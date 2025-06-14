
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';
import { CoachLeaderboardEntry } from '@/hooks/useCoachLeaderboards';

interface LeaderboardEntryProps {
  entry: CoachLeaderboardEntry;
  leaderboardType: string;
  index: number;
}

export function LeaderboardEntry({ entry, leaderboardType, index }: LeaderboardEntryProps) {
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

  const formatScore = (score: number, type: string) => {
    switch (type) {
      case 'crp':
        return `${Math.round(score)} CRP`;
      case 'cxp':
        return `${Math.round(score)} CXP`;
      case 'player_success':
        return `${score.toFixed(1)}/5.0`;
      case 'overall':
        return `${score.toFixed(1)}`;
      default:
        return Math.round(score).toString();
    }
  };

  const getMetadataDisplay = (metadata: any, type: string) => {
    if (!metadata) return null;

    switch (type) {
      case 'crp':
        return (
          <div className="text-xs text-tennis-green-medium">
            Level: {metadata.reputation_level} • Total: {metadata.total_crp_earned} CRP
          </div>
        );
      case 'cxp':
        return (
          <div className="text-xs text-tennis-green-medium">
            Level {metadata.current_level} • {metadata.coaching_tier} Coach
          </div>
        );
      case 'player_success':
        return (
          <div className="text-xs text-tennis-green-medium">
            {metadata.total_feedback} reviews • {metadata.success_rate}% positive
          </div>
        );
      case 'overall':
        return (
          <div className="text-xs text-tennis-green-medium">
            {metadata.current_crp} CRP • Level {metadata.current_level} • 
            {metadata.avg_rating ? ` ${metadata.avg_rating.toFixed(1)}/5` : ' No ratings'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-tennis-green-bg/20 ${
      entry.rank_position <= 3 ? 'border-tennis-green-medium bg-tennis-green-bg/10' : 'border-gray-200'
    }`}>
      {/* Rank */}
      <div className="flex items-center justify-center min-w-[3rem]">
        {getRankIcon(entry.rank_position) || (
          <Badge className={getRankBadgeColor(entry.rank_position)}>
            #{entry.rank_position}
          </Badge>
        )}
      </div>

      {/* Coach Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={entry.coach_avatar_url || undefined} />
          <AvatarFallback className="bg-tennis-green-light text-white">
            {entry.coach_name?.split(' ').map(n => n[0]).join('') || 'C'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-tennis-green-dark truncate">
            {entry.coach_name || 'Anonymous Coach'}
          </p>
          {getMetadataDisplay(entry.metadata, leaderboardType)}
        </div>
      </div>

      {/* Score */}
      <div className="text-right">
        <p className="font-bold text-tennis-green-dark">
          {formatScore(entry.score_value, leaderboardType)}
        </p>
        {leaderboardType === 'player_success' && entry.metadata?.total_feedback && (
          <div className="flex items-center gap-1 justify-end">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs text-tennis-green-medium">
              {entry.metadata.total_feedback}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
