
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, User, MapPin } from 'lucide-react';
import { useCreateLessonSession } from '@/hooks/useLessonSessions';
import { useProfiles } from '@/hooks/useProfiles';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function LessonScheduler() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [sessionType, setSessionType] = useState('private');
  const [location, setLocation] = useState('');
  const [skillsFocus, setSkillsFocus] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const { data: players } = useProfiles();
  const createSession = useCreateLessonSession();

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const sessionTypes = [
    { value: 'private', label: 'Private Lesson' },
    { value: 'group', label: 'Group Lesson' },
    { value: 'assessment', label: 'Skills Assessment' },
    { value: 'match_play', label: 'Match Play' }
  ];

  const addSkill = () => {
    if (newSkill.trim() && !skillsFocus.includes(newSkill.trim())) {
      setSkillsFocus([...skillsFocus, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkillsFocus(skillsFocus.filter(s => s !== skill));
  };

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime || !selectedPlayer || !title) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      await createSession.mutateAsync({
        player_id: selectedPlayer,
        title,
        description,
        scheduled_date: scheduledDateTime.toISOString(),
        duration_minutes: parseInt(duration),
        session_type: sessionType,
        location,
        skills_focus: skillsFocus,
        hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined
      });

      toast.success('Lesson scheduled successfully!');
      
      // Reset form
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedPlayer('');
      setTitle('');
      setDescription('');
      setDuration('60');
      setSessionType('private');
      setLocation('');
      setSkillsFocus([]);
      setHourlyRate('');
    } catch (error) {
      console.error('Error scheduling lesson:', error);
      toast.error('Failed to schedule lesson');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Schedule Lesson
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Forehand Technique Session"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="player">Select Player *</Label>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a player..." />
              </SelectTrigger>
              <SelectContent>
                {players?.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {player.full_name || player.email}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select date"}
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
            <Label htmlFor="time">Time *</Label>
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

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Session Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="session-type">Session Type</Label>
            <Select value={sessionType} onValueChange={setSessionType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sessionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                placeholder="e.g., Court 1, Tennis Center"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Skills Focus */}
        <div className="space-y-2">
          <Label htmlFor="skills">Skills Focus</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Add a skill to focus on..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>
          {skillsFocus.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skillsFocus.map((skill) => (
                <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                  {skill} ×
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Description and Rate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about the lesson..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Hourly Rate ($)</Label>
            <Input
              id="rate"
              type="number"
              placeholder="e.g., 75"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
            {hourlyRate && duration && (
              <p className="text-sm text-muted-foreground">
                Total cost: ${((parseFloat(hourlyRate) * parseInt(duration)) / 60).toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {/* Schedule Button */}
        <Button 
          onClick={handleSchedule}
          disabled={!selectedDate || !selectedTime || !selectedPlayer || !title || createSession.isPending}
          className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
        >
          {createSession.isPending ? 'Scheduling...' : 'Schedule Lesson'}
        </Button>
      </CardContent>
    </Card>
  );
}
