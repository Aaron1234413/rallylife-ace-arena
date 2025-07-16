import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Info
} from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { BookCourtDialog } from './BookCourtDialog';
import { supabase } from '@/integrations/supabase/client';
import { getAvailableTimeSlots, validateBookingTime } from '@/utils/operatingHoursValidation';
import { AvailableServicesWidget } from '../services/AvailableServicesWidget';
import { useClubCourts } from '@/hooks/useClubCourts';
import { useAuth } from '@/hooks/useAuth';
import { EmptyCourtState } from '../courts/EmptyCourtState';
import { InteractiveTimeGrid } from '../courts/InteractiveTimeGrid';

interface CourtBookingProps {
  clubId: string;
  isOwner?: boolean;
  onNavigateToSettings?: () => void;
}

interface Club {
  id: string;
  operating_hours?: any;
}

export function CourtBooking({ clubId, isOwner = false, onNavigateToSettings }: CourtBookingProps) {
  const { user } = useAuth();
  const { courts, loading: courtsLoading } = useClubCourts(clubId);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showBookDialog, setShowBookDialog] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [club, setClub] = useState<Club | null>(null);

  useEffect(() => {
    fetchClub();
    fetchBookings();
  }, [clubId, selectedDate]);

  const fetchClub = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, operating_hours')
        .eq('id', clubId)
        .single();

      if (error) throw error;
      setClub(data);
    } catch (error) {
      console.error('Error fetching club:', error);
    }
  };

  // Remove fetchCourts function - now using useClubCourts hook

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('club_court_bookings')
        .select(`
          *,
          court:club_courts(name)
        `)
        .eq('club_id', clubId)
        .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
        .order('start_time');

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
      toast.error('Failed to load bookings');
    }
  };

  // Generate time slots based on operating hours
  const timeSlots = React.useMemo(() => {
    if (!club?.operating_hours) {
      // Fallback to default slots
      return [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00'
      ];
    }

    const availableSlots = getAvailableTimeSlots(selectedDate, club.operating_hours);
    return availableSlots.map(slot => slot.split('-')[0]); // Get start times only
  }, [club?.operating_hours, selectedDate]);

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

  const calculatePricing = (courtId: string, duration: number = 1) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return { baseAmount: 0, convenienceFee: 0, totalAmount: 0 };
    
    const baseAmount = Math.round(court.hourly_rate_money * duration * 100); // Convert to cents
    const convenienceFee = Math.round(baseAmount * 0.05); // 5% RAKO fee
    const totalAmount = baseAmount + convenienceFee;
    
    return { baseAmount, convenienceFee, totalAmount };
  };

  const handleBookCourt = (courtId: string, time: string, duration: number = 1) => {
    // Validate booking time against operating hours
    if (club?.operating_hours) {
      const endTime = `${parseInt(time.split(':')[0]) + duration}:${time.split(':')[1]}`;
      const validation = validateBookingTime(selectedDate, time, endTime, club.operating_hours);
      
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }
    
    setSelectedCourt(courtId);
    setSelectedTime(time);
    setSelectedDuration(duration);
    setShowBookDialog(true);
  };

  const handleTimeSelectionChange = (selection: { courtId: string; startTime: string; duration: number } | null) => {
    if (selection) {
      setSelectedCourt(selection.courtId);
      setSelectedTime(selection.startTime);
      setSelectedDuration(selection.duration);
    } else {
      setSelectedCourt(null);
      setSelectedTime('');
      setSelectedDuration(1);
    }
  };

  // Show empty state if no courts are configured
  if (!courtsLoading && courts.length === 0) {
    return (
      <EmptyCourtState 
        isOwner={isOwner}
        onNavigateToSettings={onNavigateToSettings || (() => {})}
      />
    );
  }

  return (
    <>
      {courtsLoading ? (
        <div className="space-y-6 animate-fade-in">
          {/* Loading skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                <CalendarIcon className="h-5 w-5 text-tennis-green-primary" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick date selection buttons */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className={isSameDay(selectedDate, new Date()) ? 'bg-tennis-green-primary text-white' : ''}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(new Date(), 1))}
                  className={isSameDay(selectedDate, addDays(new Date(), 1)) ? 'bg-tennis-green-primary text-white' : ''}
                >
                  Tomorrow
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                  disabled={selectedDate <= new Date()}
                >
                  Previous Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  disabled={selectedDate >= addDays(new Date(), 30)}
                >
                  Next Day
                </Button>
              </div>
              
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
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4 text-tennis-green-medium" />
                        <span className="text-tennis-green-medium">{court.hourly_rate_tokens} tokens/hour</span>
                        {court.hourly_rate_money > 0 && (
                          <span className="text-tennis-green-medium">or ${court.hourly_rate_money}/hour</span>
                        )}
                      </div>
                      {court.hourly_rate_money > 0 && (
                        <div className="text-xs text-tennis-green-medium/80">
                          + 5% convenience fee
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Operating Hours Info */}
            {club?.operating_hours && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Operating Hours</h4>
                    <p className="text-sm text-blue-700">
                      {(() => {
                        const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                        const dayHours = club.operating_hours[dayOfWeek];
                        return dayHours ? `${dayHours.open} - ${dayHours.close}` : 'Closed';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Time Slot Grid */}
            <div className="space-y-4">
              <h3 className="font-semibold text-tennis-green-dark">Available Time Slots</h3>
              
              <InteractiveTimeGrid
                courts={courts}
                timeSlots={timeSlots}
                bookings={bookings}
                selectedDate={selectedDate}
                currentUserId={user?.id}
                onSelectionChange={handleTimeSelectionChange}
                onBookingClick={handleBookCourt}
              />
            </div>


          </CardContent>
        </Card>

        {/* Available Services Widget */}
        <AvailableServicesWidget 
          clubId={clubId}
          title="Book Club Services"
          compact={true}
        />

        </div>
      )}

      <BookCourtDialog
        open={showBookDialog}
        onOpenChange={(open) => {
          setShowBookDialog(open);
          if (!open) {
            // Refresh bookings when dialog closes
            fetchBookings();
          }
        }}
        courtId={selectedCourt}
        date={selectedDate}
        courts={courts}
        preselectedTime={selectedTime}
        preselectedDuration={selectedDuration}
      />
    </>
  );
}