
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Clock, Flame, Trophy } from 'lucide-react';
import { useStretchingProgress } from '@/hooks/useStretching';

export function StretchingProgress() {
  const { data: progress, isLoading } = useStretchingProgress();

  if (isLoading) {
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

  if (!progress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-green-500" />
            Stretching Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-4">
            Complete your first stretching session to start tracking progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  const streakColor = progress.current_streak >= 7 ? 'text-orange-600' : 
                     progress.current_streak >= 3 ? 'text-yellow-600' : 'text-gray-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-green-500" />
          Stretching Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold text-green-800">{progress.total_sessions}</span>
            </div>
            <p className="text-sm text-green-600">Sessions</p>
          </div>
          
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold text-blue-800">{progress.total_minutes}</span>
            </div>
            <p className="text-sm text-blue-600">Minutes</p>
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`h-5 w-5 ${streakColor}`} />
              <div>
                <p className="font-semibold text-gray-900">Current Streak</p>
                <p className="text-sm text-gray-600">
                  {progress.current_streak === 0 
                    ? 'Start your streak today!' 
                    : `${progress.current_streak} day${progress.current_streak > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`${streakColor} border-current`}
            >
              {progress.current_streak >= 7 ? '🔥 Hot!' : 
               progress.current_streak >= 3 ? '⭐ Good!' : '💪 Keep Going!'}
            </Badge>
          </div>
        </div>

        {/* Longest Streak */}
        {progress.longest_streak > 0 && (
          <div className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Personal Best: <span className="font-semibold text-gray-900">{progress.longest_streak} days</span>
            </p>
          </div>
        )}

        {/* Streak Bonus Info */}
        <div className="text-xs text-gray-500 text-center">
          💡 Maintain streaks for bonus HP: 3+ days (+1 HP), 7+ days (+3 HP)
        </div>
      </CardContent>
    </Card>
  );
}
