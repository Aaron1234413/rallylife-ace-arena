-- Test if the initialization functions exist and work properly
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
BEGIN
    -- Test each function to see which one fails
    RAISE NOTICE 'Testing initialize_player_hp...';
    PERFORM public.initialize_player_hp(test_user_id);
    
    RAISE NOTICE 'Testing initialize_player_xp...';
    PERFORM public.initialize_player_xp(test_user_id);
    
    RAISE NOTICE 'Testing initialize_player_tokens...';
    PERFORM public.initialize_player_tokens(test_user_id);
    
    RAISE NOTICE 'Testing initialize_player_avatar...';
    PERFORM public.initialize_player_avatar(test_user_id);
    
    RAISE NOTICE 'All functions work!';
    
    -- Clean up test data
    DELETE FROM public.player_hp WHERE player_id = test_user_id;
    DELETE FROM public.player_xp WHERE player_id = test_user_id;
    DELETE FROM public.player_avatar_equipped WHERE player_id = test_user_id;
    DELETE FROM public.player_avatar_items WHERE player_id = test_user_id;
END $$;