
-- Fix the initialize_coach_avatar function to handle conflicts properly
CREATE OR REPLACE FUNCTION public.initialize_coach_avatar(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- First, ensure we don't have any existing records to avoid conflicts
  -- Give coach all default items (only if not already owned)
  INSERT INTO public.coach_avatar_owned (coach_id, avatar_item_id, unlock_method)
  SELECT user_id, id, 'initial'
  FROM public.coach_avatar_items
  WHERE is_default = true
    AND NOT EXISTS (
      SELECT 1 FROM public.coach_avatar_owned 
      WHERE coach_id = user_id AND avatar_item_id = coach_avatar_items.id
    );
  
  -- Equip default items (only if not already equipped)
  INSERT INTO public.coach_avatar_equipped (coach_id, category, avatar_item_id)
  SELECT user_id, category, id
  FROM public.coach_avatar_items
  WHERE is_default = true
    AND NOT EXISTS (
      SELECT 1 FROM public.coach_avatar_equipped 
      WHERE coach_id = user_id AND category = coach_avatar_items.category
    );
END;
$function$
