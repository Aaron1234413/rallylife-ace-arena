import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Target,
  X,
  Coins
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { useCourtBookings } from '@/hooks/useCourtBookings';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

interface MyClubBookingsProps {
  club: Club;
}

export function MyClubBookings({ club }: MyClubBookingsProps) {
  const { user } = useAuth();
  const { fetchUserBookings, cancelBooking } = useCourtBookings();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await fetchUserBookings(user.id);
        // Filter bookings for this specific club
        const clubBookings = data.filter((booking: any) => booking.club_courts.club_id === club.id);
        setBookings(clubBookings);
      } catch (error) {
        console.error('Error loading user bookings:', error);
        toast.error('Failed to load your bookings');
      } finally {
        setLoading(false);
      }
    };

    loadUserBookings();
  }, [user, club.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const isPastBooking = (startDateTime: string) => {
    return new Date(startDateTime) < new Date();
  };

  const canCancelBooking = (startDateTime: string, status: string) => {
    if (status === 'cancelled') return false;
    const bookingDateTime = new Date(startDateTime);
    const hoursUntilBooking = (bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursUntilBooking > 24; // Can cancel if more than 24 hours away
  };

  const getDurationInHours = (startDateTime: string, endDateTime: string) => {
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <h3 className="font-medium mb-2">Loading Your Bookings</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we fetch your court reservations...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">No Bookings Yet</h3>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t made any court bookings at this club.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-tennis-green-dark">My Court Bookings</h2>
        <p className="text-sm text-tennis-green-medium">
          View and manage your court reservations at {club.name}
        </p>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => {
          const duration = getDurationInHours(booking.start_datetime, booking.end_datetime);
          const totalCost = booking.payment_method === 'tokens' ? booking.total_cost_tokens : booking.total_cost_money;
          
          return (
            <Card key={booking.id} className={`transition-all ${isPastBooking(booking.start_datetime) ? 'opacity-75' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-lg">{booking.club_courts?.name || 'Court'}</h3>
                      {getStatusBadge(booking.status)}
                      {isPastBooking(booking.start_datetime) && (
                        <Badge variant="outline">Past</Badge>
                      )}
                    </div>
                    
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-tennis-green-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(booking.start_datetime), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(booking.start_datetime), 'HH:mm')} ({duration}h)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{booking.club_courts?.surface_type || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {booking.payment_method === 'tokens' ? (
                          <>
                            <Coins className="h-3 w-3" />
                            <span>{totalCost} tokens</span>
                          </>
                        ) : (
                          <>
                            <DollarSign className="h-3 w-3" />
                            <span>${totalCost}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-tennis-green-medium mt-2">
                      Booked {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                    </p>
                    
                    {booking.notes && (
                      <p className="text-xs text-tennis-green-medium mt-1 italic">
                        Note: {booking.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {canCancelBooking(booking.start_datetime, booking.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Booking Policy */}
      <Card className="bg-tennis-green-bg/30">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Booking Policy</h4>
          <ul className="text-sm text-tennis-green-medium space-y-1">
            <li>• Bookings can be cancelled up to 24 hours in advance</li>
            <li>• Late cancellations may incur a fee</li>
            <li>• Please arrive 10 minutes before your booking time</li>
            <li>• Court time includes setup and cleanup</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}