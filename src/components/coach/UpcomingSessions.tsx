import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar } from 'lucide-react';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/hooks/useAuth';

export function UpcomingSessions() {
  const { user } = useAuth();
  const { sessions, loading, joinSession, tipCoach } = useSessions();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingSessions = sessions.slice(0, 3); // Show only first 3

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcomingSessions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No upcoming sessions found
          </p>
        ) : (
          upcomingSessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{session.session_type}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {session.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {session.participant_count || 0} / {session.max_players}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* Show coach badge if this coach has joined */}
                  {session.user_has_joined && (
                    <Badge variant="secondary" className="text-xs">
                      🎾 Coach
                    </Badge>
                  )}
                  
                  {!session.user_has_joined ? (
                    <Button 
                      size="sm" 
                      onClick={() => joinSession(session.id)}
                    >
                      Join
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => tipCoach(session.id, session.creator_id, 10)}
                    >
                      Tip Coach (10)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}