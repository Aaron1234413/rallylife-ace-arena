-- Ensure we have all the necessary functions for the unified session completion

-- Check if complete_session_unified exists, if not create it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'complete_session_unified' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.complete_session_unified(
            session_id_param UUID,
            winner_id_param UUID DEFAULT NULL,
            winning_team_param TEXT[] DEFAULT NULL,
            completion_data JSONB DEFAULT NULL
        )
        RETURNS JSON
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $func$
        DECLARE
            session_record RECORD;
            participant_record RECORD;
            total_stakes INTEGER := 0;
            platform_fee INTEGER := 0;
            net_payout INTEGER := 0;
            base_xp INTEGER := 20;
            base_hp_loss INTEGER := 5;
            result JSON;
            session_duration INTEGER;
        BEGIN
            -- Get session details
            SELECT * INTO session_record
            FROM public.sessions
            WHERE id = session_id_param;
            
            IF NOT FOUND THEN
                RETURN json_build_object(''success'', false, ''error'', ''Session not found'');
            END IF;
            
            -- Prevent double completion
            IF session_record.status = ''completed'' THEN
                RETURN json_build_object(''success'', false, ''error'', ''Session already completed'');
            END IF;
            
            -- Calculate session duration
            IF session_record.session_started_at IS NOT NULL THEN
                session_duration := EXTRACT(EPOCH FROM (now() - session_record.session_started_at)) / 60;
            ELSE
                session_duration := COALESCE((completion_data->>''session_duration_minutes'')::INTEGER, 60);
            END IF;
            
            -- Calculate stakes and fees
            SELECT COALESCE(SUM(stakes_contributed), 0) INTO total_stakes
            FROM public.session_participants
            WHERE session_id = session_id_param;
            
            platform_fee := FLOOR(total_stakes * COALESCE((completion_data->>''platform_fee_rate'')::NUMERIC, 0.1));
            net_payout := total_stakes - platform_fee;
            
            -- Get participant count for XP scaling
            SELECT COUNT(*) INTO base_xp 
            FROM public.session_participants 
            WHERE session_id = session_id_param;
            base_xp := GREATEST(20, base_xp * 10); -- Scale XP by participant count
            
            -- Set HP loss based on session type
            CASE session_record.session_type
                WHEN ''challenge'' THEN base_hp_loss := 10;
                WHEN ''social'' THEN base_hp_loss := 2;
                WHEN ''training'' THEN base_hp_loss := 0;
                ELSE base_hp_loss := 5;
            END CASE;
            
            BEGIN
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
                    BEGIN
                        -- Determine if winner
                        IF winner_id_param IS NOT NULL THEN
                            is_winner := participant_record.user_id = winner_id_param;
                        ELSIF winning_team_param IS NOT NULL THEN
                            is_winner := participant_record.user_id::TEXT = ANY(winning_team_param);
                        END IF;
                        
                        -- Calculate rewards
                        IF is_winner THEN
                            xp_earned := xp_earned + 20; -- Winner bonus
                            tokens_earned := net_payout; -- Winner takes net payout
                            IF session_record.session_type = ''social'' THEN
                                hp_change := 2; -- Social winners gain HP
                            END IF;
                        ELSE
                            -- Participation rewards for non-winners
                            tokens_refunded := FLOOR(participant_record.stakes_contributed * 0.3);
                        END IF;
                        
                        -- Award XP
                        IF xp_earned > 0 THEN
                            PERFORM public.add_xp(
                                participant_record.user_id,
                                xp_earned,
                                ''session_completion'',
                                ''Session: '' || COALESCE(session_record.title, session_record.session_type) || CASE WHEN is_winner THEN '' (Winner)'' ELSE '''' END
                            );
                        END IF;
                        
                        -- Handle HP changes
                        IF hp_change != 0 THEN
                            PERFORM public.restore_hp(
                                participant_record.user_id,
                                hp_change,
                                CASE WHEN hp_change > 0 THEN ''session_reward'' ELSE ''session_hp_loss'' END,
                                ''Session: '' || COALESCE(session_record.title, session_record.session_type)
                            );
                        END IF;
                        
                        -- Handle token rewards
                        IF tokens_earned > 0 THEN
                            PERFORM public.add_tokens(
                                participant_record.user_id,
                                tokens_earned,
                                ''regular'',
                                ''session_win'',
                                ''Session win: '' || COALESCE(session_record.title, session_record.session_type)
                            );
                        END IF;
                        
                        IF tokens_refunded > 0 THEN
                            PERFORM public.add_tokens(
                                participant_record.user_id,
                                tokens_refunded,
                                ''regular'',
                                ''session_participation'',
                                ''Participation refund: '' || COALESCE(session_record.title, session_record.session_type)
                            );
                        END IF;
                        
                    EXCEPTION
                        WHEN OTHERS THEN
                            -- Log error but continue
                            RAISE WARNING ''Error processing rewards for participant %: %'', participant_record.user_id, SQLERRM;
                    END;
                END LOOP;
                
                -- Update session status
                UPDATE public.sessions
                SET 
                    status = ''completed'',
                    completed_at = now(),
                    session_ended_at = now(),
                    winner_id = winner_id_param,
                    winning_team = CASE WHEN winning_team_param IS NOT NULL THEN to_jsonb(winning_team_param) ELSE NULL END,
                    session_result = json_build_object(
                        ''total_stakes'', total_stakes,
                        ''platform_fee'', platform_fee,
                        ''net_payout'', net_payout,
                        ''completion_data'', completion_data
                    ),
                    updated_at = now()
                WHERE id = session_id_param;
                
                -- Build result
                result := json_build_object(
                    ''success'', true,
                    ''session_id'', session_id_param,
                    ''total_stakes'', total_stakes,
                    ''platform_fee'', platform_fee,
                    ''net_payout'', net_payout,
                    ''winner_id'', winner_id_param,
                    ''winning_team'', winning_team_param,
                    ''completed_at'', now()
                );
                
                RETURN result;
                
            EXCEPTION
                WHEN OTHERS THEN
                    -- Transaction automatically rolls back
                    RETURN json_build_object(
                        ''success'', false,
                        ''error'', ''Completion failed: '' || SQLERRM,
                        ''rollback'', true
                    );
            END;
        END;
        $func$';
    END IF;
END $$;

-- Ensure validate_session_completion function exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'validate_session_completion' 
        AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        EXECUTE '
        CREATE OR REPLACE FUNCTION public.validate_session_completion(
            session_id_param UUID,
            winner_id_param UUID DEFAULT NULL
        )
        RETURNS JSON
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $func$
        DECLARE
            session_record RECORD;
            participant_count INTEGER;
        BEGIN
            -- Get session details
            SELECT * INTO session_record
            FROM public.sessions
            WHERE id = session_id_param;
            
            IF NOT FOUND THEN
                RETURN json_build_object(''valid'', false, ''error'', ''Session not found'');
            END IF;
            
            IF session_record.status NOT IN (''active'', ''paused'') THEN
                RETURN json_build_object(''valid'', false, ''error'', ''Session must be active or paused to complete'');
            END IF;
            
            -- Get participant count
            SELECT COUNT(*) INTO participant_count
            FROM public.session_participants
            WHERE session_id = session_id_param;
            
            IF participant_count = 0 THEN
                RETURN json_build_object(''valid'', false, ''error'', ''No participants found'');
            END IF;
            
            -- Validate winner if provided
            IF winner_id_param IS NOT NULL THEN
                IF NOT EXISTS (
                    SELECT 1 FROM public.session_participants 
                    WHERE session_id = session_id_param AND user_id = winner_id_param
                ) THEN
                    RETURN json_build_object(''valid'', false, ''error'', ''Winner must be a session participant'');
                END IF;
            END IF;
            
            RETURN json_build_object(
                ''valid'', true,
                ''participant_count'', participant_count
            );
        END;
        $func$';
    END IF;
END $$;