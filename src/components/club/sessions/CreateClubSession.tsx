import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Coins, 
  DollarSign,
  AlertTriangle,
  Check,
  Trophy
} from 'lucide-react';
import { useClubSessions } from '@/hooks/useClubSessions';
import { useClubCourts } from '@/hooks/useClubCourts';
import { HybridPayment } from '@/components/payments/HybridPayment';

interface CreateClubSessionProps {
  clubId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const SESSION_TYPES = [
  { value: 'court_booking', label: 'Court Booking', icon: MapPin },
  { value: 'coaching', label: 'Coaching Session', icon: Users },
  { value: 'group_training', label: 'Group Training', icon: Users },
  { value: 'tournament', label: 'Tournament', icon: Trophy }
];

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00'
];

export function CreateClubSession({ clubId, isOpen, onClose, onSuccess }: CreateClubSessionProps) {
  const { createSession, getTierLimits, checkAvailability } = useClubSessions(clubId);
  const { courts } = useClubCourts(clubId);
  
  const [step, setStep] = useState(1);
  const [sessionData, setSessionData] = useState({
    session_type: 'court_booking' as const,
    title: '',
    description: '',
    court_id: '',
    coach_id: '',
    date: new Date(),
    start_time: '',
    end_time: '',
    max_participants: 1,
    cost_tokens: 50,
    cost_money: 0,
    payment_method: 'tokens' as const
  });
  
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleNext = async () => {
    if (step === 1) {
      // Validate basic session details
      if (!sessionData.title || !sessionData.date || !sessionData.start_time || !sessionData.end_time) {
        return;
      }
      
      // Check availability
      const startDateTime = new Date(sessionData.date);
      startDateTime.setHours(parseInt(sessionData.start_time.split(':')[0]), parseInt(sessionData.start_time.split(':')[1]));
      
      const endDateTime = new Date(sessionData.date);
      endDateTime.setHours(parseInt(sessionData.end_time.split(':')[0]), parseInt(sessionData.end_time.split(':')[1]));

      const sessionConflicts = await checkAvailability(
        startDateTime.toISOString(),
        endDateTime.toISOString(),
        sessionData.court_id || undefined,
        sessionData.coach_id || undefined
      );

      setConflicts(sessionConflicts);
      
      if (sessionConflicts.length > 0) {
        // Show conflicts but allow user to proceed
        setStep(2);
      } else {
        setStep(3); // Skip to payment
      }
    } else if (step === 2) {
      setStep(3); // Proceed to payment despite conflicts
    }
  };

  const handleCreateSession = async () => {
    setIsCreating(true);
    
    try {
      const startDateTime = new Date(sessionData.date);
      startDateTime.setHours(parseInt(sessionData.start_time.split(':')[0]), parseInt(sessionData.start_time.split(':')[1]));
      
      const endDateTime = new Date(sessionData.date);
      endDateTime.setHours(parseInt(sessionData.end_time.split(':')[0]), parseInt(sessionData.end_time.split(':')[1]));

      await createSession({
        ...sessionData,
        start_datetime: startDateTime.toISOString(),
        end_datetime: endDateTime.toISOString()
      });

      onSuccess?.();
      onClose();
      setStep(1);
      setSessionData({
        session_type: 'court_booking',
        title: '',
        description: '',
        court_id: '',
        coach_id: '',
        date: new Date(),
        start_time: '',
        end_time: '',
        max_participants: 1,
        cost_tokens: 50,
        cost_money: 0,
        payment_method: 'tokens'
      });
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const tierLimits = getTierLimits();

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Session Type */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Session Type</label>
              <div className="grid grid-cols-2 gap-3">
                {SESSION_TYPES.map(type => (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      sessionData.session_type === type.value 
                        ? 'border-tennis-green-primary bg-tennis-green-primary/5' 
                        : 'border-tennis-green-bg/20 hover:border-tennis-green-primary/50'
                    }`}
                    onClick={() => setSessionData(prev => ({ ...prev, session_type: type.value as any }))}
                  >
                    <CardContent className="p-4 text-center">
                      <type.icon className="h-6 w-6 mx-auto mb-2 text-tennis-green-primary" />
                      <p className="text-sm font-medium">{type.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Basic Details */}
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Session Title</label>
                <Input
                  value={sessionData.title}
                  onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter session title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
                <Textarea
                  value={sessionData.description}
                  onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add session details..."
                  rows={3}
                />
              </div>
            </div>

            {/* Court Selection */}
            {sessionData.session_type === 'court_booking' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Court</label>
                <Select value={sessionData.court_id} onValueChange={(value) => setSessionData(prev => ({ ...prev, court_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a court" />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map(court => (
                      <SelectItem key={court.id} value={court.id}>
                        <div className="flex items-center gap-2">
                          <span>{court.name}</span>
                          <Badge variant="outline">{court.surface_type}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Calendar
                  mode="single"
                  selected={sessionData.date}
                  onSelect={(date) => date && setSessionData(prev => ({ ...prev, date }))}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Start Time</label>
                <Select value={sessionData.start_time} onValueChange={(value) => setSessionData(prev => ({ ...prev, start_time: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">End Time</label>
                <Select value={sessionData.end_time} onValueChange={(value) => setSessionData(prev => ({ ...prev, end_time: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="End time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tier Limits Warning */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Session Limits</h4>
                    <p className="text-sm text-amber-700">
                      Your tier allows {tierLimits.maxSessionsPerMonth === -1 ? 'unlimited' : tierLimits.maxSessionsPerMonth} sessions per month.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Scheduling Conflicts Detected</h3>
              <p className="text-tennis-green-medium">
                There are conflicts with your selected time. You can still proceed but may need to coordinate.
              </p>
            </div>

            <div className="space-y-3">
              {conflicts.map((conflict, index) => (
                <Card key={index} className="border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-1" />
                      <div>
                        <p className="font-medium text-amber-800">{conflict.message}</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Conflicting session: {conflict.conflictingSession.title}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-tennis-green-primary/20 bg-tennis-green-primary/5">
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Options:</h4>
                <ul className="text-sm space-y-1 text-tennis-green-medium">
                  <li>• Choose a different time slot</li>
                  <li>• Contact the conflicting party to coordinate</li>
                  <li>• Proceed and resolve conflicts later</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Session Summary */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Session Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-tennis-green-medium">Type:</span>
                    <span className="font-medium">{SESSION_TYPES.find(t => t.value === sessionData.session_type)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tennis-green-medium">Date:</span>
                    <span className="font-medium">{format(sessionData.date, 'PPP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tennis-green-medium">Time:</span>
                    <span className="font-medium">{sessionData.start_time} - {sessionData.end_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-tennis-green-medium">Cost:</span>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-tennis-yellow" />
                      <span className="font-medium">{sessionData.cost_tokens} tokens</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <HybridPayment
              itemName={sessionData.title}
              totalCost={sessionData.cost_money}
              metadata={{
                sessionType: sessionData.session_type,
                clubId,
                sessionData
              }}
              onPaymentSuccess={handleCreateSession}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Create Club Session
          </DialogTitle>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((stepNum, index) => (
              <React.Fragment key={stepNum}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step >= stepNum 
                    ? 'border-tennis-green-primary bg-tennis-green-primary text-white' 
                    : 'border-tennis-green-bg text-tennis-green-medium'
                }`}>
                  {step > stepNum ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-medium">{stepNum}</span>
                  )}
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-1 rounded ${
                    step > stepNum ? 'bg-tennis-green-primary' : 'bg-tennis-green-bg'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        <div className="mt-6">
          {renderStepContent()}
        </div>

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isCreating}
            >
              Back
            </Button>
          )}
          
          <Button onClick={onClose} variant="outline" disabled={isCreating}>
            Cancel
          </Button>
          
          {step < 3 ? (
            <Button 
              onClick={handleNext}
              disabled={!sessionData.title || !sessionData.start_time || !sessionData.end_time}
            >
              {step === 2 ? 'Proceed Anyway' : 'Next'}
            </Button>
          ) : (
            <Button 
              onClick={handleCreateSession}
              disabled={isCreating}
              className="bg-tennis-green-primary hover:bg-tennis-green-primary/90"
            >
              {isCreating ? 'Creating...' : 'Create Session'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}