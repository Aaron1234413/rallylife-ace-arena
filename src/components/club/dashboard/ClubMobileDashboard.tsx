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

      {/* Phase 2 Enhanced Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-500" />
            Phase 2 Features Now Available!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Enhanced Member List</p>
                <p className="text-sm text-green-700">Search, filter, and view detailed profiles</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <UserPlus className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-800">Coach Profiles</p>
                <p className="text-sm text-green-700">Browse coaches with detailed information</p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-tennis-green-primary/5 to-tennis-green-primary/10 rounded-lg border">
            <p className="text-sm font-medium text-tennis-green-dark mb-2">
              🎉 Try the new features:
            </p>
            <ul className="text-sm text-tennis-green-medium space-y-1">
              <li>• Click on any member to view their detailed profile</li>
              <li>• Use the search bar to find specific members or coaches</li>
              <li>• Filter members by role (Owner, Admin, Coach, Member)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Next Phase Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark">Coming in Phase 3</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/30 rounded-lg">
            <MessageCircle className="h-5 w-5 text-tennis-green-medium" />
            <div className="flex-1">
              <p className="font-medium text-tennis-green-dark">Member Activity Feed</p>
              <p className="text-sm text-tennis-green-medium">See real-time club activity and updates</p>
            </div>
            <Badge variant="secondary">Phase 3</Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/30 rounded-lg">
            <Activity className="h-5 w-5 text-tennis-green-medium" />
            <div className="flex-1">
              <p className="font-medium text-tennis-green-dark">Member Status Tracking</p>
              <p className="text-sm text-tennis-green-medium">See who's online and looking to play</p>
            </div>
            <Badge variant="secondary">Phase 3</Badge>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/30 rounded-lg">
            <Calendar className="h-5 w-5 text-tennis-green-medium" />
            <div className="flex-1">
              <p className="font-medium text-tennis-green-dark">Session Management</p>
              <p className="text-sm text-tennis-green-medium">Create and join club sessions</p>
            </div>
            <Badge variant="secondary">Phase 4</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}