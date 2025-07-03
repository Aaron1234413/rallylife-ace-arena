import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, Star, MessageCircle } from 'lucide-react';
import { PlayerLeaderboardEntry as PlayerEntry } from '@/hooks/usePlayerLeaderboards';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMessageNavigation } from '@/hooks/useMessageNavigation';

interface PlayerLeaderboardEntryProps {
  entry: PlayerEntry;
  index: number;
  currentUserRole?: 'player' | 'coach';
  mobileOptimized?: boolean;
}

export function PlayerLeaderboardEntry({ entry, index, currentUserRole, mobileOptimized = false }: PlayerLeaderboardEntryProps) {
  const { user } = useAuth();
  const { openConversation, isLoading } = useMessageNavigation();
  const isCurrentUser = user?.id === entry.player_id;

  const handleMessage = () => {
    openConversation({
      targetUserId: entry.player_id,
      targetUserName: entry.player_name || 'Player'
    });
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-yellow-500 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-orange-600 text-white';
      default:
        return 'bg-tennis-green-light text-white';
    }
  };

  if (mobileOptimized) {
    return (
      <div className={`relative flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-tennis-green-bg/20 ${
        entry.rank_position <= 3 ? 'border-tennis-green-medium bg-tennis-green-bg/10' : 'border-tennis-green-subtle'
      }`}>
        {/* Mobile: Rank and Avatar combined */}
        <div className="relative flex-shrink-0">
          <Avatar className="h-12 w-12">
            <AvatarImage src={entry.player_avatar_url || undefined} />
            <AvatarFallback className="bg-tennis-green-light text-white text-sm">
              {entry.player_name?.split(' ').map(n => n[0]).join('') || 'P'}
            </AvatarFallback>
          </Avatar>
          {/* Rank badge overlay */}
          <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(entry.rank_position)}`}>
            {entry.rank_position <= 3 ? (
              getRankIcon(entry.rank_position)
            ) : (
              <span className="text-xs">{entry.rank_position}</span>
            )}
          </div>
        </div>

        {/* Mobile: Player info stacked */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-tennis-green-dark truncate text-sm">
              {entry.player_name || 'Anonymous Player'}
              {isCurrentUser && (
                <Badge variant="outline" className="ml-1 text-xs">You</Badge>
              )}
            </p>
            {!isCurrentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMessage}
                disabled={isLoading}
                className="h-8 w-8 p-0 hover:bg-tennis-green-bg/30 ml-2"
              >
                <MessageCircle className="h-4 w-4 text-tennis-green-medium hover:text-tennis-green-dark" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-tennis-green-medium mt-1">
            <span>Level {entry.current_level}</span>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{entry.current_xp}/{entry.current_xp + entry.xp_to_next_level}</span>
            </div>
          </div>
          
          <div className="text-xs text-tennis-green-medium/80 mt-0.5">
            {entry.total_xp_earned.toLocaleString()} XP earned
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center gap-6 p-6 rounded-xl border transition-colors hover:bg-tennis-green-bg/20 ${
      entry.rank_position <= 3 ? 'border-tennis-green-medium bg-tennis-green-bg/10' : 'border-tennis-green-subtle'
    }`}>
      {/* Desktop: Rank */}
      <div className="flex items-center justify-center min-w-[3rem]">
        {getRankIcon(entry.rank_position) || (
          <Badge className={getRankBadgeColor(entry.rank_position)}>
            #{entry.rank_position}
          </Badge>
        )}
      </div>

      {/* Desktop: Player Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={entry.player_avatar_url || undefined} />
          <AvatarFallback className="bg-tennis-green-light text-white">
            {entry.player_name?.split(' ').map(n => n[0]).join('') || 'P'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-tennis-green-dark truncate">
            {entry.player_name || 'Anonymous Player'}
            {isCurrentUser && (
              <Badge variant="outline" className="ml-2 text-xs">You</Badge>
            )}
          </p>
          <div className="text-xs text-tennis-green-medium">
            Level {entry.current_level} • {entry.total_xp_earned.toLocaleString()} XP earned
          </div>
        </div>
      </div>

      {/* Desktop: Stats */}
      <div className="text-right mr-4">
        <p className="font-bold text-tennis-green-dark">
          Level {entry.current_level}
        </p>
        <div className="flex items-center gap-1 justify-end">
          <Star className="h-3 w-3 text-yellow-500 fill-current" />
          <span className="text-xs text-tennis-green-medium">
            {entry.current_xp}/{entry.current_xp + entry.xp_to_next_level}
          </span>
        </div>
      </div>

      {/* Desktop: Message Button */}
      {!isCurrentUser && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMessage}
          disabled={isLoading}
          className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-tennis-green-bg/30"
        >
          <MessageCircle className="h-4 w-4 text-tennis-green-medium hover:text-tennis-green-dark" />
        </Button>
      )}
    </div>
  );
}