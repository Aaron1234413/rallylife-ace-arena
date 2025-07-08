import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  Calendar, 
  Trophy
} from 'lucide-react';
import { LiveClubActivityFeed } from './LiveClubActivityFeed';
import { WhoIsLookingToPlay } from './WhoIsLookingToPlay';
import { SessionManagement } from './SessionManagement';

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
      {/* Session Management Widget - Core functionality */}
      <SessionManagement clubId={club.id} />
      
      {/* Live Activity & Member Status */}
      <LiveClubActivityFeed clubId={club.id} />
      
      <WhoIsLookingToPlay clubId={club.id} />
    </div>
  );
}