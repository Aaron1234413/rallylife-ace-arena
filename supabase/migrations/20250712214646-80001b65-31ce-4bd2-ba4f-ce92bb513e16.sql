-- Test the complete signup flow with a realistic mock user
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_email text := 'testuser@example.com';
    test_metadata jsonb := '{"full_name": "Test User", "role": "player", "utr_rating": 4.5, "usta_rating": 3.5}'::jsonb;
BEGIN
    RAISE NOTICE 'Starting complete signup flow test...';
    
    -- Step 1: Insert into profiles (simulating handle_new_user trigger)
    RAISE NOTICE 'Step 1: Creating user profile...';
    INSERT INTO public.profiles (id, email, full_name, role, utr_rating, usta_rating)
    VALUES (
        test_user_id,
        test_email,
        COALESCE(test_metadata ->> 'full_name', ''),
        COALESCE((test_metadata ->> 'role')::public.user_role, 'player'::public.user_role),
        COALESCE((test_metadata ->> 'utr_rating')::numeric, 4.0),
        COALESCE((test_metadata ->> 'usta_rating')::numeric, 3.0)
    );
    RAISE NOTICE 'Profile created successfully!';
    
    -- Step 2: Initialize player data
    RAISE NOTICE 'Step 2: Initializing player HP...';
    PERFORM public.initialize_player_hp(test_user_id);
    RAISE NOTICE 'HP initialized successfully!';
    
    RAISE NOTICE 'Step 3: Initializing player XP...';
    PERFORM public.initialize_player_xp(test_user_id);
    RAISE NOTICE 'XP initialized successfully!';
    
    RAISE NOTICE 'Step 4: Initializing player tokens...';
    PERFORM public.initialize_player_tokens(test_user_id);
    RAISE NOTICE 'Tokens initialized successfully!';
    
    RAISE NOTICE 'Step 5: Initializing player avatar...';
    PERFORM public.initialize_player_avatar(test_user_id);
    RAISE NOTICE 'Avatar initialized successfully!';
    
    -- Step 3: Verify all data was created correctly
    RAISE NOTICE 'Step 6: Verifying data integrity...';
    
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = test_user_id) THEN
        RAISE EXCEPTION 'Profile not found!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.player_hp WHERE player_id = test_user_id) THEN
        RAISE EXCEPTION 'Player HP not found!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.player_xp WHERE player_id = test_user_id) THEN
        RAISE EXCEPTION 'Player XP not found!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.token_balances WHERE player_id = test_user_id) THEN
        RAISE EXCEPTION 'Token balance not found!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM public.player_avatar_equipped WHERE player_id = test_user_id) THEN
        RAISE EXCEPTION 'Player avatar equipment not found!';
    END IF;
    
    RAISE NOTICE 'All data verification passed!';
    
    -- Step 4: Clean up test data
    RAISE NOTICE 'Step 7: Cleaning up test data...';
    DELETE FROM public.player_avatar_equipped WHERE player_id = test_user_id;
    DELETE FROM public.player_avatar_items WHERE player_id = test_user_id;
    DELETE FROM public.token_balances WHERE player_id = test_user_id;
    DELETE FROM public.player_xp WHERE player_id = test_user_id;
    DELETE FROM public.player_hp WHERE player_id = test_user_id;
    DELETE FROM public.profiles WHERE id = test_user_id;
    
    RAISE NOTICE '✅ SIGNUP FLOW TEST COMPLETED SUCCESSFULLY! ✅';
    RAISE NOTICE 'The user signup process should now work properly.';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ SIGNUP FLOW TEST FAILED: %', SQLERRM;
    -- Clean up on error
    DELETE FROM public.player_avatar_equipped WHERE player_id = test_user_id;
    DELETE FROM public.player_avatar_items WHERE player_id = test_user_id;
    DELETE FROM public.token_balances WHERE player_id = test_user_id;
    DELETE FROM public.player_xp WHERE player_id = test_user_id;
    DELETE FROM public.player_hp WHERE player_id = test_user_id;
    DELETE FROM public.profiles WHERE id = test_user_id;
END $$;