
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePlayerHP } from "@/hooks/usePlayerHP";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User } from "lucide-react";
import { HPDisplay } from "@/components/hp/HPDisplay";
import { HPCard } from "@/components/hp/HPDisplay";
import { HPActivityLog } from "@/components/hp/HPActivityLog";
import { HPRestoreActions } from "@/components/hp/HPRestoreActions";

const Index = () => {
  const { user, signOut } = useAuth();
  const { hpData, activities, loading: hpLoading, restoreHP, initializeHP } = usePlayerHP();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Initialize HP for existing users who don't have HP data yet
    if (user && !hpLoading && !hpData && profile?.role === 'player') {
      initializeHP();
    }
  }, [user, hpLoading, hpData, profile, initializeHP]);

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
        {/* Header with HP Display */}
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
              <h1 className="text-3xl font-bold text-tennis-green-dark">
                Welcome back, {profile?.full_name || 'User'}!
              </h1>
              <p className="text-tennis-green-medium mt-1">
                Ready to continue your tennis journey?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* HP Display in Header for Players */}
            {isPlayer && hpData && (
              <div className="bg-white rounded-lg px-4 py-2 shadow-sm">
                <HPDisplay 
                  currentHP={hpData.current_hp} 
                  maxHP={hpData.max_hp} 
                  size="medium"
                />
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
                    🎾 Phase 2.1 (HP System) is now live! 
                    {isPlayer ? ' Track your health points and stay active to maintain them.' : ' Monitor your players\' engagement through the HP system.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HP System UI - Only for Players */}
          {isPlayer && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* HP Status Card */}
              <div className="space-y-6">
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

                {/* HP Restore Actions */}
                {hpData && (
                  <HPRestoreActions
                    onRestoreHP={restoreHP}
                    currentHP={hpData.current_hp}
                    maxHP={hpData.max_hp}
                  />
                )}
              </div>

              {/* HP Activity Log */}
              <HPActivityLog
                activities={activities}
                loading={hpLoading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
