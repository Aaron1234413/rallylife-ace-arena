
-- Create conversations table for managing chat rooms between users
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  is_group BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conversation participants table for tracking who's in each conversation
CREATE TABLE public.conversation_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(conversation_id, user_id)
);

-- Create messages table for storing actual messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenges table for storing game challenges between players
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenger_id UUID REFERENCES auth.users NOT NULL,
  challenged_id UUID REFERENCES auth.users NOT NULL,
  conversation_id UUID REFERENCES public.conversations,
  challenge_type TEXT NOT NULL,
  stakes_tokens INTEGER DEFAULT 0,
  stakes_premium_tokens INTEGER DEFAULT 0,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES auth.users,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations FOR SELECT
  USING (
    id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants in their conversations"
  ON public.conversation_participants FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join conversations"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for challenges
CREATE POLICY "Users can view challenges involving them"
  ON public.challenges FOR SELECT
  USING (challenger_id = auth.uid() OR challenged_id = auth.uid());

CREATE POLICY "Users can create challenges"
  ON public.challenges FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);

CREATE POLICY "Users can update challenges they're involved in"
  ON public.challenges FOR UPDATE
  USING (challenger_id = auth.uid() OR challenged_id = auth.uid());

-- Function to create a direct conversation between two users
CREATE OR REPLACE FUNCTION public.create_direct_conversation(
  other_user_id UUID,
  conversation_name TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conversation_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if conversation already exists between these two users
  SELECT c.id INTO conversation_id
  FROM public.conversations c
  WHERE c.is_group = false
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp1 
      WHERE cp1.conversation_id = c.id AND cp1.user_id = current_user_id
    )
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp2 
      WHERE cp2.conversation_id = c.id AND cp2.user_id = other_user_id
    );
  
  -- If conversation doesn't exist, create it
  IF conversation_id IS NULL THEN
    INSERT INTO public.conversations (name, is_group, created_by)
    VALUES (conversation_name, false, current_user_id)
    RETURNING id INTO conversation_id;
    
    -- Add both participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, current_user_id),
      (conversation_id, other_user_id);
  END IF;
  
  RETURN conversation_id;
END;
$$;

-- Function to send a message
CREATE OR REPLACE FUNCTION public.send_message(
  conversation_id UUID,
  content TEXT,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Verify user is participant in conversation
  IF NOT EXISTS (
    SELECT 1 FROM public.conversation_participants 
    WHERE conversation_id = send_message.conversation_id 
    AND user_id = current_user_id
  ) THEN
    RAISE EXCEPTION 'User is not a participant in this conversation';
  END IF;
  
  -- Insert message
  INSERT INTO public.messages (conversation_id, sender_id, content, message_type, metadata)
  VALUES (send_message.conversation_id, current_user_id, content, message_type, metadata)
  RETURNING id INTO message_id;
  
  -- Update conversation timestamp
  UPDATE public.conversations 
  SET updated_at = now() 
  WHERE id = send_message.conversation_id;
  
  RETURN message_id;
END;
$$;

-- Function to send a challenge
CREATE OR REPLACE FUNCTION public.send_challenge(
  challenged_user_id UUID,
  challenge_type TEXT,
  stakes_tokens INTEGER DEFAULT 0,
  stakes_premium_tokens INTEGER DEFAULT 0,
  message TEXT DEFAULT NULL,
  metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  challenge_id UUID;
  conversation_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- Create or get direct conversation
  SELECT public.create_direct_conversation(challenged_user_id) INTO conversation_id;
  
  -- Insert challenge
  INSERT INTO public.challenges (
    challenger_id, challenged_id, conversation_id, challenge_type,
    stakes_tokens, stakes_premium_tokens, message, metadata
  )
  VALUES (
    current_user_id, challenged_user_id, conversation_id, challenge_type,
    stakes_tokens, stakes_premium_tokens, message, metadata
  )
  RETURNING id INTO challenge_id;
  
  -- Send challenge message
  PERFORM public.send_message(
    conversation_id,
    COALESCE(message, 'Challenge sent: ' || challenge_type),
    'challenge',
    jsonb_build_object('challenge_id', challenge_id)
  );
  
  RETURN challenge_id;
END;
$$;
