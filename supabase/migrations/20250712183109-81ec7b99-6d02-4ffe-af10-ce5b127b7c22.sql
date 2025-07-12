-- Create comprehensive reward audit table
CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  participant_id UUID NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('xp_gain', 'hp_loss', 'hp_gain', 'token_earn', 'token_stake', 'token_refund')),
  amount INTEGER NOT NULL,
  before_value INTEGER,
  after_value INTEGER,
  calculation_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID DEFAULT auth.uid()
);

-- Enable RLS
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reward transactions"
ON public.reward_transactions FOR SELECT
USING (participant_id = auth.uid());

CREATE POLICY "System can manage reward transactions"
ON public.reward_transactions FOR ALL
USING (true);

-- Create unified session completion function
CREATE OR REPLACE FUNCTION public.complete_session_unified(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL,
  winning_team_param JSONB DEFAULT NULL,
  completion_data JSONB DEFAULT '{}'::JSONB
) RETURNS JSON AS $$
DECLARE
  session_record RECORD;
  participant_record RECORD;
  reward_calc JSONB;
  transaction_id UUID;
  result JSON;
  total_stakes INTEGER := 0;
  platform_fee INTEGER := 0;
  net_payout INTEGER := 0;
  base_xp INTEGER := 20;
  base_hp_loss INTEGER := 5;
  rollback_needed BOOLEAN := FALSE;
  error_msg TEXT;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Session not found');
  END IF;
  
  -- Prevent double completion
  IF session_record.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', 'Session already completed');
  END IF;
  
  -- Calculate stakes and fees
  SELECT COALESCE(SUM(stakes_contributed), 0) INTO total_stakes
  FROM public.session_participants
  WHERE session_id = session_id_param;
  
  platform_fee := FLOOR(total_stakes * COALESCE((completion_data->>'platform_fee_rate')::NUMERIC, 0.1));
  net_payout := total_stakes - platform_fee;
  
  -- Get participant count for XP scaling
  SELECT COUNT(*) INTO base_xp 
  FROM public.session_participants 
  WHERE session_id = session_id_param;
  base_xp := GREATEST(20, base_xp * 10); -- Scale XP by participant count
  
  -- Set HP loss based on session type
  CASE session_record.session_type
    WHEN 'challenge' THEN base_hp_loss := 10;
    WHEN 'social' THEN base_hp_loss := 2;
    WHEN 'training' THEN base_hp_loss := 0;
    ELSE base_hp_loss := 5;
  END CASE;
  
  BEGIN
    -- Start transaction
    -- Process each participant
    FOR participant_record IN 
      SELECT sp.*, p.full_name 
      FROM public.session_participants sp
      JOIN public.profiles p ON sp.user_id = p.id
      WHERE sp.session_id = session_id_param
    LOOP
      DECLARE
        is_winner BOOLEAN := FALSE;
        xp_earned INTEGER := base_xp;
        hp_change INTEGER := -base_hp_loss;
        tokens_earned INTEGER := 0;
        tokens_refunded INTEGER := 0;
        current_xp INTEGER;
        current_hp INTEGER;
        current_tokens INTEGER;
      BEGIN
        -- Determine if winner
        IF winner_id_param IS NOT NULL THEN
          is_winner := participant_record.user_id = winner_id_param;
        ELSIF winning_team_param IS NOT NULL THEN
          is_winner := (winning_team_param ? participant_record.user_id::TEXT);
        END IF;
        
        -- Calculate rewards
        IF is_winner THEN
          xp_earned := xp_earned + 20; -- Winner bonus
          tokens_earned := net_payout; -- Winner takes net payout
          IF session_record.session_type = 'social' THEN
            hp_change := 2; -- Social winners gain HP
          END IF;
        ELSE
          -- Participation rewards for non-winners
          tokens_refunded := FLOOR(participant_record.stakes_contributed * 0.3);
        END IF;
        
        -- Get current values for audit
        SELECT COALESCE(total_xp_earned, 0) INTO current_xp
        FROM public.player_xp WHERE player_id = participant_record.user_id;
        
        SELECT COALESCE(current_hp, 100) INTO current_hp
        FROM public.player_hp WHERE player_id = participant_record.user_id;
        
        SELECT COALESCE(current_tokens, 0) INTO current_tokens
        FROM public.token_balances WHERE player_id = participant_record.user_id;
        
        -- Award XP with audit
        IF xp_earned > 0 THEN
          PERFORM public.add_xp(
            participant_record.user_id,
            xp_earned,
            'session_completion',
            'Session: ' || session_record.title || CASE WHEN is_winner THEN ' (Winner)' ELSE '' END
          );
          
          -- Log transaction
          INSERT INTO public.reward_transactions (
            session_id, participant_id, transaction_type, amount,
            before_value, after_value, calculation_data
          ) VALUES (
            session_id_param, participant_record.user_id, 'xp_gain', xp_earned,
            current_xp, current_xp + xp_earned,
            json_build_object('is_winner', is_winner, 'base_xp', base_xp)
          );
        END IF;
        
        -- Handle HP changes with audit
        IF hp_change != 0 THEN
          PERFORM public.restore_hp(
            participant_record.user_id,
            hp_change,
            CASE WHEN hp_change > 0 THEN 'session_reward' ELSE 'session_hp_loss' END,
            'Session: ' || session_record.title
          );
          
          -- Log transaction
          INSERT INTO public.reward_transactions (
            session_id, participant_id, transaction_type, amount,
            before_value, after_value, calculation_data
          ) VALUES (
            session_id_param, participant_record.user_id, 
            CASE WHEN hp_change > 0 THEN 'hp_gain' ELSE 'hp_loss' END,
            ABS(hp_change), current_hp, current_hp + hp_change,
            json_build_object('session_type', session_record.session_type)
          );
        END IF;
        
        -- Handle token rewards with audit
        IF tokens_earned > 0 THEN
          PERFORM public.add_tokens(
            participant_record.user_id,
            tokens_earned,
            'regular',
            'session_win',
            'Session win: ' || session_record.title
          );
          
          INSERT INTO public.reward_transactions (
            session_id, participant_id, transaction_type, amount,
            before_value, after_value, calculation_data
          ) VALUES (
            session_id_param, participant_record.user_id, 'token_earn', tokens_earned,
            current_tokens, current_tokens + tokens_earned,
            json_build_object('type', 'winner_payout', 'net_payout', net_payout)
          );
        END IF;
        
        IF tokens_refunded > 0 THEN
          PERFORM public.add_tokens(
            participant_record.user_id,
            tokens_refunded,
            'regular',
            'session_participation',
            'Participation refund: ' || session_record.title
          );
          
          INSERT INTO public.reward_transactions (
            session_id, participant_id, transaction_type, amount,
            before_value, after_value, calculation_data
          ) VALUES (
            session_id_param, participant_record.user_id, 'token_refund', tokens_refunded,
            current_tokens, current_tokens + tokens_refunded,
            json_build_object('type', 'participation_refund', 'refund_rate', 0.3)
          );
        END IF;
        
      EXCEPTION
        WHEN OTHERS THEN
          error_msg := SQLERRM;
          rollback_needed := TRUE;
          EXIT; -- Exit the loop on error
      END;
    END LOOP;
    
    -- If any error occurred, rollback is handled by the transaction
    IF rollback_needed THEN
      RAISE EXCEPTION 'Reward processing failed: %', error_msg;
    END IF;
    
    -- Update session status
    UPDATE public.sessions
    SET 
      status = 'completed',
      completed_at = now(),
      session_ended_at = now(),
      winner_id = winner_id_param,
      winning_team = winning_team_param,
      session_result = json_build_object(
        'total_stakes', total_stakes,
        'platform_fee', platform_fee,
        'net_payout', net_payout,
        'completion_data', completion_data
      ),
      updated_at = now()
    WHERE id = session_id_param;
    
    -- Build result
    result := json_build_object(
      'success', true,
      'session_id', session_id_param,
      'total_stakes', total_stakes,
      'platform_fee', platform_fee,
      'net_payout', net_payout,
      'winner_id', winner_id_param,
      'winning_team', winning_team_param,
      'completed_at', now()
    );
    
    RETURN result;
    
  EXCEPTION
    WHEN OTHERS THEN
      -- Transaction automatically rolls back
      RETURN json_build_object(
        'success', false,
        'error', 'Completion failed: ' || SQLERRM,
        'rollback', true
      );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get reward history
CREATE OR REPLACE FUNCTION public.get_session_reward_audit(session_id_param UUID)
RETURNS TABLE (
  participant_name TEXT,
  transaction_type TEXT,
  amount INTEGER,
  before_value INTEGER,
  after_value INTEGER,
  calculation_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.full_name,
    rt.transaction_type,
    rt.amount,
    rt.before_value,
    rt.after_value,
    rt.calculation_data,
    rt.created_at
  FROM public.reward_transactions rt
  JOIN public.profiles p ON rt.participant_id = p.id
  WHERE rt.session_id = session_id_param
  ORDER BY rt.created_at, p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create validation function
CREATE OR REPLACE FUNCTION public.validate_session_completion(
  session_id_param UUID,
  winner_id_param UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  session_record RECORD;
  participant_count INTEGER;
  winner_is_participant BOOLEAN := FALSE;
  result JSON;
BEGIN
  -- Get session details
  SELECT * INTO session_record
  FROM public.sessions
  WHERE id = session_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Session not found');
  END IF;
  
  -- Check if already completed
  IF session_record.status = 'completed' THEN
    RETURN json_build_object('valid', false, 'error', 'Session already completed');
  END IF;
  
  -- Check if session is active
  IF session_record.status != 'active' THEN
    RETURN json_build_object('valid', false, 'error', 'Session must be active to complete');
  END IF;
  
  -- Check participant count
  SELECT COUNT(*) INTO participant_count
  FROM public.session_participants
  WHERE session_id = session_id_param;
  
  IF participant_count < 2 THEN
    RETURN json_build_object('valid', false, 'error', 'Need at least 2 participants to complete');
  END IF;
  
  -- Validate winner if provided
  IF winner_id_param IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.session_participants 
      WHERE session_id = session_id_param AND user_id = winner_id_param
    ) INTO winner_is_participant;
    
    IF NOT winner_is_participant THEN
      RETURN json_build_object('valid', false, 'error', 'Winner must be a session participant');
    END IF;
  END IF;
  
  RETURN json_build_object('valid', true, 'participant_count', participant_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;