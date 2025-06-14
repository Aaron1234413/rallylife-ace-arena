
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, User, MapPin, CheckCircle, X } from 'lucide-react';
import { useLessonSessions, useUpdateLessonSession } from '@/hooks/useLessonSessions';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function LessonsList() {
  const { data: sessions, isLoading } = useLessonSessions();
  const { user } = useAuth();
  const updateSession = useUpdateLessonSession();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (sessionId: string, newStatus: string) => {
    try {
      await updateSession.mutateAsync({
        sessionId,
        updates: { 
          status: newStatus,
          ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {})
        }
      });
      
      toast.success(`Lesson ${newStatus} successfully!`);
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update lesson status');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading lessons...</p>
        </CardContent>
      </Card>
    );
  }

  const upcomingSessions = sessions?.filter(s => 
    s.status === 'scheduled' && new Date(s.scheduled_date) > new Date()
  ) || [];
  
  const pastSessions = sessions?.filter(s => 
    s.status === 'completed' || new Date(s.scheduled_date) <= new Date()
  ) || [];

  return (
    <div className="space-y-6">
      {/* Upcoming Lessons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Upcoming Lessons</h3>
              <p className="text-muted-foreground">
                Schedule a lesson to see it here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{session.title}</h3>
                          <Badge className={getStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            {format(new Date(session.scheduled_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(session.scheduled_date), 'HH:mm')} 
                            ({session.duration_minutes}m)
                          </div>
                          {session.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {session.location}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4" />
                          {user?.id === session.coach_id ? (
                            <span>Student: {session.player_profile?.full_name}</span>
                          ) : (
                            <span>Coach: {session.coach_profile?.full_name}</span>
                          )}
                        </div>

                        {session.description && (
                          <p className="text-sm text-muted-foreground">{session.description}</p>
                        )}

                        {session.skills_focus && session.skills_focus.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {session.skills_focus.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {session.total_cost && (
                          <p className="text-sm font-medium">
                            Cost: ${session.total_cost.toFixed(2)}
                          </p>
                        )}
                      </div>

                      {/* Action buttons for coach */}
                      {user?.id === session.coach_id && session.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(session.id, 'completed')}
                            disabled={updateSession.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(session.id, 'cancelled')}
                            disabled={updateSession.isPending}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Lessons */}
      {pastSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Lessons ({pastSessions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <h4 className="font-medium">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(session.scheduled_date), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
