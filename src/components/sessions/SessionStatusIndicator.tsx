import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, CheckCircle, XCircle, Users } from 'lucide-react';
import type { UnifiedSession } from '@/hooks/useUnifiedSessions';

interface SessionStatusIndicatorProps {
  session: UnifiedSession;
  showDetails?: boolean;
  className?: string;
}

export function SessionStatusIndicator({ 
  session, 
  showDetails = false, 
  className = '' 
}: SessionStatusIndicatorProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return {
          label: 'Open',
          icon: <Users className="h-3 w-3" />,
          variant: 'default' as const,
          color: 'bg-primary/10 text-primary border-primary/20'
        };
      case 'waiting':
        return {
          label: 'Waiting',
          icon: <Clock className="h-3 w-3" />,
          variant: 'secondary' as const,
          color: 'bg-muted text-muted-foreground border-border'
        };
      case 'active':
        return {
          label: 'Active',
          icon: <Play className="h-3 w-3" />,
          variant: 'default' as const,
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        };
      case 'paused':
        return {
          label: 'Paused',
          icon: <Pause className="h-3 w-3" />,
          variant: 'secondary' as const,
          color: 'bg-orange-500/10 text-orange-600 border-orange-500/20'
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: <CheckCircle className="h-3 w-3" />,
          variant: 'outline' as const,
          color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: <XCircle className="h-3 w-3" />,
          variant: 'destructive' as const,
          color: 'bg-destructive/10 text-destructive border-destructive/20'
        };
      default:
        return {
          label: status,
          icon: <Clock className="h-3 w-3" />,
          variant: 'outline' as const,
          color: 'bg-muted text-muted-foreground border-border'
        };
    }
  };

  const statusConfig = getStatusConfig(session.status);
  const participantCount = session.participant_count || 0;
  const maxPlayers = session.max_players || 0;

  if (showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge 
          variant={statusConfig.variant}
          className={`flex items-center gap-1 animate-fade-in ${statusConfig.color}`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
        
        {session.status !== 'cancelled' && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {participantCount}/{maxPlayers}
          </Badge>
        )}
        
        {session.status === 'active' && session.session_started_at && (
          <Badge variant="outline" className="text-xs">
            Started {new Date(session.session_started_at).toLocaleTimeString()}
          </Badge>
        )}
        
        {session.status === 'completed' && session.completed_at && (
          <Badge variant="outline" className="text-xs">
            Ended {new Date(session.completed_at).toLocaleTimeString()}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Badge 
      variant={statusConfig.variant}
      className={`flex items-center gap-1 animate-fade-in ${statusConfig.color} ${className}`}
    >
      {statusConfig.icon}
      {statusConfig.label}
    </Badge>
  );
}

// Helper component for session progress indicator
export function SessionProgressIndicator({ session }: { session: UnifiedSession }) {
  const participantCount = session.participant_count || 0;
  const maxPlayers = session.max_players || 0;
  const progressPercentage = maxPlayers > 0 ? (participantCount / maxPlayers) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Participants</span>
        <span>{participantCount}/{maxPlayers}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>
      {progressPercentage >= 100 && session.status === 'open' && (
        <p className="text-xs text-emerald-600 animate-fade-in">
          ✅ Ready to start!
        </p>
      )}
    </div>
  );
}