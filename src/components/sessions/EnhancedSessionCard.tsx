import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SessionActionButton } from './SessionActionButton';
import { useEnhancedSessionActions } from '@/hooks/useEnhancedSessionActions';
import { Clock, MapPin, Users, Calendar } from 'lucide-react';

interface SessionData {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  max_participants: number;
  current_participants: number;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  creator_id: string;
  creator_name?: string;
  skill_level?: string;
  session_type: string;
}

interface EnhancedSessionCardProps {
  session: SessionData;
  userRole: string;
  clubId?: string;
  onActionComplete?: () => void;
}

export function EnhancedSessionCard({ 
  session, 
  userRole, 
  clubId,
  onActionComplete 
}: EnhancedSessionCardProps) {
  const { getSessionActions, executeAction, loading } = useEnhancedSessionActions();
  const actions = getSessionActions(session, userRole);

  const handleActionClick = async (action: any) => {
    const success = await executeAction(action, session.id, clubId);
    if (success && onActionComplete) {
      onActionComplete();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'active': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'completed': return 'bg-gray-500/10 text-gray-700 border-gray-200';
      case 'cancelled': return 'bg-red-500/10 text-red-700 border-red-200';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{session.title}</CardTitle>
            <Badge variant="outline" className={getStatusColor(session.status)}>
              {session.status}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(session.start_time).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(session.start_time).toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{session.current_participants}/{session.max_participants}</span>
          </div>
          {session.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{session.location}</span>
            </div>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex gap-2 pt-2 border-t">
            {actions.map((action) => (
              <SessionActionButton
                key={action.id}
                action={action}
                onClick={() => handleActionClick(action)}
                loading={loading === action.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}