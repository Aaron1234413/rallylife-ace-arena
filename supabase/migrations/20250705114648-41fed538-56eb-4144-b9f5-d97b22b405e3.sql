-- Add location field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN location TEXT;