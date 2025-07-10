-- Phase 1: Database Schema Updates for Simplified Session System

-- Update sessions table with new tracking fields
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS session_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS session_ended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS winning_team JSONB,
ADD COLUMN IF NOT EXISTS platform_fee_percentage INTEGER DEFAULT 10;

-- Create HP reduction tracking table
CREATE TABLE IF NOT EXISTS public.session_hp_reductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  hp_reduced INTEGER NOT NULL,
  user_level INTEGER NOT NULL,
  session_duration_minutes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on HP reductions table
ALTER TABLE public.session_hp_reductions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for HP reductions
CREATE POLICY "Users can view their own HP reductions"
ON public.session_hp_reductions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can manage HP reductions"
ON public.session_hp_reductions
FOR ALL
USING (true)
WITH CHECK (true);

-- Update session_participants table if columns don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'session_participants' 
                   AND column_name = 'stakes_contributed') THEN
        ALTER TABLE public.session_participants 
        ADD COLUMN stakes_contributed INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'session_participants' 
                   AND column_name = 'tokens_paid') THEN
        ALTER TABLE public.session_participants 
        ADD COLUMN tokens_paid INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create HP reduction calculation function
CREATE OR REPLACE FUNCTION public.calculate_hp_reduction(
  user_level INTEGER,
  duration_minutes INTEGER,
  session_type TEXT
) RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- No HP reduction for social and training sessions
  IF session_type IN ('social', 'training') THEN
    RETURN 0;
  END IF;
  
  -- For challenge sessions: base reduction modified by level
  DECLARE
    base_reduction INTEGER := duration_minutes / 10;
    level_modifier NUMERIC := (100 - LEAST(user_level, 99)) / 100.0;
    final_reduction INTEGER;
  BEGIN
    final_reduction := FLOOR(base_reduction * level_modifier);
    -- Minimum 1 HP reduction for challenge sessions, maximum based on duration
    RETURN GREATEST(1, LEAST(final_reduction, duration_minutes / 5));
  END;
END;
$$;

-- Create session management function for starting sessions
CREATE OR REPLACE FUNCTION public.start_session_with_tracking(
  session_id_param UUID,
  starter_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  result JSON;
BEGIN
  -- Check if user is session creator
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param AND creator_id = starter_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found or you are not the creator');
  END IF;
  
  IF session_record.session_started_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session already started');
  END IF;
  
  -- Count active participants
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- For training sessions, allow any number of participants
  IF session_record.session_type != 'training' AND participant_count < session_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Session is not full yet');
  END IF;
  
  -- Start the session with timestamp
  UPDATE public.sessions
  SET session_started_at = now(), updated_at = now()
  WHERE id = session_id_param;
  
  result := json_build_object('success', true, 'started_at', now());
  RETURN result;
END;
$$;

-- Create enhanced session completion function
CREATE OR REPLACE FUNCTION public.complete_session_with_hp(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  winning_team_param JSONB DEFAULT NULL
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_record RECORD;
  participants RECORD;
  total_stakes INTEGER := 0;
  participant_count INTEGER := 0;
  session_duration_minutes INTEGER;
  platform_fee INTEGER;
  remaining_pool INTEGER;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF session_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  IF session_record.session_started_at IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session was never started');
  END IF;
  
  IF session_record.session_ended_at IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Session already completed');
  END IF;
  
  -- Calculate session duration
  session_duration_minutes := EXTRACT(EPOCH FROM (now() - session_record.session_started_at)) / 60;
  
  -- Get participant information
  SELECT COUNT(*), COALESCE(SUM(stakes_contributed), 0) INTO participant_count, total_stakes
  FROM public.session_participants
  WHERE session_id = session_id_param AND status = 'joined';
  
  -- Complete the session
  UPDATE public.sessions
  SET session_ended_at = now(), 
      updated_at = now(),
      winning_team = winning_team_param
  WHERE id = session_id_param;
  
  -- Handle HP reductions for challenge sessions
  IF session_record.session_type = 'challenge' THEN
    FOR participants IN 
      SELECT sp.user_id, p.level 
      FROM public.session_participants sp
      LEFT JOIN public.player_xp p ON sp.user_id = p.player_id
      WHERE sp.session_id = session_id_param AND sp.status = 'joined'
    LOOP
      DECLARE
        user_level INTEGER := COALESCE(participants.level, 1);
        hp_reduction INTEGER;
      BEGIN
        hp_reduction := public.calculate_hp_reduction(user_level, session_duration_minutes::INTEGER, 'challenge');
        
        -- Record HP reduction
        INSERT INTO public.session_hp_reductions (session_id, user_id, hp_reduced, user_level, session_duration_minutes)
        VALUES (session_id_param, participants.user_id, hp_reduction, user_level, session_duration_minutes::INTEGER);
        
        -- Apply HP reduction (if HP system functions exist)
        BEGIN
          PERFORM public.reduce_hp(participants.user_id, hp_reduction, 'session_challenge', 'HP lost from challenge session');
        EXCEPTION
          WHEN undefined_function THEN
            -- HP system not implemented yet, skip
            NULL;
        END;
      END;
    END LOOP;
  END IF;
  
  -- Handle token distribution
  IF total_stakes > 0 THEN
    platform_fee := FLOOR(total_stakes * (session_record.platform_fee_percentage / 100.0));
    remaining_pool := total_stakes - platform_fee;
    
    -- Award platform fee to system (could be tracked separately)
    -- For now, we'll just reduce the pool
    
    IF session_record.session_type = 'challenge' AND winner_id_param IS NOT NULL THEN
      -- Check if it's doubles (more than 2 participants)
      IF participant_count > 2 THEN
        -- Doubles: split between winning team members
        DECLARE
          winning_team_members JSONB := winning_team_param;
          member_count INTEGER;
          share_per_member INTEGER;
        BEGIN
          IF winning_team_members IS NOT NULL THEN
            member_count := jsonb_array_length(winning_team_members);
            share_per_member := remaining_pool / member_count;
            
            -- Award to each winning team member
            FOR i IN 0..(member_count-1) LOOP
              PERFORM public.add_tokens(
                (winning_team_members->i->>'user_id')::UUID,
                share_per_member,
                'regular',
                'match_win_stakes',
                'Stakes won from doubles match victory'
              );
            END LOOP;
          END IF;
        END;
      ELSE
        -- Singles: winner takes all remaining pool
        PERFORM public.add_tokens(
          winner_id_param,
          remaining_pool,
          'regular',
          'match_win_stakes',
          'Stakes won from singles match victory'
        );
      END IF;
    ELSE
      -- For training sessions or no winner, refund stakes to participants
      FOR participants IN 
        SELECT user_id, stakes_contributed FROM public.session_participants 
        WHERE session_id = session_id_param AND status = 'joined' AND stakes_contributed > 0
      LOOP
        PERFORM public.add_tokens(
          participants.user_id,
          participants.stakes_contributed - FLOOR(participants.stakes_contributed * (session_record.platform_fee_percentage / 100.0)),
          'regular',
          'session_stakes_refund',
          'Stakes refunded from completed session (minus platform fee)'
        );
      END LOOP;
    END IF;
  END IF;
  
  -- Award XP based on duration
  DECLARE
    base_xp INTEGER := 20;
    duration_bonus INTEGER := session_duration_minutes / 5;
    total_xp INTEGER := base_xp + duration_bonus;
  BEGIN
    FOR participants IN 
      SELECT user_id FROM public.session_participants 
      WHERE session_id = session_id_param AND status = 'joined'
    LOOP
      PERFORM public.add_xp(
        participants.user_id,
        total_xp,
        'session_completion',
        'Completed ' || session_record.session_type || ' session'
      );
    END LOOP;
  END;
  
  result := json_build_object(
    'success', true,
    'session_type', session_record.session_type,
    'session_duration_minutes', session_duration_minutes,
    'xp_granted', base_xp + (session_duration_minutes / 5),
    'participant_count', participant_count,
    'total_stakes', total_stakes,
    'platform_fee', platform_fee,
    'remaining_pool', remaining_pool
  );
  
  RETURN result;
END;
$$;