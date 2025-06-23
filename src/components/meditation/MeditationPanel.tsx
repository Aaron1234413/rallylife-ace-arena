
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MeditationTimer } from './MeditationTimer';
import { MeditationProgress } from './MeditationProgress';
import { useCompleteMeditation } from '@/hooks/useMeditation';
import { useMeditationAchievements } from '@/hooks/useMeditationAchievements';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { Brain, Heart, Clock, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const MEDITATION_DURATIONS = [
  { minutes: 5, hp: 5, label: 'Quick Reset', description: 'Perfect for busy schedules' },
  { minutes: 10, hp: 8, label: 'Deep Focus', description: 'Balance mind and body' },
  { minutes: 15, hp: 12, label: 'Full Journey', description: 'Complete restoration' }
];

export function MeditationPanel() {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const completeMeditation = useCompleteMeditation();
  const { checkMeditationAchievements } = useMeditationAchievements();
  const { refreshData } = useActivityLogs();

  const handleStartMeditation = (duration: number) => {
    setSelectedDuration(duration);
    setIsTimerActive(true);
  };

  const handleMeditationComplete = async () => {
    if (selectedDuration) {
      try {
        console.log('Starting meditation completion for duration:', selectedDuration);
        
        const result = await completeMeditation.mutateAsync({ 
          duration_minutes: selectedDuration,
          session_type: 'guided' 
        });
        
        console.log('Meditation completion result:', result);
        
        if (result?.hp_gained) {
          toast.success(`🧘 Meditation complete! +${result.hp_gained} HP restored`);
        }
        
        // Refresh all data to ensure UI updates
        await refreshData();
        
        // Check for meditation achievements after completion (with delay to ensure data is updated)
        setTimeout(async () => {
          try {
            await checkMeditationAchievements();
          } catch (error) {
            console.error('Error checking meditation achievements:', error);
            // Don't show error to user since this is secondary functionality
          }
        }, 1500);
        
      } catch (error) {
        console.error('Error completing meditation:', error);
        toast.error('Failed to complete meditation. Please try again.');
      }
    }
    setIsTimerActive(false);
    setSelectedDuration(null);
  };

  const handleMeditationCancel = () => {
    setIsTimerActive(false);
    setSelectedDuration(null);
  };

  if (isTimerActive && selectedDuration) {
    return (
      <div className="space-y-4">
        <MeditationTimer
          duration={selectedDuration}
          onComplete={handleMeditationComplete}
          onCancel={handleMeditationCancel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Choose Your Meditation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {MEDITATION_DURATIONS.map((option) => (
              <div
                key={option.minutes}
                className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => handleStartMeditation(option.minutes)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{option.minutes} min</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        <Heart className="h-3 w-3 mr-1 text-green-500" />
                        +{option.hp} HP
                      </Badge>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{option.label}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                  <div className="ml-4">
                    <Button 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      disabled={completeMeditation.isPending}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <div className="text-sm text-purple-700">
              <strong>💡 Pro Tip:</strong> Regular meditation builds streaks for bonus HP rewards and unlocks achievement badges!
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Display */}
      <MeditationProgress />
    </div>
  );
}
