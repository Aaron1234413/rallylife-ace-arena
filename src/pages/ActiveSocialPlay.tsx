import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { ActiveSocialPlayWidget } from '@/components/social-play/ActiveSocialPlayWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';

const ActiveSocialPlay = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { activeSession, loading } = useSocialPlaySession();
  
  const sessionId = searchParams.get('session');
  const invitationId = searchParams.get('invitation');

  useEffect(() => {
    // If no active session and no session ID in URL, redirect to dashboard
    if (!loading && !activeSession && !sessionId) {
      toast.error('No active social play session found');
      navigate('/dashboard');
      return;
    }

    // If there's a session ID in URL but no active session, try to recover
    if (sessionId && !activeSession && !loading) {
      toast.info('Attempting to recover social play session...');
      // The SocialPlaySessionContext will handle session recovery
    }

    // If invitation ID is present, show success message
    if (invitationId) {
      toast.success('Social play invitation accepted! Your session is ready to start.');
      // Clean up URL by removing invitation parameter
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('invitation');
      const newUrl = newParams.toString() ? `?${newParams.toString()}` : '';
      navigate(`/active-social-play${newUrl}`, { replace: true });
    }
  }, [activeSession, loading, sessionId, invitationId, navigate, searchParams]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleAddXP = async (amount: number, activityType: string, description?: string) => {
    // This would typically be handled by the parent component that has access to XP functions
    // For now, we'll just show a toast
    toast.success(`+${amount} XP earned!`);
  };

  const handleRestoreHP = async (amount: number, activityType: string, description?: string) => {
    // This would typically be handled by the parent component that has access to HP functions
    // For now, we'll just show a toast
    toast.success(`+${amount} HP restored!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary mx-auto"></div>
          <p className="mt-2 text-tennis-green-dark">Loading social play session...</p>
        </div>
      </div>
    );
  }

  if (!activeSession) {
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-4 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-tennis-green-dark">
                <Users className="h-6 w-6" />
                No Active Social Play
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-tennis-green-dark/80">
                You don't have an active social play session at the moment.
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
            Active Social Play
          </h1>
          <div></div> {/* Spacer for center alignment */}
        </div>

        {/* Active Social Play Widget */}
        <ActiveSocialPlayWidget 
          onAddXP={handleAddXP}
          onRestoreHP={handleRestoreHP}
        />
      </div>
    </div>
  );
};

export default ActiveSocialPlay;