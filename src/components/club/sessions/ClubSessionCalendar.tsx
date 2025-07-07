import React, { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Users,
  Settings,
  Filter,
  Plus
} from 'lucide-react';
import { useClubSessions, ClubSession } from '@/hooks/useClubSessions';
import { useClubCourts } from '@/hooks/useClubCourts';
import { CreateClubSession } from './CreateClubSession';
import { SessionCancellation } from './SessionCancellation';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

interface ClubSessionCalendarProps {
  clubId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ClubSession;
}

export function ClubSessionCalendar({ clubId }: ClubSessionCalendarProps) {
  const { sessions, loading, refetch, cancelSession } = useClubSessions(clubId);
  const { courts } = useClubCourts(clubId);
  const [view, setView] = useState<'month' | 'week' | 'day'>('week');
  const [selectedEvent, setSelectedEvent] = useState<ClubSession | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [filters, setFilters] = useState({
    sessionType: 'all',
    status: 'active',
    court: 'all'
  });

  // Convert sessions to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return sessions
      .filter(session => {
        // Apply filters
        if (filters.sessionType !== 'all' && session.session_type !== filters.sessionType) {
          return false;
        }
        if (filters.status === 'active' && session.status === 'cancelled') {
          return false;
        }
        if (filters.court !== 'all' && session.court_id !== filters.court) {
          return false;
        }
        return true;
      })
      .map(session => ({
        id: session.id,
        title: session.title,
        start: new Date(session.start_datetime),
        end: new Date(session.end_datetime),
        resource: session
      }));
  }, [sessions, filters]);

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    const session = event.resource;
    const court = courts.find(c => c.id === session.court_id);
    
    return (
      <div className="p-1 text-xs">
        <div className="font-medium truncate">{session.title}</div>
        {court && (
          <div className="text-tennis-green-medium truncate">{court.name}</div>
        )}
        <div className="flex items-center gap-1 mt-1">
          <Badge 
            variant={session.status === 'confirmed' ? 'default' : 'secondary'}
            className="text-xs px-1 py-0"
          >
            {session.status}
          </Badge>
        </div>
      </div>
    );
  };

  // Event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    const session = event.resource;
    let backgroundColor = '#0D4F3C'; // tennis-green-primary
    let borderColor = '#0D4F3C';
    
    switch (session.session_type) {
      case 'coaching':
        backgroundColor = '#1E40AF'; // blue
        borderColor = '#1E40AF';
        break;
      case 'group_training':
        backgroundColor = '#7C2D12'; // orange
        borderColor = '#7C2D12';
        break;
      case 'tournament':
        backgroundColor = '#B91C1C'; // red
        borderColor = '#B91C1C';
        break;
    }

    if (session.status === 'cancelled') {
      backgroundColor = '#6B7280'; // gray
      borderColor = '#6B7280';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px'
      }
    };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    // Open create dialog with pre-selected time
    setShowCreateDialog(true);
  };

  const handleCancelSession = async (sessionId: string, reason?: string) => {
    await cancelSession(sessionId, reason);
    setShowCancelDialog(false);
    setSelectedEvent(null);
    refetch();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary mx-auto"></div>
          <p className="mt-4 text-tennis-green-medium">Loading calendar...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-tennis-green-dark">Session Calendar</h2>
          <p className="text-tennis-green-medium">Manage your club sessions and bookings</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>

      {/* View Controls & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* View Buttons */}
            <div className="flex gap-2">
              {(['month', 'week', 'day'] as const).map(viewType => (
                <Button
                  key={viewType}
                  variant={view === viewType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView(viewType)}
                >
                  {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
                </Button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-2 items-center">
              <Filter className="h-4 w-4 text-tennis-green-medium" />
              
              <select
                value={filters.sessionType}
                onChange={(e) => setFilters(prev => ({ ...prev, sessionType: e.target.value }))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Types</option>
                <option value="court_booking">Court Booking</option>
                <option value="coaching">Coaching</option>
                <option value="group_training">Group Training</option>
                <option value="tournament">Tournament</option>
              </select>

              <select
                value={filters.court}
                onChange={(e) => setFilters(prev => ({ ...prev, court: e.target.value }))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Courts</option>
                {courts.map(court => (
                  <option key={court.id} value={court.id}>{court.name}</option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="active">Active Only</option>
                <option value="all">All Status</option>
                <option value="cancelled">Cancelled Only</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              eventPropGetter={eventStyleGetter}
              components={{
                event: EventComponent,
              }}
              step={30}
              timeslots={2}
              min={new Date(2000, 0, 1, 6, 0, 0)} // 6 AM
              max={new Date(2000, 0, 1, 22, 0, 0)} // 10 PM
              formats={{
                timeGutterFormat: 'HH:mm',
                eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
                  `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Session Types</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-tennis-green-primary rounded"></div>
              <span className="text-sm">Court Booking</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm">Coaching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
              <span className="text-sm">Group Training</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span className="text-sm">Tournament</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm">Cancelled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      {selectedEvent && (
        <SessionDetailsModal 
          session={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onCancel={() => setShowCancelDialog(true)}
        />
      )}

      {/* Create Session Dialog */}
      <CreateClubSession
        clubId={clubId}
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          refetch();
          setShowCreateDialog(false);
        }}
      />

      {/* Cancel Session Dialog */}
      <SessionCancellation
        session={selectedEvent}
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelSession}
      />
    </div>
  );
}

// Session Details Modal Component
interface SessionDetailsModalProps {
  session: ClubSession;
  onClose: () => void;
  onCancel: () => void;
}

function SessionDetailsModal({ session, onClose, onCancel }: SessionDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{session.title}</h3>
            {session.description && (
              <p className="text-tennis-green-medium mt-1">{session.description}</p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-tennis-green-medium" />
              <span className="text-sm">
                {format(new Date(session.start_datetime), 'PPP p')} - 
                {format(new Date(session.end_datetime), 'p')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="capitalize">{session.session_type.replace('_', ' ')}</Badge>
              <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                {session.status}
              </Badge>
            </div>

            {session.cost_tokens > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm">Cost: {session.cost_tokens} tokens</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {session.status !== 'cancelled' && (
              <Button 
                variant="destructive" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}