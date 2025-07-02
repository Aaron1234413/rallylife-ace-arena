import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useCourtBooking, Court, CourtBooking } from '@/hooks/useCourtBooking';
import { useAuth } from '@/hooks/useAuth';
import { format, addDays, startOfDay, isToday, isTomorrow } from 'date-fns';
import { BookingDialog } from './BookingDialog';
import { toast } from 'sonner';

interface ClubCourtBookingProps {
  club: any;
  canBook: boolean;
}

export function ClubCourtBooking({ club, canBook }: ClubCourtBookingProps) {
  const { user } = useAuth();
  const { courts, bookings, loading, fetchCourts, fetchBookings } = useCourtBooking();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (club?.id) {
      loadData();
    }
  }, [club?.id]);

  const loadData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchCourts(club.id),
        fetchBookings({ clubId: club.id })
      ]);
    } catch (error) {
      console.error('Error loading court data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const activeCourts = courts.filter(court => court.is_active);

  const getBookingsForDate = (date: Date, courtId: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(booking => 
      booking.court_id === courtId &&
      booking.start_datetime.startsWith(dateStr) &&
      booking.status === 'confirmed'
    );
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const isSlotBooked = (courtId: string, timeSlot: string) => {
    const dateBookings = getBookingsForDate(selectedDate, courtId);
    const slotDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${timeSlot}:00`;
    
    return dateBookings.some(booking => {
      const bookingStart = booking.start_datetime;
      const bookingEnd = booking.end_datetime;
      return slotDateTime >= bookingStart && slotDateTime < bookingEnd;
    });
  };

  const handleTimeSlotClick = (court: Court, timeSlot: string) => {
    if (!canBook) {
      toast.error('You must be a club member to book courts');
      return;
    }

    if (isSlotBooked(court.id, timeSlot)) {
      toast.error('This time slot is already booked');
      return;
    }

    setSelectedCourt(court);
    setSelectedTimeSlot(timeSlot);
    setShowBookingDialog(true);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  if (loading && courts.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (activeCourts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">No Courts Available</h3>
          <p className="text-sm text-muted-foreground">
            This club hasn't set up any courts for booking yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Court Bookings</h2>
          <p className="text-muted-foreground">
            Book courts for {club.name}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadData}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {Array.from({ length: 14 }, (_, i) => {
              const date = addDays(new Date(), i);
              return (
                <Button
                  key={i}
                  variant={format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') ? "default" : "outline"}
                  onClick={() => setSelectedDate(date)}
                  className="flex-shrink-0"
                  size="sm"
                >
                  <div className="text-center">
                    <div className="font-medium">{getDateLabel(date)}</div>
                    <div className="text-xs">{format(date, 'EEE')}</div>
                  </div>
                </Button>
              );
            })}
          </div>
          <div className="text-sm text-gray-600">
            Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </div>
        </CardContent>
      </Card>

      {/* Court Availability Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Time Slots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Time headers */}
              <div className="grid grid-cols-[150px_repeat(14,1fr)] gap-1 mb-2">
                <div className="font-medium text-sm p-2">Court</div>
                {timeSlots.map(slot => (
                  <div key={slot} className="font-medium text-xs p-1 text-center">
                    {slot}
                  </div>
                ))}
              </div>

              {/* Court rows */}
              {activeCourts.map(court => (
                <div key={court.id} className="grid grid-cols-[150px_repeat(14,1fr)] gap-1 mb-1">
                  <div className="p-2 bg-gray-50 rounded flex flex-col justify-center">
                    <div className="font-medium text-sm">{court.name}</div>
                    <div className="text-xs text-gray-600 capitalize">{court.surface_type}</div>
                  </div>
                  
                  {timeSlots.map(slot => {
                    const isBooked = isSlotBooked(court.id, slot);
                    return (
                      <button
                        key={slot}
                        onClick={() => handleTimeSlotClick(court, slot)}
                        disabled={isBooked || !canBook}
                        className={`
                          h-10 rounded text-xs font-medium transition-colors
                          ${isBooked 
                            ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                            : canBook 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                          }
                        `}
                      >
                        {isBooked ? 'Booked' : 'Available'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span>Booked</span>
            </div>
            {!canBook && (
              <div className="text-amber-600">
                You must be a club member to book courts
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      {selectedCourt && selectedTimeSlot && (
        <BookingDialog
          open={showBookingDialog}
          onOpenChange={setShowBookingDialog}
          court={selectedCourt}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          onBookingComplete={loadData}
        />
      )}
    </div>
  );
}