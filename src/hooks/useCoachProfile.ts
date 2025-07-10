import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CoachProfile {
  bio: string;
  experienceTags: string[];
}

export function useCoachProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CoachProfile>({ bio: '', experienceTags: [] });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('bio, experience_tags')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile({
        bio: data?.bio || '',
        experienceTags: data?.experience_tags || []
      });
    } catch (error) {
      console.error('Error fetching coach profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return {
    bio: profile.bio,
    experienceTags: profile.experienceTags,
    loading,
    refreshProfile: fetchProfile
  };
}