
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { CoachAvatarDisplay } from '@/components/avatar/CoachAvatarDisplay';
import { AvatarCustomization } from '@/components/avatar/AvatarCustomization';
import { CoachAvatarCustomization } from '@/components/avatar/CoachAvatarCustomization';
import { CRPDisplay } from '@/components/crp/CRPDisplay';
import { CXPDisplay } from '@/components/cxp/CXPDisplay';
import { CTKDisplay } from '@/components/ctk/CTKDisplay';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { ProfileAvailability } from '@/components/profile/ProfileAvailability';
import { User, Mail, UserCheck, Edit, Trophy, Target, Calendar, Settings, Palette, MapPin } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editAvatarOpen, setEditAvatarOpen] = useState(false);

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
        .maybeSingle();

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
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          <p className="mt-2 text-white">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const isPlayer = profile?.role === 'player';
  const isCoach = profile?.role === 'coach';

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <span className="text-xl">🎾</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">My Profile</h1>
          <p className="text-tennis-green-bg/90">Manage your Rako profile and preferences</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Profile Header Card */}
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center space-y-4">
                {isCoach ? (
                  <CoachAvatarDisplay size="lg" showItems={true} />
                ) : (
                  <AvatarDisplay 
                    avatarUrl={profile?.avatar_url}
                    size="xl"
                    showBorder={true}
                  />
                )}
                
                <div className="text-center space-y-1">
                  <CardTitle className="text-2xl text-tennis-green-dark">
                    {profile?.full_name || 'Tennis Player'}
                  </CardTitle>
                  <div className="flex items-center justify-center gap-2">
                    <UserCheck className="h-4 w-4 text-tennis-green-medium" />
                    <span className="text-tennis-green-medium font-medium capitalize">
                      {profile?.role}
                    </span>
                  </div>
                </div>

                <Dialog open={editAvatarOpen} onOpenChange={setEditAvatarOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Avatar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Customize Your Avatar</DialogTitle>
                    </DialogHeader>
                    {isCoach ? (
                      <CoachAvatarCustomization />
                    ) : (
                      <AvatarCustomization />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Personal Information */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/50 rounded-lg">
                    <User className="h-5 w-5 text-tennis-green-medium" />
                    <div className="flex-1">
                      <p className="text-sm text-tennis-green-dark/70 font-medium">Full Name</p>
                      <p className="text-tennis-green-dark font-semibold">
                        {profile?.full_name || 'Not set'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/50 rounded-lg">
                    <Mail className="h-5 w-5 text-tennis-green-medium" />
                    <div className="flex-1">
                      <p className="text-sm text-tennis-green-dark/70 font-medium">Email</p>
                      <p className="text-tennis-green-dark font-semibold break-all text-sm">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/50 rounded-lg">
                    <UserCheck className="h-5 w-5 text-tennis-green-medium" />
                    <div className="flex-1">
                      <p className="text-sm text-tennis-green-dark/70 font-medium">Account Type</p>
                      <p className="text-tennis-green-dark font-semibold capitalize">
                        {profile?.role}
                      </p>
                    </div>
                  </div>

                  {profile?.location && (
                    <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/50 rounded-lg">
                      <MapPin className="h-5 w-5 text-tennis-green-medium" />
                      <div className="flex-1">
                        <p className="text-sm text-tennis-green-dark/70 font-medium">Location</p>
                        <p className="text-tennis-green-dark font-semibold">
                          {profile.location}
                        </p>
                      </div>
                    </div>
                   )}

                   {/* Availability */}
                   {profile?.availability && profile.availability.length > 0 && (
                     <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/50 rounded-lg">
                       <Calendar className="h-5 w-5 text-tennis-green-medium" />
                       <div className="flex-1">
                         <p className="text-sm text-tennis-green-dark/70 font-medium">Availability</p>
                         <p className="text-tennis-green-dark font-semibold text-sm">
                           {profile.availability.length} time slots set
                         </p>
                       </div>
                     </div>
                   )}

                   {/* Stake Preferences */}
                   {profile?.stake_preference && Object.keys(profile.stake_preference).length > 0 && (
                     <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/50 rounded-lg">
                       <Trophy className="h-5 w-5 text-tennis-green-medium" />
                       <div className="flex-1">
                         <p className="text-sm text-tennis-green-dark/70 font-medium">Stake Preference</p>
                         <p className="text-tennis-green-dark font-semibold text-sm">
                           {profile.stake_preference.preferred_stakes || 'Configured'}
                         </p>
                       </div>
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>

            {/* Role-specific Information */}
            <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                  {isPlayer ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                  {isPlayer ? 'Player Journey' : 'Coach Excellence'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isPlayer ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-tennis-green-light/20 to-tennis-green-medium/20 rounded-lg">
                      <Trophy className="h-12 w-12 text-tennis-green-medium mx-auto mb-3" />
                      <h3 className="font-semibold text-tennis-green-dark mb-2">Welcome to Rako!</h3>
                      <p className="text-tennis-green-dark/70 text-sm">
                        Track your tennis journey, earn XP, and unlock achievements as you progress through your training and matches.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                        <Calendar className="h-6 w-6 text-tennis-green-medium mx-auto mb-1" />
                        <p className="text-xs text-tennis-green-dark/70">Member Since</p>
                        <p className="text-sm font-semibold text-tennis-green-dark">
                          {new Date(user?.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                        <Target className="h-6 w-6 text-tennis-green-medium mx-auto mb-1" />
                        <p className="text-xs text-tennis-green-dark/70">Status</p>
                        <p className="text-sm font-semibold text-tennis-green-dark">Active</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-tennis-green-light/20 to-tennis-green-medium/20 rounded-lg">
                      <Target className="h-12 w-12 text-tennis-green-medium mx-auto mb-3" />
                      <h3 className="font-semibold text-tennis-green-dark mb-2">Coach Dashboard</h3>
                      <p className="text-tennis-green-dark/70 text-sm">
                        As a coach on Rako, you can mentor players, assign training plans, and earn CRP for your coaching excellence.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                        <Calendar className="h-6 w-6 text-tennis-green-medium mx-auto mb-1" />
                        <p className="text-xs text-tennis-green-dark/70">Coach Since</p>
                        <p className="text-sm font-semibold text-tennis-green-dark">
                          {new Date(user?.created_at || '').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                        <Trophy className="h-6 w-6 text-tennis-green-medium mx-auto mb-1" />
                        <p className="text-xs text-tennis-green-dark/70">Rating</p>
                        <p className="text-sm font-semibold text-tennis-green-dark">Professional</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coach-specific Stats */}
          {isCoach && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-tennis-green-dark text-lg">
                    <Trophy className="h-5 w-5" />
                    CRP Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CRPDisplay />
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-tennis-green-dark text-lg">
                    <Target className="h-5 w-5" />
                    CXP Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CXPDisplay />
                </CardContent>
              </Card>

              <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-tennis-green-dark text-lg">
                    <Settings className="h-5 w-5" />
                    CTK Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CTKDisplay />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Availability Section - Only for players */}
          {isPlayer && (
            <ProfileAvailability />
          )}

          {/* Quick Actions */}
          <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                <Edit className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <ProfileEditDialog 
                profile={profile} 
                onProfileUpdate={fetchProfile}
              >
                <Button 
                  variant="outline" 
                  className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </ProfileEditDialog>
                <Button 
                  variant="outline" 
                  className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
                  onClick={() => setEditAvatarOpen(true)}
                >
                  <Palette className="h-4 w-4 mr-2" />
                  Customize Avatar
                </Button>
                <Button 
                  variant="outline" 
                  className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
                >
                  <User className="h-4 w-4 mr-2" />
                  Privacy Settings
                </Button>
                <Button 
                  variant="outline" 
                  className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
