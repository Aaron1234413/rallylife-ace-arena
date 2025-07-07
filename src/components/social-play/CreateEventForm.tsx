
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { UserSearchSelector } from './UserSearchSelector';
import { LocationInput } from '@/components/ui/location-input';

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  skill_level?: string;
  location?: string;
}

interface CreateEventFormProps {
  onEventCreate: (eventData: {
    title: string;
    session_type: 'singles' | 'doubles';
    location: string;
    scheduled_time: Date;
    description?: string;
    invited_users: string[];
  }) => void;
  isCreating: boolean;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  onEventCreate,
  isCreating,
}) => {
  const [title, setTitle] = useState('');
  const [sessionType, setSessionType] = useState<'singles' | 'doubles'>('singles');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const handleUserSelect = (user: User) => {
    setSelectedUsers(prev => [...prev, user]);
  };

  const handleUserRemove = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !location.trim() || !scheduledDate || !scheduledTime) {
      return;
    }

    // Combine date and time
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduledDate);
    scheduledDateTime.setHours(hours, minutes);

    onEventCreate({
      title: title.trim(),
      session_type: sessionType,
      location: location.trim(),
      scheduled_time: scheduledDateTime,
      description: description.trim() || undefined,
      invited_users: selectedUsers.map(u => u.id),
    });
  };

  const maxParticipants = sessionType === 'singles' ? 1 : 3;

  return (
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
          onValueChange={(value) => {
            setSessionType(value as 'singles' | 'doubles');
            // Reset selected users if switching to more restrictive type
            if (value === 'singles' && selectedUsers.length > 1) {
              setSelectedUsers(prev => prev.slice(0, 1));
            }
          }}
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
        <LocationInput
          value={location ? { address: location } : null}
          onChange={(locationData) => setLocation(locationData?.address || '')}
          placeholder="Tennis court or venue"
        />
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

      {/* User Selection */}
      <UserSearchSelector
        selectedUsers={selectedUsers}
        onUserSelect={handleUserSelect}
        onUserRemove={handleUserRemove}
        maxSelection={maxParticipants}
        sessionType={sessionType}
      />

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!title.trim() || !location.trim() || !scheduledDate || !scheduledTime || isCreating}
          className="flex-1"
        >
          {isCreating ? 'Creating Event...' : `Create Event & Invite ${selectedUsers.length} Player${selectedUsers.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </form>
  );
};
