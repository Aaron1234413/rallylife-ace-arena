import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Target,
  X
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { formatDistanceToNow } from 'date-fns';

interface MyClubBookingsProps {
  club: Club;
}

export function MyClubBookings({ club }: MyClubBookingsProps) {
  // Mock bookings data
  const bookings = [
    {
      id: '1',
      court: 'Court 1',
      date: '2024-07-05',
      time: '14:00',
      duration: 2,
      status: 'confirmed',
      cost: 50,
      surface: 'Hard Court',
      bookedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      court: 'Court 2',
      date: '2024-07-07',
      time: '10:00',
      duration: 1,
      status: 'confirmed',
      cost: 30,
      surface: 'Clay Court',
      bookedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      court: 'Court 4',
      date: '2024-07-10',
      time: '16:00',
      duration: 1.5,
      status: 'pending',
      cost: 52.5,
      surface: 'Grass Court',
      bookedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
    }
  ];

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

  const handleCancelBooking = (bookingId: string) => {
    // Mock cancel functionality
    console.log('Cancelling booking:', bookingId);
  };

  const isPastBooking = (date: string, time: string) => {
    const bookingDateTime = new Date(`${date}T${time}`);
    return bookingDateTime < new Date();
  };

  const canCancelBooking = (date: string, time: string, status: string) => {
    if (status === 'cancelled') return false;
    const bookingDateTime = new Date(`${date}T${time}`);
    const hoursUntilBooking = (bookingDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return hoursUntilBooking > 24; // Can cancel if more than 24 hours away
  };

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
        {bookings.map((booking) => (
          <Card key={booking.id} className={`transition-all ${isPastBooking(booking.date, booking.time) ? 'opacity-75' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg">{booking.court}</h3>
                    {getStatusBadge(booking.status)}
                    {isPastBooking(booking.date, booking.time) && (
                      <Badge variant="outline">Past</Badge>
                    )}
                  </div>
                  
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-tennis-green-medium">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(booking.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{booking.time} ({booking.duration}h)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{booking.surface}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>${booking.cost}</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-tennis-green-medium mt-2">
                    Booked {formatDistanceToNow(booking.bookedAt, { addSuffix: true })}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {canCancelBooking(booking.date, booking.time, booking.status) && (
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
        ))}
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