
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PlayerOnboarding } from '@/components/onboarding/PlayerOnboarding';
import { CoachOnboarding } from '@/components/onboarding/CoachOnboarding';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Onboarding() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/login');
      return;
    }

    if (user) {
      fetchUserProfile();
    }
  }, [user, loading, navigate]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
        return;
      }

      setUserProfile(data);

      // If onboarding is already completed, redirect to dashboard
      if (data?.onboarding_completed) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading your profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          preferences: {
            app_tour_completed: false, // Will trigger app tour
            completed_tutorials: [],
            dismissed_tips: [],
            last_active_date: new Date().toISOString()
          }
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Error updating onboarding status:', error);
        toast.error('Failed to complete onboarding');
        return;
      }

      toast.success('Profile setup complete! Let\'s take a quick tour.');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light flex items-center justify-center">
        <div className="text-center text-white">
          <p>Unable to load profile. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
            <span className="text-2xl">🎾</span>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Welcome to Rako!</h1>
          <p className="text-tennis-green-bg/90 text-lg">Let's set up your profile to get started</p>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 max-w-4xl mx-auto">
          {userProfile.role === 'player' ? (
            <PlayerOnboarding 
              user={user} 
              profile={userProfile} 
              onComplete={handleOnboardingComplete} 
            />
          ) : (
            <CoachOnboarding 
              user={user} 
              profile={userProfile} 
              onComplete={handleOnboardingComplete} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
