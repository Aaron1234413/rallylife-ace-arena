-- Add token economy columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login DATE,
ADD COLUMN IF NOT EXISTS lifetime_tokens_earned INTEGER DEFAULT 0;