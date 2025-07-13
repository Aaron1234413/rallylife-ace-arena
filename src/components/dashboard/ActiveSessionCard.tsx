import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Play, 
  Pause, 
  Square,
  Clock, 
  Users, 
  MapPin, 
  Coins,
  Eye
} from 'lucide-react';
import { UnifiedSession } from '@/hooks/useUnifiedSessions';
import { useAuth } from '@/hooks/useAuth';
import { useEnhancedSessionActions } from '@/hooks/useEnhancedSessionActions';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CompletionFlow } from '@/components/sessions/CompletionFlow';
import { supabase } from '@/integrations/supabase/client';

interface ActiveSessionCardProps {
  session: UnifiedSession;
  onRefresh?: () => void;
}

export function ActiveSessionCard({ session, onRefresh }: ActiveSessionCardProps) {
  const { user } = useAuth();
  const { getSessionActions, executeAction, loading } = useEnhancedSessionActions();
  const navigate = useNavigate();
  
  const [showCompletionFlow, setShowCompletionFlow] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  const isCreator = user?.id === session.creator_id;
  const userRole = isCreator ? 'creator' : 'participant';
  const actions = getSessionActions(session, userRole);

  // Load participants when completion flow is opened
  useEffect(() => {
    if (showCompletionFlow) {
      loadParticipants();
    }
  }, [showCompletionFlow]);

  const loadParticipants = async () => {
    try {
      console.log('📋 Loading participants for session:', session.id);
      
      const { data, error } = await supabase
        .from('session_participants')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('session_id', session.id);

      if (error) throw error;
      
      console.log('📋 Participants loaded:', data);
      setParticipants(data || []);
      
      // If no participants found, create a basic entry for the creator
      if (!data || data.length === 0) {
        console.log('📋 No participants found, adding creator as participant');
        setParticipants([{
          user_id: session.creator_id,
          session_id: session.id,
          stakes_contributed: 0,
          profiles: {
            full_name: 'Session Creator',
            avatar_url: null
          }
        }]);
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
      toast.error('Failed to load session participants');
    }
  };

  const handleAction = async (actionType: string) => {
    console.log('🎯 ActiveSessionCard handleAction called:', actionType);
    
    // Special handling for end action - open completion flow
    if (actionType === 'end') {
      console.log('🏁 Opening completion flow for session:', session.id);
      await loadParticipants(); // Ensure we have latest participants
      setShowCompletionFlow(true);
      return;
    }

    try {
      const action = actions.find(a => a.type === actionType);
      if (!action) return;

      const success = await executeAction(action, session.id);
      if (success && onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Action failed. Please try again.');
    }
  };

  const handleCompletionSuccess = () => {
    setShowCompletionFlow(false);
    if (onRefresh) {
      onRefresh();
    }
    toast.success('Session completed successfully!');
  };

  const handleViewSession = () => {
    navigate(`/play?session=${session.id}`);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionIcon = () => {
    switch (session.status) {
      case 'active': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getPrimaryAction = () => {
    if (!isCreator) return null;
    
    switch (session.status) {
      case 'open':
      case 'waiting':
        if ((session.participant_count || 0) >= 2) {
          return (
            <Button 
              size="sm" 
              onClick={() => handleAction('start')}
              disabled={loading === 'start'}
              className="flex items-center gap-1"
            >
              <Play className="h-3 w-3" />
              Start
            </Button>
          );
        }
        break;
      case 'active':
        return (
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={() => handleAction('end')}
            disabled={loading === 'end'}
            className="flex items-center gap-1"
          >
            <Square className="h-3 w-3" />
            End
          </Button>
        );
      case 'paused':
        return (
          <Button 
            size="sm" 
            onClick={() => handleAction('pause')}
            disabled={loading === 'pause'}
            className="flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            Resume
          </Button>
        );
    }
    return null;
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getSessionIcon()}
            {session.session_type}
          </CardTitle>
          <Badge className={`${getStatusColor(session.status)} capitalize`}>
            {session.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Session Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gray-500" />
            <span className="truncate">{session.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3 text-gray-500" />
            <span>{session.participant_count || 0}/{session.max_players} players</span>
          </div>
        </div>

        {session.stakes_amount > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Coins className="h-3 w-3 text-yellow-600" />
            <span className="text-yellow-700">{session.stakes_amount} tokens at stake</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleViewSession}
            className="flex-1 flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            View Details
          </Button>
          
          {getPrimaryAction()}
        </div>

        {/* Status Info */}
        {session.status === 'open' && (session.participant_count || 0) < 2 && (
          <p className="text-xs text-gray-600">
            Waiting for more players to join...
          </p>
        )}
        
        {session.status === 'active' && (
          <p className="text-xs text-green-700 font-medium">
            🔴 Session is live! Players are actively playing.
          </p>
        )}
      </CardContent>

      {/* Completion Flow Dialog */}
      <CompletionFlow
        open={showCompletionFlow}
        onOpenChange={setShowCompletionFlow}
        session={session}
        participants={participants}
        onComplete={handleCompletionSuccess}
      />
    </Card>
  );
}