
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Trophy, 
  Dumbbell, 
  Users, 
  Heart, 
  Target,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  Zap
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { usePlayerAchievements } from '@/hooks/usePlayerAchievements';
import { useProfiles } from '@/hooks/useProfiles';
import { format } from 'date-fns';

const activityIcons = {
  match: Trophy,
  training: Dumbbell,
  lesson: Users,
  social: Heart,
  tournament: Trophy,
  practice: Target,
  default: Activity
};

const activityColors = {
  match: 'bg-blue-100 text-blue-800',
  training: 'bg-green-100 text-green-800',
  lesson: 'bg-purple-100 text-purple-800',
  social: 'bg-pink-100 text-pink-800',
  tournament: 'bg-yellow-100 text-yellow-800',
  practice: 'bg-orange-100 text-orange-800'
};

export default function Feed() {
  const [filter, setFilter] = useState<string>('all');
  const { activities, loading: activitiesLoading } = useActivityLogs();
  const { playerAchievements, loading: achievementsLoading } = usePlayerAchievements();
  const { data: profiles } = useProfiles();

  // Combine activities and achievements into a unified feed
  const feedItems = React.useMemo(() => {
    const items = [];

    // Add activity logs
    if (activities) {
      activities.forEach(activity => {
        items.push({
          id: activity.id,
          type: 'activity',
          timestamp: activity.logged_at,
          data: activity
        });
      });
    }

    // Add recent achievements
    if (playerAchievements) {
      playerAchievements.slice(0, 10).forEach(achievement => {
        items.push({
          id: achievement.id,
          type: 'achievement',
          timestamp: achievement.unlocked_at,
          data: achievement
        });
      });
    }

    // Sort by timestamp (most recent first)
    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [activities, playerAchievements]);

  const filteredItems = feedItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'achievements') return item.type === 'achievement';
    if (filter === 'activities') return item.type === 'activity';
    if (item.type === 'activity') return item.data.activity_type === filter;
    return false;
  });

  const renderFeedItem = (item: any) => {
    if (item.type === 'achievement') {
      const achievement = item.data;
      const achievementData = achievement.achievement;
      
      return (
        <Card key={item.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
                <Trophy className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-yellow-600">Achievement Unlocked!</span>
                  <Badge variant="secondary" className="capitalize">
                    {achievementData?.tier || 'bronze'}
                  </Badge>
                </div>
                
                <h4 className="font-medium mb-1">{achievementData?.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {achievementData?.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(achievement.unlocked_at), 'MMM d, yyyy')}
                  </div>
                  {achievementData?.reward_xp > 0 && (
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      +{achievementData.reward_xp} XP
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (item.type === 'activity') {
      const activity = item.data;
      const Icon = activityIcons[activity.activity_type as keyof typeof activityIcons] || activityIcons.default;
      const colorClass = activityColors[activity.activity_type as keyof typeof activityColors] || 'bg-gray-100 text-gray-800';

      return (
        <Card key={item.id} className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="capitalize">
                    {activity.activity_type}
                  </Badge>
                  {activity.is_competitive && (
                    <Badge className="bg-red-100 text-red-800">
                      Competitive
                    </Badge>
                  )}
                </div>
                
                <h4 className="font-medium mb-1">{activity.title}</h4>
                {activity.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(activity.logged_at), 'MMM d, yyyy')}
                  </div>
                  
                  {activity.duration_minutes && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {activity.duration_minutes} min
                    </div>
                  )}
                  
                  {activity.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {activity.location}
                    </div>
                  )}
                  
                  {activity.opponent_name && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      vs {activity.opponent_name}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {activity.hp_impact !== 0 && (
                    <Badge 
                      variant="secondary" 
                      className={activity.hp_impact > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {activity.hp_impact > 0 ? '+' : ''}{activity.hp_impact} HP
                    </Badge>
                  )}
                  {activity.xp_earned > 0 && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      +{activity.xp_earned} XP
                    </Badge>
                  )}
                  {activity.score && (
                    <Badge variant="outline">
                      {activity.score}
                    </Badge>
                  )}
                  {activity.result && (
                    <Badge 
                      variant="outline"
                      className={
                        activity.result === 'win' ? 'bg-green-100 text-green-800' :
                        activity.result === 'loss' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {activity.result.charAt(0).toUpperCase() + activity.result.slice(1)}
                    </Badge>
                  )}
                </div>
                
                {activity.enjoyment_rating && (
                  <div className="mt-2 flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">
                      {activity.enjoyment_rating}/5 enjoyment
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  const loading = activitiesLoading || achievementsLoading;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Activity Feed</h1>
        <p className="text-muted-foreground">
          Stay updated with the latest activities and achievements from the tennis community
        </p>
      </div>

      <div className="mb-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activities</SelectItem>
            <SelectItem value="achievements">Achievements</SelectItem>
            <SelectItem value="activities">Activities Only</SelectItem>
            <Separator className="my-1" />
            <SelectItem value="match">Matches</SelectItem>
            <SelectItem value="training">Training</SelectItem>
            <SelectItem value="lesson">Lessons</SelectItem>
            <SelectItem value="tournament">Tournaments</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="practice">Practice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No activities found</h3>
            <p className="text-muted-foreground">
              {filter === 'all' 
                ? 'No activities or achievements to display yet. Start playing to see your feed come to life!'
                : `No ${filter} activities found. Try adjusting your filter or log some activities.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-0">
            {filteredItems.map(renderFeedItem)}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
