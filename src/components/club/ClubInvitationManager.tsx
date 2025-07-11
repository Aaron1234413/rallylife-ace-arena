import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Link2, Users, Clock, Share2, X } from 'lucide-react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/hooks/useAuth';

interface ClubInvitationManagerProps {
  clubId: string;
  isPrivate?: boolean;
  onPrivacyChange?: (isPrivate: boolean) => void;
}

interface Invitation {
  id: string;
  invitation_code: string;
  expires_at: string;
  uses_count: number;
  max_uses: number;
  is_active: boolean;
  created_at: string;
}

export function ClubInvitationManager({ clubId }: ClubInvitationManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const { user } = useAuth();

  // Check user permissions on component mount
  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!user?.id) return;
      
      const { data: membership } = await supabase
        .from('club_memberships')
        .select('permissions, role')
        .eq('club_id', clubId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
        
      setUserPermissions(membership);
    };
    
    checkUserPermissions();
  }, [clubId, user?.id]);

  // Fetch existing invitations
  useEffect(() => {
    const fetchInvitations = async () => {
      const { data } = await supabase
        .from('club_invitations')
        .select('*')
        .eq('club_id', clubId)
        .eq('is_shareable_link', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (data) {
        setInvitations(data);
      }
    };
    
    fetchInvitations();
  }, [clubId]);

  const generateInviteLink = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create invitation links",
        variant: "destructive"
      });
      return;
    }

    // Check permissions before attempting to create invitation
    if (!userPermissions) {
      toast({
        title: "Permission Check Failed",
        description: "Unable to verify your permissions. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (!userPermissions.permissions?.can_invite && userPermissions.role !== 'owner') {
      toast({
        title: "Insufficient Permissions",
        description: "You don't have permission to create invitation links. Contact your club owner to request invitation privileges.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Generate unique email for shareable links to avoid constraint conflicts
      const uniqueEmail = `invite-${Date.now()}@shareable.link`;
      
      const { data, error } = await supabase
        .from('club_invitations')
        .insert({
          club_id: clubId,
          inviter_id: user.id,
          invitee_email: uniqueEmail,
          max_uses: null, // Unlimited uses
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
          message: 'Join our tennis club!',
          is_shareable_link: true
        })
        .select()
        .single();

      if (error) {
        // Handle specific RLS errors
        if (error.code === '42501' || error.message.includes('policy')) {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to create invitations. Please contact your club administrator.",
            variant: "destructive"
          });
        } else if (error.code === '23505') {
          toast({
            title: "Duplicate Invitation",
            description: "An invitation with this code already exists. Please try again.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      setInvitations(prev => [data, ...prev]);
      toast({
        title: "Shareable Link Created",
        description: "Your unlimited club invite link is ready!"
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create invitation link. Please check your internet connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = (code: string) => {
    const link = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied", 
      description: "Share this link to invite members to your club"
    });
  };

  const shareLink = async (code: string) => {
    const fullUrl = `${window.location.origin}/join/${code}`;
    const shareData = {
      title: 'Join Our Tennis Club',
      text: "You're invited to join our tennis club! Click the link to get started.",
      url: fullUrl,
    };

    try {
      // Check if we're on a native platform
      const isNative = Capacitor.isNativePlatform();
      
      if (isNative) {
        // Use Capacitor Share plugin for native platforms (iOS/Android)
        await Share.share(shareData);
        toast({
          title: "Shared Successfully",
          description: "Invitation link shared!"
        });
      } else if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        // Use Web Share API for modern browsers
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully", 
          description: "Invitation link shared!"
        });
      } else {
        // Fallback to clipboard copy for older browsers
        copyInviteLink(code);
      }
    } catch (error: any) {
      // Handle share cancellation gracefully (user canceled the share dialog)
      if (error.name !== 'AbortError' && error.message !== 'Share canceled') {
        console.error('Error sharing:', error);
        // Fallback to clipboard copy on error
        copyInviteLink(code);
      }
    }
  };

  const deactivateInvitation = async (invitationId: string) => {
    try {
      await supabase
        .from('club_invitations')
        .update({ is_active: false })
        .eq('id', invitationId);

      setInvitations(prev => 
        prev.map(inv => 
          inv.id === invitationId ? { ...inv, is_active: false } : inv
        )
      );

      toast({
        title: "Invitation Deactivated",
        description: "The invitation link is no longer active"
      });
    } catch (error) {
      console.error('Error deactivating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate invitation",
        variant: "destructive"
      });
    }
  };

  // Check if user has permission to create invitations
  const canCreateInvitations = userPermissions?.role === 'owner' || userPermissions?.permissions?.can_invite;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Club Invitations
          </CardTitle>
          <CardDescription>
            Create shareable links for new members to join your club
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Check Display */}
          {!canCreateInvitations && (
            <div className="p-3 rounded-md bg-orange-50 border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>No invitation permissions:</strong> Contact your club owner to request invitation privileges.
              </p>
            </div>
          )}
          
          {/* Create Shareable Link */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Create Shareable Invite Link</h3>
              <Button 
                onClick={generateInviteLink} 
                disabled={loading || !canCreateInvitations}
                size="sm"
                className="flex items-center gap-2"
              >
                <Link2 className="h-4 w-4" />
                {loading ? 'Creating...' : 'Create Link'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Generate unlimited-use invitation links that expire in 1 year
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Active Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Invitations</CardTitle>
            <CardDescription>
              Manage your club's invitation links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {invitation.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    
                    {/* Full shareable link display */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Share2 className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Share this link:</span>
                      </div>
                      <code className="text-sm text-blue-600 break-all">
                        {`${window.location.origin}/join/${invitation.invitation_code}`}
                      </code>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {invitation.uses_count} members joined
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Expires {new Date(invitation.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareLink(invitation.invitation_code)}
                      className="flex items-center gap-1"
                    >
                      <Share2 className="h-3 w-3" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyInviteLink(invitation.invitation_code)}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deactivateInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}