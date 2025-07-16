import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  Clock,
  Coins,
  Plus,
  Star,
  Filter,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: 'tournament' | 'clinic' | 'social' | 'league';
  start_datetime: string;
  end_datetime: string;
  location: string;
  max_participants?: number;
  entry_fee_tokens?: number;
  organizer: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  participants_count: number;
  prize_pool?: number;
  skill_level?: string;
}

// Mock data for now - will be replaced with real data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Weekend Singles Tournament',
    description: 'Competitive singles tournament for intermediate players. Round-robin format followed by knockout rounds.',
    event_type: 'tournament',
    start_datetime: '2025-01-20T09:00:00Z',
    end_datetime: '2025-01-20T17:00:00Z',
    location: 'Central Tennis Club',
    max_participants: 16,
    entry_fee_tokens: 50,
    organizer: {
      id: 'org1',
      full_name: 'Sarah Chen',
      avatar_url: '/avatars/sarah.jpg'
    },
    participants_count: 12,
    prize_pool: 400,
    skill_level: 'Intermediate'
  },
  {
    id: '2',
    title: 'Tennis Clinic: Serve Masterclass',
    description: 'Learn professional serving techniques from certified coaches. Suitable for all skill levels.',
    event_type: 'clinic',
    start_datetime: '2025-01-18T14:00:00Z',
    end_datetime: '2025-01-18T16:00:00Z',
    location: 'Elite Tennis Academy',
    max_participants: 8,
    entry_fee_tokens: 25,
    organizer: {
      id: 'org2',
      full_name: 'Coach Mike Rodriguez',
      avatar_url: '/avatars/mike.jpg'
    },
    participants_count: 6,
    skill_level: 'All Levels'
  },
  {
    id: '3',
    title: 'Friday Social Mixer',
    description: 'Casual doubles play and networking. Great for meeting new tennis partners!',
    event_type: 'social',
    start_datetime: '2025-01-17T18:00:00Z',
    end_datetime: '2025-01-17T21:00:00Z',
    location: 'Community Courts Park',
    max_participants: 20,
    entry_fee_tokens: 10,
    organizer: {
      id: 'org3',
      full_name: 'Alex Thompson',
      avatar_url: '/avatars/alex.jpg'
    },
    participants_count: 15,
    skill_level: 'Beginner to Intermediate'
  }
];

export default function Events() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'tournament',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    max_participants: '',
    entry_fee_tokens: '',
    prize_pool: '',
    skill_level: ''
  });

  const filteredEvents = mockEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || event.event_type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleCreateEvent = () => {
    // Validate required fields
    if (!newEvent.title || !newEvent.start_date || !newEvent.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Here you would call the API to create the event
    console.log('Creating event:', newEvent);
    toast.success('Event created successfully!');
    setShowCreateDialog(false);
    
    // Reset form
    setNewEvent({
      title: '',
      description: '',
      event_type: 'tournament',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      location: '',
      max_participants: '',
      entry_fee_tokens: '',
      prize_pool: '',
      skill_level: ''
    });
  };

  const handleJoinEvent = (eventId: string) => {
    // Here you would call the API to join the event
    console.log('Joining event:', eventId);
    toast.success('Successfully joined the event!');
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament': return Trophy;
      case 'clinic': return Star;
      case 'social': return Users;
      case 'league': return Calendar;
      default: return Trophy;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'tournament': return 'from-yellow-500 to-yellow-600';
      case 'clinic': return 'from-blue-500 to-blue-600';
      case 'social': return 'from-green-500 to-green-600';
      case 'league': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">Discover and create tennis events</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Describe your event"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="event_type">Event Type</Label>
                  <Select value={newEvent.event_type} onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tournament">Tournament</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                      <SelectItem value="social">Social Event</SelectItem>
                      <SelectItem value="league">League</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="skill_level">Skill Level</Label>
                  <Select value={newEvent.skill_level} onValueChange={(value) => setNewEvent({ ...newEvent, skill_level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="All Levels">All Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newEvent.start_date}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={newEvent.start_time}
                    onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="Enter event location"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    value={newEvent.max_participants}
                    onChange={(e) => setNewEvent({ ...newEvent, max_participants: e.target.value })}
                    placeholder="16"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="entry_fee_tokens">Entry Fee (Tokens)</Label>
                  <Input
                    id="entry_fee_tokens"
                    type="number"
                    value={newEvent.entry_fee_tokens}
                    onChange={(e) => setNewEvent({ ...newEvent, entry_fee_tokens: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prize_pool">Prize Pool (Tokens)</Label>
                  <Input
                    id="prize_pool"
                    type="number"
                    value={newEvent.prize_pool}
                    onChange={(e) => setNewEvent({ ...newEvent, prize_pool: e.target.value })}
                    placeholder="400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            <SelectItem value="tournament">Tournaments</SelectItem>
            <SelectItem value="clinic">Clinics</SelectItem>
            <SelectItem value="social">Social Events</SelectItem>
            <SelectItem value="league">Leagues</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEvents.map((event) => {
          const IconComponent = getEventTypeIcon(event.event_type);
          const datetime = formatDateTime(event.start_datetime);
          const isFull = event.max_participants && event.participants_count >= event.max_participants;
          
          return (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${getEventTypeColor(event.event_type)} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {event.prize_pool && (
                    <Badge variant="outline" className="gap-1 text-yellow-600">
                      <Trophy className="h-3 w-3" />
                      {event.prize_pool}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{datetime.date} at {datetime.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.participants_count}
                      {event.max_participants && `/${event.max_participants}`} participants
                      {isFull && <span className="text-red-600 ml-1">(Full)</span>}
                    </span>
                  </div>
                  {event.skill_level && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{event.skill_level}</span>
                    </div>
                  )}
                  {event.entry_fee_tokens && (
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <span>{event.entry_fee_tokens} tokens</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={event.organizer.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {event.organizer.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    by {event.organizer.full_name}
                  </span>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => handleJoinEvent(event.id)}
                  disabled={isFull}
                >
                  {isFull ? 'Event Full' : 'Join Event'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create an event for the tennis community!
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}