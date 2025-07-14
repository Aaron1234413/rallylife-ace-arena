import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User, Star, Zap, Trophy, Target, Settings, Edit, Camera } from "lucide-react";

interface PlayerStatusCardProps {
  onEditProfile?: () => void;
  onViewAchievements?: () => void;
}

export function PlayerStatusCard({ onEditProfile, onViewAchievements }: PlayerStatusCardProps) {
  const player = {
    name: "Alex Morgan",
    username: "@alexmorgan",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    rating: 4.2,
    level: 15,
    xp: 2450,
    xpToNext: 550,
    totalXp: 3000,
    status: "online",
    lastActive: "2 minutes ago",
    joinDate: "March 2023",
    location: "New York, NY",
    playingStyle: "Aggressive Baseline",
    favoriteShot: "Forehand"
  };

  const stats = {
    matchesPlayed: 128,
    winRate: 68,
    currentStreak: 5,
    longestStreak: 12,
    favoritePartner: "Sarah Chen",
    preferredCourt: "Hard Court"
  };

  const recentAchievements = [
    {
      title: "Win Streak Master",
      description: "Win 5 matches in a row",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      earned: "2 days ago"
    },
    {
      title: "Rising Star",
      description: "Reach rating 4.0+",
      icon: Star,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      earned: "1 week ago"
    },
    {
      title: "Tournament Warrior",
      description: "Complete 10 tournaments",
      icon: Trophy,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      earned: "2 weeks ago"
    }
  ];

  const levelProgress = (player.xp / player.totalXp) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Player Profile
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onEditProfile}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Header */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-16 h-16">
              <AvatarImage src={player.avatar} alt={player.name} />
              <AvatarFallback>{player.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
              player.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
            }`} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{player.name}</h3>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{player.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{player.username}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Level {player.level}</span>
              <span>{player.location}</span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Level {player.level}</span>
            <span className="text-muted-foreground">{player.xp}/{player.totalXp} XP</span>
          </div>
          <Progress value={levelProgress} className="h-2" />
          <p className="text-xs text-muted-foreground">{player.xpToNext} XP to next level</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg">{stats.matchesPlayed}</div>
            <div className="text-xs text-muted-foreground">Matches Played</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="font-semibold text-lg text-green-600">{stats.winRate}%</div>
            <div className="text-xs text-muted-foreground">Win Rate</div>
          </div>
        </div>

        {/* Playing Style */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Playing Style</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Style:</span>
              <span>{player.playingStyle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Favorite Shot:</span>
              <span>{player.favoriteShot}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Preferred Court:</span>
              <span>{stats.preferredCourt}</span>
            </div>
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Recent Achievements</h4>
            <Button variant="ghost" size="sm" onClick={onViewAchievements}>
              View All
            </Button>
          </div>
          
          <div className="space-y-2">
            {recentAchievements.slice(0, 2).map((achievement) => (
              <div key={achievement.title} className="flex items-center gap-3 p-2 rounded-lg border">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${achievement.bgColor}`}>
                  <achievement.icon className={`w-4 h-4 ${achievement.color}`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.earned}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <div>
            <div className="font-medium text-sm">Currently {player.status}</div>
            <div className="text-xs text-muted-foreground">Last active {player.lastActive}</div>
          </div>
          <Badge 
            variant={player.status === 'online' ? 'default' : 'secondary'}
            className={player.status === 'online' ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {player.status}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onEditProfile}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Gallery
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}