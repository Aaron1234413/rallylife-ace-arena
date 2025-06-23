
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMeditationProgress } from '@/hooks/useMeditation';
import { Brain, Clock, Flame, Trophy } from 'lucide-react';

export function MeditationProgress() {
  const { data: progress, isLoading } = useMeditationProgress();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
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
            <Brain className="h-5 w-5 text-purple-500" />
            Meditation Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-600">Start your first meditation session to track your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const streakColor = progress.current_streak >= 7 ? 'text-orange-600' : 
                     progress.current_streak >= 3 ? 'text-blue-600' : 
                     'text-gray-600';

  const streakBgColor = progress.current_streak >= 7 ? 'bg-orange-100' : 
                        progress.current_streak >= 3 ? 'bg-blue-100' : 
                        'bg-gray-100';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Meditation Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sessions */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mx-auto mb-2">
              <Trophy className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{progress.total_sessions}</div>
            <div className="text-xs text-gray-600">Sessions</div>
          </div>

          {/* Total Minutes */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mx-auto mb-2">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{progress.total_minutes}</div>
            <div className="text-xs text-gray-600">Minutes</div>
          </div>

          {/* Current Streak */}
          <div className="text-center">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full ${streakBgColor} mx-auto mb-2`}>
              <Flame className={`h-6 w-6 ${streakColor}`} />
            </div>
            <div className={`text-2xl font-bold ${streakColor}`}>{progress.current_streak}</div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>

          {/* Longest Streak */}
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{progress.longest_streak}</div>
            <div className="text-xs text-gray-600">Best Streak</div>
          </div>
        </div>

        {/* Streak Bonus Info */}
        {progress.current_streak >= 3 && (
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                Streak Bonus Active!
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {progress.current_streak >= 7 
                ? "🔥 7+ day streak: +50% HP bonus" 
                : "✨ 3+ day streak: +20% HP bonus"}
            </p>
          </div>
        )}

        {/* Next milestone */}
        <div className="mt-4 text-center">
          {progress.current_streak === 0 && (
            <Badge variant="outline" className="text-xs">
              Meditate tomorrow to start a streak! 
            </Badge>
          )}
          {progress.current_streak > 0 && progress.current_streak < 3 && (
            <Badge variant="outline" className="text-xs">
              {3 - progress.current_streak} more days for streak bonus
            </Badge>
          )}
          {progress.current_streak >= 3 && progress.current_streak < 7 && (
            <Badge variant="outline" className="text-xs">
              {7 - progress.current_streak} more days for maximum bonus
            </Badge>
          )}
          {progress.current_streak >= 7 && (
            <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500">
              🔥 Maximum streak bonus!
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
