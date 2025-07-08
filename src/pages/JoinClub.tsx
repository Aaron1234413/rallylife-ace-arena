import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';

export default function JoinClubPage() {
  const { inviteCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [clubInfo, setClubInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!inviteCode) {
      setError('Invalid invitation link');
      setLoading(false);
      return;
    }

    fetchClubInfo();
  }, [user, inviteCode]);

  const fetchClubInfo = async () => {
    try {
      const { data: invitation, error: inviteError } = await supabase
        .from('club_invitations')
        .select(`
          *,
          club:club_id (
            id,
            name,
            description,
            logo_url,
            member_count
          )
        `)
        .eq('invitation_code', inviteCode)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (inviteError || !invitation) {
        setError('Invalid or expired invitation link');
        return;
      }

      setClubInfo(invitation);
    } catch (error) {
      console.error('Error fetching club info:', error);
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClub = async () => {
    if (!inviteCode) return;

    setJoining(true);
    try {
      const { data, error } = await supabase.rpc('join_club_via_invitation', {
        invitation_code_param: inviteCode
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string; club_id?: string; error?: string };

      if (result.success) {
        toast({
          title: "Welcome to the club!",
          description: result.message || "Successfully joined the club!"
        });
        navigate(`/club/${result.club_id}`);
      } else {
        setError(result.error || 'Failed to join club');
      }
    } catch (error) {
      console.error('Error joining club:', error);
      setError('Failed to join club. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/clubs')}>
              Browse Clubs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-tennis-green-bg rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-tennis-green-primary" />
          </div>
          <CardTitle className="text-xl">You're Invited!</CardTitle>
          <CardDescription>
            Join {clubInfo?.club?.name} and start playing tennis
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {clubInfo?.club && (
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">{clubInfo.club.name}</h3>
              {clubInfo.club.description && (
                <p className="text-sm text-tennis-green-medium">{clubInfo.club.description}</p>
              )}
              <div className="flex justify-center items-center gap-2 text-sm text-tennis-green-medium">
                <Users className="h-4 w-4" />
                {clubInfo.club.member_count} members
              </div>
            </div>
          )}

          <Button 
            onClick={handleJoinClub} 
            disabled={joining}
            className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark"
          >
            {joining ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Joining Club...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Join Club
              </>
            )}
          </Button>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate('/clubs')}>
              Browse Other Clubs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}