import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lock, 
  Star, 
  Trophy,
  BookOpen,
  Gavel,
  Target,
  Wrench,
  History,
  ChevronRight
} from 'lucide-react';
import { AcademyProgress } from '@/hooks/useAcademyProgress';

interface Building {
  id: string;
  name: string;
  category: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  requiredLevel: number;
  description: string;
  questionsCount: number;
}

const CAMPUS_BUILDINGS: Building[] = [
  {
    id: 'rules',
    name: 'Rules Hall',
    category: 'Rules',
    icon: Gavel,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    requiredLevel: 1,
    description: 'Master tennis rules and regulations',
    questionsCount: 25
  },
  {
    id: 'basics',
    name: 'Court Academy',
    category: 'Court Basics',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    requiredLevel: 1,
    description: 'Learn court dimensions and basics',
    questionsCount: 20
  },
  {
    id: 'scoring',
    name: 'Scoring Center',
    category: 'Scoring',
    icon: Trophy,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    requiredLevel: 2,
    description: 'Understand tennis scoring systems',
    questionsCount: 18
  },
  {
    id: 'equipment',
    name: 'Equipment Lab',
    category: 'Equipment',
    icon: Wrench,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    requiredLevel: 3,
    description: 'Explore rackets, balls, and gear',
    questionsCount: 22
  },
  {
    id: 'strategy',
    name: 'Strategy Tower',
    category: 'Strategy',
    icon: BookOpen,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    requiredLevel: 4,
    description: 'Advanced tactics and gameplay',
    questionsCount: 30
  },
  {
    id: 'history',
    name: 'History Museum',
    category: 'History',
    icon: History,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    requiredLevel: 5,
    description: 'Tennis heritage and legends',
    questionsCount: 28
  }
];

interface CampusViewProps {
  progress: AcademyProgress;
  onBuildingSelect: (category: string) => void;
  onDailyDrill: () => void;
}

export const CampusView: React.FC<CampusViewProps> = ({
  progress,
  onBuildingSelect,
  onDailyDrill
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const isBuildingUnlocked = (requiredLevel: number) => {
    return progress.level >= requiredLevel;
  };

  const getBuildingProgress = (category: string) => {
    // Mock progress - in real app this would come from backend
    const mockProgress = {
      'Rules': 85,
      'Court Basics': 100,
      'Scoring': 60,
      'Equipment': 30,
      'Strategy': 10,
      'History': 0
    };
    return mockProgress[category as keyof typeof mockProgress] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-tennis-green-bg to-tennis-green-light/20 p-4">
      {/* Campus Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-tennis-green-primary rounded-full flex items-center justify-center">
            <span className="text-2xl">🏛️</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-tennis-green-dark">RAKO Campus</h1>
            <p className="text-tennis-green-medium">Choose your learning path</p>
          </div>
        </div>
        
        {/* Level Badge */}
        <Badge className="bg-tennis-green-primary text-white text-lg px-4 py-2">
          Level {progress.level} • {progress.levelName}
        </Badge>
      </div>

      {/* Daily Drill Card */}
      <Card className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Today's Special Drill</h3>
                <p className="text-gray-600">Quick 5-question focused session</p>
                <Badge variant="outline" className="mt-1">+5 Tokens</Badge>
              </div>
            </div>
            <Button
              onClick={onDailyDrill}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
              disabled={progress.dailyTokensEarned >= 10}
            >
              Start Drill
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campus Buildings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {CAMPUS_BUILDINGS.map((building) => {
          const Icon = building.icon;
          const isUnlocked = isBuildingUnlocked(building.requiredLevel);
          const progressPercent = getBuildingProgress(building.category);
          const isSelected = selectedBuilding === building.id;

          return (
            <Card
              key={building.id}
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isSelected ? 'ring-2 ring-tennis-green-primary' : ''
              } ${isUnlocked ? 'hover:shadow-lg' : 'opacity-60'}`}
              onClick={() => {
                if (isUnlocked) {
                  setSelectedBuilding(building.id);
                  onBuildingSelect(building.category);
                }
              }}
            >
              <CardContent className="p-6">
                {/* Building Visual */}
                <div className={`relative w-full h-32 ${building.bgColor} border-2 rounded-lg mb-4 flex items-center justify-center`}>
                  {isUnlocked ? (
                    <Icon className={`h-16 w-16 ${building.color}`} />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Lock className="h-12 w-12 text-gray-400 mb-2" />
                      <Badge variant="outline" className="text-xs">
                        Level {building.requiredLevel}
                      </Badge>
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {isUnlocked && progressPercent > 0 && (
                    <div className="absolute top-2 right-2">
                      <div className={`w-8 h-8 rounded-full ${building.bgColor} border-2 ${building.color.replace('text-', 'border-')} flex items-center justify-center`}>
                        <span className="text-xs font-bold">{progressPercent}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Building Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-tennis-green-dark">{building.name}</h3>
                  <p className="text-sm text-tennis-green-medium">{building.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {building.questionsCount} Questions
                    </Badge>
                    
                    {isUnlocked ? (
                      <Badge className={building.color.replace('text-', 'bg-').replace('600', '100')} variant="outline">
                        Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isUnlocked && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${building.color.replace('text-', 'bg-')}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-tennis-green-medium mt-1">
                      <span>Progress</span>
                      <span>{progressPercent}% Complete</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Campus Footer */}
      <div className="text-center mt-12 pb-8">
        <p className="text-tennis-green-medium text-sm">
          Complete quizzes to unlock new buildings and advance your tennis knowledge
        </p>
      </div>
    </div>
  );
};