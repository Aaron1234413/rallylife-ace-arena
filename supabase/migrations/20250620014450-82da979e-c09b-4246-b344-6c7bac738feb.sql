
-- First, let's check if tables exist and create only what's missing

-- Create friend_connections table (this is new)
CREATE TABLE IF NOT EXISTS public.friend_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id),
  addressee_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id),
  CHECK (requester_id != addressee_id)
);

-- Enable RLS on friend_connections (if not already enabled)
ALTER TABLE public.friend_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on friend_connections if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their own friend connections" ON public.friend_connections;
DROP POLICY IF EXISTS "Users can create friend requests" ON public.friend_connections;
DROP POLICY IF EXISTS "Users can update friend connections they're involved in" ON public.friend_connections;

-- RLS Policies for friend_connections
CREATE POLICY "Users can view their own friend connections" 
  ON public.friend_connections 
  FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friend requests" 
  ON public.friend_connections 
  FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friend connections they're involved in" 
  ON public.friend_connections 
  FOR UPDATE 
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Create indexes for friend_connections
CREATE INDEX IF NOT EXISTS idx_friend_connections_requester ON public.friend_connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_friend_connections_addressee ON public.friend_connections(addressee_id);
CREATE INDEX IF NOT EXISTS idx_friend_connections_status ON public.friend_connections(status);

-- Create function to get user's friends
CREATE OR REPLACE FUNCTION get_user_friends(user_id UUID)
RETURNS TABLE(
  friend_id UUID,
  friend_name TEXT,
  friend_avatar_url TEXT,
  connection_status TEXT,
  connected_since TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN fc.requester_id = user_id THEN fc.addressee_id
      ELSE fc.requester_id
    END as friend_id,
    p.full_name as friend_name,
    p.avatar_url as friend_avatar_url,
    fc.status as connection_status,
    fc.updated_at as connected_since
  FROM public.friend_connections fc
  JOIN public.profiles p ON (
    CASE 
      WHEN fc.requester_id = user_id THEN p.id = fc.addressee_id
      ELSE p.id = fc.requester_id
    END
  )
  WHERE (fc.requester_id = user_id OR fc.addressee_id = user_id)
    AND fc.status = 'accepted'
  ORDER BY fc.updated_at DESC;
END;
$$;
