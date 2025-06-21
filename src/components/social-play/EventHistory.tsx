
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, MapPin, Users, Trophy } from 'lucide-react';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';
import { format } from 'date-fns';

export const EventHistory = () => {
  const { sessions, isLoading } = useSocialPlaySessions();

  const completedSessions = sessions.filter(session => session.status === 'completed');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completedSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No completed sessions yet</p>
            <p className="text-sm">Start playing to build your history!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatSessionDuration = (startTime: string | null, endTime: string | null) => {
    if (!startTime || !endTime) return 'Unknown duration';
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Event History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {completedSessions.map((session) => {
              const participantCount = session.participants?.length || 0;
              const duration = formatSessionDuration(session.start_time, session.end_time);
              
              return (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium capitalize">
                        {session.session_type} Session
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {session.end_time && format(new Date(session.end_time), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{duration}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{participantCount + 1} players</span>
                    </div>
                    
                    {session.location && (
                      <div className="flex items-center gap-2 col-span-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{session.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {session.final_score && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                      <strong>Score:</strong> {session.final_score}
                    </div>
                  )}
                  
                  {session.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <em>"{session.notes}"</em>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
