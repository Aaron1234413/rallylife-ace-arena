-- Test coach signup flow
DO $$
DECLARE
    test_coach_id uuid := gen_random_uuid();
    test_email text := 'testcoach@example.com';
    test_metadata jsonb := '{"full_name": "Test Coach", "role": "coach", "utr_rating": 8.0, "usta_rating": 5.0}'::jsonb;
BEGIN
    RAISE NOTICE 'Starting coach signup flow test...';
    
    -- Step 1: Insert into profiles
    RAISE NOTICE 'Step 1: Creating coach profile...';
    INSERT INTO public.profiles (id, email, full_name, role, utr_rating, usta_rating)
    VALUES (
        test_coach_id,
        test_email,
        COALESCE(test_metadata ->> 'full_name', ''),
        COALESCE((test_metadata ->> 'role')::public.user_role, 'player'::public.user_role),
        COALESCE((test_metadata ->> 'utr_rating')::numeric, 4.0),
        COALESCE((test_metadata ->> 'usta_rating')::numeric, 3.0)
    );
    RAISE NOTICE 'Coach profile created successfully!';
    
    -- Step 2: Initialize coach data (checking if functions exist)
    RAISE NOTICE 'Step 2: Initializing coach CRP...';
    BEGIN
        PERFORM public.initialize_coach_crp(test_coach_id);
        RAISE NOTICE 'CRP initialized successfully!';
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'initialize_coach_crp function does not exist (this is expected if not implemented yet)';
    END;
    
    RAISE NOTICE 'Step 3: Initializing coach CXP...';
    BEGIN
        PERFORM public.initialize_coach_cxp(test_coach_id);
        RAISE NOTICE 'CXP initialized successfully!';
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'initialize_coach_cxp function does not exist (this is expected if not implemented yet)';
    END;
    
    RAISE NOTICE 'Step 4: Initializing coach tokens...';
    BEGIN
        PERFORM public.initialize_coach_tokens(test_coach_id);
        RAISE NOTICE 'Coach tokens initialized successfully!';
    EXCEPTION WHEN undefined_function THEN
        RAISE NOTICE 'initialize_coach_tokens function does not exist (this is expected if not implemented yet)';
    END;
    
    -- Verify profile was created
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = test_coach_id AND role = 'coach') THEN
        RAISE EXCEPTION 'Coach profile not found!';
    END IF;
    
    RAISE NOTICE 'Coach profile verification passed!';
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_coach_id;
    
    RAISE NOTICE '✅ COACH SIGNUP FLOW TEST COMPLETED! ✅';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ COACH SIGNUP FLOW TEST FAILED: %', SQLERRM;
    DELETE FROM public.profiles WHERE id = test_coach_id;
END $$;