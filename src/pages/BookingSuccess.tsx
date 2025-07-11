import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      // Here you would typically verify the payment with Stripe
      // and create the actual booking in your database
      verifyPaymentAndCreateBooking();
    }
  }, [sessionId]);

  const verifyPaymentAndCreateBooking = async () => {
    try {
      // This would be handled by a webhook in production
      // For now, we'll show a success message
      setBookingData({
        court: "Court 1",
        date: new Date().toLocaleDateString(),
        time: "10:00 - 11:00",
        amount: "$50.00"
      });
      
      toast.success('Payment successful! Your court has been booked.');
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Payment verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary mx-auto mb-4"></div>
          <p>Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tennis-green-bg/30 to-tennis-green-primary/10">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-tennis-green-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-tennis-green-dark mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-tennis-green-medium">
            Your court booking has been successfully created.
          </p>
        </div>

        {bookingData && (
          <div className="space-y-4 mb-6 p-4 bg-tennis-green-bg/20 rounded-lg">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-tennis-green-medium" />
              <span className="text-sm">{bookingData.court}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-tennis-green-medium" />
              <span className="text-sm">{bookingData.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-tennis-green-medium" />
              <span className="text-sm">{bookingData.time}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium"
          >
            Return to Dashboard
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/bookings'}
            className="w-full"
          >
            View My Bookings
          </Button>
        </div>
      </div>
    </div>
  );
}