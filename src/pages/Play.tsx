import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Trophy, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  Search,
  Filter,
  Plus,
  Gamepad2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const Play = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');

  // Mock data for sessions/matches
  const activeSessions = [
    {
      id: 1,
      title: 'Competitive Singles',
      type: 'match',
      format: 'singles',
      level: 'Intermediate',
      location: 'Central Tennis Club',
      time: '2:00 PM',
      players: 1,
      maxPlayers: 2,
      stakes: { tokens: 50, rating: 15 },
      creator: 'Alex M.',
      distance: '0.8 miles'
    },
    {
      id: 2,
      title: 'Doubles Practice',
      type: 'social',
      format: 'doubles',
      level: 'Beginner',
      location: 'Riverside Courts',
      time: '4:30 PM',
      players: 2,
      maxPlayers: 4,
      stakes: { tokens: 0, rating: 0 },
      creator: 'Sarah L.',
      distance: '1.2 miles'
    },
    {
      id: 3,
      title: 'Rally & Drills',
      type: 'training',
      format: 'group',
      level: 'All Levels',
      location: 'Tennis Academy',
      time: '6:00 PM',
      players: 3,
      maxPlayers: 6,
      stakes: { tokens: 25, rating: 0 },
      creator: 'Mike R.',
      distance: '2.1 miles'
    }
  ];

  const upcomingSessions = [
    {
      id: 4,
      title: 'Tournament Prep',
      type: 'match',
      format: 'singles',
      level: 'Advanced',
      location: 'Elite Tennis Center',
      time: 'Tomorrow 10:00 AM',
      players: 0,
      maxPlayers: 2,
      stakes: { tokens: 100, rating: 25 },
      creator: 'David K.',
      distance: '3.4 miles'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-red-100 text-red-700';
      case 'social': return 'bg-green-100 text-green-700';
      case 'training': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'social': return Users;
      case 'training': return Star;
      default: return Gamepad2;
    }
  };

  const SessionCard = ({ session }: { session: any }) => {
    const TypeIcon = getTypeIcon(session.type);
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-tennis-green-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-tennis-green-primary" />
              <CardTitle className="text-lg">{session.title}</CardTitle>
            </div>
            <Badge className={getTypeColor(session.type)}>
              {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{session.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{session.time}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">{session.format}</Badge>
                <Badge variant="outline">{session.level}</Badge>
                <span className="text-sm text-gray-500">{session.distance}</span>
              </div>
              <div className="text-sm font-medium">
                {session.players}/{session.maxPlayers} players
              </div>
            </div>
            
            {session.stakes.tokens > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-600 font-medium">
                  Stakes: {session.stakes.tokens} tokens
                </span>
                {session.stakes.rating > 0 && (
                  <span className="text-blue-600 font-medium">
                    +{session.stakes.rating} rating
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-500">
                Created by {session.creator}
              </span>
              <Button size="sm" className="bg-tennis-green-primary hover:bg-tennis-green-medium">
                Join Session
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-tennis-green-dark mb-2">
            Find Your Match 🎾
          </h1>
          <p className="text-tennis-green-medium">
            Discover players, join sessions, and compete in your area
          </p>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by location, player name, or session type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <Link to="/sessions/create">
                  <Button size="sm" className="bg-tennis-green-primary hover:bg-tennis-green-medium">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Types */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Now</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-tennis-green-dark">
                Active Sessions
              </h2>
              <Badge variant="outline">
                {activeSessions.length} available
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="upcoming" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-tennis-green-dark">
                Upcoming Sessions
              </h2>
              <Badge variant="outline">
                {upcomingSessions.length} scheduled
              </Badge>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="my-sessions" className="space-y-4">
            <div className="text-center py-12">
              <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No Active Sessions
              </h3>
              <p className="text-gray-500 mb-4">
                You haven't joined any sessions yet. Start playing!
              </p>
              <Link to="/sessions/create">
                <Button className="bg-tennis-green-primary hover:bg-tennis-green-medium">
                  Create Your First Session
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-tennis-green-primary">12</div>
              <div className="text-sm text-gray-600">Active Players</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-tennis-green-primary">5</div>
              <div className="text-sm text-gray-600">Available Courts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-tennis-green-primary">8</div>
              <div className="text-sm text-gray-600">This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-tennis-green-primary">3.2</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Play;