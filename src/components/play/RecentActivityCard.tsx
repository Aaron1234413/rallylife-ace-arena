import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { History, Trophy, Target, Users, Clock, Star, TrendingUp, Calendar } from "lucide-react";

interface RecentActivityCardProps {
  onViewHistory?: () => void;
}

export function RecentActivityCard({ onViewHistory }: RecentActivityCardProps) {
  const recentActivities = [
    {
      id: "1",
      type: "match",
      title: "Won vs Sarah Chen",
      description: "Singles Match • 6-4, 6-2",
      timestamp: "2 hours ago",
      xpGained: 85,
      result: "win",
      rating: 4.3,
      ratingChange: +0.1,
      opponent: {
        name: "Sarah Chen",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face"
      }
    },
    {
      id: "2", 
      type: "training",
      title: "Practice Session",
      description: "Forehand & Serve drills • 45 minutes",
      timestamp: "Yesterday",
      xpGained: 25,
      result: "completed",
      skillsImproved: ["Forehand", "Serve"]
    },
    {
      id: "3",
      type: "match",
      title: "Lost vs Mike Johnson",
      description: "Singles Match • 4-6, 3-6", 
      timestamp: "2 days ago",
      xpGained: 15,
      result: "loss",
      rating: 4.2,
      ratingChange: -0.1,
      opponent: {
        name: "Mike Johnson",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
      }
    },
    {
      id: "4",
      type: "tournament",
      title: "Weekend Tournament",
      description: "Reached Quarter-Finals • 3 wins",
      timestamp: "3 days ago", 
      xpGained: 120,
      result: "eliminated",
      placement: "Quarter-Finals",
      totalMatches: 4
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "match":
        return Trophy;
      case "training":
        return Target;
      case "tournament":
        return Star;
      default:
        return History;
    }
  };

  const getResultBadge = (activity: any) => {
    switch (activity.result) {
      case "win":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">+{activity.xpGained} XP</Badge>;
      case "loss":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">+{activity.xpGained} XP</Badge>;
      case "completed":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">+{activity.xpGained} XP</Badge>;
      case "eliminated":
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">+{activity.xpGained} XP</Badge>;
      default:
        return <Badge variant="secondary">+{activity.xpGained} XP</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onViewHistory}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentActivities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                    
                    {/* Additional Info */}
                    {activity.opponent && (
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={activity.opponent.avatar} alt={activity.opponent.name} />
                          <AvatarFallback className="text-xs">
                            {activity.opponent.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{activity.opponent.name}</span>
                        {activity.ratingChange && (
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${activity.ratingChange > 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {activity.ratingChange > 0 ? '+' : ''}{activity.ratingChange}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {activity.skillsImproved && (
                      <div className="flex gap-1 mt-2">
                        {activity.skillsImproved.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {activity.placement && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {activity.placement} • {activity.totalMatches} matches played
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {getResultBadge(activity)}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="font-semibold text-lg">245</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-lg">4</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-lg text-green-500">+12%</span>
            </div>
            <div className="text-xs text-muted-foreground">Improvement</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}