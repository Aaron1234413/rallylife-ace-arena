
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ActivityLogParams {
  user_id?: string; // Make optional since we'll set it automatically
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
  coach_id?: string; // Add coach_id parameter for lessons
}

export const useActivityLogger = () => {
  const logActivity = async (params: ActivityLogParams) => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        toast.error('Authentication required to save activity');
        throw new Error('User not authenticated');
      }

      // Call the RPC with user_id automatically set and coach_id if provided
      const { data, error } = await supabase.rpc('log_comprehensive_activity', {
        user_id: user.id,
        ...params,
        coach_id: params.coach_id || null // Ensure coach_id is passed to the database
      });

      if (error) {
        console.error('Error logging activity:', error);
        toast.error('Failed to save activity');
        throw error;
      }

      console.log('Activity logged successfully:', data);
      
      // Show enhanced success message for lessons with coach benefits
      if (data?.coach_level_bonus && data?.coach_level) {
        toast.success(
          `Lesson completed! +${data.hp_impact} HP restored from Level ${data.coach_level} coach!`
        );
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error logging activity:', error);
      throw error;
    }
  };

  return { logActivity };
};
