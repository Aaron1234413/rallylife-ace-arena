-- Comprehensive messaging infrastructure fix
-- This migration consolidates and fixes all messaging-related database issues

-- 1. Fix foreign key relationships
-- Drop existing problematic foreign key if it exists
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Recreate foreign key constraint properly
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_id_fkey 
FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Ensure conversations foreign key exists
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_conversation_id_fkey;
ALTER TABLE public.messages 
ADD CONSTRAINT messages_conversation_id_fkey 
FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;

-- 2. Fix RLS policies to prevent infinite recursion
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants for their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own conversation participants" ON public.conversation_participants;

-- Create safe RLS policies for conversation_participants using security definer function
CREATE OR REPLACE FUNCTION public.user_can_access_conversation(conversation_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = conversation_id_param 
    AND cp.user_id = user_id_param
  );
$$;

-- New safe RLS policies for conversation_participants
CREATE POLICY "Users can view participants in accessible conversations"
ON public.conversation_participants
FOR SELECT
USING (public.user_can_access_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can insert their own participation"
ON public.conversation_participants  
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants
FOR UPDATE
USING (user_id = auth.uid());

-- 3. Fix conversations RLS policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
USING (public.user_can_access_conversation(id, auth.uid()));

-- 4. Fix messages RLS policies  
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in accessible conversations"
ON public.messages
FOR SELECT
USING (public.user_can_access_conversation(conversation_id, auth.uid()));

CREATE POLICY "Users can insert messages in accessible conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND public.user_can_access_conversation(conversation_id, auth.uid())
);

-- 5. Fix send_message function
DROP FUNCTION IF EXISTS public.send_message(uuid, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.send_message(
  conversation_id_param uuid,
  content_param text,
  message_type_param text DEFAULT 'text',
  metadata_param jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_user_id uuid;
  message_id uuid;
BEGIN
  -- Get the current user ID
  sender_user_id := auth.uid();
  
  -- Verify user has access to this conversation
  IF NOT public.user_can_access_conversation(conversation_id_param, sender_user_id) THEN
    RAISE EXCEPTION 'User does not have access to this conversation';
  END IF;
  
  -- Insert the message
  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    content,
    message_type,
    metadata
  )
  VALUES (
    conversation_id_param,
    sender_user_id,
    content_param,
    message_type_param,
    metadata_param
  )
  RETURNING id INTO message_id;
  
  -- Update conversation's updated_at timestamp
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = conversation_id_param;
  
  RETURN message_id;
END;
$$;

-- 6. Fix create_direct_conversation function
CREATE OR REPLACE FUNCTION public.create_direct_conversation(
  other_user_id_param uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
  conversation_id uuid;
  existing_conversation_id uuid;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Check if conversation already exists between these users
  SELECT c.id INTO existing_conversation_id
  FROM public.conversations c
  WHERE c.is_group = false
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp1 
    WHERE cp1.conversation_id = c.id AND cp1.user_id = current_user_id
  )
  AND EXISTS (
    SELECT 1 FROM public.conversation_participants cp2 
    WHERE cp2.conversation_id = c.id AND cp2.user_id = other_user_id_param
  )
  AND (
    SELECT COUNT(*) FROM public.conversation_participants cp3 
    WHERE cp3.conversation_id = c.id
  ) = 2;
  
  -- If conversation exists, return it
  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;
  
  -- Create new conversation
  INSERT INTO public.conversations (
    name,
    is_group,
    created_by
  )
  VALUES (
    NULL, -- Direct conversations don't need names
    false,
    current_user_id
  )
  RETURNING id INTO conversation_id;
  
  -- Add both participants
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES 
    (conversation_id, current_user_id),
    (conversation_id, other_user_id_param);
  
  RETURN conversation_id;
END;
$$;

-- 7. Fix send_challenge function parameters (ensure it exists with correct signature)
CREATE OR REPLACE FUNCTION public.send_challenge(
  challenged_user_id uuid,
  challenge_type text,
  stakes_tokens integer DEFAULT 0,
  stakes_premium_tokens integer DEFAULT 0,
  message text DEFAULT NULL,
  metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenger_user_id uuid;
  challenge_id uuid;
  conversation_id uuid;
BEGIN
  challenger_user_id := auth.uid();
  
  -- Get or create conversation between challenger and challenged user
  SELECT public.create_direct_conversation(challenged_user_id) INTO conversation_id;
  
  -- Create the challenge
  INSERT INTO public.challenges (
    challenger_id,
    challenged_id,
    challenge_type,
    stakes_tokens,
    stakes_premium_tokens,
    message,
    metadata,
    conversation_id
  )
  VALUES (
    challenger_user_id,
    challenged_user_id,
    challenge_type,
    stakes_tokens,
    stakes_premium_tokens,
    message,
    metadata,
    conversation_id
  )
  RETURNING id INTO challenge_id;
  
  -- Send a message about the challenge
  PERFORM public.send_message(
    conversation_id,
    COALESCE(message, 'Challenge sent: ' || challenge_type),
    'challenge',
    jsonb_build_object('challenge_id', challenge_id)
  );
  
  RETURN challenge_id;
END;
$$;