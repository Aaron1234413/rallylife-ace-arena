-- Test the handle_new_user function with realistic data
DO $$
DECLARE
    test_record RECORD;
BEGIN
    -- Create a test record similar to what auth.users would have
    test_record := ROW(
        gen_random_uuid(), -- id
        'joshua123@gmail.com', -- email
        '{"full_name": "Joshua Feder", "role": "player", "utr_rating": 4, "usta_rating": 4}'::jsonb -- raw_user_meta_data
    );
    
    -- Test just the profiles insertion part
    RAISE NOTICE 'Testing profiles insertion...';
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        test_record.id,
        test_record.email,
        COALESCE(test_record.raw_user_meta_data ->> 'full_name', ''),
        COALESCE((test_record.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role)
    );
    
    RAISE NOTICE 'Profiles insertion successful!';
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_record.id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;