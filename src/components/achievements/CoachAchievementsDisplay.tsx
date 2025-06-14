
import React from "react";
import { useCoachAchievements } from "@/hooks/useCoachAchievements";
import { Loader2, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const CoachAchievementsDisplay: React.FC = () => {
  const { achievements, unlocked, progress, loading } = useCoachAchievements();

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

  return (
    <section className="my-6">
      <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
        <Award className="w-5 h-5 text-yellow-500" />
        Coach Achievements
      </h2>
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
              className={`flex flex-col p-4 relative border-2 ${
                isClaimed
                  ? "border-green-500 bg-green-50"
                  : isUnlocked
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-300"
              }`}
            >
              <div className="flex items-center mb-1">
                <span className="font-bold text-base">{ach.name}</span>
                {isClaimed && (
                  <Badge className="ml-2 bg-green-500 text-white">Claimed</Badge>
                )}
                {!isClaimed && isUnlocked && (
                  <Badge className="ml-2 bg-yellow-500 text-white">Unlocked</Badge>
                )}
              </div>
              <div className="mb-1 text-sm text-muted-foreground">
                {ach.description}
              </div>
              <div className="flex items-center gap-2 text-xs mb-1">
                <Badge variant="outline" className="capitalize">
                  {ach.category}
                </Badge>
                <Badge variant="secondary" className="capitalize">
                  {ach.tier}
                </Badge>
              </div>
              <div className="mt-2 text-xs">
                Progress:{" "}
                <span>
                  {currProgress} / {ach.requirement_value}
                </span>
                <div className="w-full bg-gray-200 rounded h-1 mt-1">
                  <div
                    className={`h-1 rounded ${isUnlocked ? "bg-yellow-400" : "bg-gray-400"}`}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2 text-xs">
                {ach.reward_cxp ? (
                  <Badge className="bg-purple-500 text-white">+{ach.reward_cxp} CXP</Badge>
                ) : null}
                {ach.reward_tokens ? (
                  <Badge className="bg-blue-500 text-white">+{ach.reward_tokens} CTK</Badge>
                ) : null}
                {ach.reward_special ? (
                  <Badge className="bg-indigo-500 text-white">{ach.reward_special}</Badge>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
};
