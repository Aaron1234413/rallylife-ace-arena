import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  Clock,
  Target,
  GraduationCap,
  Users,
  AlertTriangle,
  Coins,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { useClubSessions, SessionConflict } from '@/hooks/useClubSessions';
import { useRealTimeCourtBookings } from '@/hooks/useRealTimeCourtBookings';
import { useRealTimeCoachBookings } from '@/hooks/useRealTimeCoachBookings';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CreateClubSessionProps {
  club: Club;
  onSessionCreated?: () => void;
}

export function CreateClubSession({ club, onSessionCreated }: CreateClubSessionProps) {
  const { user } = useAuth();
  const { createSession, checkAvailability, getTierLimits } = useClubSessions(club.id);
  const { bookings: courtBookings } = useRealTimeCourtBookings(club.id);
  const { bookings: coachBookings } = useRealTimeCoachBookings(club.id);

  const [sessionType, setSessionType] = useState<'court_booking' | 'coaching' | 'group_training'>('court_booking');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('1');
  const [maxParticipants, setMaxParticipants] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState<'tokens' | 'money'>('tokens');
  const [conflicts, setConflicts] = useState<SessionConflict[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Mock data for courts and coaches
  const availableCourts = [
    { id: 'court-1', name: 'Court 1', surface: 'Hard', tokenCost: 50, moneyCost: 30 },
    { id: 'court-2', name: 'Court 2', surface: 'Clay', tokenCost: 60, moneyCost: 35 },
    { id: 'court-3', name: 'Court 3', surface: 'Grass', tokenCost: 70, moneyCost: 40 }
  ];

  const availableCoaches = [
    { id: 'coach-1', name: 'David Rodriguez', specialization: 'Singles', tokenCost: 75, moneyCost: 45 },
    { id: 'coach-2', name: 'Sarah Martinez', specialization: 'Doubles', tokenCost: 65, moneyCost: 40 },
    { id: 'coach-3', name: 'Michael Chen', specialization: 'Fitness', tokenCost: 55, moneyCost: 35 }
  ];

  // Calculate cost based on selection
  const calculateCost = () => {
    const durationHours = parseFloat(duration);
    let baseCost = 0;

    if (sessionType === 'court_booking' && selectedCourt) {
      const court = availableCourts.find(c => c.id === selectedCourt);
      baseCost = court ? (paymentMethod === 'tokens' ? court.tokenCost : court.moneyCost) : 0;
    } else if (sessionType === 'coaching' && selectedCoach) {
      const coach = availableCoaches.find(c => c.id === selectedCoach);
      baseCost = coach ? (paymentMethod === 'tokens' ? coach.tokenCost : coach.moneyCost) : 0;
    } else if (sessionType === 'group_training') {
      baseCost = paymentMethod === 'tokens' ? 25 : 15; // Group training base rate
    }

    return Math.round(baseCost * durationHours);
  };

  // Check for conflicts when inputs change
  useEffect(() => {
    const checkConflicts = async () => {
      if (!selectedDate || !startTime) {
        setConflicts([]);
        return;
      }

      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + parseFloat(duration));

      try {
        const sessionConflicts = await checkAvailability(
          startDateTime.toISOString(),
          endDateTime.toISOString(),
          sessionType === 'court_booking' ? selectedCourt : undefined,
          sessionType === 'coaching' ? selectedCoach : undefined
        );
        setConflicts(sessionConflicts);
      } catch (error) {
        console.error('Error checking conflicts:', error);
      }
    };

    checkConflicts();
  }, [selectedDate, startTime, duration, selectedCourt, selectedCoach, sessionType]);

  const handleCreateSession = async () => {
    if (!selectedDate || !startTime || !title.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (conflicts.length > 0) {
      toast.error('Please resolve conflicts before creating the session');
      return;
    }

    setIsCreating(true);
    try {
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] = startTime.split(':').map(Number);
      startDateTime.setHours(hours, minutes, 0, 0);

      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + parseFloat(duration));

      const cost = calculateCost();

      await createSession({
        session_type: sessionType,
        title: title.trim(),
        description: description.trim() || undefined,
        court_id: sessionType === 'court_booking' ? selectedCourt : undefined,
        coach_id: sessionType === 'coaching' ? selectedCoach : undefined,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString(),
        cost_tokens: paymentMethod === 'tokens' ? cost : 0,
        cost_money: paymentMethod === 'money' ? cost : 0,
        payment_method: paymentMethod,
        max_participants: parseInt(maxParticipants)
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedDate(undefined);
      setSelectedCourt('');
      setSelectedCoach('');
      setStartTime('');
      setDuration('1');
      setMaxParticipants('1');
      
      onSessionCreated?.();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create session');
    } finally {
      setIsCreating(false);
    }
  };

  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'court_booking':
        return <Target className="h-4 w-4" />;
      case 'coaching':
        return <GraduationCap className="h-4 w-4" />;
      case 'group_training':
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const tierLimits = getTierLimits();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Create Club Session
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Type Selection */}
        <div className="space-y-3">
          <Label>Session Type</Label>
          <RadioGroup value={sessionType} onValueChange={(value: any) => setSessionType(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="court_booking" id="court_booking" />
              <Label htmlFor="court_booking" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Court Booking
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="coaching" id="coaching" />
              <Label htmlFor="coaching" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Coaching Session
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="group_training" id="group_training" />
              <Label htmlFor="group_training" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Group Training
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Session Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Session Title *</Label>
            <Input
              id="title"
              placeholder="Enter session title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="max_participants">Max Participants</Label>
            <Select value={maxParticipants} onValueChange={setMaxParticipants}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 8, 10].map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add session details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Date and Time Selection */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Date *</Label>
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
            <Label htmlFor="start_time">Start Time *</Label>
            <Select value={startTime} onValueChange={setStartTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 28 }, (_, i) => {
                  const hour = Math.floor(i / 2) + 6;
                  const minute = i % 2 === 0 ? '00' : '30';
                  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                  return (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (hours)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">30 minutes</SelectItem>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="1.5">1.5 hours</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="2.5">2.5 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Court/Coach Selection */}
        {sessionType === 'court_booking' && (
          <div className="space-y-2">
            <Label>Select Court *</Label>
            <Select value={selectedCourt} onValueChange={setSelectedCourt}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a court" />
              </SelectTrigger>
              <SelectContent>
                {availableCourts.map((court) => (
                  <SelectItem key={court.id} value={court.id}>
                    {court.name} - {court.surface} ({court.tokenCost} tokens/hr)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {sessionType === 'coaching' && (
          <div className="space-y-2">
            <Label>Select Coach *</Label>
            <Select value={selectedCoach} onValueChange={setSelectedCoach}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a coach" />
              </SelectTrigger>
              <SelectContent>
                {availableCoaches.map((coach) => (
                  <SelectItem key={coach.id} value={coach.id}>
                    {coach.name} - {coach.specialization} ({coach.tokenCost} tokens/hr)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Payment Method */}
        <div className="space-y-3">
          <Label>Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tokens" id="tokens" />
              <Label htmlFor="tokens" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Tokens ({calculateCost()} tokens)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="money" id="money" />
              <Label htmlFor="money" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Cash (${calculateCost()})
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Conflicts Display */}
        {conflicts.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Scheduling conflicts detected:</p>
                {conflicts.map((conflict, index) => (
                  <p key={index} className="text-sm">• {conflict.message}</p>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Tier Limits Info */}
        <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
          <p className="text-sm text-tennis-green-medium">
            <strong>Session Limits:</strong> {tierLimits.maxSessionsPerMonth === -1 ? 'Unlimited' : `${tierLimits.maxSessionsPerMonth} sessions per month`}
            {sessionType === 'coaching' && `, ${tierLimits.maxCoachingSessions === -1 ? 'unlimited' : tierLimits.maxCoachingSessions} coaching sessions`}
          </p>
        </div>

        <Button
          onClick={handleCreateSession}
          disabled={isCreating || conflicts.length > 0 || !title.trim() || !selectedDate || !startTime}
          className="w-full"
        >
          {isCreating ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creating Session...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Create Session
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}