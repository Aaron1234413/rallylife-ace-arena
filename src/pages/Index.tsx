
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
import { ActiveTrainingWidget } from "@/components/training/ActiveTrainingWidget";
import { SocialPlayQuickActions } from "@/components/social-play/SocialPlayQuickActions";
import { useSocialPlaySession } from "@/contexts/SocialPlaySessionContext";
import { ActiveSocialPlayWidget } from "@/components/social-play/ActiveSocialPlayWidget";
import { FloatingCheckInTrigger } from "@/components/training/FloatingCheckInTrigger";
import { FloatingCheckInButton } from "@/components/match/FloatingCheckInButton";
import { InvitationsWidget } from "@/components/invitations/InvitationsWidget";
import { InvitationSystemTest } from "@/components/testing/InvitationSystemTest";

const Index = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Initialize hooks with error boundaries
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
  const { loading } = useSocialPlaySession();
  
  const [dataInitialized, setDataInitialized] = useState(false);
  const [showTestSuite, setShowTestSuite] = useState(false);

  // Derive user role flags from profile
  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';

  // Fetch profile with better error handling
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('Index: Fetching profile for user:', user.id);
        setProfileError(null);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfileError(error.message);
          return;
        }

        console.log('Index: Profile fetched successfully:', data);
        setProfile(data);
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setProfileError('Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  // Initialize data based on user role with better error handling
  useEffect(() => {
    if (!user || !profile || dataInitialized) return;
    
    console.log('Index: Initializing data for role:', profile.role);
    
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
      console.error('Error initializing data:', error);
    }
  }, [user, profile, dataInitialized, hpData, xpData, tokenData, equippedItems, cxpData, coachTokenData, crpData]);

  // Enhanced XP earning function that checks for avatar unlocks and achievements
  const handleAddXP = async (amount: number, activityType: string, description?: string) => {
    const oldLevel = xpData?.current_level || 1;
    const result = await addXP(amount, activityType, description);
    
    // Check if level increased and unlock avatar items
    if (xpData && xpData.current_level > oldLevel) {
      await checkLevelUnlocks(xpData.current_level);
    }
    
    // Check for achievement unlocks
    await checkAllAchievements();
    
    return result;
  };

  // Enhanced token earning function that checks for achievements
  const handleAddTokens = async (amount: number, tokenType: string = 'regular', source: string = 'manual', description?: string) => {
    await addTokens(amount, tokenType, source, description);
    // Check for achievement unlocks
    await checkAllAchievements();
  };

  // Enhanced HP restoration function that checks for achievements
  const handleRestoreHP = async (amount: number, activityType: string, description?: string) => {
    console.log('Index: Starting HP restoration...', { amount, activityType, description });
    
    await restoreHP(amount, activityType, description);
    
    // Check for achievement unlocks
    await checkAllAchievements();
    
    console.log('Index: HP restoration completed');
  };

  const vitalsLoading = hpLoading || xpLoading || tokensLoading;

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-tennis-neutral-100 rounded-lg mb-6"></div>
            <div className="h-48 bg-tennis-neutral-100 rounded-lg mb-6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if profile failed to load
  if (profileError) {
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800">Error Loading Dashboard</h2>
            <p className="text-red-600 mt-2">{profileError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no profile exists
  if (!profile) {
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-yellow-800">Profile Not Found</h2>
            <p className="text-yellow-600 mt-2">Please complete the onboarding process.</p>
            <button 
              onClick={() => window.location.href = '/onboarding'} 
              className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Go to Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg overflow-x-hidden">
      {/* Floating components that need to be inside the provider contexts */}
      <FloatingCheckInTrigger />
      <FloatingCheckInButton />
      
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Test Suite Toggle - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowTestSuite(!showTestSuite)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {showTestSuite ? 'Hide' : 'Show'} Invitation System Test Suite
            </button>
          </div>
        )}

        {/* Test Suite */}
        {showTestSuite && (
          <div className="mb-6">
            <InvitationSystemTest />
          </div>
        )}

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
      </div>
    </div>
  );
};

export default Index;
