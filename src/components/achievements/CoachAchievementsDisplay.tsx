
import React from "react";
import { useCoachAchievements } from "@/hooks/useCoachAchievements";
import { Loader2, Award, CheckCircle, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const CoachAchievementsDisplay: React.FC = () => {
  const { 
    achievements, 
    unlocked, 
    progress, 
    loading, 
    checkAllAchievements, 
    claimReward, 
    isCheckingAchievements,
    isClaimingReward 
  } = useCoachAchievements();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin mr-2" />
        Loading coach achievements...
      </div>
    );
  }

  const unlockedIds = new Set(unlocked.map((a) => a.achievement_id));
  const claimedIds = new Set(
    unlocked.filter((a) => a.is_claimed).map((a) => a.achievement_id)
  );

  const progressMap = new Map(
    progress.map((p) => [p.achievement_id, p.current_progress])
  );

  const canClaimRewards = unlocked.some(u => !u.is_claimed);

  return (
    <section className="my-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-500" />
          Coach Achievements
        </h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => checkAllAchievements()}
            disabled={isCheckingAchievements}
            variant="outline"
            size="sm"
          >
            {isCheckingAchievements ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="w-4 h-4 mr-2" />
            )}
            Check Progress
          </Button>
        </div>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{unlocked.length}</div>
          <div className="text-sm text-muted-foreground">Unlocked</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{claimedIds.size}</div>
          <div className="text-sm text-muted-foreground">Claimed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{achievements.length}</div>
          <div className="text-sm text-muted-foreground">Total Available</div>
        </Card>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((ach) => {
          const isUnlocked = unlockedIds.has(ach.id);
          const isClaimed = claimedIds.has(ach.id);
          const currProgress = progressMap.get(ach.id) ?? 0;
          const ratio = Math.min(
            currProgress / ach.requirement_value,
            1
          );
          
          return (
            <Card
              key={ach.id}
              className={`flex flex-col p-4 relative border-2 transition-all ${
                isClaimed
                  ? "border-green-500 bg-green-50"
                  : isUnlocked
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base">{ach.name}</span>
                {isClaimed && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {!isClaimed && isUnlocked && (
                  <Gift className="w-5 h-5 text-yellow-500" />
                )}
              </div>

              <div className="mb-2 text-sm text-muted-foreground">
                {ach.description}
              </div>

              <div className="flex items-center gap-2 text-xs mb-3">
                <Badge variant="outline" className="capitalize">
                  {ach.category}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {ach.tier}
                </Badge>
              </div>

              <div className="mb-4 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span>Progress:</span>
                  <span>
                    {currProgress} / {ach.requirement_value}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div
                    className={`h-2 rounded transition-all ${
                      isUnlocked ? "bg-yellow-400" : "bg-blue-400"
                    }`}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>

              {/* Rewards */}
              <div className="flex gap-2 text-xs mb-4">
                {ach.reward_cxp > 0 && (
                  <Badge className="bg-purple-500 text-white">
                    +{ach.reward_cxp} CXP
                  </Badge>
                )}
                {ach.reward_tokens > 0 && (
                  <Badge className="bg-blue-500 text-white">
                    +{ach.reward_tokens} CTK
                  </Badge>
                )}
                {ach.reward_special && (
                  <Badge className="bg-indigo-500 text-white">
                    {ach.reward_special}
                  </Badge>
                )}
              </div>

              {/* Claim Button */}
              {isUnlocked && !isClaimed && (
                <Button
                  onClick={() => claimReward(ach.id)}
                  disabled={isClaimingReward}
                  className="w-full"
                  size="sm"
                >
                  {isClaimingReward ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Gift className="w-4 h-4 mr-2" />
                  )}
                  Claim Reward
                </Button>
              )}

              {isClaimed && (
                <div className="text-center text-sm text-green-600 font-medium">
                  ✓ Reward Claimed
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
};
