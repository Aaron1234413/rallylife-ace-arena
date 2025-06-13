
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

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

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      <div className="max-w-4xl mx-auto">
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
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="flex items-center gap-2 border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="grid gap-6">
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
                    🎉 Phase 1.2 (Initial Profile Setup & Onboarding) is now complete! 
                    Users can complete their profile setup with role-specific information and avatar selection.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
