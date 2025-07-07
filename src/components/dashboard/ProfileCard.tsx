
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MapPin } from 'lucide-react';
import { CRPDisplay } from '@/components/crp/CRPDisplay';
import { CXPDisplay } from '@/components/cxp/CXPDisplay';
import { CTKDisplay } from '@/components/ctk/CTKDisplay';
import { CoachAvatarDisplay } from '@/components/avatar/CoachAvatarDisplay';

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
              {/* Coach Avatar for coaches */}
              {!isPlayer && (
                <div className="flex justify-center">
                  <CoachAvatarDisplay size="md" showItems={true} />
                </div>
              )}
              
              <div className="space-y-2 text-sm">
                <p><strong className="text-tennis-green-dark">Email:</strong> <span className="break-all">{user?.email}</span></p>
                <p><strong className="text-tennis-green-dark">Full Name:</strong> {profile?.full_name}</p>
                <p><strong className="text-tennis-green-dark">Role:</strong> {profile?.role}</p>
                {profile?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-tennis-green-medium" />
                    <p><strong className="text-tennis-green-dark">Location:</strong> {profile.location}</p>
                  </div>
                )}
                <p className="text-tennis-green-medium text-xs mt-3">
                  🎾 Phase 2.5 (Achievement System) is now live! 
                  {isPlayer ? ' Earn achievements by playing, training, and progressing in the game!' : ' Monitor your players\' achievement progress and unlocks.'}
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
