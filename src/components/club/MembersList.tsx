import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Crown, 
  Shield, 
  UserCheck, 
  MoreVertical,
  UserMinus,
  UserCog,
  Mail
} from 'lucide-react';
import { useClubs, ClubMembership } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { InviteMembersDialog } from './InviteMembersDialog';

interface MembersListProps {
  club: any;
  members: ClubMembership[];
  canManageMembers: boolean;
  onRefresh: () => void;
}

export function MembersList({ club, members, canManageMembers, onRefresh }: MembersListProps) {
  const { user } = useAuth();
  const { removeMember, updateMemberRole } = useClubs();
  const [loading, setLoading] = useState<string | null>(null);

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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'moderator':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const handleRemoveMember = async (memberId: string, memberUserId: string) => {
    if (!confirm('Are you sure you want to remove this member from the club?')) {
      return;
    }

    try {
      setLoading(memberUserId);
      await removeMember(club.id, memberUserId);
      onRefresh();
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(null);
    }
  };

  const handleChangeRole = async (memberUserId: string, newRole: string) => {
    try {
      setLoading(memberUserId);
      await updateMemberRole(club.id, memberUserId, newRole);
      onRefresh();
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(null);
    }
  };

  const canManageMember = (member: ClubMembership) => {
    if (user?.id === member.user_id) return false; // Can't manage yourself
    if (member.role === 'owner') return false; // Can't manage owner
    if (user?.id === club.owner_id) return true; // Owner can manage anyone
    return canManageMembers && member.role === 'member'; // Admins can only manage regular members
  };

  const availableRoles = (currentRole: string) => {
    const allRoles = ['member', 'moderator', 'admin'];
    return allRoles.filter(role => role !== currentRole);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Club Members ({members.length})
          </CardTitle>
          {canManageMembers && (
            <InviteMembersDialog clubId={club.id} onInviteSent={onRefresh} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
              <Avatar className="h-10 w-10">
                <AvatarImage src={member.profiles?.avatar_url || undefined} />
                <AvatarFallback>
                  {member.profiles?.full_name?.slice(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate">
                    {member.profiles?.full_name || 'Unknown User'}
                  </p>
                  {member.user_id === user?.id && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {member.profiles?.email}
                </p>
                <p className="text-xs text-gray-500">
                  Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  {getRoleIcon(member.role)}
                  <Badge variant={getRoleBadgeVariant(member.role)} className="capitalize">
                    {member.role}
                  </Badge>
                </div>

                {canManageMember(member) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={loading === member.user_id}
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border shadow-lg">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => window.open(`mailto:${member.profiles?.email}`, '_blank')}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {availableRoles(member.role).map((role) => (
                        <DropdownMenuItem
                          key={role}
                          className="cursor-pointer"
                          onClick={() => handleChangeRole(member.user_id, role)}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Make {role.charAt(0).toUpperCase() + role.slice(1)}
                        </DropdownMenuItem>
                      ))}
                      
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600"
                        onClick={() => handleRemoveMember(member.id, member.user_id)}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove from Club
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">No members yet</h3>
              <p className="text-sm">Invite members to get started!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}