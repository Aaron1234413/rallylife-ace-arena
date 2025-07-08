import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  Calendar, 
  Trophy,
  MessageCircle,
  UserPlus,
  MapPin
} from 'lucide-react';

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
      {/* Welcome Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-tennis-green-primary/5 to-tennis-green-primary/10">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-tennis-green-primary/10 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-tennis-green-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-tennis-green-dark mb-2">
                Welcome to {club.name}!
              </h2>
              <p className="text-tennis-green-medium">
                You're now part of a community of {club.member_count} tennis enthusiasts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-tennis-green-primary" />
            <div className="text-2xl font-bold text-tennis-green-dark">{club.member_count}</div>
            <div className="text-sm text-tennis-green-medium">Members</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-tennis-green-primary" />
            <div className="text-2xl font-bold text-tennis-green-dark">
              {club.is_public ? 'Public' : 'Private'}
            </div>
            <div className="text-sm text-tennis-green-medium">Club Type</div>
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark">Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/30 rounded-lg">
            <MessageCircle className="h-5 w-5 text-tennis-green-medium" />
            <div className="flex-1">
              <p className="font-medium text-tennis-green-dark">Find Players</p>
              <p className="text-sm text-tennis-green-medium">See who's looking to play</p>
            </div>
            <Badge variant="secondary">Phase 2</Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/30 rounded-lg">
            <Calendar className="h-5 w-5 text-tennis-green-medium" />
            <div className="flex-1">
              <p className="font-medium text-tennis-green-dark">Session Booking</p>
              <p className="text-sm text-tennis-green-medium">Book courts and sessions</p>
            </div>
            <Badge variant="secondary">Phase 4</Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/30 rounded-lg">
            <Activity className="h-5 w-5 text-tennis-green-medium" />
            <div className="flex-1">
              <p className="font-medium text-tennis-green-dark">Live Activity</p>
              <p className="text-sm text-tennis-green-medium">Real-time club updates</p>
            </div>
            <Badge variant="secondary">Phase 3</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Get Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark">Get Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 border border-tennis-green-bg rounded-lg">
            <h4 className="font-medium text-tennis-green-dark mb-2">Explore Your Club</h4>
            <p className="text-sm text-tennis-green-medium mb-3">
              Use the tabs above to browse members, coaches, and club information.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                <Users className="h-3 w-3 mr-1" />
                Members
              </Badge>
              <Badge variant="outline">
                <UserPlus className="h-3 w-3 mr-1" />
                Coaches
              </Badge>
              <Badge variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                Courts
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}