
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { TrainingWrapUp } from '@/components/training/TrainingWrapUp';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';

export default function EndTraining() {
  const { isSessionActive } = useTrainingSession();

  if (!isSessionActive) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-gray-400" />
              No Active Training Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There's no active training session to complete. Start a new training session to track your progress.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Complete Training Session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingWrapUp />
        </CardContent>
      </Card>
    </div>
  );
}
