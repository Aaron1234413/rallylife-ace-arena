import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useCourtBooking, CourtBooking } from '@/hooks/useCourtBooking';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format, isFuture, isToday, isTomorrow } from 'date-fns';

export function UpcomingCourtBookings() {
  const { user } = useAuth();
  const { myClubs } = useClubs();
  const { getUserBookings } = useCourtBooking();
  const [bookings, setBookings] = useState<CourtBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const userBookings = await getUserBookings();
      // Filter for upcoming bookings only
      const upcoming = userBookings.filter(booking => 
        booking.status === 'confirmed' && isFuture(new Date(booking.start_datetime))
      );
      // Sort by start time
      upcoming.sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime());
      setBookings(upcoming.slice(0, 3)); // Show only next 3 bookings
    } catch (error) {
      console.error('Error loading user bookings:', error);
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
    // Find the club that contains this court
    return myClubs.find(club => 
      club.id === booking.court?.club_id
    );
  };

  const handleViewAllBookings = () => {
    // Navigate to the first club with bookings, or just the first club
    if (bookings.length > 0) {
      const firstBooking = bookings[0];
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
            Upcoming Court Bookings
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

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Court Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-medium mb-2">No Upcoming Bookings</h3>
            <p className="text-sm text-gray-600 mb-4">
              You don't have any court bookings scheduled.
            </p>
            {myClubs.length > 0 && (
              <Button 
                onClick={handleViewAllBookings}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Book a Court
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
          Upcoming Court Bookings
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleViewAllBookings}
          className="flex items-center gap-1"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.map((booking) => {
            const club = getClubForBooking(booking);
            const startTime = new Date(booking.start_datetime);
            const endTime = new Date(booking.end_datetime);
            
            return (
              <div 
                key={booking.id} 
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
        </div>
      </CardContent>
    </Card>
  );
}