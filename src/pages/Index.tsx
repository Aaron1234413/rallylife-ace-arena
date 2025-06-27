
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
import { useCoachCXP } from "@/hooks/useCoachCXP";
import { useCoachTokens } from "@/hooks/useCoachTokens";
import { useCoachCRP } from "@/hooks/useCoachCRP";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { ActiveMatchWidget } from "@/components/match/ActiveMatchWidget";
import { ActiveTrainingWidget } from "@/components/training/ActiveTrainingWidget";
import { SocialPlayQuickActions } from "@/components/social-play/SocialPlayQuickActions";
import { useSocialPlaySession } from "@/contexts/SocialPlaySessionContext";
import { ActiveSocialPlayWidget } from "@/components/social-play/ActiveSocialPlayWidget";
import { MatchInvitations } from "@/components/match/MatchInvitations";

const Index = () => {
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
  const { loading } = useSocialPlaySession();
  
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive user role flags from profile
  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Initialize data based on user role - only once
    if (user && profile && !dataInitialized) {
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
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to initialize user data');
      }
    }
  }, [user, profile, dataInitialized, hpData, xpData, tokenData, equippedItems, cxpData, coachTokenData, crpData]);

  const fetchProfile = async () => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to fetch profile');
    } finally {
      setProfileLoading(false);
    }
  };

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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while profile is being fetched
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show fallback if no profile
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>Unable to load profile. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-tennis-green-dark text-white px-4 py-2 rounded hover:bg-tennis-green"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Match Invitations - Show for all authenticated users */}
        <MatchInvitations />

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

            {/* Active Session Widgets */}
            <ActiveSocialPlayWidget 
              onAddXP={handleAddXP}
              onRestoreHP={handleRestoreHP}
            />
            <ActiveMatchWidget />
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
