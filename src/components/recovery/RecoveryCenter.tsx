
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Heart, 
  Sparkles, 
  Dumbbell,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { MeditationPanel } from '@/components/meditation/MeditationPanel';
import { MeditationProgress } from '@/components/meditation/MeditationProgress';
import { MeditationAchievements } from '@/components/meditation/MeditationAchievements';
import { StretchingPanel } from '@/components/stretching/StretchingPanel';
import { StretchingProgress } from '@/components/stretching/StretchingProgress';

interface RecoveryCenterProps {
  onBack: () => void;
}

const recoveryModes = [
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Mindful breathing and relaxation',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200 hover:border-purple-300',
    duration: '5-15 min',
    hp: 10,
    difficulty: 'easy' as const
  },
  {
    id: 'stretching',
    title: 'Stretching',
    description: 'Tennis-focused muscle recovery',
    icon: Dumbbell,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200 hover:border-green-300',
    duration: '8-20 min',
    hp: 12,
    difficulty: 'medium' as const
  }
];

export function RecoveryCenter({ onBack }: RecoveryCenterProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleModeSelect = (modeId: string) => {
    console.log('Recovery mode selected:', modeId);
    
    // Navigate directly to the appropriate tab
    if (modeId === 'meditation') {
      setActiveTab('meditation');
    } else if (modeId === 'stretching') {
      setActiveTab('stretching');
    }
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
          {/* Direct Recovery Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Choose Your Recovery Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-100 to-green-100">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Choose your recovery method to restore HP and improve wellbeing
                </p>
              </div>

              <div className="grid gap-4">
                {recoveryModes.map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <Card 
                      key={mode.id}
                      className={`border-2 ${mode.borderColor} transition-colors cursor-pointer`}
                      onClick={() => handleModeSelect(mode.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${mode.bgColor}`}>
                            <Icon className={`h-5 w-5 ${mode.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{mode.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {mode.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{mode.description}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{mode.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 text-red-500" />
                                <span>+{mode.hp} HP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  💡 Regular recovery sessions help maintain peak performance
                </p>
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
