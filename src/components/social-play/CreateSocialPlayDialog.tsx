
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSocialPlayEvents } from '@/hooks/useSocialPlayEvents';

interface CreateSocialPlayDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEventCreated?: () => void;
}

export const CreateSocialPlayDialog: React.FC<CreateSocialPlayDialogProps> = ({
  children,
  open,
  onOpenChange,
  onEventCreated,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { createEvent, isCreatingEvent } = useSocialPlayEvents();

  // Form state
  const [title, setTitle] = useState('');
  const [sessionType, setSessionType] = useState<'singles' | 'doubles'>('singles');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [description, setDescription] = useState('');

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !location.trim() || !scheduledDate || !scheduledTime) {
      return;
    }

    // Combine date and time
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(hours, minutes);

    try {
      await createEvent({
        title: title.trim(),
        session_type: sessionType,
        location: location.trim(),
        scheduled_time: scheduledDateTime,
        description: description.trim() || undefined,
        invited_users: [], // Simplified - no invitations for now
      });
      
      // Reset form
      setTitle('');
      setLocation('');
      setScheduledDate(undefined);
      setScheduledTime('');
      setDescription('');
      
      handleOpenChange(false);
      onEventCreated?.();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create Social Tennis Event
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-medium">
            Event Title
          </Label>
          <Input
            id="title"
            placeholder="e.g., Sunday Morning Tennis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Session Type */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Session Type</Label>
          <RadioGroup
            value={sessionType}
            onValueChange={(value) => setSessionType(value as 'singles' | 'doubles')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="singles" id="singles" />
              <Label htmlFor="singles">Singles (1v1)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="doubles" id="doubles" />
              <Label htmlFor="doubles">Doubles (2v2)</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-medium">
            Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="location"
              placeholder="Tennis court or venue"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base font-medium">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={scheduledDate}
                  onSelect={setScheduledDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time" className="text-base font-medium">
              Time
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium">
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            placeholder="Add any additional details about the event..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={!title.trim() || !location.trim() || !scheduledDate || !scheduledTime || isCreatingEvent}
            className="flex-1"
          >
            {isCreatingEvent ? 'Creating Event...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  // If we're controlling the dialog externally and no children are provided,
  // render the dialog without a trigger
  if (open !== undefined && !children) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  // Standard implementation with trigger
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      {dialogContent}
    </Dialog>
  );
};
