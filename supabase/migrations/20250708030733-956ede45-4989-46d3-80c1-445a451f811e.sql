-- Fix foreign key relationships to reference profiles table instead of auth.users

-- First, drop the existing foreign keys that reference auth.users
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'open_sessions_creator_id_fkey'
    ) THEN
        ALTER TABLE public.open_sessions 
        DROP CONSTRAINT open_sessions_creator_id_fkey;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'member_status_user_id_fkey'
    ) THEN
        ALTER TABLE public.member_status 
        DROP CONSTRAINT member_status_user_id_fkey;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'club_activity_stream_user_id_fkey'
    ) THEN
        ALTER TABLE public.club_activity_stream 
        DROP CONSTRAINT club_activity_stream_user_id_fkey;
    END IF;
END $$;

-- Ensure profiles table exists with proper structure
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'player',
  email TEXT,
  phone TEXT,
  location TEXT,
  bio TEXT,
  skill_level NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can view all profiles'
    ) THEN
        CREATE POLICY "Users can view all profiles" 
        ON public.profiles FOR SELECT 
        USING (true);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" 
        ON public.profiles FOR UPDATE 
        USING (auth.uid() = id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" 
        ON public.profiles FOR INSERT 
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Add trigger to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'player')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;

-- Now add proper foreign keys to profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'open_sessions_creator_id_fkey'
    ) THEN
        ALTER TABLE public.open_sessions 
        ADD CONSTRAINT open_sessions_creator_id_fkey 
        FOREIGN KEY (creator_id) REFERENCES public.profiles(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'member_status_user_id_fkey'
    ) THEN
        ALTER TABLE public.member_status 
        ADD CONSTRAINT member_status_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'club_activity_stream_user_id_fkey'
    ) THEN
        ALTER TABLE public.club_activity_stream 
        ADD CONSTRAINT club_activity_stream_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;