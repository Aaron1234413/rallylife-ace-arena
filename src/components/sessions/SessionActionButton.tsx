import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Play, Square, Trophy, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SessionActionButtonProps {
  sessionId: string;
  action: 'join' | 'leave' | 'start' | 'complete' | 'cancel';
  loading?: boolean;
  disabled?: boolean;
  onClick: (sessionId: string) => void;
  className?: string;
  
  // Session context for smart UI decisions
  participantCount?: number;
  maxPlayers?: number;
  userHasJoined?: boolean;
  isCreator?: boolean;
  sessionStatus?: string;
}

export const SessionActionButton: React.FC<SessionActionButtonProps> = ({
  sessionId,
  action,
  loading = false,
  disabled = false,
  onClick,
  className,
  participantCount = 0,
  maxPlayers = 4,
  userHasJoined = false,
  isCreator = false,
  sessionStatus = 'scheduled'
}) => {
  const getButtonConfig = () => {
    switch (action) {
      case 'join':
        const isFull = participantCount >= maxPlayers;
        return {
          variant: isFull ? 'outline' : 'default' as any,
          icon: Users,
          text: loading ? 'Joining...' : isFull ? 'Session Full' : 'Join Session',
          loadingText: 'Joining...',
          disabled: disabled || isFull || userHasJoined,
          className: 'bg-tennis-green-primary hover:bg-tennis-green-dark text-white'
        };
        
      case 'leave':
        return {
          variant: 'outline' as any,
          icon: X,
          text: loading ? 'Leaving...' : 'Leave Session',
          loadingText: 'Leaving...',
          disabled: disabled || !userHasJoined,
          className: 'border-red-200 text-red-600 hover:bg-red-50'
        };
        
      case 'start':
        return {
          variant: 'default' as any,
          icon: Play,
          text: loading ? 'Starting...' : 'Start Session',
          loadingText: 'Starting...',
          disabled: disabled || !isCreator || sessionStatus === 'active',
          className: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
        
      case 'complete':
        return {
          variant: 'default' as any,
          icon: Trophy,
          text: loading ? 'Completing...' : 'Complete Session',
          loadingText: 'Completing...',
          disabled: disabled || !isCreator || sessionStatus !== 'active',
          className: 'bg-green-600 hover:bg-green-700 text-white'
        };
        
      case 'cancel':
        return {
          variant: 'destructive' as any,
          icon: X,
          text: loading ? 'Cancelling...' : 'Cancel Session',
          loadingText: 'Cancelling...',
          disabled: disabled || !isCreator,
          className: 'bg-red-600 hover:bg-red-700 text-white'
        };
        
      default:
        return {
          variant: 'outline' as any,
          icon: Users,
          text: 'Action',
          loadingText: 'Loading...',
          disabled: false,
          className: ''
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  // Special case for join button - show participant count
  const showParticipantBadge = action === 'join' && participantCount > 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={config.variant}
        onClick={() => onClick(sessionId)}
        disabled={config.disabled || loading}
        className={cn(config.className, className)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Icon className="h-4 w-4 mr-2" />
        )}
        {config.text}
      </Button>
      
      {showParticipantBadge && (
        <Badge variant="secondary" className="text-xs">
          {participantCount}/{maxPlayers}
        </Badge>
      )}
    </div>
  );
};