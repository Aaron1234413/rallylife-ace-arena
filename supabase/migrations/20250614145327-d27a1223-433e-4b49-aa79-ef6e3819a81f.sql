
-- Create table for coach leaderboard entries
CREATE TABLE public.coach_leaderboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leaderboard_type TEXT NOT NULL, -- 'crp', 'cxp', 'player_success', 'overall'
  rank_position INTEGER NOT NULL,
  score_value NUMERIC NOT NULL,
  period_type TEXT NOT NULL DEFAULT 'all_time', -- 'weekly', 'monthly', 'yearly', 'all_time'
  period_start DATE,
  period_end DATE,
  metadata JSONB DEFAULT '{}',
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying
CREATE INDEX idx_coach_leaderboards_type_period ON public.coach_leaderboards(leaderboard_type, period_type);
CREATE INDEX idx_coach_leaderboards_rank ON public.coach_leaderboards(leaderboard_type, period_type, rank_position);
CREATE INDEX idx_coach_leaderboards_coach ON public.coach_leaderboards(coach_id);

-- Enable RLS
ALTER TABLE public.coach_leaderboards ENABLE ROW LEVEL SECURITY;

-- RLS policies - leaderboards are public read-only
CREATE POLICY "Anyone can view coach leaderboards" ON public.coach_leaderboards FOR SELECT USING (true);
CREATE POLICY "Only system can modify coach leaderboards" ON public.coach_leaderboards FOR ALL USING (false);

-- Function to calculate and update coach leaderboards
CREATE OR REPLACE FUNCTION public.calculate_coach_leaderboards(
  leaderboard_type TEXT DEFAULT 'all',
  period_type TEXT DEFAULT 'all_time'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  period_start_date DATE;
  period_end_date DATE;
  leaderboard_count INTEGER := 0;
  current_count INTEGER;
BEGIN
  -- Determine period dates
  CASE period_type
    WHEN 'weekly' THEN
      period_start_date := date_trunc('week', CURRENT_DATE)::DATE;
      period_end_date := (period_start_date + INTERVAL '6 days')::DATE;
    WHEN 'monthly' THEN
      period_start_date := date_trunc('month', CURRENT_DATE)::DATE;
      period_end_date := (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE;
    WHEN 'yearly' THEN
      period_start_date := date_trunc('year', CURRENT_DATE)::DATE;
      period_end_date := (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year - 1 day')::DATE;
    ELSE
      period_start_date := NULL;
      period_end_date := NULL;
  END CASE;

  -- Clear existing leaderboard data for this type and period
  DELETE FROM public.coach_leaderboards 
  WHERE (leaderboard_type = calculate_coach_leaderboards.leaderboard_type OR calculate_coach_leaderboards.leaderboard_type = 'all')
    AND period_type = calculate_coach_leaderboards.period_type;

  -- Calculate CRP leaderboard
  IF leaderboard_type IN ('crp', 'all') THEN
    INSERT INTO public.coach_leaderboards (
      coach_id, leaderboard_type, rank_position, score_value, 
      period_type, period_start, period_end, metadata
    )
    SELECT 
      cc.coach_id,
      'crp',
      ROW_NUMBER() OVER (ORDER BY cc.current_crp DESC, cc.total_crp_earned DESC),
      cc.current_crp,
      calculate_coach_leaderboards.period_type,
      period_start_date,
      period_end_date,
      jsonb_build_object(
        'total_crp_earned', cc.total_crp_earned,
        'reputation_level', cc.reputation_level,
        'visibility_score', cc.visibility_score
      )
    FROM public.coach_crp cc
    JOIN public.profiles p ON cc.coach_id = p.id
    WHERE p.role = 'coach'
    ORDER BY cc.current_crp DESC, cc.total_crp_earned DESC;
    
    GET DIAGNOSTICS current_count = ROW_COUNT;
    leaderboard_count := leaderboard_count + current_count;
  END IF;

  -- Calculate CXP leaderboard
  IF leaderboard_type IN ('cxp', 'all') THEN
    INSERT INTO public.coach_leaderboards (
      coach_id, leaderboard_type, rank_position, score_value, 
      period_type, period_start, period_end, metadata
    )
    SELECT 
      cx.coach_id,
      'cxp',
      ROW_NUMBER() OVER (ORDER BY cx.total_cxp_earned DESC, cx.current_level DESC),
      cx.total_cxp_earned,
      calculate_coach_leaderboards.period_type,
      period_start_date,
      period_end_date,
      jsonb_build_object(
        'current_level', cx.current_level,
        'coaching_tier', cx.coaching_tier,
        'commission_rate', cx.commission_rate,
        'current_cxp', cx.current_cxp
      )
    FROM public.coach_cxp cx
    JOIN public.profiles p ON cx.coach_id = p.id
    WHERE p.role = 'coach'
    ORDER BY cx.total_cxp_earned DESC, cx.current_level DESC;
    
    GET DIAGNOSTICS current_count = ROW_COUNT;
    leaderboard_count := leaderboard_count + current_count;
  END IF;

  -- Calculate Player Success leaderboard (based on positive feedback)
  IF leaderboard_type IN ('player_success', 'all') THEN
    INSERT INTO public.coach_leaderboards (
      coach_id, leaderboard_type, rank_position, score_value, 
      period_type, period_start, period_end, metadata
    )
    WITH coach_success AS (
      SELECT 
        pf.coach_id,
        COUNT(*) as total_feedback,
        AVG(pf.rating) as avg_rating,
        SUM(CASE WHEN pf.rating >= 4 THEN 1 ELSE 0 END) as positive_feedback,
        SUM(pf.crp_awarded) as total_crp_from_feedback
      FROM public.player_feedback pf
      JOIN public.profiles p ON pf.coach_id = p.id
      WHERE p.role = 'coach'
        AND (period_start_date IS NULL OR pf.created_at >= period_start_date)
        AND (period_end_date IS NULL OR pf.created_at <= period_end_date + INTERVAL '1 day')
      GROUP BY pf.coach_id
      HAVING COUNT(*) >= 3 -- Minimum feedback requirement
    )
    SELECT 
      cs.coach_id,
      'player_success',
      ROW_NUMBER() OVER (ORDER BY cs.avg_rating DESC, cs.positive_feedback DESC),
      cs.avg_rating,
      calculate_coach_leaderboards.period_type,
      period_start_date,
      period_end_date,
      jsonb_build_object(
        'total_feedback', cs.total_feedback,
        'positive_feedback', cs.positive_feedback,
        'success_rate', ROUND((cs.positive_feedback::NUMERIC / cs.total_feedback) * 100, 2),
        'total_crp_from_feedback', cs.total_crp_from_feedback
      )
    FROM coach_success cs
    ORDER BY cs.avg_rating DESC, cs.positive_feedback DESC;
    
    GET DIAGNOSTICS current_count = ROW_COUNT;
    leaderboard_count := leaderboard_count + current_count;
  END IF;

  -- Calculate Overall leaderboard (composite score)
  IF leaderboard_type IN ('overall', 'all') THEN
    INSERT INTO public.coach_leaderboards (
      coach_id, leaderboard_type, rank_position, score_value, 
      period_type, period_start, period_end, metadata
    )
    WITH coach_overall AS (
      SELECT 
        p.id as coach_id,
        -- Composite score: normalized CRP (40%) + normalized CXP (40%) + feedback score (20%)
        (
          COALESCE(
            (cc.current_crp::NUMERIC / NULLIF(MAX(cc.current_crp) OVER (), 0)) * 0.4, 0
          ) +
          COALESCE(
            (cx.total_cxp_earned::NUMERIC / NULLIF(MAX(cx.total_cxp_earned) OVER (), 0)) * 0.4, 0
          ) +
          COALESCE(
            (feedback_avg::NUMERIC / 5.0) * 0.2, 0
          )
        ) * 100 as composite_score,
        cc.current_crp,
        cx.total_cxp_earned,
        cx.current_level,
        cx.coaching_tier,
        feedback_avg,
        feedback_count
      FROM public.profiles p
      LEFT JOIN public.coach_crp cc ON p.id = cc.coach_id
      LEFT JOIN public.coach_cxp cx ON p.id = cx.coach_id
      LEFT JOIN (
        SELECT 
          coach_id, 
          AVG(rating) as feedback_avg,
          COUNT(*) as feedback_count
        FROM public.player_feedback 
        WHERE (period_start_date IS NULL OR created_at >= period_start_date)
          AND (period_end_date IS NULL OR created_at <= period_end_date + INTERVAL '1 day')
        GROUP BY coach_id
      ) pf ON p.id = pf.coach_id
      WHERE p.role = 'coach'
        AND (cc.coach_id IS NOT NULL OR cx.coach_id IS NOT NULL)
    )
    SELECT 
      co.coach_id,
      'overall',
      ROW_NUMBER() OVER (ORDER BY co.composite_score DESC),
      co.composite_score,
      calculate_coach_leaderboards.period_type,
      period_start_date,
      period_end_date,
      jsonb_build_object(
        'current_crp', co.current_crp,
        'total_cxp_earned', co.total_cxp_earned,
        'current_level', co.current_level,
        'coaching_tier', co.coaching_tier,
        'avg_rating', co.feedback_avg,
        'feedback_count', co.feedback_count
      )
    FROM coach_overall co
    ORDER BY co.composite_score DESC;
    
    GET DIAGNOSTICS current_count = ROW_COUNT;
    leaderboard_count := leaderboard_count + current_count;
  END IF;

  -- Return result
  result := json_build_object(
    'success', true,
    'leaderboard_type', leaderboard_type,
    'period_type', period_type,
    'period_start', period_start_date,
    'period_end', period_end_date,
    'entries_created', leaderboard_count,
    'calculated_at', now()
  );

  RETURN result;
END;
$$;

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION public.get_coach_leaderboard(
  leaderboard_type TEXT DEFAULT 'overall',
  period_type TEXT DEFAULT 'all_time',
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  rank_position INTEGER,
  coach_id UUID,
  coach_name TEXT,
  coach_avatar_url TEXT,
  score_value NUMERIC,
  metadata JSONB,
  calculated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.rank_position,
    cl.coach_id,
    p.full_name as coach_name,
    p.avatar_url as coach_avatar_url,
    cl.score_value,
    cl.metadata,
    cl.calculated_at
  FROM public.coach_leaderboards cl
  JOIN public.profiles p ON cl.coach_id = p.id
  WHERE cl.leaderboard_type = get_coach_leaderboard.leaderboard_type
    AND cl.period_type = get_coach_leaderboard.period_type
  ORDER BY cl.rank_position ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
