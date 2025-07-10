import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { SessionActiveView } from './SessionActiveView';
import { useUnifiedSessions } from '@/hooks/useUnifiedSessions';
import { Gamepad2 } from 'lucide-react';

interface ActiveSessionsListProps {
  sessions: any[];
  loading: boolean;
  onStartSession: (sessionId: string) => Promise<boolean>;
  onCompleteSession: (sessionId: string, durationMinutes: number, winnerId?: string, winningTeam?: string) => Promise<boolean>;
}

export function ActiveSessionsList({
  sessions,
  loading,
  onStartSession,
  onCompleteSession
}: ActiveSessionsListProps) {
  const { getSessionParticipants } = useUnifiedSessions();

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Gamepad2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No active sessions</h3>
          <p className="text-gray-500">All sessions are either waiting to start or have been completed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {sessions.map((session) => (
        <ActiveSessionCard
          key={session.id}
          session={session}
          onStartSession={onStartSession}
          onCompleteSession={onCompleteSession}
          getSessionParticipants={getSessionParticipants}
        />
      ))}
    </div>
  );
}

interface ActiveSessionCardProps {
  session: any;
  onStartSession: (sessionId: string) => Promise<boolean>;
  onCompleteSession: (sessionId: string, durationMinutes: number, winnerId?: string, winningTeam?: string) => Promise<boolean>;
  getSessionParticipants: (sessionId: string) => Promise<any[]>;
}

function ActiveSessionCard({
  session,
  onStartSession,
  onCompleteSession,
  getSessionParticipants
}: ActiveSessionCardProps) {
  const [participants, setParticipants] = React.useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = React.useState(true);

  // Load participants for this session
  React.useEffect(() => {
    const loadParticipants = async () => {
      try {
        setLoadingParticipants(true);
        const sessionParticipants = await getSessionParticipants(session.id);
        setParticipants(sessionParticipants);
      } catch (error) {
        console.error('Error loading participants:', error);
        setParticipants([]);
      } finally {
        setLoadingParticipants(false);
      }
    };

    loadParticipants();
  }, [session.id, getSessionParticipants]);

  if (loadingParticipants) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <SessionActiveView
      session={session}
      participants={participants}
      onStartSession={onStartSession}
      onCompleteSession={onCompleteSession}
    />
  );
}