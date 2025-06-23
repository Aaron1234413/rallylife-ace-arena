
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Heart, 
  Clock, 
  Sparkles, 
  Dumbbell,
  Waves,
  Moon,
  ArrowLeft,
  Play,
  Pause
} from 'lucide-react';
import { MeditationPanel } from '@/components/meditation/MeditationPanel';
import { MeditationProgress } from '@/components/meditation/MeditationProgress';
import { MeditationAchievements } from '@/components/meditation/MeditationAchievements';
import { useCompleteMeditation } from '@/hooks/useMeditation';
import { useMeditationAchievements } from '@/hooks/useMeditationAchievements';

interface RecoveryCenterProps {
  onBack: () => void;
}

const STRETCHING_ROUTINES = [
  {
    id: 'tennis-stretch',
    name: 'Tennis Recovery',
    description: 'Target areas used in tennis',
    duration: 10,
    hp: 6,
    difficulty: 'Easy',
    icon: Dumbbell,
    color: 'bg-gradient-to-r from-green-500 to-emerald-500'
  },
  {
    id: 'full-body',
    name: 'Full Body Stretch',
    description: 'Complete muscle recovery',
    duration: 15,
    hp: 10,
    difficulty: 'Medium',
    icon: Waves,
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
  },
  {
    id: 'bedtime',
    name: 'Bedtime Routine',
    description: 'Gentle stretches for sleep',
    duration: 8,
    hp: 8,
    difficulty: 'Easy',
    icon: Moon,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500'
  }
];

export function RecoveryCenter({ onBack }: RecoveryCenterProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);
  const [isStretchingActive, setIsStretchingActive] = useState(false);
  const [stretchingProgress, setStretchingProgress] = useState(0);
  
  const completeMeditation = useCompleteMeditation();
  const { checkMeditationAchievements } = useMeditationAchievements();

  const handleStartStretching = (routineId: string) => {
    setSelectedRoutine(routineId);
    setIsStretchingActive(true);
    setStretchingProgress(0);
    
    // Simulate stretching progress
    const routine = STRETCHING_ROUTINES.find(r => r.id === routineId);
    if (routine) {
      const interval = setInterval(() => {
        setStretchingProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsStretchingActive(false);
            setSelectedRoutine(null);
            // Here you would normally call an API to log the stretching session
            return 100;
          }
          return prev + (100 / (routine.duration * 60)); // Progress per second
        });
      }, 1000);
    }
  };

  if (isStretchingActive && selectedRoutine) {
    const routine = STRETCHING_ROUTINES.find(r => r.id === selectedRoutine);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setIsStretchingActive(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recovery Center
          </Button>
        </div>
        
        <Card className="border-2 border-gradient-to-r from-green-200 to-blue-200">
          <CardContent className="p-8 text-center">
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-gradient-to-r from-green-100 to-blue-100">
                  {routine && <routine.icon className="h-12 w-12 text-green-600" />}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">{routine?.name}</h2>
                <p className="text-gray-600">{routine?.description}</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Progress</span>
                  <span>{Math.round(stretchingProgress)}%</span>
                </div>
                <Progress value={stretchingProgress} className="h-3" />
              </div>
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsStretchingActive(false)}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              </div>
              
              <div className="text-sm text-gray-500">
                Follow along with your stretching routine. Take your time and listen to your body.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Recovery Center
          </h1>
          <p className="text-gray-600">Restore your energy and improve your wellbeing</p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Recovery Options Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="meditation">Meditation</TabsTrigger>
          <TabsTrigger value="stretching">Stretching</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Recovery Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Quick Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  className="p-4 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50"
                  onClick={() => setActiveTab('meditation')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Brain className="h-6 w-6 text-purple-500" />
                    <div>
                      <h3 className="font-semibold">Quick Meditation</h3>
                      <p className="text-sm text-gray-600">5-15 minutes</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Guided mindfulness sessions</p>
                </div>

                <div 
                  className="p-4 rounded-lg border-2 border-green-200 hover:border-green-300 transition-colors cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50"
                  onClick={() => setActiveTab('stretching')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Dumbbell className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Targeted Stretching</h3>
                      <p className="text-sm text-gray-600">8-15 minutes</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Tennis-focused routines</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MeditationProgress />
            <MeditationAchievements />
          </div>
        </TabsContent>

        <TabsContent value="meditation">
          <MeditationPanel />
        </TabsContent>

        <TabsContent value="stretching" className="space-y-6">
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
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${routine.color.replace('bg-gradient-to-r', 'bg-gradient-to-br')} text-white`}>
                          <routine.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{routine.name}</h3>
                          <p className="text-sm text-gray-600">{routine.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{routine.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span>+{routine.hp} HP</span>
                          </div>
                        </div>
                        <Badge variant="outline">{routine.difficulty}</Badge>
                        <Button 
                          onClick={() => handleStartStretching(routine.id)}
                          className={routine.color}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      </div>
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
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MeditationProgress />
            <MeditationAchievements />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
