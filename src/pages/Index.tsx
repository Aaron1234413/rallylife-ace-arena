import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerHP } from "@/hooks/usePlayerHP";
import { usePlayerXP } from "@/hooks/usePlayerXP";
import { usePlayerAvatar } from "@/hooks/usePlayerAvatar";
import { usePlayerAchievements } from "@/hooks/usePlayerAchievements";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User } from "lucide-react";
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
    <div className="min-h-screen bg-tennis-green-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with HP, XP, Token Display, and Avatar */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <AvatarDisplay 
              avatarUrl={profile?.avatar_url}
              equippedItems={equippedItems}
              size="large"
              showBorder={true}
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-tennis-green-dark">
                  Welcome back, {profile?.full_name || 'User'}!
                </h1>
                {isPlayer && xpData && (
                  <LevelBadge level={xpData.current_level} size="medium" />
                )}
              </div>
              <p className="text-tennis-green-medium mt-1">
                Ready to continue your tennis journey?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* HP, XP, and Token Display in Header for Players */}
            {isPlayer && (hpData || xpData || tokenData) && (
              <div className="bg-white rounded-lg px-4 py-3 shadow-sm space-y-2">
                {hpData && (
                  <HPDisplay 
                    currentHP={hpData.current_hp} 
                    maxHP={hpData.max_hp} 
                    size="small"
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
                {tokenData && (
                  <TokenDisplay
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                    size="small"
                    showPremium={true}
                  />
                )}
              </div>
            )}
            
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="flex items-center gap-2 border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Profile Card */}
          <Card className="border-tennis-green-light">
            <CardHeader className="bg-tennis-green-light text-white">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription className="text-tennis-green-bg">
                {profile?.role === 'player' ? 'Player Profile' : 'Coach Profile'}
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              {profileLoading ? (
                <p className="text-tennis-green-medium">Loading profile...</p>
              ) : (
                <div className="space-y-2">
                  <p><strong className="text-tennis-green-dark">Email:</strong> {user?.email}</p>
                  <p><strong className="text-tennis-green-dark">Full Name:</strong> {profile?.full_name}</p>
                  <p><strong className="text-tennis-green-dark">Role:</strong> {profile?.role}</p>
                  <p><strong className="text-tennis-green-dark">User ID:</strong> {user?.id}</p>
                  <p className="text-tennis-green-medium text-sm mt-4">
                    🎾 Phase 2.5 (Achievement System) is now live! 
                    {isPlayer ? ' Earn achievements by playing, training, and progressing in the game!' : ' Monitor your players\' achievement progress and unlocks.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HP, XP, Token & Avatar System UI - Only for Players */}
          {isPlayer && (
            <div className="grid gap-6">
              {/* Status Cards Row */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* HP Status Card */}
                {hpData ? (
                  <HPCard
                    currentHP={hpData.current_hp}
                    maxHP={hpData.max_hp}
                    lastActivity={hpData.last_activity}
                  />
                ) : hpLoading ? (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center">Loading HP data...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-muted-foreground">
                        HP system initializing...
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* XP Status Card */}
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
                      <p className="text-center">Loading XP data...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-muted-foreground">
                        XP system initializing...
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Token Status Card */}
                {tokenData ? (
                  <TokenCard
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                    lifetimeEarned={tokenData.lifetime_earned}
                  />
                ) : tokensLoading ? (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center">Loading token data...</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-center text-muted-foreground">
                        Token system initializing...
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Avatar Customization Full Width */}
              <AvatarCustomization />

              {/* Action Cards Row */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* HP Restore Actions */}
                {hpData && (
                  <HPRestoreActions
                    onRestoreHP={handleRestoreHP}
                    currentHP={hpData.current_hp}
                    maxHP={hpData.max_hp}
                  />
                )}

                {/* XP Earn Actions */}
                {xpData && (
                  <XPEarnActions
                    onEarnXP={handleAddXP}
                  />
                )}

                {/* Token Earn Actions */}
                {tokenData && (
                  <TokenEarnActions
                    onEarnTokens={handleAddTokens}
                  />
                )}
              </div>

              {/* Token Economy Features Row */}
              {tokenData && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Token Store */}
                  <TokenStore
                    onSpendTokens={spendTokens}
                    regularTokens={tokenData.regular_tokens}
                    premiumTokens={tokenData.premium_tokens}
                  />

                  {/* Token Converter */}
                  <TokenConverter
                    onConvertTokens={convertPremiumTokens}
                    premiumTokens={tokenData.premium_tokens}
                  />
                </div>
              )}

              {/* Activity Logs and Achievements Row */}
              <div className="grid gap-6 lg:grid-cols-4">
                {/* HP Activity Log */}
                <HPActivityLog
                  activities={hpActivities}
                  loading={hpLoading}
                />

                {/* XP Activity Log */}
                <XPActivityLog
                  activities={xpActivities}
                  loading={xpLoading}
                />

                {/* Token Transaction History */}
                <TokenTransactionHistory
                  transactions={transactions}
                  loading={tokensLoading}
                />

                {/* Recent Achievements */}
                <AchievementDisplay 
                  showRecent={true}
                  maxItems={5}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
