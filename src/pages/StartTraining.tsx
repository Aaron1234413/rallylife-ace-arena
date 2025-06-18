
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';

export default function StartTraining() {
  const navigate = useNavigate();
  const { startNewSession, hasActiveSession } = useTrainingSession();

  const handleBack = () => {
    navigate('/');
  };

  const handleStartSession = () => {
    if (!hasActiveSession) {
      startNewSession();
    }
    // For now, just show a placeholder - we'll build the actual form in Phase 2
    console.log('Starting training session...');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Start Training Session</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🏆 Time to sharpen your skills.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Ready to level up your game? Let's set up your training session.
            </p>
            
            {hasActiveSession && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 font-medium">
                  You have an active training session. Continue where you left off?
                </p>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Phase 2 components will be added here:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Session Type Selector</li>
                <li>• Coach Selector</li>
                <li>• Skills Chip Selector</li>
                <li>• Intensity Selector</li>
                <li>• Duration Estimator</li>
              </ul>
            </div>

            <Button onClick={handleStartSession} size="lg" className="w-full">
              Start Training
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
