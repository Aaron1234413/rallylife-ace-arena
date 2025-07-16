import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { UserCheck, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface ProfileHeaderCardProps {
  profile: any;
  user: any;
}

export function ProfileHeaderCard({ profile, user }: ProfileHeaderCardProps) {
  const memberSince = new Date(profile?.member_since || user?.created_at || '').toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Avatar */}
          <AvatarDisplay 
            avatarUrl={profile?.avatar_url}
            size="xl"
            showBorder={true}
          />
          
          {/* Name and UTR Status */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-tennis-green-dark">
              {profile?.full_name || 'Tennis Player'}
            </h2>
            
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-tennis-green-medium" />
                <span className="text-tennis-green-medium font-medium capitalize">
                  {profile?.role || 'Player'}
                </span>
              </div>
              
              {profile?.utr_rating && (
                <div className="flex items-center gap-2">
                  {profile.utr_verified ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <Badge variant="outline" className="bg-white/50">
                    UTR {profile.utr_rating}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-2 text-tennis-green-dark/70">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">Member since {memberSince}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}