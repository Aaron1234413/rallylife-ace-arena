
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { CoachAvatarDisplay } from '@/components/avatar/CoachAvatarDisplay';
import { User, Mail, UserCheck } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className="text-center">Loading profile...</div>
      </div>
    );
  }

  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';

  return (
    <div className="p-3 sm:p-4 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-6 w-6" />
            My Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex justify-center">
            {isCoach ? (
              <CoachAvatarDisplay size="lg" showItems={true} />
            ) : (
              <AvatarDisplay 
                avatarUrl={profile?.avatar_url}
                size="xl"
                showBorder={true}
              />
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-4 max-w-md mx-auto">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-medium">{profile?.full_name || 'Not set'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium break-all">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <UserCheck className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <p className="font-medium capitalize">{profile?.role}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Information */}
      {isPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>Player Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              🎾 Welcome to RallyLife! Track your tennis journey, earn XP, and unlock achievements as you progress.
            </p>
          </CardContent>
        </Card>
      )}

      {isCoach && (
        <Card>
          <CardHeader>
            <CardTitle>Coach Information</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              🏆 As a coach on RallyLife, you can mentor players, assign training plans, and earn CRP for your coaching excellence.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
