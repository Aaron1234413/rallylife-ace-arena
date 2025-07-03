import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';
import { PlayerLeaderboardEntry as PlayerEntry } from '@/hooks/usePlayerLeaderboards';
import { LeaderboardActions } from './LeaderboardActions';
import { useAuth } from '@/hooks/useAuth';

interface PlayerLeaderboardEntryProps {
  entry: PlayerEntry;
  index: number;
  currentUserRole?: 'player' | 'coach';
}

export function PlayerLeaderboardEntry({ entry, index, currentUserRole }: PlayerLeaderboardEntryProps) {
  const { user } = useAuth();
  const isCurrentUser = user?.id === entry.player_id;

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

  return (
    <div className={`flex items-center gap-6 p-6 rounded-xl border transition-colors hover:bg-tennis-green-bg/20 ${
      entry.rank_position <= 3 ? 'border-tennis-green-medium bg-tennis-green-bg/10' : 'border-tennis-green-subtle'
    }`}>
      {/* Rank */}
      <div className="flex items-center justify-center min-w-[3rem]">
        {getRankIcon(entry.rank_position) || (
          <Badge className={getRankBadgeColor(entry.rank_position)}>
            #{entry.rank_position}
          </Badge>
        )}
      </div>

      {/* Player Info */}
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

      {/* Stats */}
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

      {/* Actions */}
      {!isCurrentUser && (
        <LeaderboardActions
          targetUserId={entry.player_id}
          targetUserName={entry.player_name}
          targetUserRole="player"
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  );
}