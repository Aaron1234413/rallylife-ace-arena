import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Users, 
  Clock, 
  Plus,
  Play,
  MapPin,
  Trophy
} from 'lucide-react';
import { CreateSessionDialog } from './CreateSessionDialog';

interface SessionManagementProps {
  clubId: string;
}

export function SessionManagement({ clubId }: SessionManagementProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Mock data for demonstration
  const upcomingSessions = [
    {
      id: '1',
      title: 'Mixed Doubles Tournament',
      type: 'tournament',
      organizer: 'John Smith',
      organizer_avatar: null,
      scheduled_date: '2025-01-15',
      start_time: '14:00',
      end_time: '17:00',
      participants_count: 8,
      max_participants: 16,
      location: 'Court 1 & 2',
      status: 'upcoming'
    },
    {
      id: '2',
      title: 'Beginner Group Lesson',
      type: 'lesson',
      organizer: 'Coach Sarah',
      organizer_avatar: null,
      scheduled_date: '2025-01-12',
      start_time: '10:00',
      end_time: '11:30',
      participants_count: 4,
      max_participants: 6,
      location: 'Court 3',
      status: 'upcoming'
    },
    {
      id: '3',
      title: 'Friday Social Play',
      type: 'social',
      organizer: 'Club Admin',
      organizer_avatar: null,
      scheduled_date: '2025-01-10',
      start_time: '18:00',
      end_time: '20:00',
      participants_count: 12,
      max_participants: 20,
      location: 'All Courts',
      status: 'upcoming'
    }
  ];

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return 'bg-red-100 text-red-800';
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'tournament': return Trophy;
      case 'lesson': return Users;
      case 'social': return Play;
      default: return Calendar;
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Calendar className="h-5 w-5 text-tennis-green-primary" />
              Club Sessions
            </CardTitle>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Session
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => {
                const IconComponent = getSessionIcon(session.type);
                return (
                  <div
                    key={session.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-tennis-green-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-tennis-green-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-tennis-green-dark">
                            {session.title}
                          </h3>
                          <p className="text-sm text-tennis-green-medium">
                            Organized by {session.organizer}
                          </p>
                        </div>
                        <Badge className={getSessionTypeColor(session.type)}>
                          {session.type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {session.scheduled_date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.start_time} - {session.end_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {session.location}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-tennis-green-medium" />
                          <span className="text-sm text-tennis-green-medium">
                            {session.participants_count}/{session.max_participants} participants
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          Join Session
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
              <p className="text-tennis-green-medium">
                No upcoming sessions
              </p>
              <p className="text-sm text-tennis-green-medium/70 mb-4">
                Be the first to create a session for your club!
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Session
              </Button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-tennis-green-bg/50">
            <div className="text-center">
              <div className="text-lg font-bold text-tennis-green-dark">3</div>
              <div className="text-xs text-tennis-green-medium">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-tennis-green-dark">24</div>
              <div className="text-xs text-tennis-green-medium">Total Participants</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-tennis-green-dark">42</div>
              <div className="text-xs text-tennis-green-medium">Available Spots</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CreateSessionDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        clubId={clubId}
      />
    </>
  );
}