
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dumbbell, 
  Heart, 
  Clock, 
  Play,
  ArrowLeft
} from 'lucide-react';
import { useCompleteStretching } from '@/hooks/useStretching';
import { useStretchingAchievements } from '@/hooks/useStretchingAchievements';
import { StretchingTimer } from './StretchingTimer';

const STRETCHING_ROUTINES = [
  {
    id: 'tennis-recovery',
    name: 'Tennis Recovery',
    description: 'Target areas used in tennis',
    duration: 10,
    hp: 8,
    difficulty: 'easy' as const,
    color: 'bg-gradient-to-r from-green-500 to-emerald-500'
  },
  {
    id: 'full-body',
    name: 'Full Body Stretch',
    description: 'Complete muscle recovery',
    duration: 15,
    hp: 12,
    difficulty: 'medium' as const,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  {
    id: 'bedtime',
    name: 'Bedtime Routine',
    description: 'Gentle stretches for sleep',
    duration: 8,
    hp: 6,
    difficulty: 'easy' as const,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500'
  },
  {
    id: 'intense-recovery',
    name: 'Intense Recovery',
    description: 'Deep stretches for serious athletes',
    duration: 20,
    hp: 15,
    difficulty: 'hard' as const,
    color: 'bg-gradient-to-r from-red-500 to-orange-500'
  }
];

export function StretchingPanel() {
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [isStretching, setIsStretching] = useState(false);
  
  const completeStretching = useCompleteStretching();
  const { checkStretchingAchievements } = useStretchingAchievements();

  const handleStartStretching = (routineId: string) => {
    setSelectedRoutine(routineId);
    setIsStretching(true);
  };

  const handleCompleteStretching = async () => {
    if (selectedRoutine) {
      const routine = STRETCHING_ROUTINES.find(r => r.id === selectedRoutine);
      if (routine) {
        try {
          await completeStretching.mutateAsync({
            routine_id: routine.id,
            routine_name: routine.name,
            duration_minutes: routine.duration,
            difficulty: routine.difficulty
          });
          
          // Check for stretching achievements after completion
          setTimeout(() => {
            checkStretchingAchievements();
          }, 1000);
        } catch (error) {
          console.error('Error completing stretching:', error);
        }
      }
    }
    setIsStretching(false);
    setSelectedRoutine(null);
  };

  const handleCancelStretching = () => {
    setIsStretching(false);
    setSelectedRoutine(null);
  };

  // Show timer when stretching is active
  if (isStretching && selectedRoutine) {
    const routine = STRETCHING_ROUTINES.find(r => r.id === selectedRoutine);
    if (routine) {
      return (
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            onClick={handleCancelStretching}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Routines
          </Button>
          <StretchingTimer
            routine={routine}
            onComplete={handleCompleteStretching}
            onCancel={handleCancelStretching}
          />
        </div>
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-green-500" />
          Stretching Routines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {STRETCHING_ROUTINES.map((routine) => (
            <div
              key={routine.id}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{routine.name}</h3>
                    <Badge variant="outline">{routine.difficulty}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{routine.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{routine.duration} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>+{routine.hp} HP</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleStartStretching(routine.id)}
                  className={routine.color}
                  disabled={completeStretching.isPending}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <div className="text-sm text-green-700">
            <strong>💡 Pro Tip:</strong> Regular stretching improves flexibility, reduces injury risk, and helps with recovery between tennis sessions!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
