-- Phase 2: Data Structure Updates for Challenge System and Progress Tracking

-- Create daily_challenges table to store challenge definitions
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id TEXT NOT NULL UNIQUE, -- e.g., 'monday', 'tuesday', etc.
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('technique', 'strategy', 'equipment', 'knowledge')),
  content TEXT NOT NULL,
  action_text TEXT NOT NULL,
  tokens_reward INTEGER NOT NULL DEFAULT 3,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge_completions table to track user progress
CREATE TABLE public.challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  challenge_id TEXT NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  tokens_earned INTEGER NOT NULL DEFAULT 3,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one completion per player per challenge per day
  UNIQUE(player_id, challenge_id, completion_date)
);

-- Enable RLS on both tables
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_challenges (viewable by everyone)
CREATE POLICY "Anyone can view active challenges" 
ON public.daily_challenges 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for challenge_completions (users can only see/manage their own)
CREATE POLICY "Players can view their own challenge completions" 
ON public.challenge_completions 
FOR SELECT 
USING (player_id = auth.uid());

CREATE POLICY "Players can insert their own challenge completions" 
ON public.challenge_completions 
FOR INSERT 
WITH CHECK (player_id = auth.uid());

-- Insert the 7 daily challenges based on the ChallengeOfTheDay component
INSERT INTO public.daily_challenges (challenge_id, title, description, challenge_type, content, action_text, tokens_reward, day_of_week) VALUES
(
  'sunday',
  'Court Positioning Awareness',
  'Learn optimal court positioning for different shot scenarios',
  'strategy',
  'Position yourself 2-3 feet behind the baseline for groundstrokes. Move forward when your opponent hits short balls. Practice the "split step" before your opponent makes contact with the ball.',
  'Practice Split Step',
  3,
  0
),
(
  'monday',
  'Proper Grip Technique',
  'Master the fundamentals of tennis grips',
  'technique',
  'Eastern forehand grip: Place your hand flat against the strings, then slide down to the handle. Your knuckle should align with the 3rd bevel. Practice switching between forehand and backhand grips.',
  'Practice Grip Change',
  3,
  1
),
(
  'tuesday',
  'Equipment Knowledge',
  'Understanding tennis ball types and their characteristics',
  'equipment',
  'Regular duty balls: Best for hard courts and indoor play. Extra duty balls: Designed for outdoor hard courts with thicker felt. Clay court balls: Have less felt and bounce differently.',
  'Identify Ball Type',
  3,
  2
),
(
  'wednesday',
  'Mental Game Strategy',
  'Develop focus and concentration techniques',
  'strategy',
  'Use the "reset routine" between points: Take deep breaths, visualize your next shot, and use positive self-talk. Stay present and focus on one point at a time.',
  'Practice Reset Routine',
  3,
  3
),
(
  'thursday',
  'Footwork Fundamentals',
  'Master basic tennis footwork patterns',
  'technique',
  'Side shuffle: Keep feet parallel, step to the side without crossing legs. Cross-over step: For longer distances, cross your outside leg over. Always recover to center court after each shot.',
  'Practice Footwork',
  3,
  4
),
(
  'friday',
  'Match Strategy Basics',
  'Learn to read your opponent and adapt your game',
  'strategy',
  'Observe your opponent''s weaknesses in the first few games. Hit to their backhand if it''s weaker. Use variety - mix up pace, spin, and placement to keep them guessing.',
  'Study Strategy',
  3,
  5
),
(
  'saturday',
  'Tennis History Insight',
  'Learn about tennis legends and their techniques',
  'knowledge',
  'Steffi Graf''s forehand was legendary due to her perfect timing and follow-through. She used topspin to create sharp angles and hit winners from defensive positions. Study how pros generate topspin.',
  'Learn About Legends',
  3,
  6
);

-- Create function to complete daily challenge
CREATE OR REPLACE FUNCTION public.complete_daily_challenge(
  challenge_id_param TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  challenge_record RECORD;
  existing_completion RECORD;
  completion_id UUID;
  result JSON;
BEGIN
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Get challenge details
  SELECT * INTO challenge_record
  FROM public.daily_challenges
  WHERE challenge_id = challenge_id_param AND is_active = true;
  
  IF challenge_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Challenge not found');
  END IF;
  
  -- Check if already completed today
  SELECT * INTO existing_completion
  FROM public.challenge_completions
  WHERE player_id = user_id 
    AND challenge_id = challenge_id_param 
    AND completion_date = CURRENT_DATE;
  
  IF existing_completion IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Challenge already completed today');
  END IF;
  
  -- Create completion record
  INSERT INTO public.challenge_completions (
    player_id, challenge_id, tokens_earned
  )
  VALUES (user_id, challenge_id_param, challenge_record.tokens_reward)
  RETURNING id INTO completion_id;
  
  -- Award tokens to user
  PERFORM public.add_tokens(
    user_id,
    challenge_record.tokens_reward,
    'regular',
    'challenge_completion',
    'Completed daily challenge: ' || challenge_record.title
  );
  
  result := json_build_object(
    'success', true,
    'completion_id', completion_id,
    'tokens_earned', challenge_record.tokens_reward,
    'challenge_title', challenge_record.title
  );
  
  RETURN result;
END;
$$;

-- Create function to get today's challenge
CREATE OR REPLACE FUNCTION public.get_todays_challenge()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_dow INTEGER;
  challenge_record RECORD;
  user_id UUID;
  is_completed BOOLEAN := false;
  result JSON;
BEGIN
  user_id := auth.uid();
  today_dow := EXTRACT(DOW FROM CURRENT_DATE); -- 0=Sunday, 6=Saturday
  
  -- Get today's challenge
  SELECT * INTO challenge_record
  FROM public.daily_challenges
  WHERE day_of_week = today_dow AND is_active = true
  LIMIT 1;
  
  IF challenge_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No challenge found for today');
  END IF;
  
  -- Check if user has completed it today (if authenticated)
  IF user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.challenge_completions
      WHERE player_id = user_id 
        AND challenge_id = challenge_record.challenge_id 
        AND completion_date = CURRENT_DATE
    ) INTO is_completed;
  END IF;
  
  result := json_build_object(
    'success', true,
    'challenge', json_build_object(
      'id', challenge_record.challenge_id,
      'title', challenge_record.title,
      'description', challenge_record.description,
      'type', challenge_record.challenge_type,
      'content', challenge_record.content,
      'action_text', challenge_record.action_text,
      'tokens_reward', challenge_record.tokens_reward,
      'is_completed', is_completed
    )
  );
  
  RETURN result;
END;
$$;