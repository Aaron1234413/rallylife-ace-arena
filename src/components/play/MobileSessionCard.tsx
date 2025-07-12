import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Users, 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  Gamepad2,
  Coins,
  Trash2,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useEnhancedSessionActions } from '@/hooks/useEnhancedSessionActions';

interface MobileSessionCardProps {
  session: any;
  user: any;
  onJoinSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onStartSession?: (sessionId: string) => void;
  isJoining: boolean;
  isDeleting: boolean;
  isStarting?: boolean;
  regularTokens: number;
  distance?: number;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'match': return Trophy;
    case 'social_play': return Users;
    case 'training': return Star;
    default: return Gamepad2;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'match': return 'bg-red-500';
    case 'social_play': return 'bg-purple-500';
    case 'training': return 'bg-blue-500';
    default: return 'bg-gray-500';
  }
};

export const MobileSessionCard: React.FC<MobileSessionCardProps> = ({
  session,
  user,
  onJoinSession,
  onDeleteSession,
  onStartSession,
  isJoining,
  isDeleting,
  isStarting = false,
  regularTokens,
  distance
}) => {
  const { executeAction, loading } = useEnhancedSessionActions();
  const TypeIcon = getTypeIcon(session.session_type || session.type);
  const sessionType = session.session_type || session.type;
  const isCreator = user && session.creator_id === user.id;
  const participantCount = session.participant_count || 0;
  const isFull = participantCount >= session.max_players;
  const hasStakes = session.stakes_amount > 0;
  const hasInsufficientTokens = hasStakes && regularTokens < session.stakes_amount;
  const tokensShort = hasInsufficientTokens ? session.stakes_amount - regularTokens : 0;

  const handleJoin = () => {
    if (!session.user_joined && !isJoining) {
      onJoinSession(session.id);
    }
  };

  return (
    <Card className="overflow-hidden border-0 shadow-md bg-white">
      <CardContent className="p-0">
        {/* Header Section */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`p-2 rounded-full ${getTypeColor(sessionType)}`}>
                <TypeIcon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  by {session.creator_name || 'Unknown'}
                </p>
              </div>
            </div>
            {isCreator && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 shrink-0"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Session</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this session? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDeleteSession(session.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Location and Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{session.location || 'Location TBD'}</span>
              {distance && (
                <Badge variant="outline" className="text-xs ml-auto shrink-0">
                  {distance.toFixed(1)}km
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                {new Date(session.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section - Key Info */}
        <div className="px-4 py-3 bg-gray-50 border-y border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className={`text-lg font-bold ${isFull ? 'text-red-600' : 'text-gray-900'}`}>
                  {participantCount}
                </div>
                <div className="text-xs text-gray-500">
                  of {session.max_players} {isFull && '(Full)'}
                </div>
              </div>
              {session.format && (
                <Badge variant="outline" className="text-xs">
                  {session.format}
                </Badge>
              )}
            </div>
            
            {hasStakes && (
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <div className="text-right">
                  <div className={`text-sm font-medium ${hasInsufficientTokens ? 'text-red-600' : 'text-yellow-600'}`}>
                    {session.stakes_amount}T
                  </div>
                  {hasInsufficientTokens && (
                    <div className="text-xs text-red-500">
                      Need {tokensShort} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Token Warning */}
        {hasInsufficientTokens && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  Insufficient Tokens
                </p>
                <p className="text-xs text-red-600">
                  You have {regularTokens}, need {session.stakes_amount}
                </p>
              </div>
              <Link to="/store?category=tokens">
                <Button size="sm" variant="outline" className="text-xs h-8 border-red-300 text-red-600 hover:bg-red-50">
                  Get Tokens
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-600 italic">
              "{session.notes}"
            </p>
          </div>
        )}

        {/* Action Section */}
        <div className="p-4">
          {isCreator ? (
            <div className="space-y-2">
              {isFull && session.status === 'waiting' ? (
                <Button 
                  onClick={() => executeAction(
                    { id: 'start', type: 'start', label: 'Start Session', icon: '▶️', variant: 'default', loadingText: 'Starting...' },
                    session.id
                  )}
                  disabled={loading === 'start'}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading === 'start' ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Starting Session...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Start Session</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              ) : (
                <Badge variant="secondary" className="w-full justify-center py-2">
                  You created this session
                </Badge>
              )}
            </div>
          ) : isFull ? (
            <Button 
              disabled
              className="w-full bg-gray-100 text-gray-400 hover:bg-gray-100"
            >
              Session Full
            </Button>
          ) : hasInsufficientTokens ? (
            <Button 
              disabled
              className="w-full bg-gray-100 text-gray-400 hover:bg-gray-100"
            >
              Need {tokensShort} More Tokens
            </Button>
          ) : (
            <Button 
              onClick={handleJoin}
              disabled={session.user_joined || !user || isJoining}
              className={`w-full ${
                session.user_joined 
                  ? "bg-green-500 hover:bg-green-600" 
                  : "bg-tennis-green-primary hover:bg-tennis-green-medium"
              }`}
            >
              {isJoining ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </div>
              ) : session.user_joined ? (
                <div className="flex items-center justify-center gap-2">
                  <span>✓ Joined</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Join Session</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};