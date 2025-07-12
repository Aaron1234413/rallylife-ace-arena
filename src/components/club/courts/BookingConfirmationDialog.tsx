import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format, addHours } from 'date-fns';
import { PricingBreakdown } from '@/components/ui/PricingBreakdown';
import { calculateCourtPricing, calculateServicePricing, calculateTotalPricing, type PricingBreakdown as PricingData } from '@/utils/pricing';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Court {
  id: string;
  name: string;
  surface_type: string;
  hourly_rate_tokens: number;
  hourly_rate_money: number;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  price_tokens: number;
  price_usd: number;
  duration_minutes?: number;
}

interface BookingDetails {
  court: Court;
  date: Date;
  startTime: string;
  duration: number;
  selectedServices: Service[];
  bookingType: string;
  notes?: string;
}

interface BookingConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetails: BookingDetails | null;
  onBack: () => void;
  clubId: string;
}

export function BookingConfirmationDialog({
  open,
  onOpenChange,
  bookingDetails,
  onBack,
  clubId
}: BookingConfirmationDialogProps) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bookingDetails) return null;

  const { court, date, startTime, duration, selectedServices, bookingType, notes } = bookingDetails;

  // Ensure duration is a valid number
  const safeDuration = duration || 1;

  // Calculate end time
  const [hours, minutes] = startTime.split(':').map(Number);
  const endTime = `${(hours + safeDuration).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // Calculate pricing
  const courtPricing = calculateCourtPricing(court, safeDuration);
  const servicesPricing = selectedServices.map(service => calculateServicePricing(service));
  const totalServicesPricing = calculateTotalPricing(servicesPricing);
  const totalPricing = calculateTotalPricing([courtPricing, totalServicesPricing]);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!termsAccepted) {
      errors.push('You must accept the terms and conditions to proceed');
    }

    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      // Prepare booking data for Stripe checkout
      const bookingData = {
        court_id: court.id,
        club_id: clubId,
        booking_date: format(date, 'yyyy-MM-dd'),
        start_time: startTime,
        end_time: endTime,
        duration_hours: safeDuration,
        base_amount: courtPricing.money,
        convenience_fee: courtPricing.convenienceFee / 100,
        total_amount: totalPricing.money,
        notes: notes,
        selected_services: selectedServices.map(service => ({
          id: service.id,
          name: service.name,
          price_usd: service.price_usd
        }))
      };

      // Call Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke('create-court-booking-checkout', {
        body: bookingData
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }

    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create checkout session');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setTermsAccepted(false);
    setFormErrors([]);
    setIsProcessing(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-tennis-green-primary" />
            Confirm Your Booking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="p-4 bg-tennis-green-bg/20 rounded-lg border">
            <h3 className="font-medium text-tennis-green-dark mb-4">Booking Summary</h3>
            
            <div className="space-y-3">
              {/* Court Details */}
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-tennis-green-medium" />
                <span className="font-medium">{court.name}</span>
                <Badge variant="outline" className="capitalize">
                  {court.surface_type.replace('_', ' ')}
                </Badge>
              </div>

              {/* Date and Time */}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-tennis-green-medium" />
                <span>{format(date, 'EEEE, MMMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-tennis-green-medium" />
                <span>{startTime} - {endTime}</span>
                <Badge variant="secondary">
                  {safeDuration === 1 ? '1 hour' : `${safeDuration} hours`}
                </Badge>
              </div>

              {/* Booking Type */}
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-tennis-green-medium" />
                <span className="capitalize">{bookingType.replace('_', ' ')}</span>
              </div>

              {/* Notes */}
              {notes && (
                <div className="pt-2 border-t border-tennis-green-bg/50">
                  <p className="text-sm text-tennis-green-medium">
                    <strong>Notes:</strong> {notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <div>
              <h3 className="font-medium text-tennis-green-dark mb-3">Additional Services</h3>
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{service.name}</p>
                      {service.description && (
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      )}
                      {service.duration_minutes && (
                        <p className="text-xs text-tennis-green-medium">
                          Duration: {service.duration_minutes} minutes
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div>{service.price_tokens} tokens</div>
                      {service.price_usd > 0 && (
                        <div className="text-muted-foreground">${service.price_usd}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing Breakdown */}
          <div className="space-y-4">
            <h3 className="font-medium text-tennis-green-dark">Pricing Details</h3>
            
            {/* Court Cost */}
            <PricingBreakdown 
              pricing={courtPricing}
              title={`Court Booking (${safeDuration}h)`}
              className="bg-blue-50/50"
            />

            {/* Services Cost */}
            {selectedServices.length > 0 && (
              <PricingBreakdown 
                pricing={totalServicesPricing}
                title="Additional Services"
                className="bg-purple-50/50"
              />
            )}

            {/* Total Cost */}
            <PricingBreakdown 
              pricing={totalPricing}
              title="Total Cost"
              className="bg-tennis-green-bg/30 border-tennis-green-primary/30"
            />
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-4 p-4 bg-accent/10 rounded-lg border">
            <h3 className="font-medium text-tennis-green-dark">Terms & Conditions</h3>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Court bookings are subject to availability and club policies</p>
              <p>• Cancellations must be made at least 24 hours in advance for a full refund</p>
              <p>• Late arrivals may result in reduced court time</p>
              <p>• All players must follow club safety guidelines and dress code</p>
              <p>• The 5% RAKO convenience fee is non-refundable</p>
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => {
                  setTermsAccepted(!!checked);
                  setFormErrors([]);
                }}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I accept the terms and conditions and court booking policies
              </label>
            </div>
          </div>

          {/* Form Errors */}
          {formErrors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                  <ul className="mt-1 text-sm text-red-700 list-disc list-inside">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={isProcessing}
          >
            Back to Edit
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!termsAccepted || isProcessing}
            className="bg-tennis-green-primary hover:bg-tennis-green-medium"
          >
            {isProcessing ? 'Creating Checkout...' : 'Proceed to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}