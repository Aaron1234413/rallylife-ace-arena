
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { CRPDisplay } from '@/components/crp/CRPDisplay';
import { CXPDisplay } from '@/components/cxp/CXPDisplay';
import { CTKDisplay } from '@/components/ctk/CTKDisplay';
import { RPMProfileDisplay } from '@/components/readyplayerme/RPMProfileDisplay';
import { PlayerAvatarDisplay } from '@/components/avatar/PlayerAvatarDisplay';

interface ProfileCardProps {
  profile: any;
  user: any;
  profileLoading: boolean;
  isPlayer: boolean;
}

export function ProfileCard({ profile, user, profileLoading, isPlayer }: ProfileCardProps) {
  return (
    <div className="space-y-4">
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
            <div className="space-y-4">
              {/* Avatar Display with both 3D and game items */}
              <div className="flex justify-center items-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-2">3D Avatar</p>
                  <RPMProfileDisplay 
                    size="md" 
                    userType={isPlayer ? 'player' : 'coach'} 
                  />
                </div>
                
                {isPlayer && (
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">Game Avatar</p>
                    <PlayerAvatarDisplay size="md" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong className="text-tennis-green-dark">Email:</strong> <span className="break-all">{user?.email}</span></p>
                <p><strong className="text-tennis-green-dark">Full Name:</strong> {profile?.full_name}</p>
                <p><strong className="text-tennis-green-dark">Role:</strong> {profile?.role}</p>
                <p className="text-tennis-green-medium text-xs mt-3">
                  🎾 Phase 2.5 (Ready Player Me Integration) is now live! 
                  {isPlayer ? ' Create your 3D avatar and customize your game items!' : ' Create your professional 3D avatar for coaching!'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isPlayer && !profileLoading && (
        <div className="space-y-4">
          <CRPDisplay />
          <CXPDisplay />
          <CTKDisplay />
        </div>
      )}
    </div>
  );
}
