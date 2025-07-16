import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Clock, 
  Calendar, 
  DollarSign, 
  Coins,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { useCourtBooking, Court } from '@/hooks/useCourtBooking';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { format, addHours } from 'date-fns';
import { toast } from 'sonner';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  court: Court;
  selectedDate: Date;
  selectedTimeSlot: string;
  onBookingComplete: () => void;
}

export function BookingDialog({ 
  open, 
  onOpenChange, 
  court, 
  selectedDate, 
  selectedTimeSlot,
  onBookingComplete 
}: BookingDialogProps) {
  const { calculateBookingCost, createBooking } = useCourtBooking();
  const { tokenData } = usePlayerTokens();
  const [duration, setDuration] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('tokens');
  const [notes, setNotes] = useState('');
  const [costInfo, setCostInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const startDateTime = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTimeSlot}:00`;
  const endDateTime = format(addHours(new Date(startDateTime), duration), "yyyy-MM-dd'T'HH:mm:ss");

  useEffect(() => {
    if (open && court) {
      calculateCost();
    }
  }, [open, court, duration, selectedTimeSlot, selectedDate]);

  const calculateCost = async () => {
    setCalculating(true);
    try {
      const cost = await calculateBookingCost(court.id, startDateTime, endDateTime);
      setCostInfo(cost);
    } catch (error) {
      console.error('Error calculating cost:', error);
      toast.error('Failed to calculate booking cost');
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!costInfo) {
      toast.error('Cost calculation is required');
      return;
    }

    // Check if user has sufficient tokens/money
    if (paymentMethod === 'tokens' && tokenData) {
      if (tokenData.regular_tokens < costInfo.total_tokens) {
        toast.error(`Insufficient tokens. You need ${costInfo.total_tokens} tokens but only have ${tokenData.regular_tokens}`);
        return;
      }
    }

    setLoading(true);
    try {
      await createBooking(
        court.id,
        startDateTime,
        endDateTime,
        paymentMethod,
        notes.trim() || undefined
      );
      
      toast.success('Court booked successfully!');
      onBookingComplete();
      onOpenChange(false);
      
      // Reset form
      setDuration(1);
      setPaymentMethod('tokens');
      setNotes('');
    } catch (error: any) {
      console.error('Error creating booking:', error);
      if (error.message?.includes('Time slot already booked')) {
        toast.error('This time slot is no longer available. Please select a different time.');
      } else {
        toast.error('Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const canUseTokens = court.hourly_rate_tokens > 0;
  const canUseMoney = court.hourly_rate_money > 0;
  const hasInsufficientTokens = paymentMethod === 'tokens' && tokenData && costInfo && 
    tokenData.regular_tokens < costInfo.total_tokens;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Court</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Court Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{court.name}</span>
              <Badge variant="outline" className="capitalize">
                {court.surface_type}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{selectedTimeSlot} - {format(addHours(new Date(startDateTime), duration), 'HH:mm')}</span>
            </div>
          </div>

          {/* Duration Selection */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="4"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
              className="w-24"
            />
            <p className="text-xs text-gray-500">
              Maximum 4 hours per booking
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {canUseTokens && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="tokens" id="tokens" />
                  <Label htmlFor="tokens" className="flex items-center gap-2 cursor-pointer">
                    <Coins className="h-4 w-4" />
                    Tokens ({court.hourly_rate_tokens}/hour)
                    {tokenData && (
                      <span className="text-sm text-gray-600">
                        - Balance: {tokenData.regular_tokens}
                      </span>
                    )}
                  </Label>
                </div>
              )}
              
              {canUseMoney && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="money" id="money" />
                  <Label htmlFor="money" className="flex items-center gap-2 cursor-pointer">
                    <DollarSign className="h-4 w-4" />
                    Money (${court.hourly_rate_money}/hour)
                  </Label>
                </div>
              )}
            </RadioGroup>

            {(!canUseTokens && !canUseMoney) && (
              <div className="text-amber-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No payment methods configured for this court
              </div>
            )}
          </div>

          {/* Cost Summary */}
          {calculating ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Calculating cost...</p>
            </div>
          ) : costInfo && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">Booking Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{duration} hour{duration > 1 ? 's' : ''}</span>
                </div>
                {paymentMethod === 'tokens' && (
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span>{costInfo.total_tokens} tokens</span>
                  </div>
                )}
                {paymentMethod === 'money' && (
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span>${costInfo.total_money}</span>
                  </div>
                )}
              </div>
              
              {hasInsufficientTokens && (
                <div className="text-red-600 text-sm flex items-center gap-2 mt-2">
                  <AlertCircle className="h-4 w-4" />
                  Insufficient tokens
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests or notes..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || calculating || !costInfo || hasInsufficientTokens}
              className="flex-1"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}