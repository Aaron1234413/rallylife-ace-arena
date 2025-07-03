import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar,
  Clock,
  DollarSign,
  Coins,
  Star,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { toast } from 'sonner';

interface ClubCoachBookingProps {
  club: Club;
  canBook: boolean;
}

interface CoachService {
  id: string;
  coach_id: string;
  coach_name: string;
  coach_avatar: string | null;
  coach_rating: number;
  service_type: string;
  title: string;
  description: string;
  rate_tokens: number;
  rate_money: number;
  duration_minutes: number;
  max_participants: number;
  specializations: string[];
}

export function ClubCoachBooking({ club, canBook }: ClubCoachBookingProps) {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('tokens');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Mock coach services data
  const coachServices: CoachService[] = [
    {
      id: '1',
      coach_id: 'coach-1',
      coach_name: 'David Rodriguez',
      coach_avatar: null,
      coach_rating: 4.9,
      service_type: 'lesson',
      title: 'Singles Technique Mastery',
      description: 'Focused coaching on improving your singles game with emphasis on technique, footwork, and shot selection.',
      rate_tokens: 75,
      rate_money: 45,
      duration_minutes: 60,
      max_participants: 1,
      specializations: ['Singles', 'Technique', 'Mental Game']
    },
    {
      id: '2',
      coach_id: 'coach-1',
      coach_name: 'David Rodriguez',
      coach_avatar: null,
      coach_rating: 4.9,
      service_type: 'assessment',
      title: 'Skill Assessment & Plan',
      description: 'Comprehensive assessment of your current skills with personalized improvement plan and practice recommendations.',
      rate_tokens: 50,
      rate_money: 30,
      duration_minutes: 90,
      max_participants: 1,
      specializations: ['Singles', 'Technique', 'Mental Game']
    },
    {
      id: '3',
      coach_id: 'coach-2',
      coach_name: 'Sarah Martinez',
      coach_avatar: null,
      coach_rating: 4.8,
      service_type: 'group',
      title: 'Doubles Strategy Workshop',
      description: 'Group session focusing on doubles positioning, communication, and strategic play patterns.',
      rate_tokens: 40,
      rate_money: 25,
      duration_minutes: 90,
      max_participants: 4,
      specializations: ['Doubles', 'Strategy', 'Beginner Coaching']
    },
    {
      id: '4',
      coach_id: 'coach-2',
      coach_name: 'Sarah Martinez',
      coach_avatar: null,
      coach_rating: 4.8,
      service_type: 'lesson',
      title: 'Beginner Friendly Lesson',
      description: 'Perfect for new players! Learn basic techniques, rules, and build confidence on the court.',
      rate_tokens: 55,
      rate_money: 35,
      duration_minutes: 60,
      max_participants: 2,
      specializations: ['Doubles', 'Strategy', 'Beginner Coaching']
    },
    {
      id: '5',
      coach_id: 'coach-3',
      coach_name: 'Michael Chen',
      coach_avatar: null,
      coach_rating: 4.7,
      service_type: 'training',
      title: 'Tennis Fitness & Conditioning',
      description: 'Sport-specific fitness training to improve your strength, agility, and endurance for tennis.',
      rate_tokens: 45,
      rate_money: 30,
      duration_minutes: 45,
      max_participants: 6,
      specializations: ['Fitness', 'Conditioning', 'Injury Prevention']
    }
  ];

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ];

  const selectedServiceData = coachServices.find(s => s.id === selectedService);

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsBooking(true);
    try {
      // Mock booking functionality
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Coaching session booked successfully!');
      
      // Reset form
      setSelectedService('');
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
      
      console.log('Booking details:', {
        service: selectedServiceData,
        date: selectedDate,
        time: selectedTime,
        paymentMethod,
        notes
      });
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session');
    } finally {
      setIsBooking(false);
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

  const getServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson': return 'Private Lesson';
      case 'group': return 'Group Session';
      case 'training': return 'Training Session';
      case 'assessment': return 'Skill Assessment';
      default: return type;
    }
  };

  if (!canBook) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">Member Access Required</h3>
          <p className="text-sm text-muted-foreground">
            You must be a club member to book coaching sessions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-tennis-green-dark">Book Coaching Session</h2>
        <p className="text-sm text-tennis-green-medium">
          Choose from available coaching services and book your session
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Services */}
        <Card>
          <CardHeader>
            <CardTitle>Available Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coachServices.map((service) => (
              <div 
                key={service.id} 
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedService === service.id ? 'ring-2 ring-tennis-green-primary bg-tennis-green-bg/30' : ''
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={service.coach_avatar || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {service.coach_name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-tennis-green-dark">{service.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {getServiceTypeLabel(service.service_type)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-tennis-green-medium mb-2">
                      by {service.coach_name}
                    </p>
                    
                    <div className="flex items-center gap-1 mb-2">
                      {getRatingStars(service.coach_rating)}
                      <span className="text-xs text-tennis-green-medium ml-1">
                        {service.coach_rating}
                      </span>
                    </div>
                    
                    <p className="text-sm text-tennis-green-medium mb-3 line-clamp-2">
                      {service.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          Max {service.max_participants}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {service.rate_tokens}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${service.rate_money}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book Your Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedServiceData && (
              <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
                <h4 className="font-medium text-tennis-green-dark mb-1">
                  {selectedServiceData.title}
                </h4>
                <p className="text-sm text-tennis-green-medium">
                  with {selectedServiceData.coach_name} • {selectedServiceData.duration_minutes} minutes
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border rounded-md"
                disabled={!selectedService}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Time</label>
              <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={!selectedService}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tokens">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Tokens ({selectedServiceData?.rate_tokens || 0})
                    </div>
                  </SelectItem>
                  <SelectItem value="money">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Cash (${selectedServiceData?.rate_money || 0})
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Any specific goals or notes for the coach..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!selectedService}
                rows={3}
              />
            </div>

            <Button
              onClick={handleBooking}
              disabled={isBooking || !selectedService || !selectedDate || !selectedTime}
              className="w-full"
            >
              {isBooking ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Booking Session...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Book Session
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}