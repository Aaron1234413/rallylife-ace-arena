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
  UserCheck,
  MapPin
} from 'lucide-react';
import { LiveClubActivityFeed } from './LiveClubActivityFeed';
import { WhoIsLookingToPlay } from './WhoIsLookingToPlay';

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
      {/* Enhanced Welcome Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-tennis-green-primary/5 to-tennis-green-primary/10">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-tennis-green-primary/10 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-tennis-green-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-tennis-green-dark mb-1">
                  Welcome to {club.name}!
                </h2>
                <p className="text-tennis-green-medium">
                  You're part of a community of {club.member_count} tennis enthusiasts.
                </p>
              </div>
            </div>
            
            {/* Phase 2 Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-tennis-green-bg/50">
              <div className="text-center">
                <div className="text-lg font-bold text-tennis-green-dark">{club.member_count}</div>
                <div className="text-xs text-tennis-green-medium">Members</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-tennis-green-dark">
                  {club.is_public ? 'Public' : 'Private'}
                </div>
                <div className="text-xs text-tennis-green-medium">Access</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-tennis-green-dark">Active</div>
                <div className="text-xs text-tennis-green-medium">Status</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 3: Live Activity & Member Status */}
      <LiveClubActivityFeed clubId={club.id} />
      
      <WhoIsLookingToPlay clubId={club.id} />

      {/* Phase 3 Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Phase 3 Features Now Live!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">Live Activity Feed</p>
                <p className="text-sm text-blue-700">See real-time club activity and member updates</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">Member Status Tracking</p>
                <p className="text-sm text-blue-700">See who's online and looking to play</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-blue-500/5 to-blue-500/10 rounded-lg border">
            <p className="text-sm font-medium text-tennis-green-dark mb-2">
              🔥 New in Phase 3:
            </p>
            <ul className="text-sm text-tennis-green-medium space-y-1">
              <li>• Real-time activity updates from club members</li>
              <li>• See who's currently looking to play</li>
              <li>• Member online/offline status tracking</li>
              <li>• Interactive "Looking to Play" widget</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Phase 4 Complete! */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-500" />
            Phase 4 Features Complete! 
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-purple-800">Session Management</p>
                <p className="text-sm text-purple-700">Create and join club sessions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="font-medium text-purple-800">Court Booking</p>
                <p className="text-sm text-purple-700">Reserve courts and manage bookings</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-purple-500/5 to-purple-500/10 rounded-lg border">
            <p className="text-sm font-medium text-tennis-green-dark mb-2">
              🚀 Phase 4 Complete:
            </p>
            <ul className="text-sm text-tennis-green-medium space-y-1">
              <li>• Create tournaments, lessons, and social sessions</li>
              <li>• Real-time court availability and booking</li>
              <li>• Visual time slot management</li>
              <li>• Booking management with pricing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}