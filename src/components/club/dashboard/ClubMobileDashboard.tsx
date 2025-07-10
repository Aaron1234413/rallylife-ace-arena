import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar,
  MapPin,
  Clock,
  Plus,
  ChevronRight,
  Activity,
  Crown,
  Shield,
  User as UserIcon,
  Gamepad2,
  UserPlus
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { formatDistanceToNow } from 'date-fns';
import { UnifiedSessionCreationDialog } from '@/components/sessions/UnifiedSessionCreationDialog';

interface ClubMobileDashboardProps {
  club: {
    id: string;
    name: string;
    member_count: number;
    court_count?: number;
    owner_id: string;
  };
  isMember: boolean;
}

export function ClubMobileDashboard({ club, isMember }: ClubMobileDashboardProps) {
  const { clubMembers, fetchClubMembers } = useClubs();
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Mock activity data for now
  const clubActivities = [
    {
      id: '1',
      activity_type: 'member_joined',
      created_at: new Date().toISOString(),
      profiles: {
        full_name: 'John Doe',
        avatar_url: null
      }
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      if (club.id) {
        setLoading(true);
        await fetchClubMembers(club.id);
        setLoading(false);
      }
    };

    loadData();
  }, [club.id]); // Removed fetchClubMembers from deps to prevent infinite re-renders

  const getRoleIcon = (role: string, isOwner: boolean) => {
    if (isOwner) return <Crown className="h-3 w-3 text-amber-500" />;
    if (role === 'admin') return <Shield className="h-3 w-3 text-blue-500" />;
    return <UserIcon className="h-3 w-3 text-gray-500" />;
  };

  const getRoleBadge = (role: string, isOwner: boolean) => {
    if (isOwner) return <Badge className="bg-amber-100 text-amber-800 text-xs">Owner</Badge>;
    if (role === 'admin') return <Badge className="bg-blue-100 text-blue-800 text-xs">Admin</Badge>;
    if (role === 'coach') return <Badge className="bg-green-100 text-green-800 text-xs">Coach</Badge>;
    return <Badge variant="secondary" className="text-xs">Member</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeletons */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-40 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">{club.member_count}</div>
                <div className="text-sm text-blue-700">Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900">{club.court_count || 1}</div>
                <div className="text-sm text-green-700">Courts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-tennis-green-dark">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isMember ? (
            <>
              <Button 
                className="w-full justify-between bg-tennis-green-primary hover:bg-tennis-green-medium h-12"
                onClick={() => setCreateDialogOpen(true)}
              >
                <div className="flex items-center gap-3">
                  <Gamepad2 className="h-5 w-5" />
                  <span>Create Session</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between h-12 hover:bg-tennis-green-bg"
                onClick={() => {/* Navigate to court booking */}}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-tennis-green-primary" />
                  <span>Book Court</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button 
                variant="outline" 
                className="w-full justify-between h-12 hover:bg-tennis-green-bg"
                onClick={() => {/* Navigate to invite members */}}
              >
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-tennis-green-primary" />
                  <span>Invite Member</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <div className="text-center py-6">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-4">Join this club to access features</p>
              <Button className="bg-tennis-green-primary hover:bg-tennis-green-medium">
                <UserPlus className="h-4 w-4 mr-2" />
                Join Club
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-tennis-green-dark">
              <Activity className="h-5 w-5 text-tennis-green-primary" />
              Recent Activity
            </CardTitle>
            {clubActivities.length > 3 && (
              <Button variant="ghost" size="sm" className="text-tennis-green-primary">
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {clubActivities.length === 0 ? (
            <div className="text-center py-6">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500">Club activity will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clubActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="bg-tennis-green-primary text-white text-xs">
                      {activity.profiles?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.activity_type.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Preview */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg text-tennis-green-dark">
              <Users className="h-5 w-5 text-tennis-green-primary" />
              Members ({club.member_count})
            </CardTitle>
            {clubMembers.length > 4 && (
              <Button variant="ghost" size="sm" className="text-tennis-green-primary">
                View All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {clubMembers.length === 0 ? (
            <div className="text-center py-6">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No members found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {clubMembers.slice(0, 4).map((membership) => {
                const isOwner = membership.user_id === club.owner_id;
                const memberUser = membership.profiles || { 
                  full_name: 'Unknown User', 
                  avatar_url: null 
                };

                return (
                  <div key={membership.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={memberUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-tennis-green-primary text-white text-sm">
                        {memberUser.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        {getRoleIcon(membership.role, isOwner)}
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {memberUser.full_name}
                        </p>
                      </div>
                      {getRoleBadge(membership.role, isOwner)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Schedule Preview */}
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-tennis-green-dark">
            <Clock className="h-5 w-5 text-tennis-green-primary" />
            Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No sessions scheduled</p>
            <p className="text-sm text-gray-500">Book a court or create a session</p>
          </div>
        </CardContent>
      </Card>

      {/* Session Creation Dialog */}
      <UnifiedSessionCreationDialog
        clubId={club.id}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSessionCreated={() => {
          // Sessions will auto-refresh via real-time subscriptions
        }}
      />
    </div>
  );
}