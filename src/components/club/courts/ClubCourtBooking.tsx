import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Coins,
  MapPin,
  Target,
  CheckCircle2,
  Zap,
  Users
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { useConsolidatedCourtBookings } from '@/hooks/useConsolidatedCourtBookings';
import { useHybridPayment } from '@/hooks/useHybridPayment';
import { useTokenRedemption } from '@/hooks/useTokenRedemption';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type ClubCourt = Database['public']['Tables']['club_courts']['Row'];

interface ClubCourtBookingProps {
  club: Club;
  canBook: boolean;
}

export function ClubCourtBooking({ club, canBook }: ClubCourtBookingProps) {
  const { user } = useAuth();
  const { createBooking, getAvailableTimeSlots, getAvailableSlots, bookings, loading: bookingsLoading } = useConsolidatedCourtBookings(club.id);
  const { calculateRedemption, validateRedemption } = useTokenRedemption(club.id);
  
  const [courts, setCourts] = useState<ClubCourt[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<'tokens' | 'hybrid' | 'stripe'>('tokens');
  const [notes, setNotes] = useState('');
  const [tokensToUse, setTokensToUse] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);
  const [isBooking, setIsBooking] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Array<{start: Date, end: Date, time: string}>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Fetch courts for this club
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const { data, error } = await supabase
          .from('club_courts')
          .select('*')
          .eq('club_id', club.id)
          .eq('is_active', true);

        if (error) throw error;
        setCourts(data || []);
      } catch (error) {
        console.error('Error fetching courts:', error);
        toast.error('Failed to load courts');
      }
    };

    fetchCourts();
  }, [club.id]);

  // Load available time slots when date and court are selected
  useEffect(() => {
    if (selectedDate && selectedCourt) {
      loadAvailableSlots();
    }
  }, [selectedDate, selectedCourt]);

  const loadAvailableSlots = async () => {
    if (!selectedDate || !selectedCourt) return;
    
    setLoadingSlots(true);
    try {
      // Use realtime bookings data to get available slots
      const dateStr = selectedDate.toISOString().split('T')[0];
      const availableFromRealtime = getAvailableSlots(selectedCourt, dateStr);
      
      // Convert string slots to proper format
      const formattedSlots = availableFromRealtime.map(slotStr => {
        const [start, end] = slotStr.split('-');
        const startDate = new Date(selectedDate);
        const [startHour, startMin] = start.split(':').map(Number);
        startDate.setHours(startHour, startMin, 0, 0);
        
        const endDate = new Date(selectedDate);
        const [endHour, endMin] = end.split(':').map(Number);
        endDate.setHours(endHour, endMin, 0, 0);
        
        return {
          start: startDate,
          end: endDate,
          time: start
        };
      });
      
      setAvailableSlots(formattedSlots);
    } catch (error) {
      console.error('Error loading available slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const getStatusBadge = (court: ClubCourt) => {
    if (!court.is_active) {
      return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">Available</Badge>;
  };

  const getSurfaceIcon = (surface: string) => {
    switch (surface.toLowerCase()) {
      case 'hard':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'clay':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'grass':
        return <Users className="h-4 w-4 text-green-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const calculateCost = () => {
    const selectedCourtData = courts.find(c => c.id === selectedCourt);
    if (!selectedCourtData) return { tokens: 0, money: 0 };
    
    const durationHours = parseFloat(duration);
    const tokenCost = selectedCourtData.hourly_rate_tokens * durationHours;
    const moneyCost = Number(selectedCourtData.hourly_rate_money) * durationHours;
    
    return { tokens: tokenCost, money: moneyCost };
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedCourt || !selectedTime || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsBooking(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + parseFloat(duration));
      
      const cost = calculateCost();
      
      await createBooking({
        court_id: selectedCourt,
        booking_date: selectedDate.toISOString().split('T')[0],
        start_time: selectedTime,
        end_time: `${startDateTime.getHours() + parseFloat(duration)}:${startDateTime.getMinutes().toString().padStart(2, '0')}`,
        payment_method: paymentMethod,
        tokens_used: paymentMethod === 'tokens' ? cost.tokens : tokensToUse,
        cash_amount: paymentMethod === 'stripe' ? cost.money : cashAmount,
        notes: notes || undefined
      });
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedCourt('');
      setSelectedTime('');
      setDuration('1');
      setNotes('');
      
    } catch (error) {
      console.error('Error booking court:', error);
    } finally {
      setIsBooking(false);
    }
  };

  if (!canBook) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">Member Access Required</h3>
          <p className="text-sm text-muted-foreground">
            You must be a club member to book courts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-tennis-green-dark">Court Booking</h2>
        <p className="text-sm text-tennis-green-medium">
          Reserve courts for your tennis sessions at {club.name}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Book a Court
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Court Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Court</label>
              <Select value={selectedCourt} onValueChange={setSelectedCourt}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a court" />
                </SelectTrigger>
                <SelectContent>
                  {courts.filter(court => court.is_active).map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name} - {court.surface_type} ({court.hourly_rate_tokens} tokens/hr)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Time</label>
              <Select 
                value={selectedTime} 
                onValueChange={setSelectedTime}
                disabled={!selectedDate || !selectedCourt || loadingSlots}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder={loadingSlots ? "Loading..." : "Choose time slot"} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <SelectItem key={slot.time} value={slot.time} className="h-10">
                        {slot.time}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {loadingSlots ? "Loading available times..." : "No available time slots"}
                    </div>
                  )}
                </SelectContent>
              </Select>
              {selectedDate && selectedCourt && availableSlots.length === 0 && !loadingSlots && (
                <p className="text-xs text-muted-foreground">
                  No available slots for this date. Try selecting a different date.
                </p>
              )}
            </div>

            {/* Duration Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (hours)</label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="1.5">1.5 hours</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="2.5">2.5 hours</SelectItem>
                  <SelectItem value="3">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'tokens' | 'hybrid' | 'stripe')}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tokens">
                    <div className="flex items-center gap-2 py-1">
                      <Coins className="h-4 w-4" />
                      <span className="text-sm">Tokens ({calculateCost().tokens})</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex items-center gap-2 py-1">
                      <Coins className="h-4 w-4" />
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Hybrid (Tokens + Cash)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="stripe">
                    <div className="flex items-center gap-2 py-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm">Credit Card (${calculateCost().money.toFixed(2)})</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Any special requirements or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleBooking}
              disabled={isBooking || !selectedDate || !selectedCourt || !selectedTime}
              className="w-full"
            >
              {isBooking ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Booking Court...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Book Court
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Courts Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Available Courts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courts.map((court) => (
              <div key={court.id} className="p-4 border rounded-lg hover:bg-tennis-green-bg/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSurfaceIcon(court.surface_type)}
                    <h3 className="font-medium">{court.name}</h3>
                  </div>
                  {getStatusBadge(court)}
                </div>
                
                {court.description && (
                  <p className="text-sm text-tennis-green-medium mb-2">{court.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs sm:text-sm">{court.surface_type}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Coins className="h-3 w-3" />
                      <span className="text-xs sm:text-sm">{court.hourly_rate_tokens} tokens/hr</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-xs sm:text-sm">${court.hourly_rate_money}/hr</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {courts.length === 0 && (
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-muted-foreground">No courts available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}