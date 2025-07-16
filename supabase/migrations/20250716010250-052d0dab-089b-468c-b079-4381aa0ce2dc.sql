-- Create match_notifications table
CREATE TABLE public.match_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.active_match_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('challenge_received', 'challenge_accepted', 'challenge_declined', 'opponent_running_late', 'match_completed', 'match_cancelled')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" 
ON public.match_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.match_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
ON public.match_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_match_notifications_user_id ON public.match_notifications(user_id);
CREATE INDEX idx_match_notifications_created_at ON public.match_notifications(created_at);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_match_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_match_notifications_updated_at
  BEFORE UPDATE ON public.match_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_match_notifications_updated_at();