import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Zap, 
  Coins, 
  Play, 
  Target, 
  Users, 
  Award 
} from 'lucide-react';

export function MockDashboard() {
  // Mock data
  const playerStats = {
    hp: { current: 85, max: 100 },
    xp: { current: 1250, max: 2000, level: 8 },
    tokens: { regular: 245, premium: 3 }
  };

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        
        {/* Clean Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-tennis-green-dark mb-2">
            Welcome back, Alex! 👋
          </h1>
          <p className="text-tennis-green-medium">Ready for your next tennis session?</p>
        </div>

        {/* Essential Stats - Clean & Simple */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* HP Card */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {playerStats.hp.current}
              </div>
              <div className="text-sm text-gray-600 mb-3">Health Points</div>
              <Progress 
                value={(playerStats.hp.current / playerStats.hp.max) * 100} 
                className="h-2"
              />
            </CardContent>
          </Card>

          {/* XP Card */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                Level {playerStats.xp.level}
              </div>
              <div className="text-sm text-gray-600 mb-3">Experience</div>
              <Progress 
                value={(playerStats.xp.current / playerStats.xp.max) * 100} 
                className="h-2"
              />
            </CardContent>
          </Card>

          {/* Tokens Card */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Coins className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {playerStats.tokens.regular}
              </div>
              <div className="text-sm text-gray-600 mb-3">Tokens</div>
              <div className="text-xs text-gray-500">
                +{playerStats.tokens.premium} Premium
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simple Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Start Training */}
              <Button 
                className="h-20 flex flex-col items-center justify-center gap-2 bg-tennis-green-primary hover:bg-tennis-green-medium text-white"
              >
                <Play className="h-6 w-6" />
                <span className="text-sm font-medium">Start Training</span>
              </Button>

              {/* Practice Match */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Target className="h-6 w-6" />
                <span className="text-sm font-medium">Practice Match</span>
              </Button>

              {/* Find Players */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Users className="h-6 w-6" />
                <span className="text-sm font-medium">Find Players</span>
              </Button>

              {/* View Progress */}
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
              >
                <Award className="h-6 w-6" />
                <span className="text-sm font-medium">My Progress</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clean spacing at bottom */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}