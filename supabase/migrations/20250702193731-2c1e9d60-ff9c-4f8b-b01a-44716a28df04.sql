-- Fix sessions and session_participants tables to enable proper functionality

-- First, add missing foreign key constraints
ALTER TABLE public.sessions 
ADD CONSTRAINT sessions_creator_id_fkey 
FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.session_participants 
ADD CONSTRAINT session_participants_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.session_participants 
ADD CONSTRAINT session_participants_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;

-- Fix social_play_participants foreign key conflict by being explicit
-- Check and handle multiple foreign key relationships for social_play_participants
DO $$
BEGIN
    -- Remove old conflicting foreign key if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_social_participants_session' 
               AND table_name = 'social_play_participants') THEN
        ALTER TABLE public.social_play_participants 
        DROP CONSTRAINT fk_social_participants_session;
    END IF;
END $$;

-- Clean up RLS policies for sessions table
DROP POLICY IF EXISTS "Users can view sessions they created or joined" ON public.sessions;
DROP POLICY IF EXISTS "Users can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;

-- Create simple, non-recursive RLS policies for sessions
CREATE POLICY "Users can view public sessions"
ON public.sessions
FOR SELECT
USING (is_private = false OR creator_id = auth.uid());

CREATE POLICY "Users can create sessions"
ON public.sessions
FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Session creators can update their sessions"
ON public.sessions
FOR UPDATE
USING (auth.uid() = creator_id);

CREATE POLICY "Session creators can delete their sessions"
ON public.sessions
FOR DELETE
USING (auth.uid() = creator_id);

-- Clean up RLS policies for session_participants table
DROP POLICY IF EXISTS "Users can join sessions" ON public.session_participants;
DROP POLICY IF EXISTS "Users can view session participants" ON public.session_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON public.session_participants;
DROP POLICY IF EXISTS "Session creators can manage participants" ON public.session_participants;

-- Create simple, non-recursive RLS policies for session_participants
CREATE POLICY "Users can view session participants"
ON public.session_participants
FOR SELECT
USING (
  user_id = auth.uid() OR
  session_id IN (
    SELECT id FROM public.sessions WHERE creator_id = auth.uid()
  )
);

CREATE POLICY "Users can join sessions"
ON public.session_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON public.session_participants
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Session creators can manage participants"
ON public.session_participants
FOR ALL
USING (
  session_id IN (
    SELECT id FROM public.sessions WHERE creator_id = auth.uid()
  )
);

-- Add missing columns to session_participants if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'session_participants' 
                   AND column_name = 'left_at') THEN
        ALTER TABLE public.session_participants 
        ADD COLUMN left_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Create essential database functions for session management
CREATE OR REPLACE FUNCTION public.join_session(
  session_id_param UUID,
  user_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  stakes_amount INTEGER;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  IF session_record.status != 'waiting' THEN
    RETURN json_build_object('success', false, 'error', 'Session is not available for joining');
  END IF;
  
  -- Check if user is already a participant
  IF EXISTS (SELECT 1 FROM public.session_participants 
             WHERE session_id = session_id_param 
             AND user_id = user_id_param 
             AND status = 'joined') THEN
    RETURN json_build_object('success', false, 'error', 'You are already in this session');
  END IF;
  
  -- Count current participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  IF participant_count >= session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is full');
  END IF;
  
  stakes_amount := session_record.stakes_amount;
  
  -- Check if user has enough tokens for stakes
  IF stakes_amount > 0 THEN
    DECLARE
      user_balance INTEGER;
    BEGIN
      SELECT regular_tokens INTO user_balance
      FROM public.token_balances
      WHERE player_id = user_id_param;
      
      IF user_balance < stakes_amount THEN
        RETURN json_build_object('success', false, 'error', 'Insufficient tokens for stakes');
      END IF;
      
      -- Deduct stakes
      PERFORM public.spend_tokens(
        user_id_param,
        stakes_amount,
        'regular',
        'session_stakes',
        'Stakes for joining session'
      );
    END;
  END IF;
  
  -- Add participant
  INSERT INTO public.session_participants (session_id, user_id, stakes_contributed)
  VALUES (session_id_param, user_id_param, stakes_amount);
  
  participant_count := participant_count + 1;
  
  result := json_build_object(
    'success', true,
    'participant_count', participant_count,
    'session_ready', participant_count >= session_record.max_players
  );
  
  RETURN result;
END;
$$;