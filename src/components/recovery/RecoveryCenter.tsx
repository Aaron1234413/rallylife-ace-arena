
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Flower2, 
  Heart, 
  Clock, 
  Flame, 
  Sparkles,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { MeditationPanel } from '@/components/meditation/MeditationPanel';
import { cn } from '@/lib/utils';

interface RecoveryCenterProps {
  onClose?: () => void;
  className?: string;
}

export function RecoveryCenter({ onClose, className }: RecoveryCenterProps) {
  const [activeTab, setActiveTab] = useState('meditation');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Recovery Center
            </h1>
            <p className="text-sm text-gray-600">Restore your mind and body</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      {/* Recovery Stats Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 mx-auto mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-purple-600">12</div>
              <div className="text-xs text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 mx-auto mb-2">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-lg font-bold text-green-600">180</div>
              <div className="text-xs text-gray-600">Minutes</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 mx-auto mb-2">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-orange-600">5</div>
              <div className="text-xs text-gray-600">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 mx-auto mb-2">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-lg font-bold text-red-600">+45</div>
              <div className="text-xs text-gray-600">HP Gained</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recovery Activities Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger 
            value="meditation" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Meditation</span>
            <span className="sm:hidden">Mind</span>
          </TabsTrigger>
          <TabsTrigger 
            value="stretching" 
            className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
          >
            <Flower2 className="h-4 w-4" />
            <span className="hidden sm:inline">Stretching</span>
            <span className="sm:hidden">Body</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meditation" className="space-y-4">
          <MeditationPanel />
        </TabsContent>

        <TabsContent value="stretching" className="space-y-4">
          <StretchingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Placeholder stretching panel component
function StretchingPanel() {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const stretchingOptions = [
    { minutes: 5, hp: 3, label: 'Quick Stretch', description: 'Light mobility work' },
    { minutes: 10, hp: 6, label: 'Full Body', description: 'Complete stretching routine' },
    { minutes: 15, hp: 10, label: 'Deep Recovery', description: 'Intensive flexibility work' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flower2 className="h-5 w-5 text-green-500" />
          Stretching & Mobility
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {stretchingOptions.map((option) => (
            <div
              key={option.minutes}
              className="p-4 rounded-lg border-2 border-gray-200 hover:border-green-300 transition-colors cursor-pointer"
              onClick={() => setSelectedDuration(option.minutes)}
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
                  <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    <Activity className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
          <div className="text-sm text-green-700">
            <strong>💪 Pro Tip:</strong> Regular stretching improves flexibility and prevents injury while building recovery habits!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
