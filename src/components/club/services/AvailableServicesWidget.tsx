import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Users, 
  Coins,
  DollarSign,
  Plus,
  BookOpen,
  Trophy,
  Settings,
  CheckCircle
} from 'lucide-react';
import { useClubServices, ClubService } from '@/hooks/useClubServices';
import { HybridPaymentSelector } from '@/components/payments/HybridPaymentSelector';
import { toast } from 'sonner';

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
  const [selectedService, setSelectedService] = useState<ClubService | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<{ tokens: number; cash: number }>({ tokens: 0, cash: 0 });

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

  const handleBookService = async (service: ClubService) => {
    if (!paymentMethod.tokens && !paymentMethod.cash) {
      toast.error('Please select a payment method');
      return;
    }

    const bookingId = await bookService(service.id, paymentMethod.tokens, paymentMethod.cash);
    
    if (bookingId) {
      toast.success(`Successfully booked ${service.name}!`);
      setSelectedService(null);
      setPaymentMethod({ tokens: 0, cash: 0 });
    }
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
                  <HybridPaymentSelector
                    tokenPrice={service.price_tokens}
                    usdPrice={service.price_tokens * 0.01} // Convert tokens to USD at $0.01 per token
                    onPaymentChange={(payment) => setPaymentMethod({ tokens: payment.tokens, cash: payment.usd })}
                    disabled={false}
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
                      onClick={() => handleBookService(service)}
                      className="flex-1"
                      disabled={!paymentMethod.tokens && !paymentMethod.cash}
                    >
                      Confirm Booking
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
      </CardContent>
    </Card>
  );
}