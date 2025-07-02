import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { ActiveMatchWidget } from '@/components/match/ActiveMatchWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { toast } from 'sonner';

const ActiveMatch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { sessionData: activeSession, loading } = useMatchSession();
  
  const sessionId = searchParams.get('session');
  const invitationId = searchParams.get('invitation');

  useEffect(() => {
    // If no active session and no session ID in URL, redirect to dashboard
    if (!loading && !activeSession && !sessionId) {
      toast.error('No active match session found');
      navigate('/dashboard');
      return;
    }

    // If there's a session ID in URL but no active session, try to recover
    if (sessionId && !activeSession && !loading) {
      toast.info('Attempting to recover match session...');
      // The MatchSessionContext will handle session recovery
    }

    // If invitation ID is present, show success message
    if (invitationId) {
      toast.success('Match invitation accepted! Your match is ready to start.');
      // Clean up URL by removing invitation parameter
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('invitation');
      const newUrl = newParams.toString() ? `?${newParams.toString()}` : '';
      navigate(`/active-match${newUrl}`, { replace: true });
    }
  }, [activeSession, loading, sessionId, invitationId, navigate, searchParams]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary mx-auto"></div>
          <p className="mt-2 text-tennis-green-dark">Loading match session...</p>
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
                <Trophy className="h-6 w-6" />
                No Active Match
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-tennis-green-dark/80">
                You don't have an active match session at the moment.
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
            Active Match
          </h1>
          <div></div> {/* Spacer for center alignment */}
        </div>

        {/* Active Match Widget */}
        <ActiveMatchWidget />
      </div>
    </div>
  );
};

export default ActiveMatch;