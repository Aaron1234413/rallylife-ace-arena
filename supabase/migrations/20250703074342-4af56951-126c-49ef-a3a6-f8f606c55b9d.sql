-- Fix messaging infrastructure issues (Part 1)
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