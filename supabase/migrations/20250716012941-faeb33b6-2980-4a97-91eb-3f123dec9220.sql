-- Phase 2.3: Matchmaking Engine
-- Create matches table for managing tennis matches and challenges

CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'expired', 'declined')),
  scheduled_time TIMESTAMPTZ,
  court_location TEXT,
  stake_amount INTEGER DEFAULT 0,
  score TEXT,
  winner_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for match access
CREATE POLICY "Users can view their own matches" 
ON public.matches 
FOR SELECT 
USING (challenger_id = auth.uid() OR opponent_id = auth.uid());

CREATE POLICY "Users can create matches as challenger" 
ON public.matches 
FOR INSERT 
WITH CHECK (challenger_id = auth.uid());

CREATE POLICY "Users can update matches they're involved in" 
ON public.matches 
FOR UPDATE 
USING (challenger_id = auth.uid() OR opponent_id = auth.uid());

CREATE POLICY "Users can delete their own challenges" 
ON public.matches 
FOR DELETE 
USING (challenger_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_matches_challenger_id ON public.matches(challenger_id);
CREATE INDEX idx_matches_opponent_id ON public.matches(opponent_id);
CREATE INDEX idx_matches_status ON public.matches(status);
CREATE INDEX idx_matches_scheduled_time ON public.matches(scheduled_time);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_matches_updated_at
BEFORE UPDATE ON public.matches
FOR EACH ROW
EXECUTE FUNCTION public.update_matches_updated_at();