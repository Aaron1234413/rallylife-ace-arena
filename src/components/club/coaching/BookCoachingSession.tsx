import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { 
  GraduationCap,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Star,
  DollarSign,
  Coins,
  Target,
  Award,
  Trophy,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { useClubSessions } from '@/hooks/useClubSessions';
import { useRealTimeCoachBookings } from '@/hooks/useRealTimeCoachBookings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CoachService {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_tokens: number;
  price_money: number;
  service_type: string;
  max_participants: number;
  specializations: string[];
}

interface Coach {
  id: string;
  name: string;
  avatar_url?: string;
  rating: number;
  total_sessions: number;
  specializations: string[];
  bio: string;
  services: CoachService[];
  hourly_rate_tokens: number;
  hourly_rate_money: number;
}

interface BookCoachingSessionProps {
  club: Club;
  preSelectedCoach?: string;
  onSessionBooked?: () => void;
}

export function BookCoachingSession({ club, preSelectedCoach, onSessionBooked }: BookCoachingSessionProps) {
  const { user } = useAuth();
  const { createSession, checkAvailability, getTierLimits } = useClubSessions(club.id);
  const { getCoachAvailability } = useRealTimeCoachBookings(club.id);

  const [selectedCoach, setSelectedCoach] = useState(preSelectedCoach || '');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'tokens' | 'money'>('tokens');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Mock coaches data with services
  const coaches: Coach[] = [
    {
      id: 'coach-1',
      name: 'David Rodriguez',
      avatar_url: undefined,
      rating: 4.9,
      total_sessions: 156,
      specializations: ['Singles', 'Technique', 'Mental Game'],
      bio: 'Former professional player with extensive coaching experience.',
      hourly_rate_tokens: 75,
      hourly_rate_money: 45,
      services: [
        {
          id: 'service-1',
          name: 'Individual Lesson',
          description: 'One-on-one coaching focused on technique',
          duration_minutes: 60,
          price_tokens: 75,
          price_money: 45,
          service_type: 'individual',
          max_participants: 1,
          specializations: ['Technique', 'Singles']
        },
        {
          id: 'service-2',
          name: 'Intensive Training',
          description: 'Extended session for serious improvement',
          duration_minutes: 90,
          price_tokens: 100,
          price_money: 60,
          service_type: 'intensive',
          max_participants: 1,
          specializations: ['Advanced', 'Tournament Prep']
        }
      ]
    },
    {
      id: 'coach-2',
      name: 'Sarah Martinez',
      avatar_url: undefined,
      rating: 4.8,
      total_sessions: 203,
      specializations: ['Doubles', 'Strategy', 'Beginner'],
      bio: 'Certified tennis professional focusing on doubles strategy.',
      hourly_rate_tokens: 65,
      hourly_rate_money: 40,
      services: [
        {
          id: 'service-3',
          name: 'Doubles Strategy',
          description: 'Learn doubles positioning and tactics',
          duration_minutes: 60,
          price_tokens: 65,
          price_money: 40,
          service_type: 'individual',
          max_participants: 2,
          specializations: ['Doubles', 'Strategy']
        },
        {
          id: 'service-4',
          name: 'Group Lesson',
          description: 'Small group training session',
          duration_minutes: 60,
          price_tokens: 35,
          price_money: 25,
          service_type: 'group',
          max_participants: 4,
          specializations: ['Beginner', 'Group']
        }
      ]
    }
  ];

  const selectedCoachData = coaches.find(c => c.id === selectedCoach);
  const selectedServiceData = selectedCoachData?.services.find(s => s.id === selectedService);

  // Generate available time slots
  const getAvailableTimeSlots = () => {
    if (!selectedDate || !selectedCoach) return [];
    
    const dateStr = selectedDate.toISOString().split('T')[0];
    const { available } = getCoachAvailability(selectedCoach, dateStr);
    
    // Mock available slots for demo
    return [
      '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
    ];
  };

  // Check for conflicts when inputs change
  useEffect(() => {
    const checkConflicts = async () => {
      if (!selectedDate || !selectedTime || !selectedServiceData) {
        setConflicts([]);
        return;
      }

      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + (selectedServiceData.duration_minutes / 60));

      try {
        const sessionConflicts = await checkAvailability(
          startDateTime.toISOString(),
          endDateTime.toISOString(),
          undefined,
          selectedCoach
        );
        setConflicts(sessionConflicts);
      } catch (error) {
        console.error('Error checking conflicts:', error);
      }
    };

    checkConflicts();
  }, [selectedDate, selectedTime, selectedCoach, selectedService]);

  const handleBookSession = async () => {
    if (!selectedCoach || !selectedService || !selectedDate || !selectedTime || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (conflicts.length > 0) {
      toast.error('Please resolve scheduling conflicts');
      return;
    }

    setIsBooking(true);
    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + (selectedServiceData!.duration_minutes / 60));

      const cost = paymentMethod === 'tokens' ? selectedServiceData!.price_tokens : selectedServiceData!.price_money;

      await createSession({
        session_type: 'coaching',
        title: `${selectedServiceData!.name} with ${selectedCoachData!.name}`,
        description: `${selectedServiceData!.description}${notes ? `\n\nNotes: ${notes}` : ''}`,
        coach_id: selectedCoach,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        cost_tokens: paymentMethod === 'tokens' ? cost : 0,
        cost_money: paymentMethod === 'money' ? cost : 0,
        payment_method: paymentMethod,
        max_participants: selectedServiceData!.max_participants
      });

      // Reset form
      setSelectedCoach(preSelectedCoach || '');
      setSelectedService('');
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');

      onSessionBooked?.();
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to book session');
    } finally {
      setIsBooking(false);
    }
  };

  const getServiceTypeIcon = (type: string) => {
    switch (type) {
      case 'individual':
        return <Target className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'intensive':
        return <Trophy className="h-4 w-4" />;
      case 'assessment':
        return <Award className="h-4 w-4" />;
      default:
        return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const tierLimits = getTierLimits();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-tennis-green-dark">Book Coaching Session</h2>
        <p className="text-sm text-tennis-green-medium">
          Schedule a lesson with one of our professional coaches
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Booking Form */}
        <div className="space-y-6">
          {/* Coach Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Coach</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {coaches.map((coach) => (
                <div
                  key={coach.id}
                  onClick={() => setSelectedCoach(coach.id)}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-colors",
                    selectedCoach === coach.id 
                      ? "border-tennis-green-primary bg-tennis-green-bg/20" 
                      : "hover:bg-tennis-green-bg/10"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={coach.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {coach.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{coach.name}</h3>
                        <div className="flex items-center gap-1">
                          {getRatingStars(coach.rating)}
                          <span className="text-xs text-tennis-green-medium">
                            {coach.rating} ({coach.total_sessions} sessions)
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-tennis-green-medium mb-2">{coach.bio}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {coach.specializations.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Service Selection */}
          {selectedCoachData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedCoachData.services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-colors",
                      selectedService === service.id 
                        ? "border-tennis-green-primary bg-tennis-green-bg/20" 
                        : "hover:bg-tennis-green-bg/10"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getServiceTypeIcon(service.service_type)}
                          <h4 className="font-medium">{service.name}</h4>
                        </div>
                        
                        <p className="text-sm text-tennis-green-medium mb-2">
                          {service.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-tennis-green-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {service.duration_minutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            Max {service.max_participants}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {service.price_tokens} tokens
                        </p>
                        <p className="text-xs text-tennis-green-medium">
                          ${service.price_money}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Date and Time Selection */}
          {selectedService && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Date</Label>
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
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableTimeSlots().map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tokens" id="tokens" />
                      <Label htmlFor="tokens" className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        Tokens ({selectedServiceData?.price_tokens})
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="money" id="money" />
                      <Label htmlFor="money" className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Cash (${selectedServiceData?.price_money})
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any specific goals or areas you'd like to focus on..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Summary */}
        <div className="space-y-6">
          {selectedServiceData && selectedCoachData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-tennis-green-medium">Coach:</span>
                    <span className="text-sm font-medium">{selectedCoachData.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-tennis-green-medium">Service:</span>
                    <span className="text-sm font-medium">{selectedServiceData.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-tennis-green-medium">Duration:</span>
                    <span className="text-sm font-medium">{selectedServiceData.duration_minutes} minutes</span>
                  </div>
                  
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-sm text-tennis-green-medium">Date:</span>
                      <span className="text-sm font-medium">{format(selectedDate, "PPP")}</span>
                    </div>
                  )}
                  
                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className="text-sm text-tennis-green-medium">Time:</span>
                      <span className="text-sm font-medium">
                        {selectedTime} - {format(new Date(`2000-01-01T${selectedTime}:00`).getTime() + selectedServiceData.duration_minutes * 60000, 'HH:mm')}
                      </span>
                    </div>
                  )}

                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total Cost:</span>
                    <span>
                      {paymentMethod === 'tokens' 
                        ? `${selectedServiceData.price_tokens} tokens`
                        : `$${selectedServiceData.price_money}`
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Scheduling conflicts:</p>
                  {conflicts.map((conflict, index) => (
                    <p key={index} className="text-sm">• {conflict.message}</p>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Tier Limits */}
          <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
            <p className="text-sm text-tennis-green-medium">
              <strong>Coaching Limit:</strong> {tierLimits.maxCoachingSessions === -1 ? 'Unlimited' : `${tierLimits.maxCoachingSessions} sessions per month`}
            </p>
          </div>

          {/* Book Button */}
          <Button
            onClick={handleBookSession}
            disabled={
              isBooking || 
              !selectedCoach || 
              !selectedService || 
              !selectedDate || 
              !selectedTime ||
              conflicts.length > 0
            }
            className="w-full"
            size="lg"
          >
            {isBooking ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Booking Session...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Book Coaching Session
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}