
-- Create feed_likes table
CREATE TABLE public.feed_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- Create feed_comments table  
CREATE TABLE public.feed_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL REFERENCES activity_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for feed_likes
CREATE POLICY "Anyone can view likes" ON public.feed_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.feed_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own likes" ON public.feed_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for feed_comments
CREATE POLICY "Anyone can view comments" ON public.feed_comments FOR SELECT USING (true);
CREATE POLICY "Users can add comments" ON public.feed_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.feed_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.feed_comments FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for both tables
ALTER TABLE public.feed_likes REPLICA IDENTITY FULL;
ALTER TABLE public.feed_comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_comments;

-- Create function to get feed posts with likes and comments count
CREATE OR REPLACE FUNCTION get_feed_posts_with_engagement(
  user_id_param UUID,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  activity_type TEXT,
  title TEXT,
  description TEXT,
  hp_impact INTEGER,
  xp_earned INTEGER,
  duration_minutes INTEGER,
  score TEXT,
  opponent_name TEXT,
  location TEXT,
  logged_at TIMESTAMP WITH TIME ZONE,
  player_id UUID,
  player_name TEXT,
  player_avatar TEXT,
  likes_count BIGINT,
  comments_count BIGINT,
  user_has_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.activity_type,
    al.title,
    al.description,
    al.hp_impact,
    al.xp_earned,
    al.duration_minutes,
    al.score,
    al.opponent_name,
    al.location,
    al.logged_at,
    al.player_id,
    p.full_name as player_name,
    p.avatar_url as player_avatar,
    COALESCE(likes.count, 0) as likes_count,
    COALESCE(comments.count, 0) as comments_count,
    CASE WHEN user_likes.activity_id IS NOT NULL THEN true ELSE false END as user_has_liked
  FROM activity_logs al
  JOIN profiles p ON al.player_id = p.id
  LEFT JOIN (
    SELECT activity_id, COUNT(*) as count
    FROM feed_likes
    GROUP BY activity_id
  ) likes ON al.id = likes.activity_id
  LEFT JOIN (
    SELECT activity_id, COUNT(*) as count  
    FROM feed_comments
    GROUP BY activity_id
  ) comments ON al.id = comments.activity_id
  LEFT JOIN feed_likes user_likes ON al.id = user_likes.activity_id AND user_likes.user_id = user_id_param
  ORDER BY al.logged_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Create function to toggle like
CREATE OR REPLACE FUNCTION toggle_feed_like(
  activity_id_param UUID,
  user_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  like_exists BOOLEAN;
BEGIN
  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM feed_likes 
    WHERE activity_id = activity_id_param AND user_id = user_id_param
  ) INTO like_exists;
  
  IF like_exists THEN
    -- Remove like
    DELETE FROM feed_likes 
    WHERE activity_id = activity_id_param AND user_id = user_id_param;
    RETURN false;
  ELSE
    -- Add like
    INSERT INTO feed_likes (activity_id, user_id)
    VALUES (activity_id_param, user_id_param);
    RETURN true;
  END IF;
END;
$$;

-- Create function to add comment
CREATE OR REPLACE FUNCTION add_feed_comment(
  activity_id_param UUID,
  user_id_param UUID,
  content_param TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  comment_id UUID;
BEGIN
  INSERT INTO feed_comments (activity_id, user_id, content)
  VALUES (activity_id_param, user_id_param, content_param)
  RETURNING id INTO comment_id;
  
  RETURN comment_id;
END;
$$;

-- Create function to get comments for an activity
CREATE OR REPLACE FUNCTION get_feed_comments(
  activity_id_param UUID,
  limit_count INTEGER DEFAULT 10,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fc.id,
    fc.content,
    fc.created_at,
    fc.user_id,
    p.full_name as user_name,
    p.avatar_url as user_avatar
  FROM feed_comments fc
  JOIN profiles p ON fc.user_id = p.id
  WHERE fc.activity_id = activity_id_param
  ORDER BY fc.created_at ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
