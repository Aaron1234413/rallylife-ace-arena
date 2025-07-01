
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
import { useCoachCXP } from "@/hooks/useCoachCXP";
import { useCoachTokens } from "@/hooks/useCoachTokens";
import { useCoachCRP } from "@/hooks/useCoachCRP";
import { 
  Activity
} from 'lucide-react';

import { ActiveTrainingWidget } from "@/components/training/ActiveTrainingWidget";
import { SocialPlayQuickActions } from "@/components/social-play/SocialPlayQuickActions";
import { useSocialPlaySession } from "@/contexts/SocialPlaySessionContext";
import { ActiveSocialPlayWidget } from "@/components/social-play/ActiveSocialPlayWidget";
import { FloatingCheckInTrigger } from "@/components/training/FloatingCheckInTrigger";
import { FloatingCheckInButton } from "@/components/match/FloatingCheckInButton";
import { InvitationsWidget } from "@/components/invitations/InvitationsWidget";

const Index = () => {
  console.log('🏠 [INDEX] Index component mounted');
  
  const { user } = useAuth();
  const { hpData, loading: hpLoading, restoreHP, initializeHP } = usePlayerHP();
  const { xpData, loading: xpLoading, addXP, initializeXP } = usePlayerXP();
  const { tokenData, loading: tokensLoading, addTokens, spendTokens, convertPremiumTokens, initializeTokens } = usePlayerTokens();
  const { equippedItems, loading: avatarLoading, initializeAvatar, checkLevelUnlocks } = usePlayerAvatar();
  const { checkAllAchievements } = usePlayerAchievements();
  
  // Coach-specific hooks
  const { cxpData, loading: cxpLoading, addCXP, initializeCXP } = useCoachCXP();
  const { tokenData: coachTokenData, loading: coachTokensLoading, addTokens: addCoachTokens, initializeTokens: initializeCoachTokens } = useCoachTokens();
  const { crpData, isLoading: crpLoading, initializeCRP } = useCoachCRP();
  
  // Social Play Session Hook
  const { loading: socialPlayLoading } = useSocialPlaySession();
  
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive user role flags from profile
  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';

  console.log('🏠 [INDEX] Current state:', {
    user: !!user,
    profile,
    profileLoading,
    isPlayer,
    isCoach,
    error
  });

  useEffect(() => {
    if (user) {
      console.log('🏠 [INDEX] User found, fetching profile...');
      fetchProfile();
    } else {
      console.log('🏠 [INDEX] No user found');
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Initialize data based on user role - only once
    if (user && profile && !dataInitialized) {
      console.log('🏠 [INDEX] Initializing data for role:', profile.role);
      
      try {
        if (profile.role === 'player') {
          if (!hpData) initializeHP();
          if (!xpData) initializeXP();
          if (!tokenData) initializeTokens();
          if (equippedItems.length === 0) initializeAvatar();
        } else if (profile.role === 'coach') {
          if (!cxpData) initializeCXP();
          if (!coachTokenData) initializeCoachTokens();
          if (!crpData) initializeCRP();
        }
        
        setDataInitialized(true);
      } catch (error) {
        console.error('🏠 [INDEX] Error initializing data:', error);
        setError('Failed to initialize user data');
      }
    }
  }, [user, profile, dataInitialized, hpData, xpData, tokenData, equippedItems, cxpData, coachTokenData, crpData]);

  const fetchProfile = async () => {
    try {
      console.log('🏠 [INDEX] Fetching profile for user:', user?.id);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('🏠 [INDEX] Error fetching profile:', error);
        setError(`Failed to load profile: ${error.message}`);
        return;
      }

      console.log('🏠 [INDEX] Profile fetched successfully:', data);
      setProfile(data);
    } catch (error) {
      console.error('🏠 [INDEX] Unexpected error:', error);
      setError('An unexpected error occurred while loading your profile');
    } finally {
      setProfileLoading(false);
    }
  };

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
    }
  };

  const vitalsLoading = hpLoading || xpLoading || tokensLoading;

  // Show error state if there's an error
  if (error) {
    console.log('🏠 [INDEX] Rendering error state:', error);
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
          >
            Reload Page
          </button>
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
      {/* Floating components that need to be inside the provider contexts */}
      <FloatingCheckInTrigger />
      <FloatingCheckInButton />
      
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Player-specific content */}
        {isPlayer && (
          <>
            {/* Phase 1 & 2: Enhanced Player Vitals Hero Section with Recovery Integration */}
            <PlayerVitalsHero
              hpData={hpData}
              xpData={xpData}
              tokenData={tokenData}
              loading={vitalsLoading}
              onRestoreHP={handleRestoreHP}
            />

            {/* Social Play Section - Always show quick actions for Phase 1 */}
            <SocialPlayQuickActions />

            {/* Active Session Widgets - Now includes match invitations */}
            <ActiveSocialPlayWidget 
              onAddXP={handleAddXP}
              onRestoreHP={handleRestoreHP}
            />
            
            {/* Unified Invitations Widget - Shows both match and social play invitations */}
            <div className="mb-6">
              <InvitationsWidget />
            </div>
            
            <ActiveTrainingWidget />

            {/* Enhanced Quick Actions - Now Available on All Devices */}
            <EnhancedQuickActions
              hpData={hpData}
              xpData={xpData}
              onAddXP={handleAddXP}
              onRestoreHP={handleRestoreHP}
              onAddTokens={handleAddTokens}
            />
          </>
        )}

        {/* Coach-specific content */}
        {isCoach && (
          <>
            {/* Profile Card for Coaches */}
            <ProfileCard
              profile={profile}
              user={user}
              profileLoading={profileLoading}
              isPlayer={isPlayer}
            />

            {/* Coach Overview Cards */}
            <CoachOverviewCards
              cxpData={cxpData}
              tokenData={coachTokenData}
              crpData={crpData}
              cxpLoading={cxpLoading}
              tokensLoading={coachTokensLoading}
              crpLoading={crpLoading}
            />

            {/* Coach Quick Actions */}
            <CoachQuickActions />

            {/* Coach Avatar Customization */}
            <CoachAvatarCustomization />

            {/* Coach Achievements */}
            <CoachAchievementsDisplay />

            {/* CXP Earning Actions */}
            <CXPEarnActions />

            {/* CTK Earning Actions */}
            <CTKEarnActions />

            {/* CTK Store */}
            <CTKStore />

            {/* Activity Logs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CXPActivityLog />
              <CTKTransactionHistory />
            </div>
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
