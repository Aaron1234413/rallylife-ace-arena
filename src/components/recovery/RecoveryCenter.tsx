
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Heart, 
  Sparkles, 
  Dumbbell,
  ArrowLeft
} from 'lucide-react';
import { MeditationPanel } from '@/components/meditation/MeditationPanel';
import { MeditationProgress } from '@/components/meditation/MeditationProgress';
import { MeditationAchievements } from '@/components/meditation/MeditationAchievements';
import { StretchingPanel } from '@/components/stretching/StretchingPanel';
import { StretchingProgress } from '@/components/stretching/StretchingProgress';
import { RecoveryModeSelector } from './RecoveryModeSelector';

interface RecoveryCenterProps {
  onBack: () => void;
}

interface RecoveryMode {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  duration: string;
  hp: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export function RecoveryCenter({ onBack }: RecoveryCenterProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMode, setSelectedMode] = useState<RecoveryMode | null>(null);

  const handleModeSelect = (mode: RecoveryMode) => {
    console.log('Recovery mode selected:', mode);
    
    // Navigate to the appropriate tab based on mode
    if (mode.id === 'meditation') {
      setActiveTab('meditation');
    } else if (mode.id === 'stretching') {
      setActiveTab('stretching');
    }
    
    setSelectedMode(mode);
  };

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
          {/* Quick Recovery Actions with Mode Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Quick Recovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RecoveryModeSelector onModeSelect={handleModeSelect}>
                  <div className="p-4 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Brain className="h-6 w-6 text-purple-500" />
                      <div>
                        <h3 className="font-semibold">Quick Meditation</h3>
                        <p className="text-sm text-gray-600">5-15 minutes</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Guided mindfulness sessions</p>
                  </div>
                </RecoveryModeSelector>

                <div 
                  className="p-4 rounded-lg border-2 border-green-200 hover:border-green-300 transition-colors cursor-pointer bg-gradient-to-r from-green-50 to-emerald-50"
                  onClick={() => setActiveTab('stretching')}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Dumbbell className="h-6 w-6 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Targeted Stretching</h3>
                      <p className="text-sm text-gray-600">8-20 minutes</p>
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
            <StretchingProgress />
          </div>
        </TabsContent>

        <TabsContent value="meditation">
          <MeditationPanel />
        </TabsContent>

        <TabsContent value="stretching">
          <StretchingPanel />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MeditationProgress />
            <StretchingProgress />
          </div>
          <MeditationAchievements />
        </TabsContent>
      </Tabs>
    </div>
  );
}
