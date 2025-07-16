import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Target, Trophy, Clock, Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMatchmaking } from '@/hooks/useMatchmaking';

interface MatchCardProps {
  match: {
    id: string;
    status: string;
    scheduled_time?: string;
    court_location?: string;
    stake_amount: number;
    score?: string;
    created_at: string;
    expires_at: string;
    challenger: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    opponent: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
    winner?: {
      id: string;
      full_name: string;
    };
  };
  variant?: 'challenge' | 'active' | 'completed';
}

export function MatchCard({ match, variant = 'active' }: MatchCardProps) {
  const { user } = useAuth();
  const { updateMatch, isUpdating } = useMatchmaking();

  const isChallenger = match.challenger.id === user?.id;
  const otherPlayer = isChallenger ? match.opponent : match.challenger;
  
  const handleAccept = () => {
    updateMatch.mutate({
      matchId: match.id,
      updates: { status: 'accepted' }
    });
  };

  const handleDecline = () => {
    updateMatch.mutate({
      matchId: match.id,
      updates: { status: 'declined' }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            {variant === 'challenge' && !isChallenger && 'Challenge from '}
            {variant === 'challenge' && isChallenger && 'Challenge sent to '}
            {variant === 'active' && 'Match vs '}
            {variant === 'completed' && 'Match vs '}
            {otherPlayer.full_name}
          </CardTitle>
          <Badge className={getStatusColor(match.status)}>
            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Player Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherPlayer.avatar_url} />
            <AvatarFallback>
              {otherPlayer.full_name?.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{otherPlayer.full_name}</p>
            <p className="text-sm text-muted-foreground">
              {isChallenger ? 'Opponent' : 'Challenger'}
            </p>
          </div>
        </div>

        {/* Match Details */}
        <div className="space-y-2">
          {match.scheduled_time && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(match.scheduled_time)}</span>
            </div>
          )}

          {match.court_location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{match.court_location}</span>
            </div>
          )}

          {match.stake_amount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>{match.stake_amount} tokens at stake</span>
            </div>
          )}

          {match.score && variant === 'completed' && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>Score: {match.score}</span>
              {match.winner && (
                <Badge variant="outline" className="ml-2">
                  Winner: {match.winner.full_name}
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Created {formatDate(match.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        {variant === 'challenge' && match.status === 'pending' && !isChallenger && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={handleAccept}
              disabled={isUpdating}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecline}
              disabled={isUpdating}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Decline
            </Button>
          </div>
        )}

        {variant === 'challenge' && match.status === 'pending' && isChallenger && (
          <div className="text-sm text-muted-foreground pt-2">
            Waiting for {otherPlayer.full_name} to respond...
          </div>
        )}

        {variant === 'active' && match.status === 'accepted' && (
          <div className="pt-2">
            <Button size="sm" variant="outline" className="w-full">
              Record Match Result
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}