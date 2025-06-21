
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar } from 'lucide-react';
import { useSocialPlayEvents } from '@/hooks/useSocialPlayEvents';
import { formatDistanceToNow } from 'date-fns';

export const ActiveSocialPlayWidget = () => {
  const { events, isLoading } = useSocialPlayEvents();
  
  // Show recent events for Phase 1
  const recentEvents = events?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <Card className="border-purple-200 bg-purple-50/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Loading events...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentEvents.length === 0) {
    return null;
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600" />
          Recent Social Events
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {recentEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg p-3 border shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">{event.session_type === 'singles' ? 'Singles' : 'Doubles'} Event</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Created {formatDistanceToNow(new Date(event.created_at))} ago
                </div>
                {event.location && (
                  <p className="text-sm text-muted-foreground">📍 {event.location}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
