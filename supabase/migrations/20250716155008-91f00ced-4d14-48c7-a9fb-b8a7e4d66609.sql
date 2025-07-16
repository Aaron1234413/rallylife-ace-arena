-- Phase 6: Profile Page Redesign - Database Schema Changes

-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  match_requests boolean DEFAULT true,
  achievements boolean DEFAULT true,
  system_updates boolean DEFAULT true,
  weekly_summary boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add privacy and preference columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_visibility text DEFAULT 'public';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS match_history_visibility text DEFAULT 'public';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_sharing boolean DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_preferences jsonb DEFAULT '{"allow_direct_messages": true, "show_email": false, "show_phone": false}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS utr_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS member_since timestamptz DEFAULT now();

-- Enable RLS on notification preferences
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification preferences
CREATE POLICY "Users can view their own notification preferences" ON user_notification_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON user_notification_preferences
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification preferences" ON user_notification_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to create default notification preferences when user signs up
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default notification preferences
CREATE OR REPLACE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamps
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();