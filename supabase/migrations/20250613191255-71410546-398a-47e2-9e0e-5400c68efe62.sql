
-- Create coach_avatar_items table for coach-specific avatar items
CREATE TABLE public.coach_avatar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'attire', 'equipment', 'badge', 'background'
  item_type TEXT NOT NULL, -- 'shirt', 'hat', 'racket', 'certification_badge', etc.
  image_url TEXT NOT NULL,
  description TEXT,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  unlock_type TEXT NOT NULL, -- 'free', 'level', 'purchase', 'achievement', 'certification'
  unlock_requirement JSONB, -- level, cxp, achievement_id, certification_name
  ctk_cost INTEGER DEFAULT 0, -- Coach Token cost
  is_default BOOLEAN DEFAULT false,
  is_professional BOOLEAN DEFAULT false, -- Professional/business items
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coach_avatar_owned table for tracking owned items
CREATE TABLE public.coach_avatar_owned (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users NOT NULL,
  avatar_item_id UUID REFERENCES public.coach_avatar_items NOT NULL,
  unlock_method TEXT NOT NULL, -- 'initial', 'purchase', 'level_unlock', 'achievement'
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, avatar_item_id)
);

-- Create coach_avatar_equipped table for currently equipped items
CREATE TABLE public.coach_avatar_equipped (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  avatar_item_id UUID REFERENCES public.coach_avatar_items NOT NULL,
  equipped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(coach_id, category)
);

-- Enable RLS
ALTER TABLE public.coach_avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_avatar_owned ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_avatar_equipped ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coach_avatar_items (public read)
CREATE POLICY "Anyone can view coach avatar items"
  ON public.coach_avatar_items FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for coach_avatar_owned
CREATE POLICY "Coaches can view their own avatar items"
  ON public.coach_avatar_owned FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can insert their own avatar items"
  ON public.coach_avatar_owned FOR INSERT
  WITH CHECK (auth.uid() = coach_id);

-- RLS Policies for coach_avatar_equipped
CREATE POLICY "Coaches can view their own equipped items"
  ON public.coach_avatar_equipped FOR SELECT
  USING (auth.uid() = coach_id);

CREATE POLICY "Coaches can manage their own equipped items"
  ON public.coach_avatar_equipped FOR ALL
  USING (auth.uid() = coach_id);

-- Function to initialize coach avatar with default items
CREATE OR REPLACE FUNCTION public.initialize_coach_avatar(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Give coach all default items
  INSERT INTO public.coach_avatar_owned (coach_id, avatar_item_id, unlock_method)
  SELECT user_id, id, 'initial'
  FROM public.coach_avatar_items
  WHERE is_default = true
  ON CONFLICT (coach_id, avatar_item_id) DO NOTHING;
  
  -- Equip default items
  INSERT INTO public.coach_avatar_equipped (coach_id, category, avatar_item_id)
  SELECT user_id, category, id
  FROM public.coach_avatar_items
  WHERE is_default = true
  ON CONFLICT (coach_id, category) DO UPDATE SET
    avatar_item_id = EXCLUDED.avatar_item_id,
    equipped_at = now();
END;
$$;

-- Function to unlock coach avatar item
CREATE OR REPLACE FUNCTION public.unlock_coach_avatar_item(
  user_id UUID,
  item_id UUID,
  unlock_method TEXT DEFAULT 'manual'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  result JSON;
BEGIN
  -- Get item details
  SELECT * INTO item_record
  FROM public.coach_avatar_items
  WHERE id = item_id;
  
  IF item_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item not found'
    );
  END IF;
  
  -- Check if coach already owns this item
  IF EXISTS (SELECT 1 FROM public.coach_avatar_owned WHERE coach_id = user_id AND avatar_item_id = item_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item already owned'
    );
  END IF;
  
  -- Add item to coach's collection
  INSERT INTO public.coach_avatar_owned (coach_id, avatar_item_id, unlock_method)
  VALUES (user_id, item_id, unlock_method);
  
  -- Return success
  result := json_build_object(
    'success', true,
    'item_name', item_record.name,
    'item_category', item_record.category,
    'unlock_method', unlock_method
  );
  
  RETURN result;
END;
$$;

-- Function to equip coach avatar item
CREATE OR REPLACE FUNCTION public.equip_coach_avatar_item(
  user_id UUID,
  item_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  result JSON;
BEGIN
  -- Get item details and check ownership
  SELECT ai.*, cao.coach_id
  INTO item_record
  FROM public.coach_avatar_items ai
  LEFT JOIN public.coach_avatar_owned cao ON ai.id = cao.avatar_item_id AND cao.coach_id = user_id
  WHERE ai.id = item_id;
  
  IF item_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item not found'
    );
  END IF;
  
  IF item_record.coach_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item not owned by coach'
    );
  END IF;
  
  -- Equip the item (replace any existing item in the same category)
  INSERT INTO public.coach_avatar_equipped (coach_id, category, avatar_item_id)
  VALUES (user_id, item_record.category, item_id)
  ON CONFLICT (coach_id, category) DO UPDATE SET
    avatar_item_id = EXCLUDED.avatar_item_id,
    equipped_at = now();
  
  -- Return success
  result := json_build_object(
    'success', true,
    'item_name', item_record.name,
    'category', item_record.category
  );
  
  RETURN result;
END;
$$;

-- Function to purchase coach avatar item
CREATE OR REPLACE FUNCTION public.purchase_coach_avatar_item(
  user_id UUID,
  item_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  spend_result JSON;
BEGIN
  -- Get item details
  SELECT * INTO item_record
  FROM public.coach_avatar_items
  WHERE id = item_id;
  
  IF item_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item not found'
    );
  END IF;
  
  -- Check if item is purchasable
  IF item_record.unlock_type != 'purchase' THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item is not available for purchase'
    );
  END IF;
  
  -- Check if coach already owns this item
  IF EXISTS (SELECT 1 FROM public.coach_avatar_owned WHERE coach_id = user_id AND avatar_item_id = item_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item already owned'
    );
  END IF;
  
  -- Attempt to spend CTK tokens
  IF item_record.ctk_cost > 0 THEN
    SELECT public.spend_coach_tokens(user_id, item_record.ctk_cost, 'avatar_purchase', 
                                   'Purchased ' || item_record.name) INTO spend_result;
    
    IF NOT (spend_result->>'success')::boolean THEN
      RETURN spend_result;
    END IF;
  END IF;
  
  -- Unlock the item
  PERFORM public.unlock_coach_avatar_item(user_id, item_id, 'purchase');
  
  RETURN json_build_object(
    'success', true,
    'item_name', item_record.name,
    'ctk_spent', COALESCE(item_record.ctk_cost, 0)
  );
END;
$$;

-- Insert default coach avatar items
INSERT INTO public.coach_avatar_items (name, category, item_type, image_url, description, rarity, unlock_type, is_default, is_professional) VALUES
-- Default attire
('Professional Polo', 'attire', 'shirt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach-polo&top=shortHairDreads01&topColor=brown&accessories=prescription02&accessoriesColor=black&facialHair=beard&facialHairColor=brown&clothes=blazerShirt&clotheColor=blue03', 'Classic coaching polo shirt', 'common', 'free', true, true),
('Coaching Jacket', 'attire', 'jacket', 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach-jacket&top=shortHairSides&topColor=black&accessories=prescription01&accessoriesColor=black&clothes=blazerSweater&clotheColor=gray02', 'Professional coaching jacket', 'common', 'free', true, true),

-- Equipment items
('Pro Racket', 'equipment', 'racket', 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach-racket&top=shortHairShaggyMullet&topColor=auburn&clothes=shirtCrewNeck&clotheColor=blue01', 'Professional coaching racket', 'common', 'free', true, false),
('Clipboard', 'equipment', 'accessory', 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach-clipboard&top=shortHairFrizzle&topColor=red&clothes=hoodie&clotheColor=pink', 'Coaching clipboard for notes', 'common', 'free', true, true),

-- Certification badges
('Level 1 Coach Badge', 'badge', 'certification', 'https://api.dicebear.com/7.x/avataaars/svg?seed=badge-level1&top=winterHat1&topColor=blue03&hatColor=blue03&clothes=graphicShirt&clotheColor=blue03', 'Basic coaching certification', 'common', 'level', false, true),
('Advanced Coach Badge', 'badge', 'certification', 'https://api.dicebear.com/7.x/avataaars/svg?seed=badge-advanced&top=winterHat2&topColor=red&hatColor=red&clothes=graphicShirt&clotheColor=red', 'Advanced coaching certification', 'rare', 'level', false, true),
('Master Coach Badge', 'badge', 'certification', 'https://api.dicebear.com/7.x/avataaars/svg?seed=badge-master&top=winterHat3&topColor=gold&hatColor=gold&clothes=graphicShirt&clotheColor=yellow', 'Master level coaching certification', 'legendary', 'level', false, true),

-- Premium items
('Designer Polo', 'attire', 'shirt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=designer-polo&top=shortHairTheCaesar&topColor=brown&clothes=blazerShirt&clotheColor=blue01', 'Premium designer coaching polo', 'rare', 'purchase', false, true),
('Tennis Academy Jacket', 'attire', 'jacket', 'https://api.dicebear.com/7.x/avataaars/svg?seed=academy-jacket&top=shortHairSides&topColor=black&clothes=blazerSweater&clotheColor=black', 'Exclusive tennis academy jacket', 'epic', 'purchase', false, true),
('Gold Whistle', 'equipment', 'accessory', 'https://api.dicebear.com/7.x/avataaars/svg?seed=gold-whistle&top=shortHairShaggyMullet&topColor=blonde&clothes=shirtCrewNeck&clotheColor=gray01', 'Premium gold coaching whistle', 'epic', 'purchase', false, false);

-- Set unlock requirements and costs for level-based items
UPDATE public.coach_avatar_items 
SET unlock_requirement = jsonb_build_object('level', 3)
WHERE name = 'Level 1 Coach Badge';

UPDATE public.coach_avatar_items 
SET unlock_requirement = jsonb_build_object('level', 10)
WHERE name = 'Advanced Coach Badge';

UPDATE public.coach_avatar_items 
SET unlock_requirement = jsonb_build_object('level', 25)
WHERE name = 'Master Coach Badge';

-- Set CTK costs for purchasable items
UPDATE public.coach_avatar_items 
SET ctk_cost = 50
WHERE name = 'Designer Polo';

UPDATE public.coach_avatar_items 
SET ctk_cost = 100
WHERE name = 'Tennis Academy Jacket';

UPDATE public.coach_avatar_items 
SET ctk_cost = 75
WHERE name = 'Gold Whistle';

-- Update handle_new_user function to initialize coach avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role)
  );
  
  -- Initialize HP, XP, Tokens, and Avatar for players
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'player' THEN
    PERFORM public.initialize_player_hp(NEW.id);
    PERFORM public.initialize_player_xp(NEW.id);
    PERFORM public.initialize_player_tokens(NEW.id);
    PERFORM public.initialize_player_avatar(NEW.id);
  END IF;
  
  -- Initialize CRP, CXP, CTK, and Avatar for coaches
  IF COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'player'::public.user_role) = 'coach' THEN
    PERFORM public.initialize_coach_crp(NEW.id);
    PERFORM public.initialize_coach_cxp(NEW.id);
    PERFORM public.initialize_coach_tokens(NEW.id);
    PERFORM public.initialize_coach_avatar(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;
