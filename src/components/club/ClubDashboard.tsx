import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  Activity, 
  Settings,
  UserPlus,
  Crown,
  Shield,
  UserCheck
} from 'lucide-react';
import { useClubs, ClubMembership } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface ClubDashboardProps {
  club: any;
}

export function ClubDashboard({ club }: ClubDashboardProps) {
  const { user } = useAuth();
  const { 
    clubMembers, 
    clubActivities, 
    fetchClubMembers, 
    fetchClubActivities 
  } = useClubs();
  const [loading, setLoading] = useState(true);

  const userMembership = clubMembers.find(m => m.user_id === user?.id);
  const isOwner = user?.id === club.owner_id;
  const canManageMembers = userMembership?.permissions?.can_manage_members || false;

  useEffect(() => {
    if (club?.id) {
      const loadData = async () => {
        setLoading(true);
        await Promise.all([
          fetchClubMembers(club.id),
          fetchClubActivities(club.id)
        ]);
        setLoading(false);
      };
      loadData();
    }
  }, [club?.id]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'moderator':
        return <UserCheck className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityDescription = (activity: any) => {
    const data = activity.activity_data || {};
    const userName = activity.profiles?.full_name || 'Unknown User';
    
    switch (activity.activity_type) {
      case 'club_created':
        return `${userName} created the club`;
      case 'member_joined':
        return `${userName} joined the club`;
      case 'member_left':
        return `${userName} left the club`;
      case 'member_role_changed':
        return `${userName}'s role was changed to ${data.new_role}`;
      case 'club_updated':
        return `${userName} updated club settings`;
      default:
        return `${userName} performed an action`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Club Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{club.member_count}</p>
                <p className="text-sm text-gray-600">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Courts Booked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clubActivities.length}</p>
                <p className="text-sm text-gray-600">Recent Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Crown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatDistanceToNow(new Date(club.created_at))}
                </p>
                <p className="text-sm text-gray-600">Club Age</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Members and Activities */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clubMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {member.profiles?.full_name?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {member.profiles?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(member.role)}
                    <Badge variant="outline" className="text-xs capitalize">
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))}
              {clubMembers.length === 0 && (
                <p className="text-gray-500 text-center py-4">No members yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clubActivities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-6 w-6 mt-1">
                    <AvatarImage src={activity.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {activity.profiles?.full_name?.slice(0, 2).toUpperCase() || 'UN'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{getActivityDescription(activity)}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {clubActivities.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}