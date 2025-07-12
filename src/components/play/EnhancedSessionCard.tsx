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
  Trash2,
  Play
} from 'lucide-react';
import { CancelSessionDialog } from '@/components/sessions/CancelSessionDialog';
import { useEnhancedSessionActions } from '@/hooks/useEnhancedSessionActions';

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
  creator_id?: string;
  status: string;
  format?: string;
  user_joined?: boolean;
  distance_km?: number;
}

interface EnhancedSessionCardProps {
  session: Session;
  onJoin: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  isJoining: boolean;
  isCancelling?: boolean;
  userBalance: number;
  showDistance?: boolean;
  currentUserId?: string;
}

export function EnhancedSessionCard({ 
  session, 
  onJoin, 
  onCancel,
  isJoining, 
  isCancelling = false,
  userBalance,
  showDistance = false,
  currentUserId
}: EnhancedSessionCardProps) {
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const { executeAction, loading } = useEnhancedSessionActions();
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'social': return Users;
      case 'training': return Star;
      default: return Gamepad2;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-red-100 text-red-700 border-red-200';
      case 'social': return 'bg-green-100 text-green-700 border-green-200';
      case 'training': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const TypeIcon = getTypeIcon(session.session_type);
  const hasInsufficientTokens = session.stakes_amount > 0 && userBalance < session.stakes_amount;
  const participantCount = session.participant_count || 0;
  const spotsFilled = participantCount / session.max_players;
  const isFull = participantCount >= session.max_players;
  const isAlmostFull = spotsFilled >= 0.75 && !isFull;
  const isCreator = currentUserId && session.creator_id === currentUserId;

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-primary">
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
                {participantCount}/{session.max_players} players
              </span>
              {isFull ? (
                <Badge variant="destructive" className="text-xs">
                  Full
                </Badge>
              ) : isAlmostFull ? (
                <Badge variant="secondary" className="text-xs">
                  Almost Full
                </Badge>
              ) : null}
            </div>
            {session.format && (
              <Badge variant="outline" className="text-xs">
                {session.format}
              </Badge>
            )}
          </div>

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

          {/* Action Buttons */}
          <div className="pt-2">
            {isCreator ? (
              <div className="flex gap-2">
                {isFull && session.status === 'waiting' ? (
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => executeAction(
                      { id: 'start', type: 'start', label: 'Start Session', icon: '▶️', variant: 'default', loadingText: 'Starting...' },
                      session.id
                    )}
                    disabled={loading === 'start'}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {loading === 'start' ? 'Starting...' : 'Start Session'}
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCancelDialog(true)}
                    disabled={isCancelling}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {isCancelling ? 'Cancelling...' : 'Delete Session'}
                  </Button>
                )}
              </div>
            ) : session.user_joined ? (
              <Button variant="secondary" size="sm" disabled className="w-full">
                Already Joined
              </Button>
            ) : isFull ? (
              <Button variant="outline" size="sm" disabled className="w-full">
                Session Full
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
      
      {/* Cancel Session Dialog */}
      {onCancel && (
        <CancelSessionDialog
          isOpen={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
          onConfirm={(reason) => {
            onCancel(session.id);
            setShowCancelDialog(false);
          }}
          session={{
            id: session.id,
            title: session.title || `${session.session_type.charAt(0).toUpperCase() + session.session_type.slice(1)} Session`,
            scheduled_date: session.start_time ? new Date(session.start_time).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            start_time: session.start_time ? new Date(session.start_time).toTimeString().split(' ')[0] : '12:00:00',
            cost_per_person_tokens: session.stakes_amount,
            cost_per_person_money: 0
          }}
          loading={isCancelling}
        />
      )}
    </Card>
  );
}