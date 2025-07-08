import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Shield, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClubs } from '@/hooks/useClubs';

interface MembersListSimpleProps {
  club: {
    id: string;
    name: string;
    member_count: number;
    owner_id: string;
  };
  canManageMembers?: boolean;
}

export function MembersListSimple({ club, canManageMembers }: MembersListSimpleProps) {
  const { user } = useAuth();
  const { clubMembers, loading, fetchClubMembers } = useClubs();

  React.useEffect(() => {
    if (club.id) {
      fetchClubMembers(club.id);
    }
  }, [club.id, fetchClubMembers]);

  const getRoleIcon = (role: string, isOwner: boolean) => {
    if (isOwner) return <Crown className="h-4 w-4 text-amber-500" />;
    if (role === 'admin') return <Shield className="h-4 w-4 text-blue-500" />;
    return <User className="h-4 w-4 text-gray-500" />;
  };

  const getRoleBadge = (role: string, isOwner: boolean) => {
    if (isOwner) return <Badge className="bg-amber-100 text-amber-800">Owner</Badge>;
    if (role === 'admin') return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
    if (role === 'coach') return <Badge className="bg-green-100 text-green-800">Coach</Badge>;
    return <Badge variant="secondary">Member</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-tennis-green-primary" />
          <span className="ml-2 text-tennis-green-medium">Loading members...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-tennis-green-primary" />
            Club Members ({club.member_count})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clubMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
              <p className="text-tennis-green-medium">No members found</p>
              <p className="text-sm text-tennis-green-medium/70">
                Member list will appear here
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {clubMembers.map((membership) => {
                const isOwner = membership.user_id === club.owner_id;
                const memberUser = membership.profiles || { 
                  full_name: 'Unknown User', 
                  avatar_url: null 
                };

                return (
                  <div
                    key={membership.id}
                    className="flex items-center gap-3 p-4 border border-tennis-green-bg rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={memberUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-tennis-green-primary text-white">
                        {memberUser.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getRoleIcon(membership.role, isOwner)}
                        <p className="font-medium text-tennis-green-dark truncate">
                          {memberUser.full_name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(membership.role, isOwner)}
                        {membership.user_id === user?.id && (
                          <Badge variant="outline" className="text-xs">You</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark">Member Features Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
            <p className="font-medium text-tennis-green-dark">Enhanced Member Profiles</p>
            <p className="text-sm text-tennis-green-medium">Detailed profiles with playing history and preferences</p>
            <Badge variant="secondary" className="mt-2">Phase 2</Badge>
          </div>
          
          <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
            <p className="font-medium text-tennis-green-dark">Member Search & Filters</p>
            <p className="text-sm text-tennis-green-medium">Find members by skill level, availability, and more</p>
            <Badge variant="secondary" className="mt-2">Phase 2</Badge>
          </div>

          {canManageMembers && (
            <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
              <p className="font-medium text-tennis-green-dark">Member Management Tools</p>
              <p className="text-sm text-tennis-green-medium">Role management, permissions, and club administration</p>
              <Badge variant="secondary" className="mt-2">Phase 2</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}