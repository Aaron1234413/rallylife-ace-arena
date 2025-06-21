
-- Create function to handle social play feed posts
CREATE OR REPLACE FUNCTION public.create_social_play_feed_post()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  participant_names TEXT[];
  participant_count INTEGER;
  duration_minutes INTEGER;
  competitive_level_text TEXT;
  description_text TEXT;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Calculate session duration
    duration_minutes := CASE 
      WHEN NEW.start_time IS NOT NULL THEN
        EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60
      ELSE 0
    END;
    
    -- Get participant names and count
    SELECT 
      ARRAY_AGG(p.full_name) FILTER (WHERE p.full_name IS NOT NULL),
      COUNT(*)
    INTO participant_names, participant_count
    FROM public.social_play_participants spp
    JOIN public.profiles p ON spp.user_id = p.id
    WHERE spp.session_id = NEW.id 
      AND spp.status IN ('joined', 'accepted');
    
    -- Set default values if null
    participant_names := COALESCE(participant_names, ARRAY[]::TEXT[]);
    participant_count := COALESCE(participant_count, 0);
    
    -- Format competitive level
    competitive_level_text := CASE NEW.competitive_level
      WHEN 'low' THEN 'Chill'
      WHEN 'medium' THEN 'Fun'
      WHEN 'high' THEN 'Competitive'
      ELSE 'Social'
    END;
    
    -- Build description
    description_text := 'Completed a ' || LOWER(competitive_level_text) || ' ' || NEW.session_type || ' session';
    IF participant_count > 0 THEN
      description_text := description_text || ' with ' || participant_count || ' friend';
      IF participant_count > 1 THEN
        description_text := description_text || 's';
      END IF;
    END IF;
    
    IF NEW.location IS NOT NULL THEN
      description_text := description_text || ' at ' || NEW.location;
    END IF;
    
    -- Insert into activity_logs to create feed post
    INSERT INTO public.activity_logs (
      player_id,
      activity_type,
      activity_category,
      title,
      description,
      duration_minutes,
      location,
      score,
      xp_earned,
      hp_impact,
      metadata,
      logged_at
    ) VALUES (
      NEW.created_by,
      'social_play',
      'social',
      'Social ' || INITCAP(NEW.session_type) || ' Session',
      description_text,
      duration_minutes,
      NEW.location,
      NEW.final_score,
      0, -- XP already awarded in completion function
      0, -- HP already awarded in completion function
      jsonb_build_object(
        'session_id', NEW.id,
        'session_type', NEW.session_type,
        'competitive_level', NEW.competitive_level,
        'participant_count', participant_count + 1, -- +1 for session creator
        'participant_names', participant_names,
        'mood', NEW.mood,
        'notes', NEW.notes
      ),
      NEW.end_time
    );
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_social_play_feed_post ON public.social_play_sessions;
CREATE TRIGGER trigger_social_play_feed_post
  AFTER UPDATE ON public.social_play_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.create_social_play_feed_post();
