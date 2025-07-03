-- Fix messaging infrastructure issues (Part 2) - Fix functions
-- 5. Drop and recreate the send_message function to resolve ambiguous column references
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