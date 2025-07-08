import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WhoIsLookingToPlay } from './WhoIsLookingToPlay';
import { OpenSessionsNearby } from './OpenSessionsNearby';
import { ClubQuickActions } from './ClubQuickActions';
import { LiveClubActivityFeed } from './LiveClubActivityFeed';

interface ClubMobileDashboardProps {
  club: {
    id: string;
    name: string;
    description?: string;
    member_count: number;
    is_public: boolean;
  };
  isMember: boolean;
}

export function ClubMobileDashboard({ club, isMember }: ClubMobileDashboardProps) {
  if (!isMember) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="font-medium mb-2 text-tennis-green-dark">Join to Access Club Features</h3>
            <p className="text-sm text-tennis-green-medium">
              Become a member to see who's looking to play, join sessions, and access all club features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions - Always at top for easy access */}
      <ClubQuickActions clubId={club.id} />
      
      {/* Who's Looking to Play - Most prominent feature */}
      <WhoIsLookingToPlay clubId={club.id} />
      
      {/* Open Sessions Near You */}
      <OpenSessionsNearby clubId={club.id} />
      
      {/* Live Club Activity Feed */}
      <LiveClubActivityFeed clubId={club.id} />
    </div>
  );
}