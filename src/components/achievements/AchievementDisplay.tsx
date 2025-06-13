
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Star, Award, Clock } from 'lucide-react';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';

interface AchievementDisplayProps {
  className?: string;
  showRecent?: boolean;
  maxItems?: number;
}

export function AchievementDisplay({ 
  className, 
  showRecent = true, 
  maxItems = 5 
}: AchievementDisplayProps) {
  const { playerAchievements, loading } = usePlayerAchievements();

  const recentAchievements = showRecent 
    ? playerAchievements.slice(0, maxItems)
    : playerAchievements;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading achievements...</p>
        </CardContent>
      </Card>
    );
  }

  if (recentAchievements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">
            No achievements unlocked yet. Keep playing to earn your first achievement!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {showRecent ? 'Recent Achievements' : 'All Achievements'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {recentAchievements.map((playerAchievement) => {
              const achievement = playerAchievement.achievement;
              if (!achievement) return null;

              return (
                <div 
                  key={playerAchievement.id} 
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                    {achievement.tier === 'platinum' && <Award className="h-4 w-4" />}
                    {achievement.tier === 'gold' && <Star className="h-4 w-4" />}
                    {(achievement.tier === 'silver' || achievement.tier === 'bronze') && <Trophy className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{achievement.name}</h4>
                      <Badge variant="secondary" className="capitalize">
                        {achievement.tier}
                      </Badge>
                      {!playerAchievement.is_claimed && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          Unclaimed
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {new Date(playerAchievement.unlocked_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      +{achievement.reward_xp} XP
                    </div>
                    {achievement.reward_tokens > 0 && (
                      <div className="text-xs text-muted-foreground">
                        +{achievement.reward_tokens} Tokens
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
