import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
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
  Flame,
  Crown,
  Sparkles,
  TrendingUp,
  Award,
  Gamepad2
} from 'lucide-react';

export function MockDashboard() {
  const isMobile = useIsMobile();
  
  // Mock data with gamification
  const playerStats = {
    hp: { current: 85, max: 100 },
    xp: { current: 1250, max: 2000, level: 8 },
    tokens: { regular: 245, premium: 3 },
    streak: 5,
    todayXP: 150
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-bg via-tennis-green-bg to-blue-50 relative overflow-hidden">
      {/* Animated background elements - Tennis themed */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-tennis-green-primary/10 to-tennis-green-medium/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-tennis-green-light/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-tennis-green-subtle/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className={`relative z-10 ${isMobile ? 'p-4 pb-24' : 'p-6'} max-w-6xl mx-auto space-y-6`}>
        
        {/* Mobile-Optimized Header with Streak */}
        <div className="text-center relative">
          {/* Level Crown Badge - Mobile Optimized */}
          <div className={`${isMobile ? 'flex justify-between items-start mb-4' : 'absolute top-0 right-4'}`}>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 flex items-center gap-2 shadow-lg">
                <Flame className="h-4 w-4 animate-bounce" />
                <span className="font-bold">{playerStats.streak} Day Streak!</span>
              </Badge>
              {isMobile && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 flex items-center gap-1 shadow-lg">
                  <Crown className="h-4 w-4" />
                  <span className="font-bold">LVL {playerStats.xp.level}</span>
                </Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold bg-gradient-to-r from-tennis-green-dark to-blue-600 bg-clip-text text-transparent mb-2`}>
              Welcome back, Champion! 
              <Sparkles className="inline h-8 w-8 ml-2 text-tennis-green-primary animate-spin" />
            </h1>
            <div className="flex items-center justify-center gap-2 text-tennis-green-medium">
              <TrendingUp className="h-5 w-5 text-tennis-green-primary" />
              <span className="font-semibold">+{playerStats.todayXP} XP earned today</span>
              <span className="text-gray-400">•</span>
              <span className="text-blue-600">Ready for your next challenge?</span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats with Gaming UI */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-6'} mb-8`}>
          {/* HP Card - Gaming Style */}
          <Card className="border-0 shadow-2xl hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] transition-all duration-500 hover:scale-105 bg-gradient-to-br from-red-50 to-red-100 backdrop-blur-sm border border-red-200">
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center relative overflow-hidden`}>
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent rounded-lg animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-red-700 mb-2">
                  {playerStats.hp.current}
                </div>
                <div className="text-sm font-medium text-red-800 mb-3">Health Points</div>
                <Progress 
                  value={(playerStats.hp.current / playerStats.hp.max) * 100} 
                  className="h-4 bg-red-200"
                />
                <div className="text-xs text-red-700 mt-2 font-medium flex items-center justify-center gap-1">
                  {playerStats.hp.current > 80 ? (
                    <>💪 <span className="text-green-700 font-bold">Peak Performance!</span></>
                  ) : (
                    <>⚡ <span className="text-orange-700 font-bold">Ready to restore</span></>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP Card - Level Up Style */}
          <Card className="border-0 shadow-2xl hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all duration-500 hover:scale-105 bg-gradient-to-br from-blue-50 to-indigo-100 backdrop-blur-sm border border-blue-200 relative">
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center relative overflow-hidden`}>
              {/* Level crown badge */}
              {!isMobile && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 shadow-lg">
                    <Crown className="h-3 w-3 mr-1" />
                    LVL {playerStats.xp.level}
                  </Badge>
                </div>
              )}
              
              {/* Animated sparkles */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50 relative">
                    <Zap className="h-8 w-8 text-white animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-700 mb-2">
                  Level {playerStats.xp.level}
                </div>
                <div className="text-sm font-medium text-blue-800 mb-3">Experience</div>
                <Progress 
                  value={(playerStats.xp.current / playerStats.xp.max) * 100} 
                  className="h-4 bg-blue-200"
                />
                <div className="text-xs text-blue-700 mt-2 font-medium">
                  <span className="text-orange-600 font-bold">{playerStats.xp.max - playerStats.xp.current} XP</span> to next level
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tokens Card - Treasure Style */}
          <Card className="border-0 shadow-2xl hover:shadow-[0_0_40px_rgba(251,191,36,0.5)] transition-all duration-500 hover:scale-105 bg-gradient-to-br from-yellow-50 to-amber-100 backdrop-blur-sm border border-yellow-200">
            <CardContent className={`${isMobile ? 'p-4' : 'p-6'} text-center relative overflow-hidden`}>
              {/* Treasure glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50 relative">
                    <Coins className="h-8 w-8 text-white animate-bounce" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-ping"></div>
                  </div>
                </div>
                <div className="text-4xl font-bold text-amber-700 mb-2">
                  {playerStats.tokens.regular}
                </div>
                <div className="text-sm font-medium text-amber-800 mb-3">Tokens</div>
                <div className="flex items-center justify-center gap-2 bg-purple-100 rounded-full px-3 py-1 border border-purple-300">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-purple-700 font-bold">
                    {playerStats.tokens.premium} Premium
                  </span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gamified Quick Actions */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-tennis-green-bg/30 backdrop-blur-sm">
          <CardContent className={`${isMobile ? 'p-4' : 'p-8'}`}>
            <div className="text-center mb-6">
              <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold bg-gradient-to-r from-tennis-green-dark to-blue-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2`}>
                <Gamepad2 className="h-6 w-6 text-tennis-green-primary" />
                Choose Your Adventure
              </h2>
              <p className="text-tennis-green-medium">What challenge will you conquer today?</p>
            </div>
            
            <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'}`}>
              {/* Start a Match - Primary Action */}
              <Button 
                className={`${isMobile ? 'h-20' : 'h-24'} flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-tennis-green-primary to-tennis-green-medium hover:from-tennis-green-medium hover:to-tennis-green-dark text-white shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-110 relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse"></div>
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Swords className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-white`} />
                  </div>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold`}>Start Match</span>
                </div>
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                </div>
              </Button>

              {/* Practice Session */}
              <Button 
                variant="outline"
                className={`${isMobile ? 'h-20' : 'h-24'} flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100 border-2 hover:border-orange-300 transition-all duration-500 hover:scale-110 shadow-md hover:shadow-lg group`}
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center shadow-lg group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                    <Target className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-orange-600`} />
                  </div>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-700`}>Practice</span>
                </div>
              </Button>

              {/* Find Players */}
              <Button 
                variant="outline"
                className={`${isMobile ? 'h-20' : 'h-24'} flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 border-2 hover:border-blue-300 transition-all duration-500 hover:scale-110 shadow-md hover:shadow-lg group`}
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-lg group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                    <Users className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-blue-600`} />
                  </div>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-700`}>Find Players</span>
                </div>
              </Button>

              {/* Create a Club */}
              <Button 
                variant="outline"
                className={`${isMobile ? 'h-20' : 'h-24'} flex flex-col items-center justify-center gap-2 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 border-2 hover:border-purple-300 transition-all duration-500 hover:scale-110 shadow-md hover:shadow-lg group relative`}
              >
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center shadow-lg group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                    <Building className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-purple-600`} />
                  </div>
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-700`}>Create Club</span>
                </div>
                <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5">
                  NEW
                </Badge>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Showcase */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-100 to-pink-100">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-semibold text-purple-900 flex items-center gap-2">
                    Next Achievement
                    <Award className="h-4 w-4 text-yellow-500" />
                  </div>
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