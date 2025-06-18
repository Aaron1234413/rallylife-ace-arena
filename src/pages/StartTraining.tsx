
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';
import { TrainingGreeting } from '@/components/training/TrainingGreeting';
import { SessionTypeSelector } from '@/components/training/SessionTypeSelector';
import { CoachSelector } from '@/components/training/CoachSelector';
import { SkillsChipSelector } from '@/components/training/SkillsChipSelector';
import { IntensitySelector } from '@/components/training/IntensitySelector';
import { DurationEstimator } from '@/components/training/DurationEstimator';

export default function StartTraining() {
  const navigate = useNavigate();
  const { updateSessionData } = useTrainingSession();
  
  const [sessionType, setSessionType] = useState<string>('');
  const [coachName, setCoachName] = useState<string>('');
  const [skillsFocus, setSkillsFocus] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<string>('');
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);

  const handleStartSession = () => {
    const sessionData = {
      sessionType,
      coachName: coachName || undefined,
      skillsFocus,
      intensity,
      estimatedDuration,
      startTime: new Date().toISOString(),
    };

    updateSessionData(sessionData);
    console.log('Starting training session with data:', sessionData);
    
    // For now, navigate back to dashboard
    // Later this will go to active training session view
    navigate('/');
  };

  const canStart = sessionType && intensity && estimatedDuration > 0;

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-green-600" />
            Start Training Session
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <TrainingGreeting />
          
          <SessionTypeSelector 
            value={sessionType}
            onValueChange={setSessionType}
          />
          
          <CoachSelector 
            value={coachName}
            onValueChange={setCoachName}
          />
          
          <SkillsChipSelector 
            value={skillsFocus}
            onValueChange={setSkillsFocus}
          />
          
          <IntensitySelector 
            value={intensity}
            onValueChange={setIntensity}
          />
          
          <DurationEstimator 
            value={estimatedDuration}
            onValueChange={setEstimatedDuration}
          />

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStartSession}
              disabled={!canStart}
              className="flex-1"
            >
              Start Training
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
