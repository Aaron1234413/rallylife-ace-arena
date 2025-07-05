-- Remove premium token functionality from the database

-- First, drop the premium token conversion function
DROP FUNCTION IF EXISTS public.convert_premium_tokens(uuid, integer, integer);

-- Update token_balances table to remove premium_tokens column
ALTER TABLE public.token_balances DROP COLUMN IF EXISTS premium_tokens;

-- Update the add_tokens function to remove premium token logic
CREATE OR REPLACE FUNCTION public.add_tokens(user_id uuid, amount integer, token_type text DEFAULT 'regular'::text, source text DEFAULT 'manual'::text, description text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  balance_record RECORD;
  new_balance INTEGER;
  new_lifetime INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO balance_record
  FROM public.token_balances
  WHERE player_id = user_id;
  
  -- If no record exists, initialize it
  IF balance_record IS NULL THEN
    PERFORM public.initialize_player_tokens(user_id);
    SELECT * INTO balance_record
    FROM public.token_balances
    WHERE player_id = user_id;
  END IF;
  
  -- Only handle regular tokens now
  new_balance := balance_record.regular_tokens + amount;
  new_lifetime := balance_record.lifetime_earned + amount;
  
  -- Update regular tokens and lifetime earned
  UPDATE public.token_balances
  SET regular_tokens = new_balance,
      lifetime_earned = new_lifetime,
      updated_at = now()
  WHERE player_id = user_id;
  
  -- Log the transaction
  INSERT INTO public.token_transactions (
    player_id, transaction_type, token_type, amount,
    balance_before, balance_after, source, description
  )
  VALUES (
    user_id, 'earn', 'regular', amount,
    balance_record.regular_tokens, new_balance, source, description
  );
  
  -- Return result
  result := json_build_object(
    'tokens_added', amount,
    'token_type', 'regular',
    'new_balance', new_balance,
    'lifetime_earned', new_lifetime
  );
  
  RETURN result;
END;
$function$;

-- Update spend_tokens function to only handle regular tokens
CREATE OR REPLACE FUNCTION public.spend_tokens(user_id uuid, amount integer, token_type text DEFAULT 'regular'::text, source text DEFAULT 'purchase'::text, description text DEFAULT NULL::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  balance_record RECORD;
  current_balance INTEGER;
  new_balance INTEGER;
  result JSON;
BEGIN
  -- Get current balance
  SELECT * INTO balance_record
  FROM public.token_balances
  WHERE player_id = user_id;
  
  -- Only handle regular tokens
  current_balance := balance_record.regular_tokens;
  
  IF current_balance < amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient tokens',
      'current_balance', current_balance,
      'required', amount
    );
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance - amount;
  
  -- Update balance
  UPDATE public.token_balances
  SET regular_tokens = new_balance,
      updated_at = now()
  WHERE player_id = user_id;
  
  -- Log the transaction
  INSERT INTO public.token_transactions (
    player_id, transaction_type, token_type, amount,
    balance_before, balance_after, source, description
  )
  VALUES (
    user_id, 'spend', 'regular', amount,
    current_balance, new_balance, source, description
  );
  
  -- Return result
  result := json_build_object(
    'success', true,
    'tokens_spent', amount,
    'token_type', 'regular',
    'new_balance', new_balance
  );
  
  RETURN result;
END;
$function$;

-- Update initialize_player_tokens to remove premium tokens
CREATE OR REPLACE FUNCTION public.initialize_player_tokens(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.token_balances (player_id, regular_tokens, lifetime_earned)
  VALUES (user_id, 100, 0) -- Start with 100 regular tokens
  ON CONFLICT (player_id) DO NOTHING;
END;
$function$;

-- Remove premium_cost from avatar_items table
ALTER TABLE public.avatar_items DROP COLUMN IF EXISTS premium_cost;

-- Update purchase_avatar_item function to remove premium token logic
CREATE OR REPLACE FUNCTION public.purchase_avatar_item(user_id uuid, item_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  item_record RECORD;
  spend_result JSON;
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
  
  -- Attempt to spend tokens (only regular tokens now)
  IF item_record.token_cost > 0 THEN
    SELECT public.spend_tokens(user_id, item_record.token_cost, 'regular', 'avatar_purchase', 
                              'Purchased ' || item_record.name) INTO spend_result;
    
    IF NOT (spend_result->>'success')::boolean THEN
      RETURN spend_result;
    END IF;
  END IF;
  
  -- Unlock the item
  INSERT INTO public.player_avatar_items (player_id, avatar_item_id, unlock_method)
  VALUES (user_id, item_id, 'purchase');
  
  RETURN json_build_object(
    'success', true,
    'item_name', item_record.name,
    'tokens_spent', COALESCE(item_record.token_cost, 0)
  );
END;
$function$;

-- Remove premium token references from achievements table
ALTER TABLE public.achievements DROP COLUMN IF EXISTS reward_premium_tokens;