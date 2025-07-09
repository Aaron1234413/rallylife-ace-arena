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
  Gamepad2,
  Play,
  UserMinus,
  LogOut,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useEnhancedSessionActions } from '@/hooks/useEnhancedSessionActions';
import { useSessionManager } from '@/hooks/useSessionManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UnifiedSessionCreationDialog } from '@/components/sessions/UnifiedSessionCreationDialog';
import { EnhancedSessionCard } from '@/components/sessions/EnhancedSessionCard';
import { SessionCompletionModal, SessionCompletionData } from '@/components/sessions/SessionCompletionModal';

interface Session {
  id: string;
  creator_id: string;
  session_type: 'match' | 'social_play' | 'training' | 'wellbeing';
  format?: 'singles' | 'doubles';
  max_players: number;
  stakes_amount: number;
  location?: string;
  notes?: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled' | 'full';
  is_private: boolean;
  invitation_code?: string;
  created_at: string;
  updated_at: string;
  
  // Phase 1 enhanced fields
  current_participants: number;
  started_at?: string;
  completed_at?: string;
  winner_id?: string;
  session_result?: any;
  
  // Computed fields
  participant_count?: number;
  creator_name?: string;
  user_joined?: boolean;
  is_creator?: boolean;
  can_start?: boolean;
  participants?: Array<{
    id: string;
    user_id: string;
    status: string;
    joined_at: string;
    role: string;
    user: {
      full_name: string;
    }
  }>;
}

const Sessions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('available');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completingSession, setCompletingSession] = useState<any>(null);
  
  // Filters
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [stakesFilter, setStakesFilter] = useState('all');

  // Calculate active filters count
  const activeFiltersCount = [
    locationFilter.trim() !== '',
    typeFilter !== 'all',
    stakesFilter !== 'all'
  ].filter(Boolean).length;

  // Use enhanced session management
  const sessionOptions = {
    sessionType: 'all' as const,
    filterUserSessions: activeTab === 'my-sessions',
    filterUserParticipation: activeTab === 'my-sessions'
  };
  
  const { sessions, loading, error } = useSessionManager(sessionOptions);
  const { 
    joinSession, 
    leaveSession, 
    startSession, 
    completeSession, 
    cancelSession,
    actionStates,
    isActionLoading,
    getSessionParticipants 
  } = useEnhancedSessionActions({
    enableOptimisticUpdates: true,
    onSuccessRedirect: activeTab === 'available' ? '/sessions?tab=my-sessions' : undefined
  });

  // Helper function to calculate session duration
  const calculateSessionDuration = (session: any) => {
    if (session.start_datetime) {
      const start = new Date(session.start_datetime);
      const now = new Date();
      return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
    }
    // Default duration for sessions without start time
    return 60;
  };

  // Enhanced completion function that calls backend with completion data
  const completeSessionWithData = async (sessionId: string, completionData: SessionCompletionData) => {
    console.log('🎾 Phase 2: Starting session completion with data:', {
      sessionId,
      completionData,
      sessionType: sessions.find(s => s.id === sessionId)?.session_type
    });
    
    try {
      // Calculate session duration if we have the session data
      const session = sessions.find(s => s.id === sessionId);
      const sessionDuration = session ? calculateSessionDuration(session) : 60;
      
      console.log('🎾 Phase 2: Calculated session duration:', sessionDuration, 'minutes');
      
      // Call the backend with all completion data
      const success = await completeSession(sessionId, {
        winnerId: completionData.winnerId,
        sessionDuration,
        completionNotes: completionData.notes,
        sessionRating: completionData.rating,
        matchScore: completionData.score
      });
      
      console.log('🎾 Phase 2: Backend completion result:', success);
      
      if (success) {
        toast.success('Session completed successfully! 🏆');
        return true;
      } else {
        toast.error('Failed to complete session');
        return false;
      }
    } catch (error) {
      console.error('🎾 Phase 2: Error completing session:', error);
      toast.error('Failed to complete session');
      return false;
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    await joinSession(sessionId);
  };

  const handleLeaveSession = async (sessionId: string) => {
    await leaveSession(sessionId);
  };

  const handleStartSession = async (sessionId: string) => {
    await startSession(sessionId);
  };

  const handleCompleteSession = async (sessionId: string) => {
    // Find the session and get participants
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      try {
        const participants = await getSessionParticipants(sessionId);
        setCompletingSession({
          ...session,
          participants: participants
        });
        setShowCompletionModal(true);
      } catch (error) {
        console.error('Error fetching session participants:', error);
        toast.error('Failed to load session details');
      }
    }
  };

  const handleCompleteSessionWithData = async (completionData: SessionCompletionData) => {
    if (!completingSession) return;
    
    try {
      // Call enhanced completion with data
      const success = await completeSessionWithData(completingSession.id, completionData);
      if (success) {
        setShowCompletionModal(false);
        setCompletingSession(null);
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    await cancelSession(sessionId);
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'social_play': return Users;
      case 'training': return GraduationCap;
      case 'wellbeing': return Heart;
      default: return Gamepad2;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'social_play': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training': return 'bg-green-100 text-green-800 border-green-200';
      case 'wellbeing': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Clear filters helper
  const clearFilters = () => {
    setLocationFilter('');
    setTypeFilter('all');
    setStakesFilter('all');
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
            onClick={() => setShowCreateDialog(true)}
            className="bg-tennis-green-dark hover:bg-tennis-green text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>

        {/* Mobile-Optimized Collapsible Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-tennis-green-bg/20 overflow-hidden">
          {/* Filter Toggle Button - Mobile First */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="ghost"
              className="w-full h-14 px-4 flex items-center justify-between hover:bg-tennis-green-light/10 rounded-none border-b border-tennis-green-bg/10"
            >
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-tennis-green-medium" />
                <span className="font-medium text-tennis-green-dark">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="bg-tennis-green-primary text-white text-xs px-2 py-1">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {showFilters ? (
                <ChevronUp className="h-5 w-5 text-tennis-green-medium" />
              ) : (
                <ChevronDown className="h-5 w-5 text-tennis-green-medium" />
              )}
            </Button>
          </div>

          {/* Always visible on desktop, collapsible on mobile */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="p-4 lg:p-6">
              <div className="hidden lg:flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-tennis-green-medium" />
                  <h3 className="font-medium text-tennis-green-dark">Filters</h3>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="bg-tennis-green-primary text-white text-xs px-2 py-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </div>
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-tennis-green-medium hover:text-tennis-green-dark h-8 px-3"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              {/* Mobile Clear Button */}
              {activeFiltersCount > 0 && (
                <div className="lg:hidden flex justify-end mb-4">
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="text-tennis-green-medium hover:text-tennis-green-dark h-8 px-3"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              )}

              {/* Enhanced Mobile-Friendly Filter Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tennis-green-dark">Location</label>
                  <Input
                    placeholder="Search by location..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="h-11 border-tennis-green-bg/30 focus:border-tennis-green-medium"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tennis-green-dark">Session Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="h-11 border-tennis-green-bg/30 focus:border-tennis-green-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-tennis-green-bg/30 shadow-lg">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="match">Tennis Match</SelectItem>
                      <SelectItem value="social_play">Social Play</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="wellbeing">Wellbeing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-tennis-green-dark">Stakes</label>
                  <Select value={stakesFilter} onValueChange={setStakesFilter}>
                    <SelectTrigger className="h-11 border-tennis-green-bg/30 focus:border-tennis-green-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-tennis-green-bg/30 shadow-lg">
                      <SelectItem value="all">All Sessions</SelectItem>
                      <SelectItem value="stakes">With Stakes</SelectItem>
                      <SelectItem value="no-stakes">No Stakes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Sessions Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-tennis-green-bg/20 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Mobile-First Tab Navigation */}
            <div className="overflow-x-auto scrollbar-hide">
              <TabsList className="inline-flex h-12 sm:h-14 w-max min-w-full bg-transparent p-1 gap-0">
                <TabsTrigger 
                  value="available" 
                  className="flex-1 min-w-[120px] h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium transition-all duration-200 data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-tennis-green-light/20 text-tennis-green-dark rounded-lg mx-1"
                >
                  <span className="truncate">Available</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="my-sessions" 
                  className="flex-1 min-w-[120px] h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium transition-all duration-200 data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-tennis-green-light/20 text-tennis-green-dark rounded-lg mx-1"
                >
                  <span className="truncate">My Sessions</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="flex-1 min-w-[120px] h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-medium transition-all duration-200 data-[state=active]:bg-tennis-green-primary data-[state=active]:text-white data-[state=active]:shadow-md hover:bg-tennis-green-light/20 text-tennis-green-dark rounded-lg mx-1"
                >
                  <span className="truncate">Completed</span>
                </TabsTrigger>
              </TabsList>
            </div>

          <TabsContent value="available" className="mt-6">
            <SessionsList 
              sessions={filteredSessions} 
              loading={loading}
              onJoinSession={handleJoinSession}
              onLeaveSession={handleLeaveSession}
              onStartSession={handleStartSession}
              onCompleteSession={handleCompleteSession}
              onCancelSession={handleCancelSession}
              actionStates={actionStates}
              isActionLoading={isActionLoading}
              showJoinButton={true}
            />
          </TabsContent>

          <TabsContent value="my-sessions" className="mt-6">
            <SessionsList 
              sessions={filteredSessions} 
              loading={loading}
              onJoinSession={handleJoinSession}
              onLeaveSession={handleLeaveSession}
              onStartSession={handleStartSession}
              onCompleteSession={handleCompleteSession}
              onCancelSession={handleCancelSession}
              actionStates={actionStates}
              isActionLoading={isActionLoading}
              showJoinButton={false}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <SessionsList 
              sessions={filteredSessions} 
              loading={loading}
              onJoinSession={handleJoinSession}
              onLeaveSession={handleLeaveSession}
              onStartSession={handleStartSession}
              onCompleteSession={handleCompleteSession}
              onCancelSession={handleCancelSession}
              actionStates={actionStates}
              isActionLoading={isActionLoading}
              showJoinButton={false}
            />
          </TabsContent>
        </Tabs>
        </div>

        {/* Unified Session Creation Dialog */}
        <UnifiedSessionCreationDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSuccess={() => {
            // No need to reload - real-time subscriptions will update automatically
            toast.success('Session created! It should appear in your sessions shortly.');
          }}
        />

        {/* Session Completion Modal */}
        {completingSession && (
          <SessionCompletionModal
            open={showCompletionModal}
            onOpenChange={setShowCompletionModal}
            session={completingSession}
            participants={completingSession.participants || []}
            durationMinutes={calculateSessionDuration(completingSession)}
            onComplete={handleCompleteSessionWithData}
            isLoading={isActionLoading(completingSession.id, 'completing')}
          />
        )}
      </div>
    </div>
  );
};

// Sessions List Component
interface SessionsListProps {
  sessions: any[];
  loading: boolean;
  onJoinSession: (sessionId: string) => void;
  onLeaveSession: (sessionId: string) => void;
  onStartSession: (sessionId: string) => void;
  onCompleteSession: (sessionId: string) => void;
  onCancelSession: (sessionId: string) => void;
  actionStates: Record<string, any>;
  isActionLoading: (sessionId: string, action: string) => boolean;
  showJoinButton: boolean;
}

const SessionsList: React.FC<SessionsListProps> = ({ 
  sessions, 
  loading, 
  onJoinSession,
  onLeaveSession,
  onStartSession,
  onCompleteSession,
  onCancelSession,
  actionStates,
  isActionLoading,
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
        <EnhancedSessionCard
          key={session.id}
          session={session}
          onJoin={onJoinSession}
          onLeave={onLeaveSession}
          onStart={onStartSession}
          onComplete={onCompleteSession}
          onCancel={onCancelSession}
          onViewDetails={(session) => {
            // Handle view details
            console.log('View details for session:', session);
          }}
          isJoining={isActionLoading(session.id, 'joining')}
          isLeaving={isActionLoading(session.id, 'leaving')}
          isStarting={isActionLoading(session.id, 'starting')}
          isCompleting={isActionLoading(session.id, 'completing')}
          isCancelling={isActionLoading(session.id, 'cancelling')}
          showActions={true}
        />
      ))}
    </div>
  );
};

// Session Card Component
interface SessionCardProps {
  session: Session;
  onJoinSession: (sessionId: string) => void;
  onLeaveSession: (sessionId: string) => void;
  onKickParticipant: (sessionId: string, participantId: string) => void;
  onStartSession: (sessionId: string) => void;
  onCompleteSession: (sessionId: string, winnerId?: string) => void;
  showJoinButton: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({ 
  session, 
  onJoinSession, 
  onLeaveSession, 
  onKickParticipant, 
  onStartSession, 
  onCompleteSession,
  showJoinButton 
}) => {
  const { user } = useAuth();
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  
  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'match': return Trophy;
      case 'social_play': return Users;
      case 'training': return GraduationCap;
      case 'wellbeing': return Heart;
      default: return Gamepad2;
    }
  };

  const getSessionTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'social_play': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'training': return 'bg-green-100 text-green-800 border-green-200';
      case 'wellbeing': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const SessionIcon = getSessionIcon(session.session_type);
  const isCreator = session.creator_id === user?.id;
  const isFull = session.participant_count >= session.max_players;
  const canJoin = showJoinButton && !session.user_joined && !isCreator && !isFull && session.status === 'waiting';
  const canStart = isCreator && session.status === 'waiting' && isFull;
  const canLeave = session.user_joined && !isCreator && session.status === 'waiting';
  const canComplete = isCreator && session.status === 'active';

  const handleCompleteSession = () => {
    if (session.session_type === 'match') {
      setShowWinnerModal(true);
    } else {
      // For non-match sessions, complete without selecting winner
      onCompleteSession(session.id);
    }
  };

  const handleWinnerSelection = (winnerId?: string) => {
    onCompleteSession(session.id, winnerId);
    setShowWinnerModal(false);
  };

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

        {/* Participants List (for My Sessions) */}
        {!showJoinButton && session.participants && session.participants.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Participants:</h4>
            <div className="space-y-1">
              {session.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {participant.user?.full_name || 'Unknown User'}
                    {participant.user_id === session.creator_id && ' (Creator)'}
                  </span>
                  {isCreator && participant.user_id !== session.creator_id && session.status === 'waiting' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onKickParticipant(session.id, participant.id)}
                      className="h-6 px-2 text-red-600 hover:text-red-700"
                    >
                      <UserMinus className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          {canJoin && (
            <Button 
              onClick={() => onJoinSession(session.id)}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green text-white"
            >
              Join Session
            </Button>
          )}

          {canStart && (
            <Button 
              onClick={() => onStartSession(session.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Session
            </Button>
          )}

          {canLeave && (
            <Button 
              onClick={() => onLeaveSession(session.id)}
              variant="outline"
              className="w-full text-red-600 hover:text-red-700 border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Leave Session
            </Button>
          )}

          {canComplete && (
            <Button 
              onClick={handleCompleteSession}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Session
            </Button>
          )}
          
          {session.user_joined && session.status === 'waiting' && !canLeave && (
            <Button variant="outline" className="w-full" disabled>
              Joined - Waiting for Players
            </Button>
          )}
          
          {isCreator && session.status === 'waiting' && !canStart && (
            <Button variant="outline" className="w-full" disabled>
              Your Session - {isFull ? 'Ready to Start' : 'Waiting for Players'}
            </Button>
          )}
          
          {session.status === 'active' && !canComplete && (
            <Button variant="outline" className="w-full" disabled>
              Session Active
            </Button>
          )}
          
          {session.status === 'completed' && (
            <Button variant="outline" className="w-full" disabled>
              Completed
            </Button>
          )}
        </div>
      </CardContent>

      {/* Winner Selection Modal */}
      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Winner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Who won the match? The winner will receive all stakes ({session.stakes_amount * session.max_players} tokens).
            </p>
            
            <div className="space-y-2">
              {session.participants?.map((participant) => (
                <Button
                  key={participant.id}
                  variant="outline"
                  onClick={() => handleWinnerSelection(participant.user_id)}
                  className="w-full justify-start"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  {participant.user?.full_name || 'Unknown User'}
                  {participant.user_id === session.creator_id && ' (You)'}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={() => handleWinnerSelection()}
                className="w-full text-gray-600"
              >
                No Winner / Draw
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Sessions;