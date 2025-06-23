import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  icon_url: string | null;
  requirement_type: string;
  requirement_value: number;
  requirement_data: any;
  reward_xp: number;
  reward_tokens: number;
  reward_premium_tokens: number;
  reward_avatar_item_id: string | null;
  is_hidden: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
