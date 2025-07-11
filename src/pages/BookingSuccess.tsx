import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, MapPin, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface BookingDetails {
  id: string;
  court_name: string;
  surface_type: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
}

interface PaymentDetails {
  session_id: string;
  amount_paid: number;
  payment_status: string;
}

export function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [bookingData, setBookingData] = useState<BookingDetails | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      verifyPaymentAndCreateBooking();
    } else {
      setError('No session ID found');
      setLoading(false);
    }
  }, [sessionId]);

  const verifyPaymentAndCreateBooking = async () => {
    try {
      setLoading(true);
      console.log('Verifying payment for session:', sessionId);

      const { data, error } = await supabase.functions.invoke('verify-booking-payment', {
        body: { session_id: sessionId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      setBookingData(data.booking);
      setPaymentData(data.payment);
      
      toast.success('Payment successful! Your court has been booked.');
      console.log('Booking created successfully:', data.booking);

    } catch (error) {
      console.error('Error verifying payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
      setError(errorMessage);
      toast.error(`Payment verification failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tennis-green-bg/30 to-tennis-green-primary/10">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="h-16 w-16 text-tennis-green-primary mx-auto mb-4 animate-spin" />
          <h1 className="text-xl font-semibold text-tennis-green-dark mb-2">
            Verifying Your Payment
          </h1>
          <p className="text-tennis-green-medium">
            Please wait while we confirm your booking...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-700 mb-2">
            Booking Failed
          </h1>
          <p className="text-red-600 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full"
              variant="outline"
            >
              Return to Dashboard
            </Button>
            <Button 
              onClick={() => window.location.href = '/support'}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-tennis-green-bg/30 to-tennis-green-primary/10">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-tennis-green-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-tennis-green-dark mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-tennis-green-medium">
            Your court booking has been successfully created and payment processed.
          </p>
        </div>

        {bookingData && (
          <div className="space-y-6 mb-8">
            {/* Booking Details */}
            <div className="p-4 bg-tennis-green-bg/20 rounded-lg border">
              <h3 className="font-semibold text-tennis-green-dark mb-4">Booking Details</h3>
              
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-tennis-green-medium flex-shrink-0" />
                  <div>
                    <span className="font-medium">{bookingData.court_name}</span>
                    <Badge variant="outline" className="ml-2 capitalize text-xs">
                      {bookingData.surface_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-tennis-green-medium flex-shrink-0" />
                  <span>{formatDate(bookingData.booking_date)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-tennis-green-medium flex-shrink-0" />
                  <span>
                    {formatTime(bookingData.start_time)} - {formatTime(bookingData.end_time)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            {paymentData && (
              <div className="p-4 bg-blue-50/50 rounded-lg border">
                <h3 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Confirmation
                </h3>
                
                <div className="space-y-2 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">${paymentData.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {paymentData.payment_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-xs text-gray-500">
                      {paymentData.session_id.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Booking Status */}
            <div className="text-center">
              <Badge variant="default" className="bg-tennis-green-primary text-white px-4 py-2">
                Booking #{bookingData.id.slice(-8)} - {bookingData.status}
              </Badge>
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