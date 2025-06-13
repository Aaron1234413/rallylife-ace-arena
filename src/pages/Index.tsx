
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerHP } from "@/hooks/usePlayerHP";
import { usePlayerXP } from "@/hooks/usePlayerXP";
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

const Index = () => {
  const { user, signOut } = useAuth();
  const { hpData, activities: hpActivities, loading: hpLoading, restoreHP, initializeHP } = usePlayerHP();
  const { xpData, activities: xpActivities, loading: xpLoading, addXP, initializeXP } = usePlayerXP();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Initialize HP and XP for existing users who don't have data yet
    if (user && !hpLoading && !hpData && profile?.role === 'player') {
      initializeHP();
    }
    if (user && !xpLoading && !xpData && profile?.role === 'player') {
      initializeXP();
    }
  }, [user, hpLoading, hpData, xpLoading, xpData, profile, initializeHP, initializeXP]);

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

  const isPlayer = profile?.role === 'player';

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with HP and XP Display */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            {profile?.avatar_url && (
              <img 
                src={profile.avatar_url} 
                alt="Avatar"
                className="w-12 h-12 rounded-full border-2 border-tennis-green-dark"
              />
            )}
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
            {/* HP and XP Display in Header for Players */}
            {isPlayer && (hpData || xpData) && (
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
                    🎾 Phase 2.1 (HP & XP Systems) is now live! 
                    {isPlayer ? ' Track your health points, earn experience, and level up as you play!' : ' Monitor your players\' engagement through the HP and XP systems.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HP & XP System UI - Only for Players */}
          {isPlayer && (
            <div className="grid gap-6">
              {/* Status Cards Row */}
              <div className="grid gap-6 lg:grid-cols-2">
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
              </div>

              {/* Action Cards Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* HP Restore Actions */}
                {hpData && (
                  <HPRestoreActions
                    onRestoreHP={restoreHP}
                    currentHP={hpData.current_hp}
                    maxHP={hpData.max_hp}
                  />
                )}

                {/* XP Earn Actions */}
                {xpData && (
                  <XPEarnActions
                    onEarnXP={addXP}
                  />
                )}
              </div>

              {/* Activity Logs Row */}
              <div className="grid gap-6 lg:grid-cols-2">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
