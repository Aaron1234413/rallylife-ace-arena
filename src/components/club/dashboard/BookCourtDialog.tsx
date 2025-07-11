import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  Users,
  Coins,
  Plus,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { format, addHours, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useClubServices, ClubService } from '@/hooks/useClubServices';
import { HybridPaymentSelector } from '@/components/payments/HybridPaymentSelector';
import { calculateCourtPricing, calculateServicePricing, calculateTotalPricing } from '@/utils/pricing';
import { PricingBreakdown } from '@/components/ui/PricingBreakdown';
import { BookingConfirmationDialog } from '@/components/club/courts/BookingConfirmationDialog';

interface Court {
  id: string;
  name: string;
  surface_type: string;
  hourly_rate_tokens: number;
  hourly_rate_money: number;
  is_active: boolean;
}

interface BookCourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courtId: string | null;
  date: Date;
  courts: Court[];
  preselectedTime?: string;
  preselectedDuration?: number;
}

interface BookingFormData {
  startTime: string;
  duration: number;
  notes: string;
  bookingType: string;
  paymentMethod: { tokens: number; cash: number };
  selectedServices: string[];
}

export function BookCourtDialog({ open, onOpenChange, courtId, date, courts, preselectedTime, preselectedDuration }: BookCourtDialogProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    startTime: preselectedTime || '',
    duration: preselectedDuration || 1,
    notes: '',
    bookingType: 'personal',
    paymentMethod: { tokens: 0, cash: 0 },
    selectedServices: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  
  const selectedCourt = courts.find(c => c.id === courtId);
  
  // Get club ID from the URL or props - we'll need to pass it properly
  const { pathname } = window.location;
  const clubId = pathname.includes('/club/') ? pathname.split('/club/')[1].split('/')[0] : '';
  const { services } = useClubServices(clubId || '');
  const courtServices = services.filter(s => 
    s.service_type === 'court_booking' || 
    s.service_type === 'coaching_session' ||
    s.service_type === 'lesson'
  );

  // Fetch existing bookings and generate available time slots
  useEffect(() => {
    if (open && courtId && date) {
      fetchExistingBookings();
      generateTimeSlots();
    }
  }, [open, courtId, date]);

  // Update form data when preselected values change
  useEffect(() => {
    if (open && preselectedTime) {
      setFormData(prev => ({
        ...prev,
        startTime: preselectedTime,
        duration: preselectedDuration || 1
      }));
    }
  }, [open, preselectedTime, preselectedDuration]);

  const fetchExistingBookings = async () => {
    if (!courtId) return;
    
    try {
      const { data, error } = await supabase
        .from('club_court_bookings')
        .select('start_time, end_time')
        .eq('court_id', courtId)
        .eq('booking_date', format(date, 'yyyy-MM-dd'))
        .eq('status', 'confirmed');

      if (error) throw error;
      setExistingBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(timeString);
    }
    setAvailableTimeSlots(slots);
  };

  const isTimeSlotAvailable = (time: string) => {
    const [hours] = time.split(':').map(Number);
    const slotStart = hours;
    const slotEnd = slotStart + formData.duration;

    return !existingBookings.some(booking => {
      const bookingStart = parseInt(booking.start_time.split(':')[0]);
      const bookingEnd = parseInt(booking.end_time.split(':')[0]);
      
      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd)
      );
    });
  };

  const calculateCourtCost = () => {
    if (!selectedCourt) return { tokens: 0, money: 0, baseAmount: 0, convenienceFee: 0, totalAmount: 0 };
    
    return calculateCourtPricing(selectedCourt, formData.duration);
  };

  const calculateServicesCost = () => {
    const servicesPricing = formData.selectedServices.map(serviceId => {
      const service = courtServices.find(s => s.id === serviceId);
      return service ? calculateServicePricing(service) : { tokens: 0, money: 0, baseAmount: 0, convenienceFee: 0, totalAmount: 0 };
    });
    
    return calculateTotalPricing(servicesPricing);
  };

  const calculateTotalCost = () => {
    const courtCost = calculateCourtCost();
    const servicesCost = calculateServicesCost();
    
    return calculateTotalPricing([courtCost, servicesCost]);
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: checked 
        ? [...prev.selectedServices, serviceId]
        : prev.selectedServices.filter(id => id !== serviceId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCourt || !formData.startTime) {
      toast.error('Please select a start time');
      return;
    }

    if (!isTimeSlotAvailable(formData.startTime)) {
      toast.error('Selected time slot is no longer available');
      return;
    }

    const totalCost = calculateTotalCost();
    if (!formData.paymentMethod.tokens && !formData.paymentMethod.cash) {
      toast.error('Please select a payment method');
      return;
    }

    if (formData.paymentMethod.tokens + formData.paymentMethod.cash < totalCost.tokens) {
      toast.error('Insufficient payment amount');
      return;
    }

    // Show confirmation dialog instead of directly creating booking
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedCourt) return;

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate end time
      const [hours, minutes] = formData.startTime.split(':').map(Number);
      const endHours = hours + formData.duration;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      // Create court booking
      const { data: booking, error: bookingError } = await supabase
        .from('club_court_bookings')
        .insert({
          club_id: clubId,
          court_id: courtId,
          user_id: user.id,
          booking_date: format(date, 'yyyy-MM-dd'),
          start_time: formData.startTime,
          end_time: endTime,
          tokens_used: formData.paymentMethod.tokens,
          payment_method: formData.paymentMethod.tokens > 0 ? 'tokens' : 'cash',
          status: 'confirmed',
          notes: formData.notes || null
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Book selected services
      if (formData.selectedServices.length > 0) {
        const serviceBookingPromises = formData.selectedServices.map(async (serviceId) => {
          const service = courtServices.find(s => s.id === serviceId);
          if (!service) return;

          // Use the service booking logic from useClubServices
          const { error: serviceError } = await supabase.rpc('book_club_service', {
            service_id_param: serviceId,
            tokens_to_use: service.price_tokens,
            cash_amount_cents: service.price_usd * 100
          });

          if (serviceError) throw serviceError;
        });

        await Promise.all(serviceBookingPromises);
      }

      toast.success('Court booking created successfully!');
      setShowConfirmation(false);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        startTime: '',
        duration: 1,
        notes: '',
        bookingType: 'personal',
        paymentMethod: { tokens: 0, cash: 0 },
        selectedServices: []
      });

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToEdit = () => {
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setShowConfirmation(false);
    onOpenChange(false);
    // Reset form
    setFormData({
      startTime: '',
      duration: 1,
      notes: '',
      bookingType: 'personal',
      paymentMethod: { tokens: 0, cash: 0 },
      selectedServices: []
    });
  };

  if (!selectedCourt) return null;

  // Calculate costs
  const totalCost = calculateTotalCost();

  // Prepare booking details for confirmation
  const selectedServicesData = formData.selectedServices.map(serviceId => 
    courtServices.find(s => s.id === serviceId)!
  ).filter(Boolean);

  const bookingDetails = selectedCourt ? {
    court: selectedCourt,
    date,
    startTime: formData.startTime,
    duration: formData.duration,
    selectedServices: selectedServicesData,
    bookingType: formData.bookingType,
    notes: formData.notes
  } : null;

  return (
    <>
      <Dialog open={open && !showConfirmation} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-tennis-green-primary" />
              Book {selectedCourt.name}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Court Information */}
            <div className="p-4 bg-tennis-green-bg/20 rounded-lg border">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-tennis-green-medium" />
                  <span className="font-medium text-tennis-green-dark">{selectedCourt.name}</span>
                  <Badge variant="outline" className="capitalize">
                    {selectedCourt.surface_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-tennis-green-medium" />
                  <span className="text-sm text-tennis-green-medium">
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-emerald-500" />
                    <span className="text-tennis-green-medium">
                      {selectedCourt.hourly_rate_tokens} tokens/hour
                    </span>
                  </div>
                  {selectedCourt.hourly_rate_money > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-tennis-green-medium">
                        ${selectedCourt.hourly_rate_money}/hour
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <div>
                <Label htmlFor="startTime">Start Time *</Label>
                <Select
                  value={formData.startTime}
                  onValueChange={(value) => setFormData({ ...formData, startTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map((time) => {
                      const available = isTimeSlotAvailable(time);
                      return (
                        <SelectItem 
                          key={time} 
                          value={time}
                          disabled={!available}
                          className={!available ? 'opacity-50' : ''}
                        >
                          <div className="flex items-center gap-2">
                            {time}
                            {!available && (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <Label htmlFor="duration">Duration *</Label>
                <Select
                  value={formData.duration.toString()}
                  onValueChange={(value) => setFormData({ ...formData, duration: parseFloat(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="1.5">1.5 hours</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="2.5">2.5 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Booking Type */}
            <div>
              <Label htmlFor="bookingType">Booking Type</Label>
              <Select
                value={formData.bookingType}
                onValueChange={(value) => setFormData({ ...formData, bookingType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Practice</SelectItem>
                  <SelectItem value="lesson">Coaching Lesson</SelectItem>
                  <SelectItem value="match">Match Play</SelectItem>
                  <SelectItem value="tournament">Tournament</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional Services */}
            {courtServices.length > 0 && (
              <div>
                <Label>Optional Services</Label>
                <div className="space-y-3 mt-2">
                  {courtServices.map((service) => (
                    <div key={service.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={service.id}
                        checked={formData.selectedServices.includes(service.id)}
                        onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                      />
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={service.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {service.name}
                        </label>
                        {service.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <div className="flex items-center gap-1">
                            <Coins className="h-3 w-3 text-emerald-500" />
                            <span>{service.price_tokens} tokens</span>
                          </div>
                          {service.price_usd > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3 text-green-500" />
                              <span>${service.price_usd}</span>
                            </div>
                          )}
                          {service.duration_minutes && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{service.duration_minutes} min</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any special requirements or notes..."
                rows={2}
              />
            </div>

            {/* Cost Breakdown */}
            <PricingBreakdown 
              pricing={totalCost} 
              title={`Total Cost${formData.duration > 1 ? ` (${formData.duration}h)` : ''}`}
            />

            {/* Payment Method */}
            <div>
              <Label className="text-sm font-medium">Payment Method</Label>
              <HybridPaymentSelector
                tokenPrice={totalCost.tokens}
                usdPrice={totalCost.money * 100} // Convert to cents
                onPaymentChange={(payment) => 
                  setFormData(prev => ({
                    ...prev,
                    paymentMethod: { tokens: payment.tokens, cash: payment.usd }
                  }))
                }
                disabled={false}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={!formData.startTime || isSubmitting || (!formData.paymentMethod.tokens && !formData.paymentMethod.cash)}
              >
                Continue to Confirmation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Booking Confirmation Dialog */}
      <BookingConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        bookingDetails={bookingDetails}
        onBack={handleBackToEdit}
        clubId={clubId}
      />
    </>
  );
}