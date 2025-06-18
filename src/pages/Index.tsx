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
import { CollapsibleSection, MobileActionPanel } from "@/components/dashboard/mobile";
import { useCoachCXP } from "@/hooks/useCoachCXP";
import { useCoachTokens } from "@/hooks/useCoachTokens";
import { useCoachCRP } from "@/hooks/useCoachCRP";
import { 
  Activity
} from 'lucide-react';

import { ActiveMatchWidget } from "@/components/match/ActiveMatchWidget";
import { ActiveTrainingWidget } from "@/components/training/ActiveTrainingWidget";

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
  
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Derive user role flags from profile
  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Initialize data based on user role
    if (user && profile?.role === 'player') {
      if (!hpLoading && !hpData) initializeHP();
      if (!xpLoading && !xpData) initializeXP();
      if (!tokensLoading && !tokenData) initializeTokens();
      if (!avatarLoading && equippedItems.length === 0) initializeAvatar();
    } else if (user && profile?.role === 'coach') {
      if (!cxpLoading && !cxpData) initializeCXP();
      if (!coachTokensLoading && !coachTokenData) initializeCoachTokens();
      if (!crpLoading && !crpData) initializeCRP();
    }
  }, [user, profile, hpLoading, hpData, xpLoading, xpData, tokensLoading, tokenData, avatarLoading, equippedItems, cxpLoading, cxpData, coachTokensLoading, coachTokenData, crpLoading, crpData]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
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
    await restoreHP(amount, activityType, description);
    // Check for achievement unlocks
    await checkAllAchievements();
  };

  const vitalsLoading = hpLoading || xpLoading || tokensLoading;

  // Refresh function for pull-to-refresh
  const handleRefresh = async () => {
    if (isPlayer) {
      await Promise.all([
        initializeHP(),
        initializeXP(),
        initializeTokens(),
        checkAllAchievements()
      ]);
    } else if (isCoach) {
      await Promise.all([
        initializeCXP(),
        initializeCoachTokens(),
        initializeCRP()
      ]);
    }
  };

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6 pb-24 sm:pb-6">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Player-specific content */}
      {isPlayer && (
        <>
          {/* Phase 1: Enhanced Information Hierarchy */}
          
          {/* 1. Player Vitals Hero Section - Most Prominent */}
          <PlayerVitalsHero
            hpData={hpData}
            xpData={xpData}
            tokenData={tokenData}
            loading={vitalsLoading}
          />

          {/* Active Match Widget - Shows when match is active */}
          <ActiveMatchWidget />

          {/* Active Training Widget - Shows when training session is active */}
          <ActiveTrainingWidget />

          {/* 2. Enhanced Quick Actions - Contextual and Smart (Desktop) */}
          <div className="hidden sm:block">
            <EnhancedQuickActions
              hpData={hpData}
              xpData={xpData}
              onAddXP={handleAddXP}
              onRestoreHP={handleRestoreHP}
              onAddTokens={handleAddTokens}
            />
          </div>

          {/* Mobile Action Panel */}
          <MobileActionPanel
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
  );
};

export default Index;
