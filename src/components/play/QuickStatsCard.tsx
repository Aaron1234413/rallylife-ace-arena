import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Target, TrendingUp, Calendar, Clock, Zap, Award } from "lucide-react";

interface QuickStatsCardProps {
  onViewFullStats?: () => void;
}

export function QuickStatsCard({ onViewFullStats }: QuickStatsCardProps) {
  const stats = {
    currentRating: 4.2,
    ratingTrend: "+0.3",
    totalMatches: 28,
    winRate: 68,
    currentStreak: 5,
    longestStreak: 8,
    weeklyGoal: 75,
    weeklyProgress: 3,
    weeklyTarget: 4,
    monthlyRank: 12,
    totalRank: 156
  };

  const achievements = [
    {
      title: "Win Streak",
      value: `${stats.currentStreak} games`,
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "This Month",
      value: `#${stats.monthlyRank}`,
      icon: Award,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Win Rate",
      value: `${stats.winRate}%`,
      icon: Target,
      color: "text-green-500", 
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Stats
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewFullStats}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Section */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <span className="text-3xl font-bold">{stats.currentRating}</span>
            <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
              {stats.ratingTrend}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Current Rating</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.title} className="text-center">
              <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center ${achievement.bgColor}`}>
                <achievement.icon className={`w-5 h-5 ${achievement.color}`} />
              </div>
              <div className="font-semibold text-sm">{achievement.value}</div>
              <div className="text-xs text-muted-foreground">{achievement.title}</div>
            </div>
          ))}
        </div>

        {/* Weekly Goal Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Weekly Goal</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {stats.weeklyProgress}/{stats.weeklyTarget} sessions
            </span>
          </div>
          
          <Progress value={(stats.weeklyProgress / stats.weeklyTarget) * 100} className="h-2" />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{stats.weeklyGoal}% complete</span>
            <span>1 more to reach goal</span>
          </div>
        </div>

        {/* Performance Highlights */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="font-semibold text-lg">{stats.totalMatches}</div>
            <div className="text-xs text-muted-foreground">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">#{stats.totalRank}</div>
            <div className="text-xs text-muted-foreground">Global Rank</div>
          </div>
        </div>

        {/* Recent Trends */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <div className="text-sm font-medium">Recent Performance</div>
            <div className="text-xs text-muted-foreground">Last 7 days</div>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-500">Improving</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}