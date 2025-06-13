
-- Create avatar_items table to store all available avatar customization items
CREATE TABLE public.avatar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'hair', 'clothing', 'accessories', 'background', 'racket', 'shoes'
  item_type TEXT NOT NULL, -- specific type within category like 'cap', 'shirt', 'glasses'
  image_url TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  unlock_type TEXT NOT NULL, -- 'free', 'level', 'achievement', 'purchase', 'victory'
  unlock_requirement JSONB, -- {level: 5} or {achievement_id: 'xyz'} or {tokens: 100}
  token_cost INTEGER DEFAULT 0,
  premium_cost INTEGER DEFAULT 0,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player_avatar_items table to track which items each player owns
CREATE TABLE public.player_avatar_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  avatar_item_id UUID NOT NULL REFERENCES public.avatar_items(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unlock_method TEXT NOT NULL, -- 'initial', 'level_up', 'achievement', 'purchase', 'victory'
  UNIQUE(player_id, avatar_item_id)
);

-- Create player_avatar_equipped table to track currently equipped items
CREATE TABLE public.player_avatar_equipped (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  category TEXT NOT NULL,
  avatar_item_id UUID NOT NULL REFERENCES public.avatar_items(id),
  equipped_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, category)
);

-- Create indexes for efficient querying
CREATE INDEX idx_avatar_items_category ON public.avatar_items(category);
CREATE INDEX idx_avatar_items_unlock_type ON public.avatar_items(unlock_type);
CREATE INDEX idx_player_avatar_items_player_id ON public.player_avatar_items(player_id);
CREATE INDEX idx_player_avatar_equipped_player_id ON public.player_avatar_equipped(player_id);

-- Enable Row Level Security
ALTER TABLE public.avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_avatar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_avatar_equipped ENABLE ROW LEVEL SECURITY;

-- RLS policies for avatar_items (public read access)
CREATE POLICY "Anyone can view avatar items" 
  ON public.avatar_items 
  FOR SELECT 
  USING (true);

-- RLS policies for player_avatar_items
CREATE POLICY "Users can view their own avatar items" 
  ON public.player_avatar_items 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "System can insert player avatar items" 
  ON public.player_avatar_items 
  FOR INSERT 
  WITH CHECK (true);

-- RLS policies for player_avatar_equipped
CREATE POLICY "Users can view their own equipped items" 
  ON public.player_avatar_equipped 
  FOR SELECT 
  USING (auth.uid() = player_id);

CREATE POLICY "Users can update their own equipped items" 
  ON public.player_avatar_equipped 
  FOR ALL 
  USING (auth.uid() = player_id);

-- Insert default avatar items
INSERT INTO public.avatar_items (name, category, item_type, image_url, rarity, unlock_type, unlock_requirement, description, is_default) VALUES
-- Default items (free)
('Classic Hair', 'hair', 'short', 'https://api.dicebear.com/7.x/avataaars/svg?seed=hair1', 'common', 'free', '{}', 'Classic short hairstyle', true),
('Basic Shirt', 'clothing', 'shirt', 'https://api.dicebear.com/7.x/avataaars/svg?seed=shirt1', 'common', 'free', '{}', 'Basic tennis shirt', true),
('Standard Racket', 'accessories', 'racket', 'https://api.dicebear.com/7.x/avataaars/svg?seed=racket1', 'common', 'free', '{}', 'Standard tennis racket', true),

-- Level unlock items
('Spiky Hair', 'hair', 'spiky', 'https://api.dicebear.com/7.x/avataaars/svg?seed=hair2', 'common', 'level', '{"level": 5}', 'Cool spiky hairstyle unlocked at level 5', false),
('Pro Shirt', 'clothing', 'polo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=shirt2', 'rare', 'level', '{"level": 10}', 'Professional polo shirt unlocked at level 10', false),
('Champion Headband', 'accessories', 'headband', 'https://api.dicebear.com/7.x/avataaars/svg?seed=headband1', 'rare', 'level', '{"level": 15}', 'Champions headband unlocked at level 15', false),

-- Token purchase items
('Trendy Sunglasses', 'accessories', 'glasses', 'https://api.dicebear.com/7.x/avataaars/svg?seed=glasses1', 'rare', 'purchase', '{"tokens": 150}', 'Stylish sunglasses for the court', false),
('Designer Outfit', 'clothing', 'designer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=outfit1', 'epic', 'purchase', '{"tokens": 300}', 'High-end designer tennis outfit', false),
('Golden Racket', 'accessories', 'racket_gold', 'https://api.dicebear.com/7.x/avataaars/svg?seed=racket2', 'legendary', 'purchase', '{"tokens": 500}', 'Legendary golden tennis racket', false),

-- Premium purchase items
('VIP Hair Style', 'hair', 'vip', 'https://api.dicebear.com/7.x/avataaars/svg?seed=hair3', 'epic', 'purchase', '{"premium_tokens": 5}', 'Exclusive VIP hairstyle', false),
('Diamond Accessories', 'accessories', 'diamond', 'https://api.dicebear.com/7.x/avataaars/svg?seed=diamond1', 'legendary', 'purchase', '{"premium_tokens": 10}', 'Rare diamond accessories', false);

-- Function to initialize default avatar items for a player
CREATE OR REPLACE FUNCTION public.initialize_player_avatar(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Give player all default items
  INSERT INTO public.player_avatar_items (player_id, avatar_item_id, unlock_method)
  SELECT user_id, id, 'initial'
  FROM public.avatar_items
  WHERE is_default = true
  ON CONFLICT (player_id, avatar_item_id) DO NOTHING;
  
  -- Equip default items
  INSERT INTO public.player_avatar_equipped (player_id, category, avatar_item_id)
  SELECT user_id, category, id
  FROM public.avatar_items
  WHERE is_default = true
  ON CONFLICT (player_id, category) DO UPDATE SET
    avatar_item_id = EXCLUDED.avatar_item_id,
    equipped_at = now();
END;
$$;

-- Function to unlock avatar item for a player
CREATE OR REPLACE FUNCTION public.unlock_avatar_item(
  user_id uuid,
  item_id uuid,
  unlock_method text DEFAULT 'manual'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  result JSON;
BEGIN
  -- Get item details
  SELECT * INTO item_record
  FROM public.avatar_items
  WHERE id = item_id;
  
  IF item_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item not found'
    );
  END IF;
  
  -- Check if player already owns this item
  IF EXISTS (SELECT 1 FROM public.player_avatar_items WHERE player_id = user_id AND avatar_item_id = item_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item already owned'
    );
  END IF;
  
  -- Add item to player's collection
  INSERT INTO public.player_avatar_items (player_id, avatar_item_id, unlock_method)
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

-- Function to equip avatar item
CREATE OR REPLACE FUNCTION public.equip_avatar_item(
  user_id uuid,
  item_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  result JSON;
BEGIN
  -- Get item details and check ownership
  SELECT ai.*, pai.player_id
  INTO item_record
  FROM public.avatar_items ai
  LEFT JOIN public.player_avatar_items pai ON ai.id = pai.avatar_item_id AND pai.player_id = user_id
  WHERE ai.id = item_id;
  
  IF item_record IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item not found'
    );
  END IF;
  
  IF item_record.player_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item not owned by player'
    );
  END IF;
  
  -- Equip the item (replace any existing item in the same category)
  INSERT INTO public.player_avatar_equipped (player_id, category, avatar_item_id)
  VALUES (user_id, item_record.category, item_id)
  ON CONFLICT (player_id, category) DO UPDATE SET
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

-- Function to purchase avatar item with tokens
CREATE OR REPLACE FUNCTION public.purchase_avatar_item(
  user_id uuid,
  item_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item_record RECORD;
  balance_record RECORD;
  spend_result JSON;
  unlock_result JSON;
BEGIN
  -- Get item details
  SELECT * INTO item_record
  FROM public.avatar_items
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
  
  -- Check if player already owns this item
  IF EXISTS (SELECT 1 FROM public.player_avatar_items WHERE player_id = user_id AND avatar_item_id = item_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Item already owned'
    );
  END IF;
  
  -- Attempt to spend tokens
  IF item_record.token_cost > 0 THEN
    SELECT public.spend_tokens(user_id, item_record.token_cost, 'regular', 'avatar_purchase', 
                              'Purchased ' || item_record.name) INTO spend_result;
    
    IF NOT (spend_result->>'success')::boolean THEN
      RETURN spend_result;
    END IF;
  END IF;
  
  -- Attempt to spend premium tokens
  IF item_record.premium_cost > 0 THEN
    SELECT public.spend_tokens(user_id, item_record.premium_cost, 'premium', 'avatar_purchase', 
                              'Purchased ' || item_record.name) INTO spend_result;
    
    IF NOT (spend_result->>'success')::boolean THEN
      RETURN spend_result;
    END IF;
  END IF;
  
  -- Unlock the item
  SELECT public.unlock_avatar_item(user_id, item_id, 'purchase') INTO unlock_result;
  
  RETURN json_build_object(
    'success', true,
    'item_name', item_record.name,
    'tokens_spent', COALESCE(item_record.token_cost, 0),
    'premium_spent', COALESCE(item_record.premium_cost, 0)
  );
END;
$$;

-- Update the handle_new_user function to include avatar initialization
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
  
  RETURN NEW;
END;
$$;
