
import React, { useState } from 'react';
import { AchievementCard } from './AchievementCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Users, Sparkles } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  reward_xp: number;
  reward_tokens: number;
  reward_premium_tokens: number;
  requirement_value: number;
  is_hidden: boolean;
}

interface PlayerAchievement {
  id: string;
  achievement_id: string;
  is_claimed: boolean;
  achievement?: Achievement;
}

interface AchievementProgress {
  achievement_id: string;
  current_progress: number;
  achievement?: Achievement;
}

interface AchievementGridProps {
  achievements: Achievement[];
  playerAchievements: PlayerAchievement[];
  achievementProgress: AchievementProgress[];
  onClaimReward: (achievementId: string) => void;
  loading?: boolean;
}

const categoryIcons = {
  progression: Target,
  gameplay: Trophy,
  social: Users,
  special: Sparkles
};

export function AchievementGrid({
  achievements,
  playerAchievements,
  achievementProgress,
  onClaimReward,
  loading
}: AchievementGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Create maps for quick lookup
  const unlockedAchievements = new Map(
    playerAchievements.map(pa => [pa.achievement_id, pa])
  );

  const progressMap = new Map(
    achievementProgress.map(ap => [ap.achievement_id, ap.current_progress])
  );

  // Filter achievements by category
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  // Get categories with counts
  const categories = ['all', ...new Set(achievements.map(a => a.category))];
  const categoryCounts = categories.reduce((acc, category) => {
    if (category === 'all') {
      acc[category] = achievements.length;
    } else {
      acc[category] = achievements.filter(a => a.category === category).length;
    }
    return acc;
  }, {} as Record<string, number>);

  // Statistics
  const totalAchievements = achievements.length;
  const unlockedCount = playerAchievements.length;
  const claimedCount = playerAchievements.filter(pa => pa.is_claimed).length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{unlockedCount}/{totalAchievements}</div>
          <div className="text-sm text-blue-800">Achievements Unlocked</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{claimedCount}/{unlockedCount}</div>
          <div className="text-sm text-green-800">Rewards Claimed</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round((unlockedCount / totalAchievements) * 100)}%
          </div>
          <div className="text-sm text-purple-800">Completion Rate</div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            All ({categoryCounts.all})
          </TabsTrigger>
          {categories.slice(1).map((category) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || Trophy;
            return (
              <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {category} ({categoryCounts[category]})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No achievements found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAchievements.map((achievement) => {
                const playerAchievement = unlockedAchievements.get(achievement.id);
                const currentProgress = progressMap.get(achievement.id) || 0;
                
                return (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={!!playerAchievement}
                    isClaimed={playerAchievement?.is_claimed || false}
                    currentProgress={currentProgress}
                    onClaim={onClaimReward}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
