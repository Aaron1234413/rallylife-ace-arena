-- Create clubs table
CREATE TABLE public.clubs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  owner_id UUID NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  member_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create club_memberships table
CREATE TABLE public.club_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(club_id, user_id)
);

-- Enable RLS
ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

-- RLS policies for clubs
CREATE POLICY "Public clubs are viewable by everyone"
ON public.clubs
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can view clubs they own"
ON public.clubs
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can view clubs they're members of"
ON public.clubs
FOR SELECT
USING (id IN (
  SELECT club_id FROM public.club_memberships 
  WHERE user_id = auth.uid() AND status = 'active'
));

CREATE POLICY "Users can create clubs"
ON public.clubs
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Club owners can update their clubs"
ON public.clubs
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Club owners can delete their clubs"
ON public.clubs
FOR DELETE
USING (auth.uid() = owner_id);

-- RLS policies for club_memberships
CREATE POLICY "Users can view memberships of clubs they have access to"
ON public.club_memberships
FOR SELECT
USING (
  club_id IN (
    SELECT id FROM public.clubs 
    WHERE is_public = true 
    OR owner_id = auth.uid() 
    OR id IN (
      SELECT club_id FROM public.club_memberships 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

CREATE POLICY "Club owners can manage memberships"
ON public.club_memberships
FOR ALL
USING (
  club_id IN (
    SELECT id FROM public.clubs WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Users can join clubs (insert membership)"
ON public.club_memberships
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave clubs (update their own membership)"
ON public.club_memberships
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update club member count
CREATE OR REPLACE FUNCTION update_club_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.clubs 
    SET member_count = member_count + 1, updated_at = now()
    WHERE id = NEW.club_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      UPDATE public.clubs 
      SET member_count = member_count - 1, updated_at = now()
      WHERE id = NEW.club_id;
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      UPDATE public.clubs 
      SET member_count = member_count + 1, updated_at = now()
      WHERE id = NEW.club_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    UPDATE public.clubs 
    SET member_count = member_count - 1, updated_at = now()
    WHERE id = OLD.club_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member count updates
CREATE TRIGGER update_club_member_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.club_memberships
  FOR EACH ROW EXECUTE FUNCTION update_club_member_count();

-- Create function to initialize club owner membership
CREATE OR REPLACE FUNCTION initialize_club_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.club_memberships (club_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, 'owner', 'active');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically add owner as member
CREATE TRIGGER initialize_club_owner_membership_trigger
  AFTER INSERT ON public.clubs
  FOR EACH ROW EXECUTE FUNCTION initialize_club_owner_membership();

-- Create indexes for performance
CREATE INDEX idx_clubs_owner_id ON public.clubs(owner_id);
CREATE INDEX idx_clubs_is_public ON public.clubs(is_public);
CREATE INDEX idx_club_memberships_club_id ON public.club_memberships(club_id);
CREATE INDEX idx_club_memberships_user_id ON public.club_memberships(user_id);
CREATE INDEX idx_club_memberships_status ON public.club_memberships(status);