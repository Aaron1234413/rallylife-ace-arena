import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Plus, 
  Users, 
  Trophy, 
  Star, 
  MapPin, 
  Clock, 
  Coins,
  Gamepad2,
  X,
  ChevronDown,
  Zap,
  Target,
  Award,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/hooks/useAuth';
import { useStandardSessionFetch } from '@/hooks/useStandardSessionFetch';
import { useSessionAutomation } from '@/hooks/useSessionAutomation';
import { usePlayerDiscovery } from '@/hooks/usePlayerDiscovery';
import { useIsMobile } from '@/hooks/use-mobile';
import { SessionCreationDialog } from '@/components/sessions/SessionCreationDialog';
import { QuickActionsGrid } from '@/components/play/QuickActionsGrid';
import { PlayerSuggestions } from '@/components/matchmaking/PlayerSuggestions';


const Play = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('for-you');
  
  // Session creation dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all');
  const [stakesFilter, setStakesFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');
  
  // Data hooks
  const { 
    availableSessions,
    mySessions, 
    loading: sessionsLoading,
    joinSession,
    refreshSessions
  } = useStandardSessionFetch({
    includeNonClubSessions: true
  });
  
  // Enable real-time updates for Play page sessions
  useSessionAutomation(refreshSessions);
  
  // Matchmaking and discovery
  const { suggestions, loading: discoveryLoading } = usePlayerDiscovery();


  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    return availableSessions.filter(session => {
      const matchesSearch = !searchQuery || 
        session.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.creator?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.session_type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = sessionTypeFilter === 'all' || 
        session.session_type === sessionTypeFilter;

      const matchesStakes = stakesFilter === 'all' || 
        (stakesFilter === 'free' && (session.stakes_amount || 0) === 0) ||
        (stakesFilter === 'low' && (session.stakes_amount || 0) > 0 && (session.stakes_amount || 0) <= 50) ||
        (stakesFilter === 'medium' && (session.stakes_amount || 0) > 50 && (session.stakes_amount || 0) <= 200) ||
        (stakesFilter === 'high' && (session.stakes_amount || 0) > 200);

      return matchesSearch && matchesType && matchesStakes;
    });
  }, [availableSessions, searchQuery, sessionTypeFilter, stakesFilter]);

  const handleFindMatch = () => {
    setActiveTab('for-you');
  };

  const handleCreateSession = () => {
    setShowCreateDialog(true);
  };

  // Enhanced session card with gamification (from PlayMockup)
  const SessionCard = ({ session, isRecommended = false }: { session: any, isRecommended?: boolean }) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'match': return Trophy;
        case 'social': return Users;
        case 'training': return Star;
        default: return Gamepad2;
      }
    };

    const getRewardPreview = (stakes: number, type: string) => {
      const baseXP = type === 'match' ? 50 : type === 'training' ? 30 : 20;
      const stakesBonus = Math.floor(stakes * 0.1);
      return {
        xp: baseXP + stakesBonus,
        tokens: Math.floor(stakes * 1.5) || 10
      };
    };

    const TypeIcon = getTypeIcon(session.session_type);
    const reward = getRewardPreview(session.stakes_amount || 0, session.session_type);

    return (
      <Card className={`group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-l-4 ${
        isRecommended 
          ? 'border-l-tennis-green-accent bg-gradient-to-br from-tennis-green-subtle to-tennis-green-bg ring-2 ring-tennis-green-primary/20' 
          : 'border-l-tennis-green-primary hover:border-l-tennis-green-accent'
      }`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header with enhanced badges */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative">
                  <TypeIcon className={`h-5 w-5 ${isRecommended ? 'text-tennis-green-accent' : 'text-tennis-green-primary'} transition-colors`} />
                  {isRecommended && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-tennis-green-accent rounded-full animate-pulse" />
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-tennis-green-primary transition-colors">
                  {session.session_type} Session
                </h3>
              </div>
              <Badge variant="outline" className="text-xs bg-tennis-green-subtle text-tennis-green-dark border-tennis-green-primary/30">
                {session.session_type}
              </Badge>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1 font-medium">{session.location || 'Location TBD'}</span>
            </div>

            {/* Participants */}
            <div className="flex items-center justify-between p-2 bg-tennis-green-bg/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-medium">
                  <Users className="h-3 w-3 text-tennis-green-primary" />
                  <span>{session.participant_count || 0}/{session.max_players || 4}</span>
                </div>
                <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-tennis-green-primary transition-all duration-300"
                    style={{ width: `${((session.participant_count || 0) / (session.max_players || 4)) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                by {session.creator?.full_name || 'Unknown'}
              </div>
            </div>

            {/* Gamified rewards preview */}
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-tennis-green-subtle to-tennis-green-bg rounded-lg border border-tennis-green-primary/20">
              <div className="flex items-center gap-3">
                {session.stakes_amount && session.stakes_amount > 0 && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-tennis-yellow-dark">
                    <Coins className="h-3 w-3" />
                    <span>{session.stakes_amount} stake</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs font-semibold text-tennis-green-accent">
                  <Zap className="h-3 w-3" />
                  <span>+{reward.xp} XP</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-tennis-green-primary">
                  <Target className="h-3 w-3" />
                  <span>+{reward.tokens} tokens</span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <Button 
              size="sm" 
              className="w-full font-semibold bg-tennis-green-primary hover:bg-tennis-green-accent text-white"
              onClick={() => joinSession(session.id)}
            >
              Join Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-tennis-green-bg/20 to-tennis-green-subtle/30">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">🎾 Play</h1>
            </div>
            
            {/* Search - Mobile Optimized */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sessions, players, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 text-sm md:text-base"
              />
            </div>

            {/* Quick Actions - Responsive */}
            <div className="flex items-center gap-2">
              {/* Filter */}
              <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="px-2 md:px-4">
                    <Filter className="h-4 w-4" />
                    <span className="hidden md:inline ml-2">Filter</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-96">
                  <SheetHeader>
                    <SheetTitle>Filter Sessions</SheetTitle>
                    <SheetDescription>
                      Refine your search to find the perfect match
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-6 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Session Type</label>
                      <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All session types" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="match">Matches</SelectItem>
                          <SelectItem value="social">Social Games</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stakes</label>
                      <Select value={stakesFilter} onValueChange={setStakesFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any stakes" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          <SelectItem value="all">Any Stakes</SelectItem>
                          <SelectItem value="free">Free (0 tokens)</SelectItem>
                          <SelectItem value="low">Low (1-50 tokens)</SelectItem>
                          <SelectItem value="medium">Medium (51-200 tokens)</SelectItem>
                          <SelectItem value="high">High (200+ tokens)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Distance</label>
                      <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any distance" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                          <SelectItem value="all">Any Distance</SelectItem>
                          <SelectItem value="close">Within 2km</SelectItem>
                          <SelectItem value="medium">Within 10km</SelectItem>
                          <SelectItem value="far">Within 25km</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSessionTypeFilter('all');
                          setStakesFilter('all');
                          setDistanceFilter('all');
                        }}
                        className="w-full"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Create Session */}
              <Button 
                onClick={handleCreateSession}
                size="sm" 
                className="bg-tennis-green-primary hover:bg-tennis-green-accent px-2 md:px-4"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Create</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 pb-24">
        {/* Quick Actions Grid */}
        <div className="my-6">
          <QuickActionsGrid 
            onFindMatch={handleFindMatch}
            onCreateSession={handleCreateSession}
          />
        </div>

        {/* Player Suggestions - Show when Find Match is clicked */}
        {activeTab === 'for-you' && suggestions.length > 0 && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-tennis-green-primary" />
                  Recommended Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PlayerSuggestions />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Unified Session Feed */}
        <div className="space-y-6">
          <div className="text-center py-4">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-tennis-green-primary to-tennis-green-accent bg-clip-text text-transparent">
              🎾 Available Sessions
            </h3>
            <p className="text-sm text-muted-foreground">
              Join a session or create your own
            </p>
          </div>
          
          {sessionsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredSessions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold">No Sessions Available</h3>
                    <p className="text-muted-foreground">Be the first to create a session and start playing!</p>
                  </div>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Best Match Sessions - Limit to 4 */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                {filteredSessions.slice(0, 4).map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
              
              {/* Show more sessions button if there are more */}
              {filteredSessions.length > 4 && (
                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Could expand to show all sessions, or implement pagination
                      toast.info('More sessions feature coming soon!');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Show {filteredSessions.length - 4} More Sessions
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Session Creation Dialog */}
      <SessionCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          refreshSessions();
        }}
      />
    </div>
  );
};

export default Play;