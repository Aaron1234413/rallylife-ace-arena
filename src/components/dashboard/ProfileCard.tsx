
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { CRPDisplay } from '@/components/crp/CRPDisplay';
import { CXPDisplay } from '@/components/cxp/CXPDisplay';
import { CTKDisplay } from '@/components/ctk/CTKDisplay';

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
