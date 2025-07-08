import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Link2, Users, Clock, CheckCircle } from 'lucide-react';

interface ClubInvitationManagerProps {
  clubId: string;
  isPrivate: boolean;
  onPrivacyChange: (isPrivate: boolean) => void;
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

export function ClubInvitationManager({ clubId, isPrivate, onPrivacyChange }: ClubInvitationManagerProps) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [maxUses, setMaxUses] = useState(10);

  const generateInviteLink = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('club_invitations')
        .insert({
          club_id: clubId,
          inviter_id: (await supabase.auth.getUser()).data.user?.id,
          invitee_email: 'multiple@users.com', // For shareable links
          max_uses: maxUses,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          message: 'Join our tennis club!'
        })
        .select()
        .single();

      if (error) throw error;

      setInvitations(prev => [data, ...prev]);
      toast({
        title: "Invitation Link Created",
        description: "Your shareable invite link is ready!"
      });
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: "Error",
        description: "Failed to create invitation link",
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
      description: "Invitation link copied to clipboard"
    });
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Club Privacy
          </CardTitle>
          <CardDescription>
            Control who can join your club
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Private Club</Label>
              <p className="text-sm text-tennis-green-medium">
                {isPrivate 
                  ? "Only invited members can join" 
                  : "Anyone can discover and join your club"
                }
              </p>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={onPrivacyChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invitation Generator */}
      {isPrivate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5" />
              Generate Invite Links
            </CardTitle>
            <CardDescription>
              Create shareable links for new members to join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="max-uses">Maximum Uses</Label>
                <Input
                  id="max-uses"
                  type="number"
                  min="1"
                  max="100"
                  value={maxUses}
                  onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                />
              </div>
              <Button onClick={generateInviteLink} disabled={loading}>
                Generate Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
                      <code className="text-sm bg-tennis-green-bg px-2 py-1 rounded">
                        {invitation.invitation_code}
                      </code>
                      {invitation.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {invitation.uses_count}/{invitation.max_uses} uses
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
                      onClick={() => copyInviteLink(invitation.invitation_code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {invitation.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deactivateInvitation(invitation.id)}
                      >
                        Deactivate
                      </Button>
                    )}
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