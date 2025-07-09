import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MapPin, 
  Clock, 
  Users, 
  Coins, 
  Calendar,
  Trophy,
  Play,
  Heart,
  BookOpen
} from 'lucide-react';
import { format } from 'date-fns';
import { SessionData } from '@/hooks/useSessionManager';
import { SessionActionButton } from './SessionActionButton';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface EnhancedSessionCardProps {
  session: SessionData;
  onJoin: (sessionId: string) => void;
  onLeave: (sessionId: string) => void;
  onStart: (sessionId: string) => void;
  onComplete: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
  onViewDetails: (session: SessionData) => void;
  
  // Loading states
  isJoining?: boolean;
  isLeaving?: boolean;
  isStarting?: boolean;
  isCompleting?: boolean;
  isCancelling?: boolean;
  
  className?: string;
  showActions?: boolean;
}

export const EnhancedSessionCard: React.FC<EnhancedSessionCardProps> = ({
  session,
  onJoin,
  onLeave,
  onStart,
  onComplete,
  onCancel,
  onViewDetails,
  isJoining = false,
  isLeaving = false,
  isStarting = false,
  isCompleting = false,
  isCancelling = false,
  className,
  showActions = true
}) => {
  const { user } = useAuth();
  const isCreator = session.creator_id === user?.id;
  const userHasJoined = session.user_has_joined || false;

  const getSessionTypeConfig = (type: string) => {
    switch (type) {
      case 'match':
        return {
          icon: Trophy,
          color: 'bg-blue-100 text-blue-800',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'training':
        return {
          icon: Play,
          color: 'bg-green-100 text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'social_play':
        return {
          icon: Users,
          color: 'bg-purple-100 text-purple-800',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'wellbeing':
        return {
          icon: Heart,
          color: 'bg-pink-100 text-pink-800',
          bgColor: 'bg-pink-50',
          borderColor: 'border-pink-200'
        };
      case 'club_booking':
        return {
          icon: Calendar,
          color: 'bg-orange-100 text-orange-800',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      default:
        return {
          icon: Calendar,
          color: 'bg-gray-100 text-gray-800',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const typeConfig = getSessionTypeConfig(session.session_type);
  const TypeIcon = typeConfig.icon;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className={cn(
      'transition-all duration-200 hover:shadow-md cursor-pointer',
      typeConfig.borderColor,
      'border-l-4',
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Session Type Icon */}
          <div className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
            typeConfig.bgColor
          )}>
            <TypeIcon className="h-6 w-6 text-tennis-green-primary" />
          </div>
          
          {/* Session Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-tennis-green-dark">
                    {session.title || `${session.session_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session`}
                  </h3>
                  {session.status && (
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={session.creator?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {session.creator?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {session.creator?.full_name || 'Unknown Creator'}
                    {isCreator && (
                      <span className="ml-2 px-2 py-1 text-xs bg-tennis-green-primary/10 text-tennis-green-primary rounded">
                        Your Session
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              <Badge className={typeConfig.color}>
                {session.session_type.replace('_', ' ')}
              </Badge>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-tennis-green-medium">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{session.location}</span>
              </div>
              
              {session.format && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{session.format}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{format(new Date(session.created_at), 'MMM d, h:mm a')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{session.participant_count || 0}/{session.max_players} players</span>
              </div>
            </div>

            {/* Stakes and Description */}
            {session.stakes_amount > 0 && (
              <div className="flex items-center gap-2 text-sm text-yellow-600">
                <Coins className="h-4 w-4" />
                <span>{session.stakes_amount} tokens per player</span>
              </div>
            )}

            {session.notes && (
              <p className="text-sm text-tennis-green-medium italic">
                {session.notes}
              </p>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  {/* Join/Leave Actions */}
                  {!isCreator && !userHasJoined && (
                    <SessionActionButton
                      sessionId={session.id}
                      action="join"
                      loading={isJoining}
                      onClick={onJoin}
                      participantCount={session.participant_count}
                      maxPlayers={session.max_players}
                      userHasJoined={userHasJoined}
                    />
                  )}
                  
                  {!isCreator && userHasJoined && (
                    <SessionActionButton
                      sessionId={session.id}
                      action="leave"
                      loading={isLeaving}
                      onClick={onLeave}
                      userHasJoined={userHasJoined}
                    />
                  )}
                  
                  {/* Creator Actions */}
                  {isCreator && session.status !== 'completed' && session.status !== 'cancelled' && (
                    <>
                      {session.status !== 'active' && (
                        <SessionActionButton
                          sessionId={session.id}
                          action="start"
                          loading={isStarting}
                          onClick={onStart}
                          isCreator={isCreator}
                          sessionStatus={session.status}
                        />
                      )}
                      
                      {session.status === 'active' && (
                        <SessionActionButton
                          sessionId={session.id}
                          action="complete"
                          loading={isCompleting}
                          onClick={onComplete}
                          isCreator={isCreator}
                          sessionStatus={session.status}
                        />
                      )}
                      
                      <SessionActionButton
                        sessionId={session.id}
                        action="cancel"
                        loading={isCancelling}
                        onClick={onCancel}
                        isCreator={isCreator}
                      />
                    </>
                  )}
                </div>
                
                {/* View Details */}
                <button
                  onClick={() => onViewDetails(session)}
                  className="text-sm text-tennis-green-primary hover:underline"
                >
                  View Details
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};