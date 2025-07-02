import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MapPin, 
  Coins, 
  Clock, 
  Plus,
  Filter,
  Trophy,
  GraduationCap,
  Heart,
  Gamepad2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Session {
  id: string;
  creator_id: string;
  session_type: 'match' | 'social_play' | 'training' | 'recovery';
  format?: 'singles' | 'doubles';
  max_players: number;
  stakes_amount: number;
  location?: string;
  notes?: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  is_private: boolean;
  invitation_code?: string;
  created_at: string;
  updated_at: string;
  participant_count?: number;
  creator_name?: string;
  user_joined?: boolean;
}

const Sessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  
  // Filters
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stakesFilter, setStakesFilter] = useState('all');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('sessions')
        .select(`
          *,
          participants:session_participants!inner(user_id, status),
          creator:profiles!sessions_creator_id_fkey(full_name)
        `);

      // Apply tab-specific filtering
      if (activeTab === 'my-sessions') {
        query = query.or(`creator_id.eq.${user?.id},participants.user_id.eq.${user?.id}`);
      } else if (activeTab === 'available') {
        query = query.eq('status', 'waiting').eq('is_private', false);
      } else if (activeTab === 'completed') {
        query = query.eq('status', 'completed');
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to add participant count and user join status
      const processedSessions = data?.map((session: any) => {
        const participants = session.participants || [];
        const activeParticipants = participants.filter((p: any) => p.status === 'joined');
        
        return {
          ...session,
          participant_count: activeParticipants.length,
          creator_name: session.creator?.full_name || 'Unknown',
          user_joined: activeParticipants.some((p: any) => p.user_id === user?.id)
        };
      }) || [];

      setSessions(processedSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, activeTab]);

  const handleJoinSession = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.rpc('join_session', {
        session_id_param: sessionId,
        user_id_param: user?.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; participant_count?: number; session_ready?: boolean };

      if (result.success) {
        toast.success('Successfully joined session!');
        if (result.session_ready) {
          toast.success('Session is ready to start!');
        }
        fetchSessions(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      toast.error('Failed to join session');
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'social_play': return Users;
      case 'training': return GraduationCap;
      case 'recovery': return Heart;
      default: return Gamepad2;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'social_play': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training': return 'bg-green-100 text-green-800 border-green-200';
      case 'recovery': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (locationFilter && !session.location?.toLowerCase().includes(locationFilter.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && session.session_type !== typeFilter) {
      return false;
    }
    if (stakesFilter !== 'all') {
      const hasStakes = session.stakes_amount > 0;
      if (stakesFilter === 'stakes' && !hasStakes) return false;
      if (stakesFilter === 'no-stakes' && hasStakes) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-tennis-green-dark">
              Sessions Hub
            </h1>
            <p className="text-gray-600 mt-1">
              Join sessions or create your own tennis experiences
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/sessions/create')}
            className="bg-tennis-green-dark hover:bg-tennis-green text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="Search by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Session Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="match">Tennis Match</SelectItem>
                    <SelectItem value="social_play">Social Play</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="recovery">Recovery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Stakes</label>
                <Select value={stakesFilter} onValueChange={setStakesFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sessions</SelectItem>
                    <SelectItem value="stakes">With Stakes</SelectItem>
                    <SelectItem value="no-stakes">No Stakes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sessions Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="available">Available Sessions</TabsTrigger>
            <TabsTrigger value="my-sessions">My Sessions</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <SessionsList 
              sessions={filteredSessions} 
              loading={loading}
              onJoinSession={handleJoinSession}
              showJoinButton={true}
            />
          </TabsContent>

          <TabsContent value="my-sessions" className="mt-6">
            <SessionsList 
              sessions={filteredSessions} 
              loading={loading}
              onJoinSession={handleJoinSession}
              showJoinButton={false}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <SessionsList 
              sessions={filteredSessions} 
              loading={loading}
              onJoinSession={handleJoinSession}
              showJoinButton={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Sessions List Component
interface SessionsListProps {
  sessions: Session[];
  loading: boolean;
  onJoinSession: (sessionId: string) => void;
  showJoinButton: boolean;
}

const SessionsList: React.FC<SessionsListProps> = ({ 
  sessions, 
  loading, 
  onJoinSession, 
  showJoinButton 
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Gamepad2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No sessions found</h3>
          <p className="text-gray-500">Try adjusting your filters or create a new session</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => (
        <SessionCard 
          key={session.id} 
          session={session} 
          onJoinSession={onJoinSession}
          showJoinButton={showJoinButton}
        />
      ))}
    </div>
  );
};

// Session Card Component
interface SessionCardProps {
  session: Session;
  onJoinSession: (sessionId: string) => void;
  showJoinButton: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onJoinSession, showJoinButton }) => {
  const { user } = useAuth();
  
  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'social_play': return Users;
      case 'training': return GraduationCap;
      case 'recovery': return Heart;
      default: return Gamepad2;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'social_play': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training': return 'bg-green-100 text-green-800 border-green-200';
      case 'recovery': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const SessionIcon = getSessionIcon(session.session_type);
  const isCreator = session.creator_id === user?.id;
  const isFull = session.participant_count >= session.max_players;
  const canJoin = showJoinButton && !session.user_joined && !isCreator && !isFull && session.status === 'waiting';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <SessionIcon className="h-5 w-5 text-tennis-green-dark" />
            <div>
              <h3 className="font-semibold text-tennis-green-dark capitalize">
                {session.session_type.replace('_', ' ')}
                {session.format && ` - ${session.format}`}
              </h3>
              <p className="text-sm text-gray-600">by {session.creator_name}</p>
            </div>
          </div>
          
          <Badge className={getSessionTypeColor(session.session_type)}>
            {session.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Players */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {session.participant_count}/{session.max_players} players
          </span>
          {isFull && <Badge variant="secondary">Full</Badge>}
        </div>

        {/* Location */}
        {session.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{session.location}</span>
          </div>
        )}

        {/* Stakes */}
        {session.stakes_amount > 0 && (
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">
              {session.stakes_amount} tokens
            </span>
          </div>
        )}

        {/* Notes */}
        {session.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {session.notes}
          </p>
        )}

        {/* Created time */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          {new Date(session.created_at).toLocaleDateString()}
        </div>

        {/* Action Buttons */}
        <div className="pt-2">
          {canJoin && (
            <Button 
              onClick={() => onJoinSession(session.id)}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green text-white"
            >
              Join Session
            </Button>
          )}
          
          {session.user_joined && session.status === 'waiting' && (
            <Button variant="outline" className="w-full" disabled>
              Joined - Waiting for Players
            </Button>
          )}
          
          {isCreator && session.status === 'waiting' && (
            <Button variant="outline" className="w-full" disabled>
              Your Session - {isFull ? 'Ready to Start' : 'Waiting for Players'}
            </Button>
          )}
          
          {session.status === 'completed' && (
            <Button variant="outline" className="w-full" disabled>
              Completed
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Sessions;