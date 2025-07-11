-- Phase 1: Enhanced Session Cancellation and Refund System

-- 1. Update sessions table schema to support cancellation tracking
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Create function to calculate refund percentage based on timing
CREATE OR REPLACE FUNCTION public.calculate_refund_percentage(
  session_start_time TIMESTAMP WITH TIME ZONE,
  cancellation_time TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  hours_until_session NUMERIC;
BEGIN
  -- Calculate hours between cancellation and session start
  hours_until_session := EXTRACT(EPOCH FROM (session_start_time - cancellation_time)) / 3600;
  
  -- Refund policy:
  -- 24+ hours: 100% refund
  -- 2-24 hours: 75% refund  
  -- Less than 2 hours: 50% refund
  -- Past start time: 0% refund
  
  IF hours_until_session < 0 THEN
    RETURN 0; -- Session already started
  ELSIF hours_until_session >= 24 THEN
    RETURN 1.0; -- 100% refund
  ELSIF hours_until_session >= 2 THEN
    RETURN 0.75; -- 75% refund
  ELSE
    RETURN 0.5; -- 50% refund
  END IF;
END;
$$;

-- 3. Create enhanced session cancellation function
CREATE OR REPLACE FUNCTION public.cancel_session_with_refunds(
  session_id_param UUID,
  canceller_id_param UUID,
  cancellation_reason_param TEXT DEFAULT 'Cancelled by creator'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  refund_percentage NUMERIC;
  creator_refund INTEGER;
  participant_refund INTEGER;
  total_refunded INTEGER := 0;
  participants_refunded INTEGER := 0;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param 
    AND status IN ('waiting', 'active')
    AND creator_id = canceller_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Session not found or you are not the creator'
    );
  END IF;
  
  -- Calculate refund percentage based on session start time
  refund_percentage := public.calculate_refund_percentage(
    session_record.start_datetime, 
    now()
  );
  
  -- Calculate creator refund (from session stakes)
  creator_refund := FLOOR(session_record.stakes_amount * refund_percentage);
  
  -- Refund creator's stakes if any
  IF creator_refund > 0 THEN
    PERFORM public.add_tokens(
      canceller_id_param,
      creator_refund,
      'regular',
      'session_cancellation',
      'Refund for cancelled session: ' || cancellation_reason_param
    );
    total_refunded := total_refunded + creator_refund;
  END IF;
  
  -- Refund all participants (they always get 100% refund when creator cancels)
  FOR participant_record IN 
    SELECT * FROM public.session_participants 
    WHERE session_id = session_id_param AND status = 'joined'
  LOOP
    IF participant_record.stakes_contributed > 0 THEN
      PERFORM public.add_tokens(
        participant_record.user_id,
        participant_record.stakes_contributed,
        'regular',
        'session_cancellation_refund',
        'Full refund - session cancelled by creator'
      );
      total_refunded := total_refunded + participant_record.stakes_contributed;
      participants_refunded := participants_refunded + 1;
    END IF;
    
    -- Create notification for participant
    INSERT INTO public.session_notifications (user_id, session_id, type, message)
    VALUES (
      participant_record.user_id, 
      session_id_param, 
      'session_cancelled', 
      'Session cancelled: ' || cancellation_reason_param
    );
  END LOOP;
  
  -- Update session status to cancelled instead of deleting
  UPDATE public.sessions
  SET 
    status = 'cancelled',
    cancelled_at = now(),
    cancellation_reason = cancellation_reason_param,
    updated_at = now()
  WHERE id = session_id_param;
  
  -- Log the cancellation
  INSERT INTO public.session_notifications (user_id, session_id, type, message)
  VALUES (
    canceller_id_param,
    session_id_param,
    'session_cancelled',
    'You cancelled this session: ' || cancellation_reason_param
  );
  
  result := json_build_object(
    'success', true,
    'refund_percentage', refund_percentage * 100,
    'creator_refund', creator_refund,
    'total_refunded', total_refunded,
    'participants_refunded', participants_refunded,
    'message', 'Session cancelled successfully'
  );
  
  RETURN result;
END;
$$;

-- 4. Create function to handle expired sessions
CREATE OR REPLACE FUNCTION public.expire_sessions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  total_sessions_expired INTEGER := 0;
  total_tokens_refunded INTEGER := 0;
  result JSON;
BEGIN
  -- Find sessions that should be expired
  -- Expire sessions that are past their start time and still waiting
  FOR session_record IN 
    SELECT * FROM public.sessions 
    WHERE status = 'waiting' 
      AND start_datetime < now()
      AND expires_at IS NULL -- Only expire sessions that haven't been manually set to expire
  LOOP
    total_sessions_expired := total_sessions_expired + 1;
    
    -- Refund creator stakes (100% refund for expired sessions)
    IF session_record.stakes_amount > 0 THEN
      PERFORM public.add_tokens(
        session_record.creator_id,
        session_record.stakes_amount,
        'regular',
        'session_expired',
        'Full refund - session expired without enough participants'
      );
      total_tokens_refunded := total_tokens_refunded + session_record.stakes_amount;
    END IF;
    
    -- Refund all participants (100% refund)
    FOR participant_record IN 
      SELECT * FROM public.session_participants 
      WHERE session_id = session_record.id AND status = 'joined'
    LOOP
      IF participant_record.stakes_contributed > 0 THEN
        PERFORM public.add_tokens(
          participant_record.user_id,
          participant_record.stakes_contributed,
          'regular',
          'session_expired_refund',
          'Full refund - session expired'
        );
        total_tokens_refunded := total_tokens_refunded + participant_record.stakes_contributed;
      END IF;
      
      -- Notify participant
      INSERT INTO public.session_notifications (user_id, session_id, type, message)
      VALUES (
        participant_record.user_id,
        session_record.id,
        'session_expired',
        'Session expired and stakes refunded'
      );
    END LOOP;
    
    -- Update session status to expired
    UPDATE public.sessions
    SET 
      status = 'expired',
      cancelled_at = now(),
      cancellation_reason = 'Session expired - insufficient participants',
      updated_at = now()
    WHERE id = session_record.id;
    
    -- Notify creator
    INSERT INTO public.session_notifications (user_id, session_id, type, message)
    VALUES (
      session_record.creator_id,
      session_record.id,
      'session_expired',
      'Your session expired and stakes were refunded'
    );
  END LOOP;
  
  result := json_build_object(
    'success', true,
    'sessions_expired', total_sessions_expired,
    'total_tokens_refunded', total_tokens_refunded,
    'processed_at', now()
  );
  
  RETURN result;
END;
$$;

-- 5. Create function to cleanup old cancelled/expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_old_sessions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleanup_count INTEGER;
  result JSON;
BEGIN
  -- Delete sessions that have been cancelled/expired for more than 30 days
  DELETE FROM public.sessions 
  WHERE status IN ('cancelled', 'expired') 
    AND cancelled_at < now() - INTERVAL '30 days';
  
  GET DIAGNOSTICS cleanup_count = ROW_COUNT;
  
  result := json_build_object(
    'success', true,
    'sessions_cleaned', cleanup_count,
    'cleaned_at', now()
  );
  
  RETURN result;
END;
$$;

-- 6. Update session status enum to include new statuses
ALTER TABLE public.sessions 
DROP CONSTRAINT IF EXISTS sessions_status_check;

ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_status_check 
CHECK (status IN ('waiting', 'active', 'completed', 'cancelled', 'expired'));

-- 7. Add index for better performance on session expiration queries
CREATE INDEX IF NOT EXISTS idx_sessions_status_start_time 
ON public.sessions(status, start_datetime) 
WHERE status = 'waiting';

CREATE INDEX IF NOT EXISTS idx_sessions_cancelled_at 
ON public.sessions(cancelled_at) 
WHERE status IN ('cancelled', 'expired');

-- 8. Add RLS policy for cancelled sessions
CREATE POLICY "Users can view cancelled sessions they participated in"
ON public.sessions
FOR SELECT
USING (
  status IN ('cancelled', 'expired') AND (
    creator_id = auth.uid() OR 
    id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
  )
);

-- 9. Update session notifications type enum
ALTER TABLE public.session_notifications 
DROP CONSTRAINT IF EXISTS session_notifications_type_check;

ALTER TABLE public.session_notifications 
ADD CONSTRAINT session_notifications_type_check 
CHECK (type IN (
  'player_joined', 
  'session_ready', 
  'player_kicked', 
  'invitation_received',
  'session_cancelled',
  'session_expired'
));