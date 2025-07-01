-- Create coach-player relationships table
CREATE TABLE public.coach_player_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL DEFAULT 'coaching',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(coach_id, player_id)
);

-- Enable RLS
ALTER TABLE public.coach_player_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Coaches can manage their own relationships"
ON public.coach_player_relationships
FOR ALL
USING (auth.uid() = coach_id);

CREATE POLICY "Players can view relationships involving them"
ON public.coach_player_relationships
FOR SELECT
USING (auth.uid() = player_id OR auth.uid() = coach_id);

-- Add coach invitation system
CREATE TABLE public.coach_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_email TEXT NOT NULL,
  player_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invitation_code TEXT NOT NULL UNIQUE DEFAULT substring(gen_random_uuid()::text, 1, 8),
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  message TEXT
);

-- Enable RLS for invitations
ALTER TABLE public.coach_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitations
CREATE POLICY "Coaches can manage their own invitations"
ON public.coach_invitations
FOR ALL
USING (auth.uid() = coach_id);

CREATE POLICY "Players can view invitations sent to them"
ON public.coach_invitations
FOR SELECT
USING (auth.uid() = player_id);

-- Function to accept coach invitation
CREATE OR REPLACE FUNCTION public.accept_coach_invitation(invitation_code_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
  result JSON;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.coach_invitations
  WHERE invitation_code = invitation_code_param
    AND status = 'pending'
    AND expires_at > now();
  
  IF invitation_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation code');
  END IF;
  
  -- Update invitation status
  UPDATE public.coach_invitations
  SET 
    status = 'accepted',
    player_id = auth.uid(),
    accepted_at = now()
  WHERE id = invitation_record.id;
  
  -- Create coach-player relationship
  INSERT INTO public.coach_player_relationships (coach_id, player_id, relationship_type, status)
  VALUES (invitation_record.coach_id, auth.uid(), 'coaching', 'active')
  ON CONFLICT (coach_id, player_id) DO UPDATE SET
    status = 'active',
    updated_at = now();
  
  result := json_build_object(
    'success', true,
    'coach_id', invitation_record.coach_id,
    'message', 'Successfully connected with coach!'
  );
  
  RETURN result;
END;
$$;

-- Function to send coach invitation
CREATE OR REPLACE FUNCTION public.send_coach_invitation(player_email_param TEXT, message_param TEXT DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  coach_user_id UUID;
  existing_player_id UUID;
  invitation_id UUID;
  invitation_code TEXT;
  result JSON;
BEGIN
  coach_user_id := auth.uid();
  
  -- Check if player already exists and get their ID
  SELECT id INTO existing_player_id
  FROM auth.users
  WHERE email = player_email_param;
  
  -- Create invitation
  INSERT INTO public.coach_invitations (coach_id, player_email, player_id, message)
  VALUES (coach_user_id, player_email_param, existing_player_id, message_param)
  RETURNING id, invitation_code INTO invitation_id, invitation_code;
  
  result := json_build_object(
    'success', true,
    'invitation_id', invitation_id,
    'invitation_code', invitation_code,
    'player_exists', existing_player_id IS NOT NULL
  );
  
  RETURN result;
END;
$$;