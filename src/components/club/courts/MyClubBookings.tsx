import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin,
  RefreshCw,
  X,
  DollarSign,
  Coins
} from 'lucide-react';
import { useCourtBooking, CourtBooking } from '@/hooks/useCourtBooking';
import { useAuth } from '@/hooks/useAuth';
import { format, isFuture, isPast, isToday } from 'date-fns';
import { toast } from 'sonner';

interface MyClubBookingsProps {
  club: any;
}

export function MyClubBookings({ club }: MyClubBookingsProps) {
  const { user } = useAuth();
  const { bookings, loading, fetchBookings, cancelBooking } = useCourtBooking();
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    if (club?.id && user?.id) {
      loadBookings();
    }
  }, [club?.id, user?.id]);

  const loadBookings = async () => {
    setRefreshing(true);
    try {
      await fetchBookings({ clubId: club.id, playerId: user?.id });
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancelBooking = async (booking: CourtBooking) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setCancelling(booking.id);
    try {
      await cancelBooking(booking.id);
      toast.success('Booking cancelled successfully');
      await loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const getBookingStatus = (booking: CourtBooking) => {
    const startTime = new Date(booking.start_datetime);
    const now = new Date();
    
    if (booking.status === 'cancelled') {
      return { label: 'Cancelled', variant: 'secondary' as const };
    }
    
    if (isPast(startTime)) {
      return { label: 'Completed', variant: 'default' as const };
    }
    
    if (isToday(startTime)) {
      return { label: 'Today', variant: 'default' as const };
    }
    
    return { label: 'Upcoming', variant: 'outline' as const };
  };

  const canCancelBooking = (booking: CourtBooking) => {
    return booking.status === 'confirmed' && isFuture(new Date(booking.start_datetime));
  };

  const userBookings = bookings.filter(booking => booking.player_id === user?.id);
  const upcomingBookings = userBookings.filter(booking => 
    booking.status === 'confirmed' && isFuture(new Date(booking.start_datetime))
  );
  const pastBookings = userBookings.filter(booking => 
    booking.status === 'completed' || isPast(new Date(booking.start_datetime))
  );
  const cancelledBookings = userBookings.filter(booking => booking.status === 'cancelled');

  if (loading && bookings.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  const BookingCard = ({ booking }: { booking: CourtBooking }) => {
    const status = getBookingStatus(booking);
    const startTime = new Date(booking.start_datetime);
    const endTime = new Date(booking.end_datetime);
    
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{booking.court?.name}</span>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{format(startTime, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                {booking.total_cost_tokens > 0 && (
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span>{booking.total_cost_tokens} tokens</span>
                  </div>
                )}
                {booking.total_cost_money > 0 && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>${booking.total_cost_money}</span>
                  </div>
                )}
              </div>
              
              {booking.notes && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {booking.notes}
                </p>
              )}
            </div>
            
            {canCancelBooking(booking) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCancelBooking(booking)}
                disabled={cancelling === booking.id}
                className="text-red-600 hover:text-red-700"
              >
                {cancelling === booking.id ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          <p className="text-muted-foreground">
            Your court bookings at {club.name}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadBookings}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {userBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">No Bookings Yet</h3>
            <p className="text-sm text-muted-foreground">
              You haven't made any court bookings at this club yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Upcoming Bookings</h3>
              <div className="space-y-3">
                {upcomingBookings.map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Past Bookings</h3>
              <div className="space-y-3">
                {pastBookings.slice(0, 5).map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
              {pastBookings.length > 5 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing 5 most recent past bookings
                </p>
              )}
            </div>
          )}

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Cancelled Bookings</h3>
              <div className="space-y-3">
                {cancelledBookings.slice(0, 3).map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
              {cancelledBookings.length > 3 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing 3 most recent cancelled bookings
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}