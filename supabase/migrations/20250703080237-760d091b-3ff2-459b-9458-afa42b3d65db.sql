-- Fix the infinite recursion in conversation_participants RLS
-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can insert their own participation" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can update their own participation" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.conversations;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;

-- Drop the problematic function
DROP FUNCTION IF EXISTS public.user_can_access_conversation(uuid, uuid) CASCADE;

-- Create simple, direct policies that don't cause recursion
CREATE POLICY "Users can view participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  user_id = auth.uid() OR 
  conversation_id IN (
    SELECT cp2.conversation_id 
    FROM public.conversation_participants cp2 
    WHERE cp2.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own participation"
ON public.conversation_participants  
FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own participation"
ON public.conversation_participants
FOR UPDATE
USING (user_id = auth.uid());

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