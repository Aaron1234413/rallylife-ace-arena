
-- Fix the initialize_coach_avatar function to prevent duplicate row conflicts
CREATE OR REPLACE FUNCTION public.initialize_coach_avatar(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Give coach all default items (avoid duplicates)
  INSERT INTO public.coach_avatar_owned (coach_id, avatar_item_id, unlock_method)
  SELECT user_id, id, 'initial'
  FROM public.coach_avatar_items
  WHERE is_default = true
  ON CONFLICT (coach_id, avatar_item_id) DO NOTHING;
  
  -- Equip ONE default item per category (to avoid duplicates in same category)
  INSERT INTO public.coach_avatar_equipped (coach_id, category, avatar_item_id)
  SELECT DISTINCT ON (category) user_id, category, id
  FROM public.coach_avatar_items
  WHERE is_default = true
  ORDER BY category, created_at ASC  -- Pick the first default item per category
  ON CONFLICT (coach_id, category) DO NOTHING;  -- Don't update if already equipped
END;
$function$;
