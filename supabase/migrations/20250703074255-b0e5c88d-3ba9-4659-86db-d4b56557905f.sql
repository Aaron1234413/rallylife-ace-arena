-- Fix messaging infrastructure issues
-- 1. Drop existing problematic RLS policies on conversation_participants
DROP POLICY IF EXISTS "Users can view their own conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update conversation participants" ON public.conversation_participants;

-- 2. Create security definer function to check conversation access safely
CREATE OR REPLACE FUNCTION public.user_has_conversation_access(conversation_id_param uuid, user_id_param uuid)
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

-- 3. Create new safe RLS policies for conversation_participants
CREATE POLICY "Users can view conversation participants for their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT DISTINCT cp2.conversation_id 
    FROM public.conversation_participants cp2 
    WHERE cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert conversation participants"
ON public.conversation_participants  
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversation participants"
ON public.conversation_participants
FOR UPDATE
USING (user_id = auth.uid());

-- 4. Fix messages table - ensure proper foreign key to profiles exists
-- First check if the foreign key exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'messages_sender_id_fkey' 
    AND table_name = 'messages'
  ) THEN
    ALTER TABLE public.messages 
    ADD CONSTRAINT messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id);
  END IF;
END $$;

-- 5. Fix the send_message function to resolve ambiguous column references
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
  IF NOT public.user_has_conversation_access(conversation_id_param, sender_user_id) THEN
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

-- 6. Create or update the create_direct_conversation function
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

-- 7. Ensure conversations table has proper RLS policies
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT cp.conversation_id 
    FROM public.conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);

-- 8. Ensure messages table has proper RLS policies  
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT cp.conversation_id 
    FROM public.conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND conversation_id IN (
    SELECT cp.conversation_id 
    FROM public.conversation_participants cp 
    WHERE cp.user_id = auth.uid()
  )
);