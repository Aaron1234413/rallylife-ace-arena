-- Add preferences column to profiles table for storing user guide progress
ALTER TABLE public.profiles 
ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;

-- Create index for better performance on preferences queries
CREATE INDEX idx_profiles_preferences ON public.profiles USING GIN(preferences);

-- Update existing users to have default preferences
UPDATE public.profiles 
SET preferences = '{
  "app_tour_completed": false,
  "completed_tutorials": [],
  "dismissed_tips": [],
  "last_active_date": null
}'::jsonb 
WHERE preferences IS NULL OR preferences = '{}'::jsonb;