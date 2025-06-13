
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
      <div className="min-h-screen bg-tennis-green-bg p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Achievements</h2>
              <p className="text-muted-foreground">
                Please sign in to view your achievements.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-tennis-green-dark">
              Achievements
            </h1>
            <p className="text-tennis-green-medium">
              Track your progress and unlock rewards
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
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

          {/* Sidebar */}
          <div className="space-y-6">
            <AchievementDisplay 
              showRecent={true}
              maxItems={5}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievements;
