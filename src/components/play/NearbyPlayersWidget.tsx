import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  MapPin, 
  Clock, 
  Star, 
  MessageCircle, 
  UserPlus,
  Activity,
  Trophy
} from 'lucide-react';

interface NearbyPlayer {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  distance_km: number;
  city?: string;
  last_updated: string;
  current_level: number;
  total_xp: number;
  recent_activity_count: number;
  last_activity?: string;
  activity_types: string[];
  travel_time_estimate: number;
  compatibility_score: number;
}

interface NearbyPlayersWidgetProps {
  players: NearbyPlayer[];
  loading: boolean;
  onMessagePlayer: (playerId: string) => void;
  onInvitePlayer: (playerId: string) => void;
  maxVisible?: number;
}

export const NearbyPlayersWidget: React.FC<NearbyPlayersWidgetProps> = ({
  players,
  loading,
  onMessagePlayer,
  onInvitePlayer,
  maxVisible = 6
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Nearby Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Nearby Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              No players found in your area. Try expanding your search radius.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visiblePlayers = players.slice(0, maxVisible);
  const hasMorePlayers = players.length > maxVisible;

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-700';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-700';
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 20) return 'bg-purple-100 text-purple-700';
    if (level >= 10) return 'bg-blue-100 text-blue-700';
    if (level >= 5) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const formatLastActivity = (timestamp?: string) => {
    if (!timestamp) return 'No recent activity';
    const date = new Date(timestamp);
    const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hoursAgo < 1) return 'Active now';
    if (hoursAgo < 24) return `Active ${hoursAgo}h ago`;
    return 'Active recently';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Nearby Players
          </div>
          <Badge variant="outline">
            {players.length} found
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {visiblePlayers.map((player) => (
          <div
            key={player.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={player.avatar_url} />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {player.full_name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-sm truncate">
                    {player.full_name}
                  </h4>
                  <Badge className={getLevelBadgeColor(player.current_level)} variant="secondary">
                    Lv.{player.current_level}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{player.distance_km.toFixed(1)}km away</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>~{player.travel_time_estimate}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    <span>{formatLastActivity(player.last_activity)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    <span>{player.total_xp.toLocaleString()} XP</span>
                  </div>
                </div>

                {/* Activity Types */}
                {player.activity_types.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {player.activity_types.slice(0, 3).map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {player.activity_types.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{player.activity_types.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Compatibility Score */}
                <div className="flex items-center justify-between">
                  <Badge className={getCompatibilityColor(player.compatibility_score)}>
                    <Star className="h-3 w-3 mr-1" />
                    {Math.round(player.compatibility_score * 100)}% match
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onMessagePlayer(player.user_id)}
                      className="h-7 px-2"
                    >
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onInvitePlayer(player.user_id)}
                      className="h-7 px-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {hasMorePlayers && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm">
              View {players.length - maxVisible} more players
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};