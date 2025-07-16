-- Phase 2.2: Availability System
-- Add availability and stake preference columns to profiles table

ALTER TABLE profiles ADD COLUMN availability JSONB DEFAULT '{}';
-- Format: {"monday": ["morning", "evening"], "tuesday": ["afternoon"]}

ALTER TABLE profiles ADD COLUMN stake_preference TEXT DEFAULT 'any';