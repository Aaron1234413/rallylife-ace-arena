
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
import { useCreateLessonSession } from '@/hooks/useLessonSessions';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface QuickScheduleCardProps {
  otherUserId?: string;
  conversationId: string;
}

export function QuickScheduleCard({ otherUserId, conversationId }: QuickScheduleCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [scheduling, setScheduling] = useState(false);

  const createSession = useCreateLessonSession();

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleQuickSchedule = async () => {
    if (!selectedDate || !selectedTime || !otherUserId || scheduling) return;

    setScheduling(true);
    try {
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      await createSession.mutateAsync({
        player_id: otherUserId,
        title: 'Tennis Lesson',
        scheduled_date: scheduledDateTime.toISOString(),
        duration_minutes: parseInt(duration),
        session_type: 'private'
      });

      toast.success('Lesson scheduled successfully!');
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setDuration('60');
    } catch (error) {
      console.error('Error scheduling lesson:', error);
      toast.error('Failed to schedule lesson');
    } finally {
      setScheduling(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Quick Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "MMM dd") : "Select date"}
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

        {/* Time Selection */}
        <div className="space-y-2">
          <Label>Time</Label>
          <Select value={selectedTime} onValueChange={setSelectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {timeSlots.map((time) => (
                <SelectItem key={time} value={time}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {time}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Schedule Button */}
        <Button 
          onClick={handleQuickSchedule}
          disabled={!selectedDate || !selectedTime || !otherUserId || scheduling}
          className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
        >
          {scheduling ? 'Scheduling...' : 'Schedule Lesson'}
        </Button>
      </CardContent>
    </Card>
  );
}
