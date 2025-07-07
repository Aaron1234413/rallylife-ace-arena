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
  Gamepad2,
  Coins
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { useSafeRealTimeSessions } from '@/hooks/useSafeRealTimeSessions';
import { useAuth } from '@/hooks/useAuth';

const Play = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('all');

  // Get real session data
  const { 
    sessions: availableSessions, 
    loading: availableLoading, 
    joinSession 
  } = useSafeRealTimeSessions('available', user?.id);
  
  const { 
    sessions: mySessions, 
    loading: mySessionsLoading 
  } = useSafeRealTimeSessions('my-sessions', user?.id);

  // Filter sessions based on search and format
  const filteredAvailableSessions = availableSessions.filter(session => {
    const matchesSearch = !searchQuery || 
      session.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.creator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.session_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFormat = selectedFormat === 'all' || 
      session.session_type === selectedFormat ||
      session.format === selectedFormat;
    
    return matchesSearch && matchesFormat;
  });

  // Separate sessions by timing - for now treating all as active since we don't have timing data
  const activeSessions = filteredAvailableSessions.filter(session => session.status === 'waiting');
  const upcomingSessions = []; // We'll enhance this later with scheduled sessions

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
    const TypeIcon = getTypeIcon(session.session_type || session.type);
    const sessionType = session.session_type || session.type;
    
    const handleJoinSession = async () => {
      if (session.user_joined) return;
      await joinSession(session.id);
    };
    
    return (
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-tennis-green-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <TypeIcon className="h-4 w-4 text-tennis-green-primary" />
              <CardTitle className="text-lg">
                {session.title || `${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)} Session`}
              </CardTitle>
            </div>
            <Badge className={getTypeColor(sessionType)}>
              {sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{session.location || 'Location TBD'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {session.format && <Badge variant="outline">{session.format}</Badge>}
                <Badge variant="outline">{session.status}</Badge>
              </div>
              <div className="text-sm font-medium">
                {session.participant_count || 0}/{session.max_players} players
              </div>
            </div>
            
            {session.stakes_amount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-3 w-3 text-yellow-600" />
                <span className="text-yellow-600 font-medium">
                  Stakes: {session.stakes_amount} tokens
                </span>
              </div>
            )}
            
            {session.notes && (
              <p className="text-sm text-gray-600 italic">{session.notes}</p>
            )}
            
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-500">
                Created by {session.creator_name || 'Unknown'}
              </span>
              <Button 
                size="sm" 
                className="bg-tennis-green-primary hover:bg-tennis-green-medium"
                onClick={handleJoinSession}
                disabled={session.user_joined}
              >
                {session.user_joined ? 'Joined' : 'Join Session'}
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
            
            {availableLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-tennis-green-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading sessions...</p>
              </div>
            ) : activeSessions.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No Active Sessions
                </h3>
                <p className="text-gray-500 mb-4">
                  Be the first to create a session in your area!
                </p>
                <Link to="/sessions/create">
                  <Button className="bg-tennis-green-primary hover:bg-tennis-green-medium">
                    Create Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-tennis-green-dark">
                My Sessions
              </h2>
              <Badge variant="outline">
                {mySessions.length} sessions
              </Badge>
            </div>
            
            {mySessionsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-tennis-green-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading your sessions...</p>
              </div>
            ) : mySessions.length === 0 ? (
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
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mySessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
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