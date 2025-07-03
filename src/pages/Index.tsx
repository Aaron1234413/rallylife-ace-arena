
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerHP } from "@/hooks/usePlayerHP";
import { usePlayerXP } from "@/hooks/usePlayerXP";
import { usePlayerAvatar } from "@/hooks/usePlayerAvatar";
import { usePlayerAchievements } from "@/hooks/usePlayerAchievements";
import { usePlayerTokens } from "@/hooks/usePlayerTokens";
import { supabase } from "@/integrations/supabase/client";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { PlayerVitalsHero, EnhancedQuickActions } from "@/components/dashboard/player";
import { CoachAvatarCustomization } from "@/components/avatar/CoachAvatarCustomization";
import { CXPActivityLog } from "@/components/cxp/CXPActivityLog";
import { CXPEarnActions } from "@/components/cxp/CXPEarnActions";
import { CTKEarnActions } from "@/components/ctk/CTKEarnActions";
import { CTKStore } from "@/components/ctk/CTKStore";
import { CTKTransactionHistory } from "@/components/ctk/CTKTransactionHistory";
import { CoachAchievementsDisplay } from "@/components/achievements/CoachAchievementsDisplay";
import { CoachOverviewCards } from "@/components/coach/dashboard/CoachOverviewCards";
import { CoachQuickActions } from "@/components/coach/dashboard/CoachQuickActions";
import { MobileActionPanel } from "@/components/dashboard/mobile";
import { MyClubsSection, ClubDiscovery } from "@/components/clubs";
import { UpcomingCourtBookings } from "@/components/dashboard/UpcomingCourtBookings";
import { useCoachCXP } from "@/hooks/useCoachCXP";
import { useCoachTokens } from "@/hooks/useCoachTokens";
import { useCoachCRP } from "@/hooks/useCoachCRP";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";

const Index = () => {
  console.log('🏠 [INDEX] Index component mounted');
  
  const { user } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [dataInitialized, setDataInitialized] = useState(false);

  // Player hooks with error handling
  const { hpData, loading: hpLoading, restoreHP, initializeHP } = usePlayerHP();
  const { xpData, loading: xpLoading, addXP, initializeXP } = usePlayerXP();
  const { tokenData, loading: tokensLoading, addTokens, spendTokens, convertPremiumTokens } = usePlayerTokens();
  const { equippedItems, loading: avatarLoading, initializeAvatar, checkLevelUnlocks } = usePlayerAvatar();
  const { checkAllAchievements } = usePlayerAchievements();
  
  // Coach-specific hooks
  const { cxpData, loading: cxpLoading, addCXP, initializeCXP } = useCoachCXP();
  const { tokenData: coachTokenData, loading: coachTokensLoading, addTokens: addCoachTokens } = useCoachTokens();
  const { crpData, isLoading: crpLoading, initializeCRP } = useCoachCRP();

  // Derive user role flags from profile
  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';

  console.log('🏠 [INDEX] Current state:', {
    user: !!user,
    profile,
    profileLoading,
    profileError,
    isPlayer,
    isCoach
  });

  const fetchProfile = async () => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    try {
      console.log('🏠 [INDEX] Fetching profile for user:', user.id);
      setProfileError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('🏠 [INDEX] Error fetching profile:', error);
        setProfileError(`Failed to load profile: ${error.message}`);
        return;
      }

      console.log('🏠 [INDEX] Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('🏠 [INDEX] Unexpected error:', error);
      setProfileError('An unexpected error occurred while loading your profile');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    // Initialize data based on user role - only once
    if (user && profile && !dataInitialized) {
      console.log('🏠 [INDEX] Initializing data for role:', profile.role);
      
      const initializeData = async () => {
        try {
          if (profile.role === 'player') {
            // Initialize player data with error handling (tokens handled by DB trigger)
            if (!hpData) {
              console.log('🏠 [INDEX] Initializing HP...');
              await initializeHP();
            }
            if (!xpData) {
              console.log('🏠 [INDEX] Initializing XP...');
              await initializeXP();
            }
            if (equippedItems.length === 0) {
              console.log('🏠 [INDEX] Initializing avatar...');
              await initializeAvatar();
            }
          } else if (profile.role === 'coach') {
            // Initialize coach data with error handling (tokens handled by DB trigger)
            if (!cxpData) {
              console.log('🏠 [INDEX] Initializing coach CXP...');
              await initializeCXP();
            }
            if (!crpData) {
              console.log('🏠 [INDEX] Initializing coach CRP...');
              await initializeCRP();
            }
          }
          
          setDataInitialized(true);
          console.log('🏠 [INDEX] Data initialization completed successfully');
        } catch (error) {
          console.error('🏠 [INDEX] Error initializing data:', error);
          toast.error('Failed to initialize user data. Some features may not work properly.');
        }
      };

      initializeData();
    }
  }, [user, profile, dataInitialized, hpData, xpData, equippedItems, cxpData, crpData]);

  // Enhanced XP earning function that checks for avatar unlocks and achievements
  const handleAddXP = async (amount: number, activityType: string, description?: string) => {
    try {
      const oldLevel = xpData?.current_level || 1;
      const result = await addXP(amount, activityType, description);
      
      // Check if level increased and unlock avatar items
      if (xpData && xpData.current_level > oldLevel) {
        await checkLevelUnlocks(xpData.current_level);
      }
      
      // Check for achievement unlocks
      await checkAllAchievements();
      
      return result;
    } catch (error) {
      console.error('🏠 [INDEX] Error adding XP:', error);
      toast.error('Failed to add XP');
    }
  };

  // Enhanced token earning function that checks for achievements
  const handleAddTokens = async (amount: number, tokenType: string = 'regular', source: string = 'manual', description?: string) => {
    try {
      await addTokens(amount, tokenType, source, description);
      // Check for achievement unlocks
      await checkAllAchievements();
    } catch (error) {
      console.error('🏠 [INDEX] Error adding tokens:', error);
      toast.error('Failed to add tokens');
    }
  };

  // Enhanced HP restoration function that checks for achievements
  const handleRestoreHP = async (amount: number, activityType: string, description?: string) => {
    try {
      console.log('🏠 [INDEX] Starting HP restoration...', { amount, activityType, description });
      
      await restoreHP(amount, activityType, description);
      
      // Check for achievement unlocks
      await checkAllAchievements();
      
      console.log('🏠 [INDEX] HP restoration completed');
    } catch (error) {
      console.error('🏠 [INDEX] Error restoring HP:', error);
      toast.error('Failed to restore HP');
    }
  };

  const vitalsLoading = hpLoading || xpLoading || tokensLoading;

  // Show error state if there's a profile error
  if (profileError) {
    console.log('🏠 [INDEX] Rendering profile error state:', profileError);
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Profile Error</h2>
          <p className="text-gray-700 mb-4">{profileError}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={fetchProfile}
              className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while profile is being fetched
  if (profileLoading) {
    console.log('🏠 [INDEX] Rendering loading state');
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-tennis-neutral-100 rounded-lg mb-6"></div>
            <div className="h-48 bg-tennis-neutral-100 rounded-lg mb-6"></div>
            <div className="text-center">
              <p className="text-tennis-green-dark">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no user
  if (!user) {
    console.log('🏠 [INDEX] No user found, showing login prompt');
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-tennis-green-dark mb-4">Welcome to Rako</h2>
          <p className="text-gray-700 mb-4">Please log in to access your dashboard</p>
          <button 
            onClick={() => window.location.href = '/auth'} 
            className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show message if no profile
  if (!profile) {
    console.log('🏠 [INDEX] No profile found, showing profile setup prompt');
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-tennis-green-dark mb-4">Profile Setup Required</h2>
          <p className="text-gray-700 mb-4">We couldn't find your profile. Please complete the onboarding process.</p>
          <button 
            onClick={() => window.location.href = '/onboarding'} 
            className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
          >
            Complete Setup
          </button>
        </div>
      </div>
    );
  }

  console.log('🏠 [INDEX] Rendering main dashboard for role:', profile.role);

  return (
    <div className="min-h-screen bg-tennis-green-bg overflow-x-hidden">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <ErrorBoundary fallbackTitle="Welcome Banner Error">
          <WelcomeBanner />
        </ErrorBoundary>

        {/* Player-specific content */}
        {isPlayer && (
          <>
            {/* Phase 1 & 2: Enhanced Player Vitals Hero Section with Recovery Integration */}
            <ErrorBoundary fallbackTitle="Player Vitals Error">
              <PlayerVitalsHero
                hpData={hpData}
                xpData={xpData}
                tokenData={tokenData}
                loading={vitalsLoading}
                onRestoreHP={handleRestoreHP}
              />
            </ErrorBoundary>

            {/* Enhanced Quick Actions - Now Available on All Devices */}
            <ErrorBoundary fallbackTitle="Quick Actions Error">
              <EnhancedQuickActions
                hpData={hpData}
                xpData={xpData}
                onAddXP={handleAddXP}
                onRestoreHP={handleRestoreHP}
                onAddTokens={handleAddTokens}
              />
            </ErrorBoundary>

            {/* My Clubs Section */}
            <ErrorBoundary fallbackTitle="My Clubs Error">
              <MyClubsSection />
            </ErrorBoundary>

            {/* Court Bookings Widget */}
            <ErrorBoundary fallbackTitle="Court Bookings Error">
              <UpcomingCourtBookings />
            </ErrorBoundary>

            {/* Club Discovery Section */}
            <ErrorBoundary fallbackTitle="Club Discovery Error">
              <ClubDiscovery />
            </ErrorBoundary>
          </>
        )}

        {/* Coach-specific content */}
        {isCoach && (
          <>
            {/* Profile Card for Coaches */}
            <ErrorBoundary fallbackTitle="Profile Card Error">
              <ProfileCard
                profile={profile}
                user={user}
                profileLoading={profileLoading}
                isPlayer={isPlayer}
              />
            </ErrorBoundary>

            {/* Coach Overview Cards */}
            <ErrorBoundary fallbackTitle="Coach Overview Error">
              <CoachOverviewCards
                cxpData={cxpData}
                tokenData={coachTokenData}
                crpData={crpData}
                cxpLoading={cxpLoading}
                tokensLoading={coachTokensLoading}
                crpLoading={crpLoading}
              />
            </ErrorBoundary>

            {/* Coach Quick Actions */}
            <ErrorBoundary fallbackTitle="Coach Actions Error">
              <CoachQuickActions />
            </ErrorBoundary>

            {/* Coach Avatar Customization */}
            <ErrorBoundary fallbackTitle="Avatar Customization Error">
              <CoachAvatarCustomization />
            </ErrorBoundary>

            {/* Coach Achievements */}
            <ErrorBoundary fallbackTitle="Achievements Error">
              <CoachAchievementsDisplay />
            </ErrorBoundary>

            {/* CXP Earning Actions */}
            <ErrorBoundary fallbackTitle="CXP Actions Error">
              <CXPEarnActions />
            </ErrorBoundary>

            {/* CTK Earning Actions */}
            <ErrorBoundary fallbackTitle="CTK Actions Error">
              <CTKEarnActions />
            </ErrorBoundary>

            {/* CTK Store */}
            <ErrorBoundary fallbackTitle="CTK Store Error">
              <CTKStore />
            </ErrorBoundary>

            {/* Activity Logs */}
            <ErrorBoundary fallbackTitle="Activity Logs Error">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <CXPActivityLog />
                <CTKTransactionHistory />
              </div>
            </ErrorBoundary>
          </>
        )}

        {/* Fallback content if no role is detected */}
        {!isPlayer && !isCoach && (
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-tennis-green-dark mb-4">Welcome to Rako</h2>
            <p className="text-gray-700 mb-4">
              Your profile is being set up. If this persists, please complete the onboarding process.
            </p>
            <button 
              onClick={() => window.location.href = '/onboarding'} 
              className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
            >
              Complete Onboarding
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Index;
