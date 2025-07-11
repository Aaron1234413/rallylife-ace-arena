-- Phase 1: Enhanced Session Cancellation and Refund System

-- 1. Update open_sessions table schema to support expiration tracking
ALTER TABLE public.open_sessions 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Update sessions table schema to support cancellation tracking (if needed)
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Create function to calculate refund percentage based on timing
CREATE OR REPLACE FUNCTION public.calculate_refund_percentage(
  scheduled_date DATE,
  start_time TIME,
  cancellation_time TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  session_start_datetime TIMESTAMP WITH TIME ZONE;
  hours_until_session NUMERIC;
BEGIN
  -- Combine date and time to get full datetime
  session_start_datetime := (scheduled_date + start_time)::TIMESTAMP WITH TIME ZONE;
  
  -- Calculate hours between cancellation and session start
  hours_until_session := EXTRACT(EPOCH FROM (session_start_datetime - cancellation_time)) / 3600;
  
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

-- 3. Create enhanced session cancellation function for open_sessions
CREATE OR REPLACE FUNCTION public.cancel_open_session_with_refunds(
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
  creator_tokens_refund INTEGER;
  creator_money_refund NUMERIC;
  participant_tokens_refund INTEGER;
  participant_money_refund NUMERIC;
  total_tokens_refunded INTEGER := 0;
  total_money_refunded NUMERIC := 0;
  participants_refunded INTEGER := 0;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.open_sessions
  WHERE id = session_id_param 
    AND status IN ('scheduled', 'active')
    AND creator_id = canceller_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Session not found or you are not the creator'
    );
  END IF;
  
  -- Calculate refund percentage based on session timing
  refund_percentage := public.calculate_refund_percentage(
    session_record.scheduled_date,
    session_record.start_time,
    now()
  );
  
  -- Calculate creator refunds (tokens and money based on cost per person)
  creator_tokens_refund := FLOOR(session_record.cost_per_person_tokens * refund_percentage);
  creator_money_refund := session_record.cost_per_person_money * refund_percentage;
  
  -- Refund creator's costs if any (they paid to create the session)
  IF creator_tokens_refund > 0 THEN
    PERFORM public.add_tokens(
      canceller_id_param,
      creator_tokens_refund,
      'regular',
      'session_cancellation',
      'Token refund for cancelled session: ' || cancellation_reason_param
    );
    total_tokens_refunded := total_tokens_refunded + creator_tokens_refund;
  END IF;
  
  -- Note: Money refunds would need Stripe integration - for now just log
  IF creator_money_refund > 0 THEN
    total_money_refunded := total_money_refunded + creator_money_refund;
    -- TODO: Implement Stripe refund here
  END IF;
  
  -- Refund all participants (they always get 100% refund when creator cancels)
  FOR participant_record IN 
    SELECT sp.*, os.cost_per_person_tokens, os.cost_per_person_money
    FROM public.open_session_participants sp
    JOIN public.open_sessions os ON sp.session_id = os.id
    WHERE sp.session_id = session_id_param AND sp.status = 'confirmed'
  LOOP
    participants_refunded := participants_refunded + 1;
    
    -- Full token refund for participants
    IF participant_record.cost_per_person_tokens > 0 THEN
      PERFORM public.add_tokens(
        participant_record.user_id,
        participant_record.cost_per_person_tokens,
        'regular',
        'session_cancellation_refund',
        'Full refund - session cancelled by creator'
      );
      total_tokens_refunded := total_tokens_refunded + participant_record.cost_per_person_tokens;
    END IF;
    
    -- Note money refund
    IF participant_record.cost_per_person_money > 0 THEN
      total_money_refunded := total_money_refunded + participant_record.cost_per_person_money;
      -- TODO: Implement Stripe refund here
    END IF;
  END LOOP;
  
  -- Update session status to cancelled instead of deleting
  UPDATE public.open_sessions
  SET 
    status = 'cancelled',
    cancelled_reason = cancellation_reason_param,
    cancelled_at = now(),
    updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'refund_percentage', refund_percentage * 100,
    'creator_tokens_refund', creator_tokens_refund,
    'creator_money_refund', creator_money_refund,
    'total_tokens_refunded', total_tokens_refunded,
    'total_money_refunded', total_money_refunded,
    'participants_refunded', participants_refunded,
    'message', 'Session cancelled successfully'
  );
  
  RETURN result;
END;
$$;

-- 4. Create function to handle expired open sessions
CREATE OR REPLACE FUNCTION public.expire_open_sessions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  total_sessions_expired INTEGER := 0;
  total_tokens_refunded INTEGER := 0;
  total_money_refunded NUMERIC := 0;
  result JSON;
BEGIN
  -- Find sessions that should be expired
  -- Expire sessions that are past their start time and still scheduled
  FOR session_record IN 
    SELECT * FROM public.open_sessions 
    WHERE status = 'scheduled' 
      AND (scheduled_date + start_time)::TIMESTAMP WITH TIME ZONE < now()
      AND expires_at IS NULL -- Only expire sessions that haven't been manually set to expire
  LOOP
    total_sessions_expired := total_sessions_expired + 1;
    
    -- Refund creator costs (100% refund for expired sessions)
    IF session_record.cost_per_person_tokens > 0 THEN
      PERFORM public.add_tokens(
        session_record.creator_id,
        session_record.cost_per_person_tokens,
        'regular',
        'session_expired',
        'Full refund - session expired without enough participants'
      );
      total_tokens_refunded := total_tokens_refunded + session_record.cost_per_person_tokens;
    END IF;
    
    IF session_record.cost_per_person_money > 0 THEN
      total_money_refunded := total_money_refunded + session_record.cost_per_person_money;
      -- TODO: Implement Stripe refund here
    END IF;
    
    -- Refund all participants (100% refund)
    FOR participant_record IN 
      SELECT sp.*, os.cost_per_person_tokens, os.cost_per_person_money
      FROM public.open_session_participants sp
      JOIN public.open_sessions os ON sp.session_id = os.id
      WHERE sp.session_id = session_record.id AND sp.status = 'confirmed'
    LOOP
      IF participant_record.cost_per_person_tokens > 0 THEN
        PERFORM public.add_tokens(
          participant_record.user_id,
          participant_record.cost_per_person_tokens,
          'regular',
          'session_expired_refund',
          'Full refund - session expired'
        );
        total_tokens_refunded := total_tokens_refunded + participant_record.cost_per_person_tokens;
      END IF;
      
      IF participant_record.cost_per_person_money > 0 THEN
        total_money_refunded := total_money_refunded + participant_record.cost_per_person_money;
        -- TODO: Implement Stripe refund here
      END IF;
    END LOOP;
    
    -- Update session status to expired
    UPDATE public.open_sessions
    SET 
      status = 'expired',
      cancelled_reason = 'Session expired - insufficient participants',
      cancelled_at = now(),
      updated_at = now()
    WHERE id = session_record.id;
  END LOOP;
  
  result := json_build_object(
    'success', true,
    'sessions_expired', total_sessions_expired,
    'total_tokens_refunded', total_tokens_refunded,
    'total_money_refunded', total_money_refunded,
    'processed_at', now()
  );
  
  RETURN result;
END;
$$;

-- 5. Create function to cleanup old cancelled/expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_old_open_sessions()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cleanup_count INTEGER;
  result JSON;
BEGIN
  -- Delete sessions that have been cancelled/expired for more than 30 days
  DELETE FROM public.open_sessions 
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

-- 6. Update open_sessions status enum to include new statuses
ALTER TABLE public.open_sessions 
DROP CONSTRAINT IF EXISTS open_sessions_status_check;

ALTER TABLE public.open_sessions 
ADD CONSTRAINT open_sessions_status_check 
CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'expired'));

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_open_sessions_status_datetime 
ON public.open_sessions(status, scheduled_date, start_time) 
WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_open_sessions_cancelled_at 
ON public.open_sessions(cancelled_at) 
WHERE status IN ('cancelled', 'expired');

-- 8. Add RLS policies for cancelled sessions
CREATE POLICY "Users can view cancelled sessions they participated in"
ON public.open_sessions
FOR SELECT
USING (
  status IN ('cancelled', 'expired') AND (
    creator_id = auth.uid() OR 
    id IN (SELECT session_id FROM public.open_session_participants WHERE user_id = auth.uid())
  )
);

-- 9. Create simple session cancellation function for basic sessions table (fallback)
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
  
  -- Refund creator's stakes if any
  IF session_record.stakes_amount > 0 THEN
    PERFORM public.add_tokens(
      canceller_id_param,
      session_record.stakes_amount,
      'regular',
      'session_cancellation',
      'Refund for cancelled session: ' || cancellation_reason_param
    );
    total_refunded := total_refunded + session_record.stakes_amount;
  END IF;
  
  -- Refund all participants (100% refund when creator cancels)
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
  END LOOP;
  
  -- Update session status to cancelled instead of deleting
  UPDATE public.sessions
  SET 
    status = 'cancelled',
    cancelled_at = now(),
    cancellation_reason = cancellation_reason_param,
    updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'total_refunded', total_refunded,
    'participants_refunded', participants_refunded,
    'message', 'Session cancelled successfully'
  );
  
  RETURN result;
END;
$$;