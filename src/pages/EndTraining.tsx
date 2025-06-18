
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';

export default function EndTraining() {
  const navigate = useNavigate();
  const { currentSession, clearSession } = useTrainingSession();

  const handleBack = () => {
    navigate('/start-training');
  };

  const handleSubmitSession = () => {
    // Phase 6 will implement the actual Supabase submission
    console.log('Submitting training session:', currentSession);
    clearSession();
    navigate('/');
  };

  if (!currentSession) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-lg font-medium mb-2">No Active Session</h2>
            <p className="text-muted-foreground mb-4">
              You don't have an active training session to complete.
            </p>
            <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Complete Training Session</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Training logged. Small wins = big gains.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Session Summary</h3>
              <div className="text-sm text-green-700 space-y-1">
                <p>Type: {currentSession.sessionType}</p>
                <p>Duration: {currentSession.estimatedDuration} minutes (estimated)</p>
                <p>Intensity: {currentSession.intensityLevel}</p>
                <p>Skills: {currentSession.skillsFocused.join(', ') || 'None selected'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Phase 5 components will be added here:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Actual duration confirmation</li>
                <li>• Mood emoji picker</li>
                <li>• Session notes input</li>
                <li>• Dynamic HP/XP preview</li>
              </ul>
            </div>

            <Button onClick={handleSubmitSession} size="lg" className="w-full">
              Submit Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
