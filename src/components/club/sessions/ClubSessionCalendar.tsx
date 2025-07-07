import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isToday } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  ChevronLeft, 
  ChevronRight,
  Clock,
  Target,
  GraduationCap,
  Users,
  MapPin,
  User,
  Trophy,
  MoreHorizontal
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { useClubSessions, ClubSession } from '@/hooks/useClubSessions';
import { cn } from '@/lib/utils';

interface ClubSessionCalendarProps {
  club: Club;
}

type CalendarView = 'week' | 'day';

export function ClubSessionCalendar({ club }: ClubSessionCalendarProps) {
  const { sessions, getSessionsForDate } = useClubSessions(club.id);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [selectedSession, setSelectedSession] = useState<ClubSession | null>(null);
  const [showSessionDetails, setShowSessionDetails] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6; // Start from 6 AM
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'court_booking':
        return <Target className="h-3 w-3" />;
      case 'coaching':
        return <GraduationCap className="h-3 w-3" />;
      case 'group_training':
        return <Users className="h-3 w-3" />;
      case 'tournament':
        return <Trophy className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'court_booking':
        return 'bg-blue-500';
      case 'coaching':
        return 'bg-green-500';
      case 'group_training':
        return 'bg-purple-500';
      case 'tournament':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="text-xs">Scheduled</Badge>;
      case 'confirmed':
        return <Badge className="text-xs bg-green-100 text-green-800">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
      case 'completed':
        return <Badge className="text-xs bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const handleSessionClick = (session: ClubSession) => {
    setSelectedSession(session);
    setShowSessionDetails(true);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const renderWeekView = () => (
    <div className="grid grid-cols-8 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {/* Time column header */}
      <div className="bg-tennis-green-bg/30 p-2">
        <p className="text-xs font-medium text-center">Time</p>
      </div>
      
      {/* Day headers */}
      {weekDays.map((day) => (
        <div key={day.toISOString()} className={cn(
          "bg-tennis-green-bg/30 p-2",
          isToday(day) && "bg-tennis-green-primary/20"
        )}>
          <p className="text-xs font-medium text-center">
            {format(day, 'EEE')}
          </p>
          <p className={cn(
            "text-lg font-bold text-center",
            isToday(day) ? "text-tennis-green-primary" : "text-tennis-green-dark"
          )}>
            {format(day, 'd')}
          </p>
        </div>
      ))}
      
      {/* Time slots and sessions */}
      {timeSlots.map((timeSlot) => (
        <React.Fragment key={timeSlot}>
          {/* Time label */}
          <div className="bg-white p-2 border-r">
            <p className="text-xs text-tennis-green-medium font-medium">{timeSlot}</p>
          </div>
          
          {/* Day columns */}
          {weekDays.map((day) => {
            const daySessions = getSessionsForDate(day).filter(session => {
              const sessionTime = format(new Date(session.start_datetime), 'HH:mm');
              return sessionTime === timeSlot;
            });

            return (
              <div key={`${day.toISOString()}-${timeSlot}`} className="bg-white p-1 min-h-[60px] relative">
                {daySessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionClick(session)}
                    className={cn(
                      "absolute inset-1 rounded p-1 cursor-pointer hover:opacity-80 transition-opacity",
                      getSessionTypeColor(session.session_type),
                      "text-white text-xs"
                    )}
                    style={{
                      height: `${parseFloat(format(new Date(session.end_datetime).getTime() - new Date(session.start_datetime).getTime(), 'H')) * 60}px`,
                      minHeight: '40px'
                    }}
                  >
                    <div className="flex items-start gap-1">
                      {getSessionTypeIcon(session.session_type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{session.title}</p>
                        <p className="text-xs opacity-80">
                          {format(new Date(session.start_datetime), 'HH:mm')} - 
                          {format(new Date(session.end_datetime), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );

  const renderDayView = () => {
    const daySessions = getSessionsForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h3>
        </div>
        
        <div className="grid gap-2">
          {timeSlots.map((timeSlot) => {
            const slotSessions = daySessions.filter(session => {
              const sessionTime = format(new Date(session.start_datetime), 'HH:mm');
              return sessionTime === timeSlot;
            });

            return (
              <div key={timeSlot} className="grid grid-cols-[80px_1fr] gap-4 p-2 border-b">
                <div className="text-sm font-medium text-tennis-green-medium">
                  {timeSlot}
                </div>
                <div className="space-y-2">
                  {slotSessions.length > 0 ? (
                    slotSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleSessionClick(session)}
                        className="p-3 rounded-lg border hover:bg-tennis-green-bg/30 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "p-1 rounded",
                              getSessionTypeColor(session.session_type)
                            )}>
                              {getSessionTypeIcon(session.session_type)}
                            </div>
                            <div>
                              <p className="font-medium">{session.title}</p>
                              <p className="text-sm text-tennis-green-medium">
                                {format(new Date(session.start_datetime), 'HH:mm')} - 
                                {format(new Date(session.end_datetime), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(session.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-tennis-green-medium/50 text-sm italic">
                      No sessions scheduled
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-tennis-green-dark">Session Calendar</h2>
          <p className="text-sm text-tennis-green-medium">
            {view === 'week' 
              ? `Week of ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
              : format(currentDate, 'MMMM d, yyyy')
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={(value: CalendarView) => setView(value)}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => view === 'week' ? navigateWeek('prev') : setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => view === 'week' ? navigateWeek('next') : setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <Card>
        <CardContent className="p-4">
          {view === 'week' ? renderWeekView() : renderDayView()}
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      <Dialog open={showSessionDetails} onOpenChange={setShowSessionDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedSession && getSessionTypeIcon(selectedSession.session_type)}
              Session Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedSession.title}</h3>
                {selectedSession.description && (
                  <p className="text-tennis-green-medium mt-1">{selectedSession.description}</p>
                )}
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-tennis-green-medium" />
                  <span className="text-sm">
                    {format(new Date(selectedSession.start_datetime), 'PPP p')} - 
                    {format(new Date(selectedSession.end_datetime), 'p')}
                  </span>
                </div>
                
                {selectedSession.court_id && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-tennis-green-medium" />
                    <span className="text-sm">Court {selectedSession.court_id.slice(-1)}</span>
                  </div>
                )}
                
                {selectedSession.coach_id && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-tennis-green-medium" />
                    <span className="text-sm">Coach Session</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-tennis-green-medium" />
                  <span className="text-sm">
                    {selectedSession.participants.length}
                    {selectedSession.max_participants && ` / ${selectedSession.max_participants}`} participants
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t">
                {getStatusBadge(selectedSession.status)}
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {selectedSession.payment_method === 'tokens' 
                      ? `${selectedSession.cost_tokens} tokens`
                      : `$${selectedSession.cost_money}`
                    }
                  </p>
                  <p className="text-xs text-tennis-green-medium">
                    {selectedSession.payment_status}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Session Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs">Court Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-xs">Coaching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span className="text-xs">Group Training</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-xs">Tournament</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}