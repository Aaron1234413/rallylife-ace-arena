import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  MapPin, 
  Clock, 
  Trophy, 
  Star,
  Gamepad2,
  Coins,
  Calendar,
  Heart,
  AlertTriangle,
  Zap
} from 'lucide-react';

interface Session {
  id: string;
  title?: string;
  session_type: string;
  location?: string;
  created_at: string;
  start_time?: string;
  participant_count?: number;
  max_players: number;
  stakes_amount: number;
  creator_name?: string;
  status: string;
  format?: string;
  user_joined?: boolean;
  distance_km?: number;
}

interface EnhancedSessionCardProps {
  session: Session;
  onJoin: (sessionId: string) => void;
  isJoining: boolean;
  userBalance: number;
  userHP?: number;
  showDistance?: boolean;
}

export function EnhancedSessionCard({ 
  session, 
  onJoin, 
  isJoining, 
  userBalance,
  userHP = 100,
  showDistance = false 
}: EnhancedSessionCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'challenge': return Zap;
      case 'social_play': return Users;
      case 'training': return Star;
      default: return Gamepad2;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-red-100 text-red-700 border-red-200';
      case 'challenge': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'social_play': return 'bg-green-100 text-green-700 border-green-200';
      case 'training': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const TypeIcon = getTypeIcon(session.session_type);
  const hasInsufficientTokens = session.stakes_amount > 0 && userBalance < session.stakes_amount;
  const spotsFilled = (session.participant_count || 0) / session.max_players;
  const isAlmostFull = spotsFilled >= 0.75;
  
  // HP reduction calculations
  const isChallenge = session.session_type === 'challenge';
  const estimatedDuration = 60; // Default 60 minutes for estimation
  const hpReduction = isChallenge ? 5 + Math.floor(estimatedDuration / 10) : 0;
  const hasInsufficientHP = isChallenge && userHP < hpReduction;

  return (
    <Card className={`hover:shadow-md transition-shadow duration-200 border-l-4 ${isChallenge ? 'border-l-orange-500' : 'border-l-primary'}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-base">
                {session.title || `${session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session`}
              </h3>
            </div>
            <Badge className={getTypeColor(session.session_type)}>
              {session.session_type}
            </Badge>
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{session.location || 'Location TBD'}</span>
              {showDistance && session.distance_km && (
                <Badge variant="outline" className="text-xs ml-1">
                  {session.distance_km.toFixed(1)}km
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {session.start_time ? (
                <>
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  <span>{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {session.participant_count || 0}/{session.max_players} players
              </span>
              {isAlmostFull && (
                <Badge variant="secondary" className="text-xs">
                  Almost Full
                </Badge>
              )}
            </div>
            {session.format && (
              <Badge variant="outline" className="text-xs">
                {session.format}
              </Badge>
            )}
          </div>

          {/* HP Impact Warning */}
          {isChallenge && (
            <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-orange-800">Challenge Session</div>
                <div className="text-xs text-orange-600">
                  Will consume ~{hpReduction} HP • Current HP: {userHP}
                </div>
              </div>
              <Heart className={`h-4 w-4 ${hasInsufficientHP ? 'text-red-500' : 'text-orange-600'}`} />
            </div>
          )}

          {/* Stakes */}
          {session.stakes_amount > 0 && (
            <div className={`flex items-center gap-2 text-sm ${hasInsufficientTokens ? 'text-destructive' : 'text-yellow-600'}`}>
              <Coins className="h-3 w-3" />
              <span>Stakes: {session.stakes_amount} tokens</span>
              {hasInsufficientTokens && (
                <Badge variant="destructive" className="text-xs">
                  Insufficient tokens
                </Badge>
              )}
            </div>
          )}

          {/* Creator */}
          <div className="text-xs text-muted-foreground">
            Created by {session.creator_name || 'Unknown'}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            {session.user_joined ? (
              <Button variant="secondary" size="sm" disabled className="w-full">
                Already Joined
              </Button>
            ) : hasInsufficientHP ? (
              <Button variant="outline" size="sm" disabled className="w-full text-red-600 border-red-300">
                Insufficient HP ({userHP}/{hpReduction} needed)
              </Button>
            ) : hasInsufficientTokens ? (
              <Button variant="outline" size="sm" disabled className="w-full text-destructive border-destructive">
                Need {session.stakes_amount - userBalance} More Tokens
              </Button>
            ) : (
              <Button 
                onClick={() => onJoin(session.id)}
                disabled={isJoining}
                size="sm"
                className="w-full"
              >
                {isJoining ? 'Joining...' : 'Join Session'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}