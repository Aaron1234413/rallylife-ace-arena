import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Crown, 
  Shield, 
  User, 
  Loader2, 
  Search, 
  Filter, 
  MoreVertical,
  Mail,
  Calendar,
  Settings,
  UserMinus,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClubs } from '@/hooks/useClubs';
import { formatDistanceToNow } from 'date-fns';

interface MemberProfile {
  full_name: string;
  avatar_url: string | null;
  email?: string;
}

interface ClubMembershipWithProfile {
  id: string;
  user_id: string;
  club_id: string;
  role: string;
  status: string;
  joined_at: string;
  updated_at: string;
  permissions?: any;
  profiles?: MemberProfile;
}

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
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<ClubMembershipWithProfile | null>(null);

  React.useEffect(() => {
    if (club.id) {
      fetchClubMembers(club.id);
    }
  }, [club.id, fetchClubMembers]);

  // Filter and search members
  const filteredMembers = useMemo(() => {
    return clubMembers.filter((membership) => {
      const memberUser = membership.profiles || { full_name: 'Unknown User', avatar_url: null };
      
      // Search filter
      const matchesSearch = memberUser.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) || false;
      
      // Role filter
      const isOwner = membership.user_id === club.owner_id;
      const actualRole = isOwner ? 'owner' : membership.role;
      const matchesRole = roleFilter === 'all' || actualRole === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [clubMembers, searchTerm, roleFilter, club.owner_id]);

  const handleMemberAction = async (memberId: string, action: 'promote' | 'demote' | 'remove') => {
    // This would integrate with backend member management
    console.log(`Member ${action}:`, memberId);
  };

  const MemberDetailDialog = ({ member }: { member: ClubMembershipWithProfile }) => {
    const memberUser = member.profiles || { full_name: 'Unknown User', avatar_url: null };
    const isOwner = member.user_id === club.owner_id;
    
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={memberUser.avatar_url || undefined} />
              <AvatarFallback className="bg-tennis-green-primary text-white text-lg">
                {memberUser.full_name?.substring(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-tennis-green-dark">
                {memberUser.full_name}
              </h3>
              <div className="flex items-center gap-2">
                {getRoleIcon(member.role, isOwner)}
                {getRoleBadge(member.role, isOwner)}
                {member.user_id === user?.id && (
                  <Badge variant="outline" className="text-xs">You</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Member Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-tennis-green-medium" />
              <div>
                <p className="text-sm font-medium text-tennis-green-dark">Joined</p>
                <p className="text-sm text-tennis-green-medium">
                  {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {memberUser.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-tennis-green-medium" />
                <div>
                  <p className="text-sm font-medium text-tennis-green-dark">Email</p>
                  <p className="text-sm text-tennis-green-medium">{memberUser.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Admin Actions */}
          {canManageMembers && member.user_id !== user?.id && !isOwner && (
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium text-tennis-green-dark mb-3">Member Actions</p>
              <div className="space-y-2">
                {member.role !== 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMemberAction(member.id, 'promote')}
                    className="w-full justify-start"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Promote to Admin
                  </Button>
                )}
                
                {member.role === 'admin' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMemberAction(member.id, 'demote')}
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Remove Admin
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMemberAction(member.id, 'remove')}
                  className="w-full justify-start text-red-600 hover:text-red-700"
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove Member
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    );
  };

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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-tennis-green-primary" />
              Club Members ({filteredMembers.length} of {club.member_count})
            </CardTitle>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex gap-3 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tennis-green-medium" />
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
                <SelectItem value="member">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
              <p className="text-tennis-green-medium">
                {searchTerm || roleFilter !== 'all' ? 'No members match your filters' : 'No members found'}
              </p>
              <p className="text-sm text-tennis-green-medium/70">
                {searchTerm || roleFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Member list will appear here'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.map((membership) => {
                const isOwner = membership.user_id === club.owner_id;
                const memberUser = membership.profiles || { 
                  full_name: 'Unknown User', 
                  avatar_url: null 
                };

                return (
                  <Dialog key={membership.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-center gap-3 p-4 border border-tennis-green-bg rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-tennis-green-primary/30">
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
                        
                        <MoreVertical className="h-4 w-4 text-tennis-green-medium flex-shrink-0" />
                      </div>
                    </DialogTrigger>
                    
                    <MemberDetailDialog member={membership} />
                  </Dialog>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Member Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark">Enhanced Member Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-800">✓ Enhanced Search & Filters</p>
              </div>
              <p className="text-sm text-green-700">Search members by name and filter by role</p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-800">✓ Member Detail Views</p>
              </div>
              <p className="text-sm text-green-700">Click any member to view their profile</p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-800">✓ Role Management</p>
              </div>
              <p className="text-sm text-green-700">Enhanced role badges and permissions</p>
            </div>
            
            {canManageMembers && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="font-medium text-green-800">✓ Admin Controls</p>
                </div>
                <p className="text-sm text-green-700">Promote, demote, and manage members</p>
              </div>
            )}
          </div>
          
          <div className="pt-3 border-t border-tennis-green-bg">
            <p className="text-sm text-tennis-green-medium mb-2 font-medium">Coming in Phase 3:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Member Status Tracking</Badge>
              <Badge variant="outline">Activity History</Badge>
              <Badge variant="outline">Playing Preferences</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}