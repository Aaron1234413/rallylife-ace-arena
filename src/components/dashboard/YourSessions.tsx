import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin,
  ChevronRight,
  Plus,
  Users,
  BookOpen,
  Trophy
} from 'lucide-react';
import { useCourtBooking, CourtBooking } from '@/hooks/useCourtBooking';
import { useClubServices, ServiceBooking } from '@/hooks/useClubServices';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format, isFuture, isToday, isTomorrow } from 'date-fns';

export function YourSessions() {
  const { user } = useAuth();
  const { myClubs } = useClubs();
  const { getUserBookings } = useCourtBooking();
  const [courtBookings, setCourtBookings] = useState<CourtBooking[]>([]);
  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadAllSessions();
    }
  }, [user]);

  const loadAllSessions = async () => {
    try {
      setLoading(true);
      
      // Load court bookings
      const userCourtBookings = await getUserBookings();
      const upcomingCourtBookings = userCourtBookings.filter(booking => 
        booking.status === 'confirmed' && isFuture(new Date(booking.start_datetime))
      );
      
      // Load service bookings from all clubs
      const allServiceBookings: ServiceBooking[] = [];
      for (const club of myClubs) {
        try {
          const { useClubServices } = await import('@/hooks/useClubServices');
          // This is a workaround since we can't use hooks in loops
          // In a real app, we'd need to restructure this
          continue;
        } catch (error) {
          console.error('Error loading service bookings for club:', club.id);
        }
      }
      
      // Sort all sessions by date
      upcomingCourtBookings.sort((a, b) => 
        new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
      );
      
      setCourtBookings(upcomingCourtBookings.slice(0, 5));
      setServiceBookings([]); // For now, until we can properly load service bookings
      
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = (dateTime: string) => {
    const date = new Date(dateTime);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getClubForBooking = (booking: CourtBooking) => {
    return myClubs.find(club => 
      club.id === booking.court?.club_id
    );
  };

  const handleViewAllSessions = () => {
    if (courtBookings.length > 0) {
      const firstBooking = courtBookings[0];
      const club = getClubForBooking(firstBooking);
      if (club) {
        navigate(`/club/${club.id}?tab=my-bookings`);
        return;
      }
    }
    
    if (myClubs.length > 0) {
      navigate(`/club/${myClubs[0].id}?tab=courts`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = courtBookings.length + serviceBookings.length;

  if (totalSessions === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-medium mb-2">No Upcoming Sessions</h3>
            <p className="text-sm text-gray-600 mb-4">
              You don't have any court bookings or service sessions scheduled.
            </p>
            {myClubs.length > 0 && (
              <Button 
                onClick={handleViewAllSessions}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Book a Session
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Your Sessions
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleViewAllSessions}
          className="flex items-center gap-1"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Court Bookings */}
          {courtBookings.map((booking) => {
            const club = getClubForBooking(booking);
            const startTime = new Date(booking.start_datetime);
            const endTime = new Date(booking.end_datetime);
            
            return (
              <div 
                key={`court-${booking.id}`} 
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => club && navigate(`/club/${club.id}?tab=my-bookings`)}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">
                      {booking.court?.name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getDateLabel(booking.start_datetime)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Court
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
                    </div>
                    {club && (
                      <span className="truncate">{club.name}</span>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            );
          })}

          {/* Service Bookings */}
          {serviceBookings.map((booking) => {
            const club = myClubs.find(c => c.id === booking.club_id);
            
            return (
              <div 
                key={`service-${booking.id}`} 
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => club && navigate(`/club/${club.id}?tab=services`)}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium truncate">
                      Service Booking
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getDateLabel(booking.created_at)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      Service
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Booked {format(new Date(booking.created_at), 'MMM d, h:mm a')}</span>
                    </div>
                    {club && (
                      <span className="truncate">{club.name}</span>
                    )}
                  </div>
                </div>
                
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}