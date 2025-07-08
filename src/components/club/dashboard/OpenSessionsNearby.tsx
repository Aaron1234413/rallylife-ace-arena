import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Plus,
  Star
} from 'lucide-react';
import { useOpenSessions } from '@/hooks/useOpenSessions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistanceToNow, format } from 'date-fns';

interface OpenSessionsNearbyProps {
  clubId: string;
}

export function OpenSessionsNearby({ clubId }: OpenSessionsNearbyProps) {
  const { sessions, loading, joinSession } = useOpenSessions(clubId);

  // Show only next 3 upcoming sessions for mobile dashboard
  const upcomingSessions = sessions.slice(0, 3);

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📚';
      case 'practice': return '💪';
      case 'tournament': return '🥇';
      case 'clinic': return '🏆';
      default: return '🎾';
    }
  };

  const getSessionDateTime = (session: any) => {
    const date = new Date(session.scheduled_date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = '';
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = format(date, 'MMM d');
    }

    return `${dateStr} at ${session.start_time}`;
  };

  const getSkillLevelDisplay = (min?: number, max?: number) => {
    if (!min && !max) return 'All levels';
    if (min && max) return `${min.toFixed(1)} - ${max.toFixed(1)}`;
    if (min) return `${min.toFixed(1)}+`;
    if (max) return `Up to ${max.toFixed(1)}`;
    return 'All levels';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Calendar className="h-5 w-5 text-tennis-green-primary" />
            Open Sessions Near You
          </CardTitle>
          <Badge variant="secondary" className="bg-tennis-green-bg/50">
            {sessions.length} total
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {upcomingSessions.length > 0 ? (
          <>
            <div className="space-y-3">
              {upcomingSessions.map((session) => {
                const isFull = session.current_participants >= session.max_participants;
                const canJoin = !isFull && session.status === 'open';

                return (
                  <div key={session.id} className="p-3 bg-white rounded-lg border border-tennis-green-bg/30">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getSessionTypeIcon(session.session_type)}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-tennis-green-dark text-sm">
                            {session.title}
                          </h4>
                          <p className="text-xs text-tennis-green-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {getSessionDateTime(session)}
                          </p>
                        </div>
                      </div>
                      
                      <Badge 
                        variant={session.status === 'open' ? 'default' : 'secondary'}
                        className={`text-xs ${isFull ? 'bg-orange-100 text-orange-800' : ''}`}
                      >
                        {isFull ? 'Full' : session.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div className="flex items-center gap-1 text-tennis-green-medium">
                        <Users className="h-3 w-3" />
                        <span>{session.current_participants}/{session.max_participants}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-tennis-green-medium">
                        <Star className="h-3 w-3" />
                        <span>{getSkillLevelDisplay(session.skill_level_min, session.skill_level_max)}</span>
                      </div>
                      
                      {session.court && (
                        <div className="flex items-center gap-1 text-tennis-green-medium">
                          <MapPin className="h-3 w-3" />
                          <span>{session.court.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 text-tennis-green-medium">
                        <Clock className="h-3 w-3" />
                        <span>{session.duration_minutes}min</span>
                      </div>
                    </div>

                    {/* Cost info */}
                    {(session.cost_per_person_tokens > 0 || session.cost_per_person_money > 0) && (
                      <div className="mb-3 p-2 bg-tennis-green-bg/20 rounded text-xs">
                        <span className="text-tennis-green-primary font-medium">
                          Cost: {session.cost_per_person_tokens > 0 && `${session.cost_per_person_tokens} tokens`}
                          {session.cost_per_person_tokens > 0 && session.cost_per_person_money > 0 && ' + '}
                          {session.cost_per_person_money > 0 && `$${session.cost_per_person_money}`}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs">
                        View Details
                      </Button>
                      
                      {canJoin && (
                        <Button 
                          size="sm"
                          onClick={() => joinSession(session.id)}
                          className="flex-1 text-xs"
                        >
                          Join Session
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* View All Sessions Link */}
            {sessions.length > 3 && (
              <Button variant="outline" className="w-full">
                View All {sessions.length} Sessions
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
            <p className="text-sm text-tennis-green-medium mb-2">
              No open sessions right now
            </p>
            <p className="text-xs text-tennis-green-medium/70 mb-4">
              Create the first session for your club!
            </p>
            <Button size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}