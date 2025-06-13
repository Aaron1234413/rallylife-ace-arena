
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerHP } from "@/hooks/usePlayerHP";
import { usePlayerXP } from "@/hooks/usePlayerXP";
import { usePlayerAvatar } from "@/hooks/usePlayerAvatar";
import { usePlayerAchievements } from "@/hooks/usePlayerAchievements";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User, Menu } from "lucide-react";
import { HPDisplay } from "@/components/hp/HPDisplay";
import { HPCard } from "@/components/hp/HPDisplay";
import { HPActivityLog } from "@/components/hp/HPActivityLog";
import { HPRestoreActions } from "@/components/hp/HPRestoreActions";
import { XPDisplay, LevelBadge } from "@/components/xp/XPDisplay";
import { XPCard } from "@/components/xp/XPCard";
import { XPActivityLog } from "@/components/xp/XPActivityLog";
import { XPEarnActions } from "@/components/xp/XPEarnActions";
import { usePlayerTokens } from "@/hooks/usePlayerTokens";
import { TokenDisplay } from "@/components/tokens/TokenDisplay";
import { TokenCard } from "@/components/tokens/TokenCard";
import { TokenEarnActions } from "@/components/tokens/TokenEarnActions";
import { TokenStore } from "@/components/tokens/TokenStore";
import { TokenTransactionHistory } from "@/components/tokens/TokenTransactionHistory";
import { TokenConverter } from "@/components/tokens/TokenConverter";
import { AvatarDisplay } from "@/components/avatar/AvatarDisplay";
import { AvatarCustomization } from "@/components/avatar/AvatarCustomization";
import { AchievementDisplay } from "@/components/achievements/AchievementDisplay";
import { QuickActionButtons } from "@/components/activities/QuickActionButtons";
import { ActivityFeed } from "@/components/activities/ActivityFeed";
import { ActivityStats } from "@/components/activities/ActivityStats";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const { user, signOut } = useAuth();
  const { hpData, activities: hpActivities, loading: hpLoading, restoreHP, initializeHP } = usePlayerHP();
  const { xpData, activities: xpActivities, loading: xpLoading, addXP, initializeXP } = usePlayerXP();
  const { tokenData, transactions, loading: tokensLoading, addTokens, spendTokens, convertPremiumTokens, initializeTokens } = usePlayerTokens();
  const { equippedItems, loading: avatarLoading, initializeAvatar, checkLevelUnlocks } = usePlayerAvatar();
  const { checkAllAchievements } = usePlayerAchievements();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Initialize HP, XP, Tokens, and Avatar for existing users who don't have data yet
    if (user && !hpLoading && !hpData && profile?.role === 'player') {
      initializeHP();
    }
    if (user && !xpLoading && !xpData && profile?.role === 'player') {
      initializeXP();
    }
    if (user && !tokensLoading && !tokenData && profile?.role === 'player') {
      initializeTokens();
    }
    if (user && !avatarLoading && equippedItems.length === 0 && profile?.role === 'player') {
      initializeAvatar();
    }
  }, [user, hpLoading, hpData, xpLoading, xpData, tokensLoading, tokenData, avatarLoading, equippedItems, profile, initializeHP, initializeXP, initializeTokens, initializeAvatar]);

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

  const handleSignOut = async () => {
    await signOut();
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

  const isPlayer = profile?.role === 'player';

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="w-full">
        {/* Mobile-First Header */}
        <div className="sticky top-0 z-50 bg-tennis-green-bg border-b border-tennis-green-light p-3 sm:p-4">
          <div className="flex items-center justify-between">
            {/* Left side - Avatar and Name */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <AvatarDisplay 
                avatarUrl={profile?.avatar_url}
                equippedItems={equippedItems}
                size="medium"
                showBorder={true}
                className="flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-tennis-green-dark truncate">
                    {profile?.full_name || 'User'}
                  </h1>
                  {isPlayer && xpData && (
                    <LevelBadge level={xpData.current_level} size="small" />
                  )}
                </div>
                {/* Mobile Stats Bar */}
                {isPlayer && (hpData || xpData || tokenData) && (
                  <div className="mt-1 space-y-1">
                    {hpData && (
                      <HPDisplay 
                        currentHP={hpData.current_hp} 
                        maxHP={hpData.max_hp} 
                        size="small"
                        showText={false}
                      />
                    )}
                    {xpData && (
                      <XPDisplay
                        currentLevel={xpData.current_level}
                        currentXP={xpData.current_xp}
                        xpToNextLevel={xpData.xp_to_next_level}
                        size="small"
                        showLevel={false}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Menu */}
            <div className="flex items-center gap-2">
              {tokenData && (
                <TokenDisplay
                  regularTokens={tokenData.regular_tokens}
                  premiumTokens={tokenData.premium_tokens}
                  size="small"
                  showPremium={false}
                  className="hidden sm:flex"
                />
              )}
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="border-tennis-green-dark">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="space-y-4 pt-6">
                    {isPlayer && (
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full justify-start border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
                          onClick={() => window.location.href = '/achievements'}
                        >
                          🏆 Achievements
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
                          onClick={() => window.location.href = '/activities'}
                        >
                          📋 Activities
                        </Button>
                      </div>
                    )}
                    
                    {tokenData && (
                      <div className="p-3 bg-white rounded-lg space-y-2">
                        <TokenDisplay
                          regularTokens={tokenData.regular_tokens}
                          premiumTokens={tokenData.premium_tokens}
                          size="small"
                          showPremium={true}
                        />
                      </div>
                    )}

                    <Button 
                      onClick={handleSignOut} 
                      variant="outline" 
                      className="w-full justify-start flex items-center gap-2 border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-3 sm:p-4 max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Profile Card - Mobile Optimized */}
          <Card className="border-tennis-green-light">
            <CardHeader className="bg-tennis-green-light text-white p-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription className="text-tennis-green-bg text-sm">
                {profile?.role === 'player' ? 'Player Profile' : 'Coach Profile'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {profileLoading ? (
                <p className="text-tennis-green-medium">Loading profile...</p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p><strong className="text-tennis-green-dark">Email:</strong> <span className="break-all">{user?.email}</span></p>
                  <p><strong className="text-tennis-green-dark">Full Name:</strong> {profile?.full_name}</p>
                  <p><strong className="text-tennis-green-dark">Role:</strong> {profile?.role}</p>
                  <p className="text-tennis-green-medium text-xs mt-3">
                    🎾 Phase 2.5 (Achievement System) is now live! 
                    {isPlayer ? ' Earn achievements by playing, training, and progressing in the game!' : ' Monitor your players\' achievement progress and unlocks.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Player-specific content */}
          {isPlayer && (
            <>
              {/* Quick Actions - Mobile First */}
              <QuickActionButtons />

              {/* Status Cards - Stacked on Mobile */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hpData ? (
                  <HPCard
                    currentHP={hpData.current_hp}
                    maxHP={hpData.max_hp}
                    lastActivity={hpData.last_activity}
                  />
                ) : hpLoading ? (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-sm">Loading HP data...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-muted-foreground text-sm">
                        HP system initializing...
                      </p>
                    </CardContent>
                  </Card>
                )}

                {xpData ? (
                  <XPCard
                    currentLevel={xpData.current_level}
                    currentXP={xpData.current_xp}
                    totalXPEarned={xpData.total_xp_earned}
                    xpToNextLevel={xpData.xp_to_next_level}
                  />
                ) : xpLoading ? (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-sm">Loading XP data...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-muted-foreground text-sm">
                        XP system initializing...
                      </p>
                    </CardContent>
                  </Card>
                )}

                {tokenData ? (
                  <TokenCard
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                    lifetimeEarned={tokenData.lifetime_earned}
                  />
                ) : tokensLoading ? (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-sm">Loading token data...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-muted-foreground text-sm">
                        Token system initializing...
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Activity Overview - Mobile Optimized */}
              <div className="grid gap-4 lg:grid-cols-2">
                <ActivityFeed limit={5} showFilters={false} />
                <ActivityStats />
              </div>

              {/* Avatar Customization - Mobile Friendly */}
              <AvatarCustomization />

              {/* Action Cards - Stacked on Mobile */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {hpData && (
                  <HPRestoreActions
                    onRestoreHP={handleRestoreHP}
                    currentHP={hpData.current_hp}
                    maxHP={hpData.max_hp}
                  />
                )}

                {xpData && (
                  <XPEarnActions
                    onEarnXP={handleAddXP}
                  />
                )}

                {tokenData && (
                  <TokenEarnActions
                    onEarnTokens={handleAddTokens}
                  />
                )}
              </div>

              {/* Token Economy - Mobile Stacked */}
              {tokenData && (
                <div className="grid gap-4 lg:grid-cols-2">
                  <TokenStore
                    onSpendTokens={spendTokens}
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                  />
                  <TokenConverter
                    onConvertTokens={convertPremiumTokens}
                    premiumTokens={tokenData.premium_tokens}
                  />
                </div>
              )}

              {/* Activity Logs - Mobile Stacked */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <HPActivityLog
                  activities={hpActivities}
                  loading={hpLoading}
                />
                <XPActivityLog
                  activities={xpActivities}
                  loading={xpLoading}
                />
                <TokenTransactionHistory
                  transactions={transactions}
                  loading={tokensLoading}
                />
                <AchievementDisplay 
                  showRecent={true}
                  maxItems={3}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
