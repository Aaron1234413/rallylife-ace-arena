
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Trophy } from 'lucide-react';
import { TrainingWrapUp } from '@/components/training/TrainingWrapUp';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';

export default function EndTraining() {
  const { isSessionActive } = useTrainingSession();

  if (!isSessionActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-tennis-green-dark">Training Complete</h1>
                <p className="text-tennis-green-dark/70">No active session found</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-tennis-green-dark">
                  No Active Training Session
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-tennis-green-dark/70 text-lg">
                  There's no active training session to complete. Start a new training session to track your progress.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-tennis-green-dark">Complete Training</h1>
              <p className="text-tennis-green-dark/70">Wrap up your session and earn rewards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-white/20">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-tennis-green-dark">
                Session Complete!
              </CardTitle>
              <p className="text-tennis-green-dark/70 text-lg">
                Great work! Let's log your progress and rewards
              </p>
            </CardHeader>
            
            <CardContent>
              <TrainingWrapUp />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
