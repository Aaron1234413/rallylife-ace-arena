
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { AchievementGrid } from '@/components/achievements/AchievementGrid';
import { AchievementDisplay } from '@/components/achievements/AchievementDisplay';

const Achievements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    achievements,
    playerAchievements,
    achievementProgress,
    loading,
    claimAchievementReward
  } = usePlayerAchievements();

  const handleClaimReward = async (achievementId: string) => {
    await claimAchievementReward(achievementId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Achievements</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Please sign in to view your achievements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      {/* Mobile-First Header */}
      <div className="sticky top-0 z-50 bg-tennis-green-bg border-b border-tennis-green-light p-3 sm:p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-tennis-green-dark">
                Achievements
              </h1>
              <p className="text-tennis-green-medium text-sm sm:text-base">
                Track your progress and unlock rewards
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 max-w-6xl mx-auto">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-4">
          {/* Main Achievement Grid */}
          <div className="lg:col-span-3">
            <AchievementGrid
              achievements={achievements}
              playerAchievements={playerAchievements}
              achievementProgress={achievementProgress}
              onClaimReward={handleClaimReward}
              loading={loading}
            />
          </div>

          {/* Sidebar - Hidden on Mobile, Shown on Desktop */}
          <div className="hidden lg:block space-y-6">
            <AchievementDisplay 
              showRecent={true}
              maxItems={5}
            />
          </div>
        </div>

        {/* Recent Achievements for Mobile - Below main grid */}
        <div className="mt-6 lg:hidden">
          <AchievementDisplay 
            showRecent={true}
            maxItems={3}
          />
        </div>
      </div>
    </div>
  );
};

export default Achievements;
