
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ProfileHeaderCard } from '@/components/profile/ProfileHeaderCard';
import { PlayerStatsSection } from '@/components/profile/PlayerStatsSection';
import { QuickSettingsGrid } from '@/components/profile/QuickSettingsGrid';
import { ProfileAvailability } from '@/components/profile/ProfileAvailability';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const isPlayer = profile?.role === 'player';

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <span className="text-xl">🎾</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">My Profile</h1>
          <p className="text-tennis-green-bg/90">Manage your Rako profile and preferences</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Profile Header */}
          <ProfileHeaderCard profile={profile} user={user} />

          {/* Player Stats - Only for players */}
          {isPlayer && <PlayerStatsSection />}

          {/* Availability Section - Only for players */}
          {isPlayer && <ProfileAvailability />}

          {/* Quick Settings */}
          <QuickSettingsGrid profile={profile} onProfileUpdate={fetchProfile} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
