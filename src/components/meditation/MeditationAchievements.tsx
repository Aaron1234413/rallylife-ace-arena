
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Clock, Flame } from 'lucide-react';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useMeditationProgress } from '@/hooks/useMeditation';
import { cn } from '@/lib/utils';

export function MeditationAchievements() {
  const { achievements, playerAchievements, loading } = usePlayerAchievements();
  const { data: progress } = useMeditationProgress();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const meditationAchievements = achievements.filter(a => a.category === 'meditation');
  const unlockedIds = new Set(playerAchievements.map(pa => pa.achievement_id));

  const getProgressValue = (achievement: any) => {
    if (!progress) return 0;
    
    switch (achievement.requirement_type) {
      case 'meditation_sessions':
        return progress.total_sessions;
      case 'meditation_minutes':
        return progress.total_minutes;
      case 'meditation_streak':
        return progress.current_streak;
      default:
        return 0;
    }
  };

  const getAchievementIcon = (requirementType: string) => {
    switch (requirementType) {
      case 'meditation_sessions':
        return <Trophy className="h-4 w-4" />;
      case 'meditation_minutes':
        return <Clock className="h-4 w-4" />;
      case 'meditation_streak':
        return <Flame className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getTierColor = (tier: string, unlocked: boolean) => {
    if (!unlocked) return 'bg-gray-100 text-gray-500 border-gray-300';
    
    switch (tier) {
      case 'bronze':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'silver':
        return 'bg-gray-100 text-gray-800 border-gray-400';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-400';
      case 'platinum':
        return 'bg-purple-100 text-purple-800 border-purple-400';
      default:
        return 'bg-gray-100 text-gray-500 border-gray-300';
    }
  };

  if (meditationAchievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-purple-500" />
            Meditation Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">
            Complete meditation sessions to unlock badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-purple-500" />
          Meditation Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {meditationAchievements.map((achievement) => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const currentProgress = getProgressValue(achievement);
            const progressPercentage = Math.min((currentProgress / achievement.requirement_value) * 100, 100);

            return (
              <div
                key={achievement.id}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all',
                  isUnlocked 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                )}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className={cn(
                    'p-1.5 rounded-full',
                    isUnlocked 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  )}>
                    {getAchievementIcon(achievement.requirement_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      'font-semibold text-sm',
                      isUnlocked ? 'text-green-800' : 'text-gray-700'
                    )}>
                      {achievement.name}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', getTierColor(achievement.tier, isUnlocked))}
                    >
                      {achievement.tier}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-gray-600 mb-2">
                  {achievement.description}
                </p>

                {!isUnlocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{currentProgress}/{achievement.requirement_value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {isUnlocked && (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <Trophy className="h-3 w-3" />
                    Unlocked!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
