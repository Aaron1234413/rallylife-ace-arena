-- Fix the infinite recursion in conversation_participants RLS
-- The issue is our user_can_access_conversation function itself queries conversation_participants

-- Drop the problematic function and policies
DROP FUNCTION IF EXISTS public.user_can_access_conversation(uuid, uuid);
DROP POLICY IF EXISTS "Users can view participants in accessible conversations" ON public.conversation_participants;

-- Create a simple, direct policy that doesn't cause recursion
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  -- User can see participants if they are also a participant in the same conversation
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Update conversations policy to also be direct
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
CREATE POLICY "Users can view conversations they participate in"
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Update messages policies to be direct
DROP POLICY IF EXISTS "Users can view messages in accessible conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in accessible conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations"
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages in their conversations"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() 
  AND conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);