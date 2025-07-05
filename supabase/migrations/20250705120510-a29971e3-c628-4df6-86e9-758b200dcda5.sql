-- Create user_feedback table for general player voice feedback
CREATE TABLE public.user_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own feedback" 
ON public.user_feedback 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" 
ON public.user_feedback 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_user_feedback_user_id ON public.user_feedback(user_id);
CREATE INDEX idx_user_feedback_status ON public.user_feedback(status);
CREATE INDEX idx_user_feedback_created_at ON public.user_feedback(created_at DESC);