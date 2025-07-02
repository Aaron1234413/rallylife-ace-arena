import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { InvitationCard } from '@/components/invitations/InvitationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import type { UnifiedInvitation } from '@/types/invitation';

const ViewInvitation = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState<UnifiedInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitationId || !user) {
        setError('Invalid invitation or user not authenticated');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('match_invitations')
          .select('*')
          .eq('id', invitationId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching invitation:', fetchError);
          setError('Failed to load invitation');
          return;
        }

        if (!data) {
          setError('Invitation not found');
          return;
        }

        // Check if user has permission to view this invitation
        const hasPermission = data.inviter_id === user.id || 
          (data.invitee_id && data.invitee_id === user.id) ||
          (!data.invitee_id && data.invitee_email === user.email);
        
        if (!hasPermission) {
          setError('You do not have permission to view this invitation');
          return;
        }

        setInvitation(data as UnifiedInvitation);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId, user]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleInvitationUpdate = () => {
    // Refresh the invitation data after update
    if (invitationId && user) {
      setLoading(true);
      const refetch = async () => {
        try {
          const { data } = await supabase
            .from('match_invitations')
            .select('*')
            .eq('id', invitationId)
            .maybeSingle();
          
          if (data) {
            setInvitation(data as UnifiedInvitation);
          }
        } catch (error) {
          console.error('Error refetching invitation:', error);
        } finally {
          setLoading(false);
        }
      };
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary mx-auto"></div>
          <p className="mt-2 text-tennis-green-dark">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-4 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-red-600">
                <Mail className="h-6 w-6" />
                Invitation Error
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-tennis-green-dark/80">
                {error || 'Invitation not found'}
              </p>
              <Button onClick={handleBackToDashboard} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isReceived = invitation.invitee_id === user?.id || 
    (!invitation.invitee_id && invitation.invitee_email === user?.email);

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBackToDashboard}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-tennis-green-dark font-orbitron">
            {isReceived ? 'Received' : 'Sent'} Invitation
          </h1>
          <div></div> {/* Spacer for center alignment */}
        </div>

        {/* Invitation Card */}
        <div className="max-w-2xl mx-auto">
          <InvitationCard
            invitation={invitation}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewInvitation;