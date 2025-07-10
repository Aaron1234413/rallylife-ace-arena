import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Zap, 
  Coins, 
  Swords, 
  Target, 
  Users, 
  Building,
  Star,
  Trophy,
  Flame
} from 'lucide-react';

export function MockDashboard() {
  // Mock data with gamification
  const playerStats = {
    hp: { current: 85, max: 100 },
    xp: { current: 1250, max: 2000, level: 8 },
    tokens: { regular: 245, premium: 3 },
    streak: 5,
    todayXP: 150
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-bg via-tennis-green-bg to-blue-50">
      <div className="p-4 max-w-6xl mx-auto space-y-6">
        
        {/* Gamified Header with Streak */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-4">
            <Badge className="bg-orange-500 text-white px-3 py-1 flex items-center gap-1">
              <Flame className="h-4 w-4" />
              {playerStats.streak} Day Streak!
            </Badge>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-tennis-green-dark to-blue-600 bg-clip-text text-transparent mb-2">
            Welcome back, Champion! 🏆
          </h1>
          <p className="text-tennis-green-medium">
            +{playerStats.todayXP} XP earned today • Ready for your next challenge?
          </p>
        </div>

        {/* Enhanced Stats with Gamification */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* HP Card - Gaming Style */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6 text-center relative overflow-hidden">
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-lg"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="h-7 w-7 text-white animate-pulse" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-700 mb-1">
                  {playerStats.hp.current}
                </div>
                <div className="text-sm font-medium text-red-600 mb-3">Health Points</div>
                <Progress 
                  value={(playerStats.hp.current / playerStats.hp.max) * 100} 
                  className="h-3 bg-red-200"
                />
                <div className="text-xs text-red-500 mt-2 font-medium">
                  {playerStats.hp.current > 80 ? "💪 Peak Performance!" : "⚡ Ready to restore"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP Card - Level Up Style */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
            <CardContent className="p-6 text-center relative overflow-hidden">
              {/* Level badge */}
              <div className="absolute top-2 right-2">
                <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1">
                  <Star className="h-3 w-3 mr-1" />
                  LVL {playerStats.xp.level}
                </Badge>
              </div>
              
              {/* Background sparkle effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent rounded-lg"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mb-1">
                  Level {playerStats.xp.level}
                </div>
                <div className="text-sm font-medium text-blue-600 mb-3">Experience</div>
                <Progress 
                  value={(playerStats.xp.current / playerStats.xp.max) * 100} 
                  className="h-3 bg-blue-200"
                />
                <div className="text-xs text-blue-500 mt-2 font-medium">
                  {playerStats.xp.max - playerStats.xp.current} XP to next level
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tokens Card - Treasure Style */}
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-50 to-amber-100">
            <CardContent className="p-6 text-center relative overflow-hidden">
              {/* Background shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-lg"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                    <Coins className="h-7 w-7 text-white animate-bounce" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-700 mb-1">
                  {playerStats.tokens.regular}
                </div>
                <div className="text-sm font-medium text-amber-600 mb-3">Tokens</div>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-purple-600 font-bold">
                    {playerStats.tokens.premium} Premium
                  </span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gamified Quick Actions */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-tennis-green-dark to-blue-600 bg-clip-text text-transparent mb-2">
                Choose Your Adventure
              </h2>
              <p className="text-gray-600">What challenge will you conquer today?</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Start a Match - Primary Action */}
              <Button 
                className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-tennis-green-primary to-tennis-green-medium hover:from-tennis-green-medium hover:to-tennis-green-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse"></div>
                <Swords className="h-7 w-7 relative z-10" />
                <span className="text-sm font-bold relative z-10">Start Match</span>
                <div className="absolute bottom-1 right-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </Button>

              {/* Practice Session */}
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 border-2 hover:border-orange-300 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Practice Session</span>
              </Button>

              {/* Find Players */}
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 border-2 hover:border-blue-300 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Find Players</span>
              </Button>

              {/* Create a Club */}
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 border-2 hover:border-purple-300 transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg group relative"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Create Club</span>
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5">
                  NEW
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Teaser */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-100 to-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-semibold text-purple-900">Next Achievement</div>
                  <div className="text-sm text-purple-600">Win 3 matches in a row</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-purple-600">Progress: 1/3</div>
                <Progress value={33} className="w-20 h-2 mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clean spacing at bottom */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}