import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Users, 
  Coins,
  DollarSign,
  Plus,
  BookOpen,
  Trophy,
  Settings,
  CheckCircle,
  MapPin,
  User
} from 'lucide-react';
import { useClubServices, ClubService } from '@/hooks/useClubServices';
import { InteractiveHybridPaymentSelector } from '@/components/payments/InteractiveHybridPaymentSelector';
import { PaymentConfirmationDialog } from '@/components/payments/PaymentConfirmationDialog';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';

interface AvailableServicesWidgetProps {
  clubId: string;
  title?: string;
  showHeader?: boolean;
  compact?: boolean;
}

export function AvailableServicesWidget({ 
  clubId, 
  title = "Available Services",
  showHeader = true,
  compact = false 
}: AvailableServicesWidgetProps) {
  const { services, bookings, loading, bookService } = useClubServices(clubId);
  const { regularTokens, loading: tokensLoading, refreshTokens } = usePlayerTokens();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<ClubService | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<{ tokens: number; cash: number }>({ tokens: 0, cash: 0 });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const activeServices = services.filter(service => service.is_active);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'lesson': return Users;
      case 'tournament': return Trophy;
      case 'court_booking': return Clock;
      case 'coaching_session': return Settings;
      default: return BookOpen;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'tournament': return 'bg-red-100 text-red-800';
      case 'court_booking': return 'bg-green-100 text-green-800';
      case 'coaching_session': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBookService = async () => {
    if (!selectedService) return;
    
    setIsBooking(true);
    
    try {
      // Enhanced validation
      if (!paymentMethod.tokens && !paymentMethod.cash) {
        toast({
          title: "Payment Required",
          description: "Please select a payment method",
          variant: "destructive"
        });
        return;
      }

      // Check if user has sufficient tokens if trying to use tokens
      if (paymentMethod.tokens > regularTokens) {
        toast({
          title: "Insufficient Tokens",
          description: `You need ${paymentMethod.tokens} tokens but only have ${regularTokens}.`,
          variant: "destructive"
        });
        return;
      }

      // Convert cash to cents for the API first
      const cashAmountCents = Math.round(paymentMethod.cash * 100);
      
      // Check if payment covers the service cost (both tokens and cash in cents)
      const totalPaymentValue = paymentMethod.tokens + cashAmountCents;
      const serviceCostInCents = selectedService.price_tokens + (selectedService.price_usd || 0);
      
      if (totalPaymentValue < Math.min(selectedService.price_tokens, serviceCostInCents)) {
        toast({
          title: "Payment Error", 
          description: "Payment amount does not cover the service cost",
          variant: "destructive"
        });
        return;
      }
      
      const bookingId = await bookService(selectedService.id, paymentMethod.tokens, cashAmountCents);
      
      if (bookingId) {
        toast({
          title: "Booking Confirmed",
          description: `Successfully booked ${selectedService.name}!`,
        });
        setSelectedService(null);
        setPaymentMethod({ tokens: 0, cash: 0 });
        setShowConfirmDialog(false);
        // Refresh token balance to show updated amount
        refreshTokens();
      } else {
        throw new Error('Booking failed');
      }
    } catch (error) {
      console.error('Error booking service:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book service. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleInitiateBooking = (service: ClubService) => {
    setSelectedService(service);
    setShowConfirmDialog(true);
  };

  if (loading) {
    return (
      <Card className={compact ? "shadow-md" : "shadow-lg"}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeServices.length === 0) {
    return (
      <Card className={compact ? "shadow-md" : "shadow-lg"}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-6">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-medium mb-2">No Services Available</h3>
            <p className="text-sm text-gray-600">
              This club hasn't set up any services yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${compact ? "shadow-md" : "shadow-lg"} animate-fade-in`}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <BookOpen className="h-5 w-5 text-tennis-green-primary" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {activeServices.slice(0, compact ? 3 : 6).map((service) => {
          const ServiceIcon = getServiceIcon(service.service_type);
          const isBooked = bookings.some(booking => 
            booking.service_id === service.id && 
            booking.booking_status === 'confirmed'
          );

          return (
            <div 
              key={service.id} 
              className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover-scale"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-tennis-green-bg rounded-lg flex items-center justify-center">
                      <ServiceIcon className="h-5 w-5 text-tennis-green-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-tennis-green-dark">{service.name}</h3>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getServiceTypeColor(service.service_type)}`}
                      >
                        {service.service_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-sm text-tennis-green-medium mb-3 leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                    {service.duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                    )}
                    {service.max_participants && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Max {service.max_participants}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Coins className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium text-tennis-green-dark">
                        {service.price_tokens} tokens
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-tennis-green-dark">
                        ${(service.price_tokens * 0.01).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {isBooked ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Booked
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => setSelectedService(service)}
                      className="flex items-center gap-2 hover-scale"
                    >
                      <Plus className="h-3 w-3" />
                      Book Now
                    </Button>
                  )}
                </div>
              </div>

              {selectedService?.id === service.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium mb-3 text-tennis-green-dark">Payment Options</h4>
                  <InteractiveHybridPaymentSelector
                    serviceTokenCost={service.price_tokens}
                    availableTokens={regularTokens}
                    onPaymentChange={(payment) => setPaymentMethod({ tokens: payment.tokens, cash: payment.usd })}
                    disabled={tokensLoading}
                    onRefreshTokens={refreshTokens}
                    isLoadingTokens={tokensLoading}
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedService(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowConfirmDialog(true)}
                      className="flex-1"
                      disabled={!paymentMethod.tokens && !paymentMethod.cash || tokensLoading || isBooking}
                    >
                      Continue to Confirm
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {compact && activeServices.length > 3 && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-tennis-green-primary">
              View All Services ({activeServices.length})
            </Button>
          </div>
        )}

        {/* Payment Confirmation Dialog */}
        {selectedService && (
          <PaymentConfirmationDialog
            open={showConfirmDialog}
            onClose={() => setShowConfirmDialog(false)}
            onConfirm={handleBookService}
            loading={isBooking}
            paymentBreakdown={{
              tokens: paymentMethod.tokens,
              cash: paymentMethod.cash,
              totalServiceValue: selectedService.price_tokens * 0.01,
              savings: paymentMethod.tokens * 0.01,
              savingsPercentage: paymentMethod.tokens > 0 
                ? (paymentMethod.tokens / selectedService.price_tokens) * 100 
                : 0
            }}
            serviceDetails={{
              name: selectedService.name,
              type: selectedService.service_type,
              organizerName: selectedService.organizer_name,
              duration: selectedService.duration_minutes || undefined,
              description: selectedService.description || undefined
            }}
            userTokenBalance={regularTokens}
          />
        )}
      </CardContent>
    </Card>
  );
}