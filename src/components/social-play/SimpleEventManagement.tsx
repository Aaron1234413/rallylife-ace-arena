
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, Users, MapPin, Trash2, Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const SimpleEventManagement = () => {
  const { sessions, updateSessionStatus, isLoading } = useSocialPlaySessions();
  const { toast } = useToast();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const activeSessions = sessions.filter(session => 
    session.status === 'pending' || session.status === 'active'
  );

  const handleCancelSession = async (sessionId: string) => {
    setCancelingId(sessionId);
    
    try {
      updateSessionStatus({
        sessionId,
        status: 'cancelled',
        updates: {
          updated_at: new Date().toISOString()
        }
      });
      
      toast({
        title: 'Session Cancelled',
        description: 'Your social play session has been cancelled.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel session. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCancelingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Manage Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeSessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Manage Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active events to manage</p>
            <p className="text-sm">Create a new social play session to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Manage Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {activeSessions.map((session) => {
              const participantCount = session.participants?.length || 0;
              const maxParticipants = session.session_type === 'singles' ? 2 : 4;
              const isFull = participantCount >= maxParticipants;
              
              return (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium capitalize">
                          {session.session_type} Session
                        </h4>
                        <Badge 
                          variant={session.status === 'active' ? 'default' : 'secondary'}
                          className={session.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Created {format(new Date(session.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit (Coming Soon)
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Event
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Session?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel your {session.session_type} session. 
                                {participantCount > 0 && ` ${participantCount} participant(s) will be notified.`}
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Session</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleCancelSession(session.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={cancelingId === session.id}
                              >
                                {cancelingId === session.id ? 'Cancelling...' : 'Cancel Session'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{participantCount + 1}/{maxParticipants + 1} players</span>
                      {isFull && <Badge variant="secondary" className="text-xs">Full</Badge>}
                    </div>
                    
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{session.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {session.notes && (
                    <div className="text-sm text-muted-foreground italic mb-3">
                      "{session.notes}"
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Competitive Level: <span className="capitalize">{session.competitive_level}</span>
                    </div>
                    
                    {session.status === 'pending' && (
                      <Badge variant="outline" className="text-xs">
                        Ready to Start
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
