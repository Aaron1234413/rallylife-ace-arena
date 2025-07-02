
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
interface WellbeingCenterProps {
  onBack: () => void;
}

const wellbeingModes = [
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

export function WellbeingCenter({ onBack }: WellbeingCenterProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const handleModeSelect = (modeId: string) => {
    console.log('Wellbeing mode selected:', modeId);
    
    // Navigate to wellbeing sessions
    window.location.href = '/sessions?type=wellbeing';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            Wellbeing Center
          </h1>
          <p className="text-gray-600">Restore your energy and improve your wellbeing</p>
        </div>
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Wellbeing Options */}
      <div className="space-y-6">
        {/* Direct Wellbeing Method Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pink-500" />
              Wellbeing Sessions Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-full bg-gradient-to-r from-pink-100 to-purple-100">
                  <Sparkles className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Join or create wellbeing sessions to restore HP and improve mental health
              </p>
            </div>

            <div className="grid gap-4">
              {wellbeingModes.map((mode) => {
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
                💡 Regular wellbeing sessions help maintain peak performance and mental health
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
