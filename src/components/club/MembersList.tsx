import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  Crown, 
  Shield, 
  User, 
  MoreVertical,
  Mail,
  Settings
} from 'lucide-react';
import { Club, ClubMembership } from '@/hooks/useClubs';
import { formatDistanceToNow } from 'date-fns';

interface MembersListProps {
  club: Club;
  members: ClubMembership[];
  canManageMembers: boolean;
  onRefresh: () => void;
}

export function MembersList({ club, members, canManageMembers, onRefresh }: MembersListProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  // Mock members data if empty
  const mockMembers: ClubMembership[] = members.length > 0 ? members : [
    {
      id: '1',
      club_id: club.id,
      user_id: 'owner-1',
      role: 'owner',
      status: 'active',
      permissions: {
        can_invite: true,
        can_manage_members: true,
        can_edit_club: true,
        can_manage_courts: true
      },
      joined_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      profiles: {
        full_name: 'John Smith',
        avatar_url: null,
        email: 'john.smith@email.com'
      }
    },
    {
      id: '2',
      club_id: club.id,
      user_id: 'member-1',
      role: 'admin',
      status: 'active',
      permissions: {
        can_invite: true,
        can_manage_members: true,
        can_edit_club: false,
        can_manage_courts: true
      },
      joined_at: '2024-02-01T14:30:00Z',
      updated_at: '2024-02-01T14:30:00Z',
      profiles: {
        full_name: 'Sarah Johnson',
        avatar_url: null,
        email: 'sarah.johnson@email.com'
      }
    },
    {
      id: '3',
      club_id: club.id,
      user_id: 'member-2',
      role: 'member',
      status: 'active',
      permissions: {
        can_invite: false,
        can_manage_members: false,
        can_edit_club: false,
        can_manage_courts: false
      },
      joined_at: '2024-02-15T09:15:00Z',
      updated_at: '2024-02-15T09:15:00Z',
      profiles: {
        full_name: 'Mike Davis',
        avatar_url: null,
        email: 'mike.davis@email.com'
      }
    },
    {
      id: '4',
      club_id: club.id,
      user_id: 'member-3',
      role: 'member',
      status: 'active',
      permissions: {
        can_invite: false,
        can_manage_members: false,
        can_edit_club: false,
        can_manage_courts: false
      },
      joined_at: '2024-03-01T11:20:00Z',
      updated_at: '2024-03-01T11:20:00Z',
      profiles: {
        full_name: 'Emma Wilson',
        avatar_url: null,
        email: 'emma.wilson@email.com'
      }
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-amber-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'moderator':
        return <Settings className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-amber-100 text-amber-800">Owner</Badge>;
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-green-100 text-green-800">Moderator</Badge>;
      default:
        return <Badge variant="secondary">Member</Badge>;
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // Mock invite functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInviteEmail('');
      setInviteMessage('');
      setShowInviteDialog(false);
      onRefresh();
      
      // In real implementation, would call the actual invite function
      console.log('Inviting:', inviteEmail, 'with message:', inviteMessage);
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-tennis-green-dark">Club Members</h2>
          <p className="text-sm text-tennis-green-medium">
            {mockMembers.length} member{mockMembers.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {canManageMembers && (
          <Button
            onClick={() => setShowInviteDialog(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Invite Members
          </Button>
        )}
      </div>

      {/* Members List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {mockMembers.map((member) => (
              <div key={member.id} className="p-4 hover:bg-tennis-green-bg/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.profiles?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.profiles?.full_name?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <h3 className="font-medium text-tennis-green-dark">
                          {member.profiles?.full_name || 'Unknown User'}
                        </h3>
                        {getRoleBadge(member.role)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.profiles?.email}
                        </span>
                        <span>
                          Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {canManageMembers && member.role !== 'owner' && (
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New Member</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address *</label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={isInviting}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Personal Message (Optional)</label>
              <Input
                placeholder="Add a personal message..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                disabled={isInviting}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowInviteDialog(false)}
                disabled={isInviting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                disabled={isInviting || !inviteEmail.trim()}
                className="flex-1"
              >
                {isInviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}