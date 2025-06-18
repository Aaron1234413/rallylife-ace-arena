
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActivityLogParams {
  user_id: string;
  activity_type: string;
  activity_category: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  intensity_level?: string;
  location?: string;
  opponent_name?: string;
  coach_name?: string;
  score?: string;
  result?: string;
  notes?: string;
  weather_conditions?: string;
  court_surface?: string;
  equipment_used?: string[];
  skills_practiced?: string[];
  energy_before?: number;
  energy_after?: number;
  enjoyment_rating?: number;
  difficulty_rating?: number;
  tags?: string[];
  is_competitive?: boolean;
  is_official?: boolean;
  logged_at?: string;
  metadata?: any;
}

export const useActivityLogger = () => {
  const logActivity = async (params: ActivityLogParams) => {
    try {
      const { data, error } = await supabase.rpc('log_comprehensive_activity', params);

      if (error) {
        console.error('Error logging activity:', error);
        toast.error('Failed to save activity');
        throw error;
      }

      console.log('Activity logged successfully:', data);
      return data;
    } catch (error) {
      console.error('Unexpected error logging activity:', error);
      throw error;
    }
  };

  return { logActivity };
};
