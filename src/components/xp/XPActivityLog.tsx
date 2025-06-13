
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Trophy, 
  Dumbbell, 
  Users, 
  Heart, 
  Star, 
  Gift,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface XPActivity {
  id: string;
  activity_type: string;
  xp_earned: number;
  description: string;
  level_before: number;
  level_after: number;
  created_at: string;
}

interface XPActivityLogProps {
  activities: XPActivity[];
  loading?: boolean;
  className?: string;
}

const activityIcons = {
  match: Trophy,
  training: Dumbbell,
  lesson: Users,
  social: Heart,
  achievement: Star,
  bonus: Gift,
  daily_login: Calendar,
  default: TrendingUp
};

const activityColors = {
  match: 'bg-blue-100 text-blue-800 border-blue-300',
  training: 'bg-green-100 text-green-800 border-green-300',
  lesson: 'bg-purple-100 text-purple-800 border-purple-300',
  social: 'bg-pink-100 text-pink-800 border-pink-300',
  achievement: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  bonus: 'bg-orange-100 text-orange-800 border-orange-300',
  daily_login: 'bg-indigo-100 text-indigo-800 border-indigo-300'
};

export function XPActivityLog({ activities, loading, className }: XPActivityLogProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            XP Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Loading activities...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          XP Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No XP activities yet. Start earning XP by completing activities!
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || activityIcons.default;
                const colorClass = activityColors[activity.activity_type as keyof typeof activityColors] || 'bg-gray-100 text-gray-800 border-gray-300';
                const leveledUp = activity.level_after > activity.level_before;

                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          +{activity.xp_earned} XP
                        </Badge>
                        {leveledUp && (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            🎉 Level {activity.level_after}!
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm font-medium truncate">
                        {activity.description}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString()} at{' '}
                        {new Date(activity.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
