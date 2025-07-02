-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('match', 'social_play', 'training', 'recovery')),
  format TEXT CHECK (format IN ('singles', 'doubles')),
  max_players INTEGER NOT NULL,
  stakes_amount INTEGER NOT NULL DEFAULT 0,
  location TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  is_private BOOLEAN NOT NULL DEFAULT false,
  invitation_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create session_participants table
CREATE TABLE public.session_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stakes_contributed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'joined' CHECK (status IN ('joined', 'kicked', 'left')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Create session_notifications table
CREATE TABLE public.session_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('player_joined', 'session_ready', 'player_kicked', 'invitation_received')),
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions table
CREATE POLICY "Users can view public sessions or sessions they participate in"
ON public.sessions
FOR SELECT
USING (
  NOT is_private OR 
  creator_id = auth.uid() OR 
  id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create sessions"
ON public.sessions
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Session creators can update their sessions"
ON public.sessions
FOR UPDATE
USING (auth.uid() = creator_id);

-- RLS Policies for session_participants table
CREATE POLICY "Users can view participants in sessions they can see"
ON public.session_participants
FOR SELECT
USING (
  session_id IN (
    SELECT id FROM public.sessions 
    WHERE NOT is_private OR 
          creator_id = auth.uid() OR 
          id IN (SELECT session_id FROM public.session_participants WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Users can join sessions"
ON public.session_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation or session creators can update any"
ON public.session_participants
FOR UPDATE
USING (
  auth.uid() = user_id OR 
  auth.uid() = (SELECT creator_id FROM public.sessions WHERE id = session_id)
);

-- RLS Policies for session_notifications table
CREATE POLICY "Users can view their own notifications"
ON public.session_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.session_notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.session_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to generate invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8));
END;
$$;

-- Create function to join a session
CREATE OR REPLACE FUNCTION public.join_session(session_id_param UUID, user_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  stakes_result JSON;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND status = 'waiting';
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or not available');
  END IF;
  
  -- Check if user already joined
  IF EXISTS (SELECT 1 FROM public.session_participants WHERE session_id = session_id_param AND user_id = user_id_param AND status = 'joined') THEN
    RETURN json_build_object('success', false, 'error', 'Already joined this session');
  END IF;
  
  -- Check max players
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  IF participant_count >= session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  -- Handle stakes if required
  IF session_record.stakes_amount > 0 THEN
    SELECT public.spend_tokens(user_id_param, session_record.stakes_amount, 'regular', 'session_stakes', 
                              'Stakes for session: ' || session_record.session_type) INTO stakes_result;
    
    IF NOT (stakes_result->>'success')::boolean THEN
      RETURN stakes_result;
    END IF;
  END IF;
  
  -- Add participant
  INSERT INTO public.session_participants (session_id, user_id, stakes_contributed)
  VALUES (session_id_param, user_id_param, session_record.stakes_amount);
  
  -- Create notification for session creator (if not the creator joining)
  IF user_id_param != session_record.creator_id THEN
    INSERT INTO public.session_notifications (user_id, session_id, type, message)
    VALUES (session_record.creator_id, session_id_param, 'player_joined', 
            'A player joined your ' || session_record.session_type || ' session');
  END IF;
  
  -- Check if session is now ready to start
  participant_count := participant_count + 1;
  IF participant_count = session_record.max_players THEN
    -- Notify all participants that session is ready
    INSERT INTO public.session_notifications (user_id, session_id, type, message)
    SELECT sp.user_id, session_id_param, 'session_ready', 'Session is ready to start!'
    FROM public.session_participants sp
    WHERE sp.session_id = session_id_param AND sp.status = 'joined';
  END IF;
  
  result := json_build_object(
    'success', true,
    'participant_count', participant_count,
    'session_ready', participant_count = session_record.max_players
  );
  
  RETURN result;
END;
$$;

-- Create function to kick a participant
CREATE OR REPLACE FUNCTION public.kick_participant(session_id_param UUID, participant_id_param UUID, kicker_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  refund_result JSON;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND creator_id = kicker_id_param AND status = 'waiting';
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or you are not the creator');
  END IF;
  
  -- Get participant details
  SELECT * INTO participant_record
  FROM public.session_participants
  WHERE session_id = session_id_param AND user_id = participant_id_param AND status = 'joined';
  
  IF participant_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Participant not found');
  END IF;
  
  -- Refund stakes if any were contributed
  IF participant_record.stakes_contributed > 0 THEN
    SELECT public.add_tokens(participant_id_param, participant_record.stakes_contributed, 'regular', 'stakes_refund',
                           'Stakes refund for being kicked from session') INTO refund_result;
  END IF;
  
  -- Update participant status
  UPDATE public.session_participants
  SET status = 'kicked', updated_at = now()
  WHERE id = participant_record.id;
  
  -- Create notification for kicked participant
  INSERT INTO public.session_notifications (user_id, session_id, type, message)
  VALUES (participant_id_param, session_id_param, 'player_kicked', 
          'You were removed from the ' || session_record.session_type || ' session');
  
  result := json_build_object(
    'success', true,
    'stakes_refunded', COALESCE(participant_record.stakes_contributed, 0)
  );
  
  RETURN result;
END;
$$;

-- Create function to start a session
CREATE OR REPLACE FUNCTION public.start_session(session_id_param UUID, starter_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  result JSON;
BEGIN
  -- Get session details and verify starter is a participant
  SELECT s.* INTO session_record
  FROM public.sessions s
  WHERE s.id = session_id_param 
    AND s.status = 'waiting'
    AND (s.creator_id = starter_id_param OR 
         EXISTS (SELECT 1 FROM public.session_participants sp 
                WHERE sp.session_id = s.id AND sp.user_id = starter_id_param AND sp.status = 'joined'));
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or you are not a participant');
  END IF;
  
  -- Check if enough players
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  IF participant_count < session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Not enough players to start session');
  END IF;
  
  -- Update session status
  UPDATE public.sessions
  SET status = 'active', updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object('success', true, 'message', 'Session started successfully');
  
  RETURN result;
END;
$$;

-- Create function to complete a session and distribute stakes
CREATE OR REPLACE FUNCTION public.complete_session(session_id_param UUID, winner_id_param UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  total_stakes INTEGER;
  participant_count INTEGER;
  organizer_share INTEGER;
  participant_share INTEGER;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND status = 'active';
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or not active');
  END IF;
  
  -- Calculate total stakes
  SELECT COALESCE(SUM(stakes_contributed), 0), COUNT(*)
  INTO total_stakes, participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  IF total_stakes > 0 THEN
    IF session_record.session_type = 'match' THEN
      -- Winner takes all for competitive matches
      PERFORM public.add_tokens(winner_id_param, total_stakes, 'regular', 'match_winnings',
                               'Winnings from ' || session_record.session_type || ' session');
    ELSE
      -- 60/40 split for social sessions (organizer gets 60%, participants split 40%)
      organizer_share := ROUND(total_stakes * 0.6);
      participant_share := ROUND((total_stakes - organizer_share) / participant_count);
      
      -- Give organizer their share
      PERFORM public.add_tokens(session_record.creator_id, organizer_share, 'regular', 'session_organizer_share',
                               'Organizer share from ' || session_record.session_type || ' session');
      
      -- Give participants their share
      INSERT INTO public.token_transactions (player_id, transaction_type, token_type, amount, balance_before, balance_after, source, description)
      SELECT sp.user_id, 'earn', 'regular', participant_share, 
             tb.regular_tokens, tb.regular_tokens + participant_share,
             'session_participation', 'Participation reward from ' || session_record.session_type || ' session'
      FROM public.session_participants sp
      JOIN public.token_balances tb ON sp.user_id = tb.player_id
      WHERE sp.session_id = session_id_param AND sp.status = 'joined';
      
      -- Update balances
      UPDATE public.token_balances
      SET regular_tokens = regular_tokens + participant_share,
          lifetime_earned = lifetime_earned + participant_share,
          updated_at = now()
      WHERE player_id IN (
        SELECT user_id FROM public.session_participants 
        WHERE session_id = session_id_param AND status = 'joined'
      );
    END IF;
  END IF;
  
  -- Update session status
  UPDATE public.sessions
  SET status = 'completed', updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object(
    'success', true,
    'total_stakes_distributed', total_stakes,
    'session_type', session_record.session_type
  );
  
  RETURN result;
END;
$$;

-- Create trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_participants_updated_at
  BEFORE UPDATE ON public.session_participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();