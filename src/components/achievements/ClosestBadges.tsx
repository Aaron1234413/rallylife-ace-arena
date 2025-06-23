
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useClosestAchievements } from '@/hooks/useClosestAchievements';
import { Trophy, Target, Flame, Clock, Brain, Dumbbell } from 'lucide-react';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'meditation':
      return Brain;
    case 'stretching':
      return Dumbbell;
    default:
      return Target;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'meditation':
      return 'text-purple-600';
    case 'stretching':
      return 'text-green-600';
    default:
      return 'text-blue-600';
  }
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case 'bronze':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'silver':
      return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'gold':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'platinum':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export function ClosestBadges() {
  const { closestAchievements, loading } = useClosestAchievements();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (closestAchievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">All achievements unlocked!</p>
            <p className="text-sm text-gray-500 mt-1">
              You've completed all available badges. Amazing work!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Badges
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your closest achievements to unlock
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {closestAchievements.map((achievement) => {
          const CategoryIcon = getCategoryIcon(achievement.category);
          const categoryColor = getCategoryColor(achievement.category);
          const tierColor = getTierColor(achievement.tier);
          
          return (
            <div
              key={achievement.id}
              className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {/* Header with icon, name, and tier */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <CategoryIcon className={`h-5 w-5 ${categoryColor}`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{achievement.name}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{achievement.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-xs ${tierColor} ml-2 flex-shrink-0`}>
                  {achievement.tier}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {achievement.current_progress}/{achievement.requirement_value}
                  </span>
                </div>
                <Progress
                  value={achievement.progress_percentage}
                  className="h-2"
                  indicatorClassName={
                    achievement.category === 'meditation' ? 'bg-purple-500' :
                    achievement.category === 'stretching' ? 'bg-green-500' :
                    'bg-blue-500'
                  }
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{Math.round(achievement.progress_percentage)}% complete</span>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>+{achievement.reward_xp} XP</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Motivational footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Complete activities to unlock badges and earn rewards! 🎯
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
