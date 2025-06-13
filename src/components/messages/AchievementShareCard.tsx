
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Share } from 'lucide-react';

interface AchievementShareCardProps {
  achievements: any[];
  conversationId: string;
}

export function AchievementShareCard({ achievements, conversationId }: AchievementShareCardProps) {
  const recentAchievements = achievements.slice(0, 5);

  const handleShareAchievement = (achievement: any) => {
    // TODO: Implement achievement sharing logic
    console.log('Sharing achievement:', achievement, 'to conversation:', conversationId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Share Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentAchievements.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {recentAchievements.map((playerAchievement) => {
                const achievement = playerAchievement.achievement;
                if (!achievement) return null;

                return (
                  <div 
                    key={playerAchievement.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{achievement.name}</h4>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {achievement.tier}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Unlocked {new Date(playerAchievement.unlocked_at).toLocaleDateString()}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleShareAchievement(achievement)}
                      size="sm"
                      variant="outline"
                      className="ml-3 flex-shrink-0"
                    >
                      <Share className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No achievements to share yet. Keep playing to unlock achievements!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
