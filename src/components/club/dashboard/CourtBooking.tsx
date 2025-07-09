import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar as CalendarIcon,
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { BookCourtDialog } from './BookCourtDialog';
import { supabase } from '@/integrations/supabase/client';

interface CourtBookingProps {
  clubId: string;
}

export function CourtBooking({ clubId }: CourtBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [courts, setCourts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchCourts();
    fetchBookings();
  }, [clubId, selectedDate]);

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('club_courts')
        .select('*')
        .eq('club_id', clubId)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCourts(data || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
      setCourts([]);
    }
  };

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('club_court_bookings')
        .select(`
          *,
          court:club_courts(name),
          user:profiles(full_name)
        `)
        .eq('club_id', clubId)
        .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
        .order('start_time');

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  const isSlotBooked = (courtId: string, time: string) => {
    return bookings.some(booking => {
      if (booking.court_id !== courtId) return false;
      const startTime = booking.start_time.slice(0, 5); // Extract HH:MM
      const endTime = booking.end_time.slice(0, 5);
      return time >= startTime && time < endTime;
    });
  };

  const getBookingInfo = (courtId: string, time: string) => {
    return bookings.find(booking => 
      booking.court_id === courtId && 
      booking.start_time.slice(0, 5) === time
    );
  };

  const handleBookCourt = (courtId: string, time: string) => {
    setSelectedCourt(courtId);
    setShowBookDialog(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <CalendarIcon className="h-5 w-5 text-tennis-green-primary" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
              className="rounded-md border pointer-events-auto"
            />
          </CardContent>
        </Card>

        {/* Court Availability */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                <MapPin className="h-5 w-5 text-tennis-green-primary" />
                Court Availability - {format(selectedDate, 'EEEE, MMM d')}
              </CardTitle>
              <Badge variant="outline" className="text-tennis-green-medium">
                {courts.length} courts available
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Court Information */}
            <div className="grid gap-4 sm:grid-cols-3">
              {courts.map((court) => (
                <div key={court.id} className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-tennis-green-dark">{court.name}</h3>
                    <p className="text-sm text-tennis-green-medium capitalize">{court.surface_type.replace('_', ' ')}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-4 w-4 text-tennis-green-medium" />
                      <span className="text-tennis-green-medium">{court.hourly_rate_tokens} tokens/hour</span>
                      {court.hourly_rate_money > 0 && (
                        <span className="text-tennis-green-medium">or ${court.hourly_rate_money}/hour</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slot Grid */}
            <div className="space-y-4">
              <h3 className="font-semibold text-tennis-green-dark">Available Time Slots</h3>
              
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header */}
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    <div className="font-medium text-sm text-tennis-green-dark">Time</div>
                    {courts.map((court) => (
                      <div key={court.id} className="font-medium text-sm text-tennis-green-dark text-center">
                        {court.name}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="space-y-1">
                    {timeSlots.map((time) => (
                      <div key={time} className="grid grid-cols-4 gap-2">
                        <div className="flex items-center text-sm font-medium text-tennis-green-dark py-2">
                          {time}
                        </div>
                        {courts.map((court) => {
                          const isBooked = isSlotBooked(court.id, time);
                          const bookingInfo = getBookingInfo(court.id, time);
                          const isMyBooking = bookingInfo?.user_id === bookingInfo?.user_id; // Would need auth context

                          return (
                            <div key={`${court.id}-${time}`} className="h-10">
                              {isBooked ? (
                                <div
                                  className={`h-full rounded px-2 py-1 text-xs flex items-center justify-center ${
                                    isMyBooking
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-red-100 text-red-800 border border-red-200'
                                  }`}
                                >
                                  {isMyBooking ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <AlertCircle className="h-3 w-3" />
                                  )}
                                </div>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-full w-full text-xs hover:bg-tennis-green-primary hover:text-white"
                                  onClick={() => handleBookCourt(court.id, time)}
                                >
                                  Book
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 pt-4 border-t border-tennis-green-bg/50">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                <span className="text-xs text-tennis-green-medium">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                  <CheckCircle className="h-2 w-2 text-blue-800" />
                </div>
                <span className="text-xs text-tennis-green-medium">Your Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center">
                  <AlertCircle className="h-2 w-2 text-red-800" />
                </div>
                <span className="text-xs text-tennis-green-medium">Booked</span>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      <BookCourtDialog
        open={showBookDialog}
        onOpenChange={setShowBookDialog}
        courtId={selectedCourt}
        date={selectedDate}
        courts={courts}
      />
    </>
  );
}