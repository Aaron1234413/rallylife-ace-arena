
-- Create comprehensive activity logging table
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'match', 'training', 'lesson', 'social', 'tournament', 'practice'
  activity_category TEXT NOT NULL, -- 'on_court', 'off_court', 'social', 'educational'
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER, -- Duration of activity in minutes
  intensity_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'extreme'
  location TEXT,
  opponent_name TEXT, -- For matches
  coach_name TEXT, -- For lessons
  score TEXT, -- Match score (e.g., "6-4, 6-2")
  result TEXT, -- 'win', 'loss', 'draw', 'completed' (for non-competitive activities)
  notes TEXT, -- Additional notes from player
  weather_conditions TEXT,
  court_surface TEXT, -- 'hard', 'clay', 'grass', 'indoor'
  equipment_used TEXT[], -- Array of equipment used
  skills_practiced TEXT[], -- Array of skills worked on
  energy_before INTEGER CHECK (energy_before >= 1 AND energy_before <= 10), -- 1-10 scale
  energy_after INTEGER CHECK (energy_after >= 1 AND energy_after <= 10), -- 1-10 scale
  enjoyment_rating INTEGER CHECK (enjoyment_rating >= 1 AND enjoyment_rating <= 5), -- 1-5 scale
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5), -- 1-5 scale
  hp_impact INTEGER DEFAULT 0, -- HP change from this activity
  xp_earned INTEGER DEFAULT 0, -- XP earned from this activity
  tags TEXT[], -- Custom tags for categorization
  is_competitive BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false, -- Official tournament/league match
  metadata JSONB, -- Additional flexible data storage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now() -- When the activity actually happened
);

-- Add indexes for better query performance
CREATE INDEX idx_activity_logs_player_id ON public.activity_logs(player_id);
CREATE INDEX idx_activity_logs_activity_type ON public.activity_logs(activity_type);
CREATE INDEX idx_activity_logs_logged_at ON public.activity_logs(logged_at);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);

-- Create function to log comprehensive activity
CREATE OR REPLACE FUNCTION public.log_comprehensive_activity(
  user_id UUID,
  activity_type TEXT,
  activity_category TEXT,
  title TEXT,
  description TEXT DEFAULT NULL,
  duration_minutes INTEGER DEFAULT NULL,
  intensity_level TEXT DEFAULT 'medium',
  location TEXT DEFAULT NULL,
  opponent_name TEXT DEFAULT NULL,
  coach_name TEXT DEFAULT NULL,
  score TEXT DEFAULT NULL,
  result TEXT DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  weather_conditions TEXT DEFAULT NULL,
  court_surface TEXT DEFAULT NULL,
  equipment_used TEXT[] DEFAULT NULL,
  skills_practiced TEXT[] DEFAULT NULL,
  energy_before INTEGER DEFAULT NULL,
  energy_after INTEGER DEFAULT NULL,
  enjoyment_rating INTEGER DEFAULT NULL,
  difficulty_rating INTEGER DEFAULT NULL,
  tags TEXT[] DEFAULT NULL,
  is_competitive BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_record RECORD;
  hp_change INTEGER := 0;
  xp_amount INTEGER := 0;
  hp_result JSON;
  xp_result JSON;
  result_json JSON;
BEGIN
  -- Calculate HP and XP based on activity type and parameters
  CASE activity_type
    WHEN 'match' THEN
      IF is_competitive THEN
        hp_change := CASE 
          WHEN result = 'win' THEN 5
          WHEN result = 'loss' THEN -10
          ELSE -5
        END;
        xp_amount := CASE 
          WHEN is_official THEN 75
          WHEN result = 'win' THEN 60
          ELSE 50
        END;
      ELSE
        hp_change := -5;
        xp_amount := 40;
      END IF;
    WHEN 'training' THEN
      hp_change := CASE intensity_level
        WHEN 'high' THEN -8
        WHEN 'extreme' THEN -15
        WHEN 'medium' THEN -5
        ELSE -3
      END;
      xp_amount := CASE intensity_level
        WHEN 'extreme' THEN 40
        WHEN 'high' THEN 35
        WHEN 'medium' THEN 30
        ELSE 20
      END;
    WHEN 'lesson' THEN
      hp_change := -3;
      xp_amount := 45;
    WHEN 'social' THEN
      hp_change := 5;
      xp_amount := 15;
    WHEN 'tournament' THEN
      hp_change := CASE 
        WHEN result = 'win' THEN 10
        WHEN result = 'loss' THEN -15
        ELSE -10
      END;
      xp_amount := CASE 
        WHEN result = 'win' THEN 100
        ELSE 80
      END;
    ELSE
      hp_change := 0;
      xp_amount := 10;
  END CASE;

  -- Adjust based on duration if provided
  IF duration_minutes IS NOT NULL THEN
    -- Scale XP based on duration (base calculation assumes 60 minutes)
    xp_amount := GREATEST(5, (xp_amount * duration_minutes / 60)::INTEGER);
    
    -- Scale HP impact based on duration for training activities
    IF activity_type IN ('training', 'lesson') THEN
      hp_change := (hp_change * duration_minutes / 60)::INTEGER;
    END IF;
  END IF;

  -- Insert the activity log
  INSERT INTO public.activity_logs (
    player_id, activity_type, activity_category, title, description,
    duration_minutes, intensity_level, location, opponent_name, coach_name,
    score, result, notes, weather_conditions, court_surface, equipment_used,
    skills_practiced, energy_before, energy_after, enjoyment_rating,
    difficulty_rating, hp_impact, xp_earned, tags, is_competitive,
    is_official, logged_at, metadata
  )
  VALUES (
    user_id, activity_type, activity_category, title, description,
    duration_minutes, intensity_level, location, opponent_name, coach_name,
    score, result, notes, weather_conditions, court_surface, equipment_used,
    skills_practiced, energy_before, energy_after, enjoyment_rating,
    difficulty_rating, hp_change, xp_amount, tags, is_competitive,
    is_official, logged_at, metadata
  )
  RETURNING * INTO activity_record;

  -- Apply HP change if any
  IF hp_change != 0 THEN
    IF hp_change > 0 THEN
      SELECT public.restore_hp(user_id, hp_change, activity_type, 
                              'HP restored from ' || title) INTO hp_result;
    ELSE
      -- For HP loss, we'll update directly (since restore_hp only adds HP)
      UPDATE public.player_hp 
      SET current_hp = GREATEST(20, current_hp + hp_change),
          last_activity = now(),
          updated_at = now()
      WHERE player_id = user_id;
      
      -- Log the HP activity
      INSERT INTO public.hp_activities (player_id, activity_type, hp_change, hp_before, hp_after, description)
      SELECT user_id, activity_type, hp_change, 
             ph.current_hp - hp_change, ph.current_hp, 
             'HP impact from ' || title
      FROM public.player_hp ph WHERE ph.player_id = user_id;
    END IF;
  END IF;

  -- Apply XP gain if any
  IF xp_amount > 0 THEN
    SELECT public.add_xp(user_id, xp_amount, activity_type, 
                        'XP earned from ' || title) INTO xp_result;
  END IF;

  -- Return result
  result_json := json_build_object(
    'success', true,
    'activity_id', activity_record.id,
    'activity_title', activity_record.title,
    'hp_change', hp_change,
    'xp_earned', xp_amount,
    'activity_type', activity_type,
    'logged_at', activity_record.logged_at
  );

  RETURN result_json;
END;
$$;

-- Create function to get activity feed for a player
CREATE OR REPLACE FUNCTION public.get_activity_feed(
  user_id UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0,
  activity_type_filter TEXT DEFAULT NULL,
  date_from TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  date_to TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  activity_type TEXT,
  activity_category TEXT,
  title TEXT,
  description TEXT,
  duration_minutes INTEGER,
  intensity_level TEXT,
  location TEXT,
  opponent_name TEXT,
  coach_name TEXT,
  score TEXT,
  result TEXT,
  hp_impact INTEGER,
  xp_earned INTEGER,
  enjoyment_rating INTEGER,
  is_competitive BOOLEAN,
  logged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.activity_type,
    al.activity_category,
    al.title,
    al.description,
    al.duration_minutes,
    al.intensity_level,
    al.location,
    al.opponent_name,
    al.coach_name,
    al.score,
    al.result,
    al.hp_impact,
    al.xp_earned,
    al.enjoyment_rating,
    al.is_competitive,
    al.logged_at,
    al.created_at
  FROM public.activity_logs al
  WHERE al.player_id = user_id
    AND (activity_type_filter IS NULL OR al.activity_type = activity_type_filter)
    AND (date_from IS NULL OR al.logged_at >= date_from)
    AND (date_to IS NULL OR al.logged_at <= date_to)
  ORDER BY al.logged_at DESC, al.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Create function to get activity stats for a player
CREATE OR REPLACE FUNCTION public.get_activity_stats(
  user_id UUID,
  days_back INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats_json JSON;
  start_date TIMESTAMP WITH TIME ZONE;
BEGIN
  start_date := now() - (days_back || ' days')::INTERVAL;
  
  SELECT json_build_object(
    'total_activities', COUNT(*),
    'total_duration_minutes', COALESCE(SUM(duration_minutes), 0),
    'total_hp_impact', COALESCE(SUM(hp_impact), 0),
    'total_xp_earned', COALESCE(SUM(xp_earned), 0),
    'activities_by_type', json_object_agg(activity_type, type_count),
    'avg_enjoyment_rating', ROUND(AVG(enjoyment_rating), 2),
    'competitive_activities', SUM(CASE WHEN is_competitive THEN 1 ELSE 0 END),
    'wins', SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END),
    'losses', SUM(CASE WHEN result = 'loss' THEN 1 ELSE 0 END)
  ) INTO stats_json
  FROM (
    SELECT 
      activity_type,
      duration_minutes,
      hp_impact,
      xp_earned,
      enjoyment_rating,
      is_competitive,
      result,
      COUNT(*) OVER (PARTITION BY activity_type) as type_count
    FROM public.activity_logs
    WHERE player_id = user_id
      AND logged_at >= start_date
  ) stats;
  
  RETURN COALESCE(stats_json, '{}'::JSON);
END;
$$;

-- Add RLS policies for activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (player_id = auth.uid());

CREATE POLICY "Users can create their own activity logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (player_id = auth.uid());

CREATE POLICY "Users can update their own activity logs"
  ON public.activity_logs
  FOR UPDATE
  USING (player_id = auth.uid());

CREATE POLICY "Users can delete their own activity logs"
  ON public.activity_logs
  FOR DELETE
  USING (player_id = auth.uid());
