-- Add bio and experience_tags columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS experience_tags TEXT[] DEFAULT '{}';

-- Update RLS policies for player_hp to include coaches
DROP POLICY IF EXISTS "Users can view their own HP" ON public.player_hp;
CREATE POLICY "Users can view their own HP" ON public.player_hp
  FOR SELECT USING (player_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own HP" ON public.player_hp;
CREATE POLICY "Users can update their own HP" ON public.player_hp
  FOR UPDATE USING (player_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own HP" ON public.player_hp;
CREATE POLICY "Users can insert their own HP" ON public.player_hp
  FOR INSERT WITH CHECK (player_id = auth.uid());

-- Update RLS policies for player_xp to include coaches
DROP POLICY IF EXISTS "Users can view their own XP" ON public.player_xp;
CREATE POLICY "Users can view their own XP" ON public.player_xp
  FOR SELECT USING (player_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own XP" ON public.player_xp;
CREATE POLICY "Users can update their own XP" ON public.player_xp
  FOR UPDATE USING (player_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own XP" ON public.player_xp;
CREATE POLICY "Users can insert their own XP" ON public.player_xp
  FOR INSERT WITH CHECK (player_id = auth.uid());

-- Create session_feedback table
CREATE TABLE IF NOT EXISTS public.session_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for session_feedback
ALTER TABLE public.session_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for session_feedback
CREATE POLICY "Users can view feedback they're involved in" 
ON public.session_feedback FOR SELECT 
USING (coach_id = auth.uid() OR player_id = auth.uid());

CREATE POLICY "Coaches can create feedback" 
ON public.session_feedback FOR INSERT 
WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coaches can update their own feedback" 
ON public.session_feedback FOR UPDATE 
USING (coach_id = auth.uid());

-- Create coach_tips table
CREATE TABLE IF NOT EXISTS public.coach_tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for coach_tips
ALTER TABLE public.coach_tips ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_tips
CREATE POLICY "Users can view tips they're involved in" 
ON public.coach_tips FOR SELECT 
USING (coach_id = auth.uid() OR player_id = auth.uid());

CREATE POLICY "Players can create tips" 
ON public.coach_tips FOR INSERT 
WITH CHECK (player_id = auth.uid());

-- Create tip_coach function
CREATE OR REPLACE FUNCTION public.tip_coach(
  session_id_param UUID,
  coach_id_param UUID,
  tip_amount INTEGER
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  player_user_id UUID;
  result JSON;
BEGIN
  player_user_id := auth.uid();
  
  -- Check if player has enough tokens
  IF NOT EXISTS (
    SELECT 1 FROM public.token_balances 
    WHERE player_id = player_user_id 
    AND regular_tokens >= tip_amount
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient tokens');
  END IF;
  
  -- Transfer tokens from player to coach
  PERFORM public.spend_tokens(
    player_user_id,
    tip_amount,
    'regular',
    'coach_tip',
    'Tip for coaching session'
  );
  
  PERFORM public.add_tokens(
    coach_id_param,
    tip_amount,
    'regular',
    'coaching_tip_received',
    'Tip received from player'
  );
  
  -- Record the tip
  INSERT INTO public.coach_tips (session_id, coach_id, player_id, amount)
  VALUES (session_id_param, coach_id_param, player_user_id, tip_amount);
  
  result := json_build_object(
    'success', true,
    'amount', tip_amount,
    'message', 'Tip sent successfully!'
  );
  
  RETURN result;
END;
$$;