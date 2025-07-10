import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Plus, 
  Trophy, 
  Users, 
  MapPin, 
  Clock, 
  Star,
  Gamepad2,
  Coins,
  Heart,
  Zap,
  Target,
  MessageCircle,
  UserPlus,
  Sparkles,
  Medal,
  Crown,
  ChevronRight,
  Flame,
  X,
  SlidersHorizontal,
  Calendar
} from 'lucide-react';

// Stub data and interfaces
interface User {
  id: string;
  isCoach?: boolean;
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
}

interface Session {
  id: string;
  title: string;
  session_type: 'match' | 'social' | 'training';
  location: string;
  stakes_amount: number;
  participant_count: number;
  max_players: number;
  created_at: string;
  creator_name: string;
  distance_km?: number;
  user_joined?: boolean;
  status: 'waiting' | 'active';
  recommendation_score?: number;
  recommendation_reason?: string;
}

interface Player {
  id: string;
  full_name: string;
  avatar_url?: string;
  distance_km: number;
  current_level: number;
  compatibility_score: number;
  activity_types: string[];
}

interface TokenData {
  regularTokens: number;
  xp: number;
  hp: number;
}

// Mock hooks (stubs)
const useAuth = () => ({
  user: {
    id: '1',
    isCoach: false,
    name: 'Alex Chen',
    level: 12,
    xp: 2340,
    xpToNext: 460
  } as User
});

const useLocationBasedRecommendations = (radiusKm: number) => ({
  recommendations: [
    {
      id: '1',
      title: 'Competitive Match',
      session_type: 'match' as const,
      location: 'Central Park Courts',
      stakes_amount: 50,
      participant_count: 3,
      max_players: 4,
      created_at: new Date().toISOString(),
      creator_name: 'Sarah Johnson',
      distance_km: 2.1,
      recommendation_score: 0.92,
      recommendation_reason: 'Perfect skill match'
    },
    {
      id: '2',
      title: 'Social Rally',
      session_type: 'social' as const,
      location: 'Riverside Tennis Club',
      stakes_amount: 0,
      participant_count: 2,
      max_players: 6,
      created_at: new Date().toISOString(),
      creator_name: 'Mike Torres',
      distance_km: 3.7,
      recommendation_score: 0.84,
      recommendation_reason: 'Nearby and welcoming to your level'
    }
  ] as Session[]
});

const useLocationBasedSessions = (radiusKm: number) => ({
  nearbyPlayers: [
    {
      id: '1',
      full_name: 'Emma Davis',
      avatar_url: undefined,
      distance_km: 1.2,
      current_level: 10,
      compatibility_score: 0.88,
      activity_types: ['match', 'training']
    },
    {
      id: '2',
      full_name: 'Ryan Chen',
      avatar_url: undefined,
      distance_km: 2.5,
      current_level: 14,
      compatibility_score: 0.75,
      activity_types: ['social', 'match']
    }
  ] as Player[],
  hasLocation: true
});

const useSafeRealTimeSessions = (tab: string, userId?: string) => ({
  sessions: [
    {
      id: '3',
      title: 'Evening Doubles',
      session_type: 'match' as const,
      location: 'City Sports Complex',
      stakes_amount: 25,
      participant_count: 2,
      max_players: 4,
      created_at: new Date().toISOString(),
      creator_name: 'Lisa Park',
      status: 'waiting' as const,
      user_joined: false
    },
    {
      id: '4',
      title: 'Beginner Training',
      session_type: 'training' as const,
      location: 'Tennis Academy',
      stakes_amount: 0,
      participant_count: 5,
      max_players: 8,
      created_at: new Date().toISOString(),
      creator_name: 'Coach Martinez',
      status: 'waiting' as const,
      user_joined: false
    }
  ] as Session[]
});

const usePlayerTokens = () => ({
  regularTokens: 127,
  xp: 2340,
  hp: 85
} as TokenData);

const useJoinSessionState = () => ({
  isJoining: (id: string) => false,
  startJoining: (id: string) => {},
  stopJoining: () => {}
});

const useUnifiedSessions = () => ({
  cancelSession: (id: string) => Promise.resolve(true)
});

// Gamified Components
const XPProgressBar = ({ current, toNext, level }: { current: number; toNext: number; level: number }) => {
  const progress = (current / (current + toNext)) * 100;
  
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-accent/10 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm font-medium">Lv.{level}</span>
      </div>
      <div className="flex-1">
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-muted-foreground mt-1">
          {current.toLocaleString()} / {(current + toNext).toLocaleString()} XP
        </div>
      </div>
      <div className="text-sm font-bold text-primary">+{toNext}</div>
    </div>
  );
};

const TokenCounter = ({ tokens }: { tokens: number }) => (
  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-2 rounded-lg">
    <Coins className="h-4 w-4 text-yellow-600 animate-bounce" />
    <span className="font-bold text-yellow-800">{tokens}</span>
    <Sparkles className="h-3 w-3 text-yellow-500" />
  </div>
);

const CompactSessionCard = ({ session, onJoin }: { session: Session; onJoin: (id: string) => void }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div 
      className="relative min-w-[280px] h-32 cursor-pointer transform transition-all duration-300 hover:scale-105"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`absolute inset-0 rounded-lg transition-transform duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <Card className="absolute inset-0 backface-hidden border-l-4 border-l-primary">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-sm mb-1">{session.title}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <MapPin className="h-3 w-3" />
                <span>{session.location}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {session.recommendation_score ? `${Math.round(session.recommendation_score * 100)}% match` : 'Good fit'}
              </Badge>
            </div>
            <Button size="sm" onClick={() => onJoin(session.id)} className="w-full">
              Join
            </Button>
          </CardContent>
        </Card>
        
        {/* Back - Gamified */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-primary/20 to-accent/20 border-primary">
          <CardContent className="p-4 h-full flex flex-col justify-center items-center text-center">
            <Medal className="h-6 w-6 text-primary mb-2" />
            <p className="text-sm font-medium mb-2">Join to earn:</p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                <span>+25 XP</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-primary" />
                <span>Win Streak</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PlayerCard = ({ player }: { player: Player }) => {
  const levelRingProgress = (player.current_level / 25) * 100;
  
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.avatar_url} />
              <AvatarFallback>{player.full_name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            {/* Level Ring */}
            <div className="absolute -inset-1 rounded-full" 
                 style={{
                   background: `conic-gradient(from 0deg, hsl(var(--primary)) ${levelRingProgress}%, transparent ${levelRingProgress}%)`
                 }}>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {player.current_level}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm truncate">{player.full_name}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{player.distance_km.toFixed(1)}km</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(player.compatibility_score * 100)}% match
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SessionCard = ({ session, onJoin, onDelete }: { 
  session: Session; 
  onJoin: (id: string) => void;
  onDelete?: (id: string) => void;
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'border-l-red-500 bg-red-50';
      case 'social': return 'border-l-green-500 bg-green-50';
      case 'training': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
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

  const TypeIcon = getTypeIcon(session.session_type);

  return (
    <Card className={`border-l-4 hover:shadow-lg transition-all duration-300 ${getTypeColor(session.session_type)}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">{session.title}</CardTitle>
          </div>
          <Badge variant="secondary">
            {session.session_type}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{session.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Just created</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{session.status}</Badge>
              {session.stakes_amount > 0 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Coins className="h-3 w-3" />
                  <span className="text-sm font-medium">{session.stakes_amount} tokens</span>
                </div>
              )}
            </div>
            <div className="text-sm font-medium">
              {session.participant_count}/{session.max_players} players
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              Created by {session.creator_name}
            </span>
            
            <Button 
              size="sm" 
              onClick={() => onJoin(session.id)}
              disabled={session.user_joined}
              className="bg-primary hover:bg-primary/90"
            >
              {session.user_joined ? '✓ Joined' : 'Join Session'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Unified Session Card Component
const UnifiedSessionCard = ({ session, onJoin, onDelete, variant = 'full' }: { 
  session: Session; 
  onJoin: (id: string) => void;
  onDelete?: (id: string) => void;
  variant?: 'compact' | 'full';
}) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'social': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'training': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-900/20';
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

  const TypeIcon = getTypeIcon(session.session_type);

  if (variant === 'compact') {
    return (
      <Card className={`min-w-[280px] h-40 ${getTypeColor(session.session_type)} border-l-4 hover:shadow-lg transition-all duration-300`}>
        <CardContent className="p-4 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">{session.title}</h4>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <MapPin className="h-3 w-3" />
              <span>{session.location}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {session.recommendation_score ? `${Math.round(session.recommendation_score * 100)}% match` : 'Good fit'}
              </Badge>
              {session.stakes_amount > 0 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Coins className="h-3 w-3" />
                  <span className="text-xs">{session.stakes_amount}</span>
                </div>
              )}
            </div>
          </div>
          <Button size="sm" onClick={() => onJoin(session.id)} className="w-full">
            Join Session
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${getTypeColor(session.session_type)} border-l-4 hover:shadow-lg transition-all duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <TypeIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">{session.title}</CardTitle>
          </div>
          <Badge variant="secondary">
            {session.session_type}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span>{session.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Just created</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">{session.status}</Badge>
              {session.stakes_amount > 0 && (
                <div className="flex items-center gap-1 text-yellow-600">
                  <Coins className="h-3 w-3" />
                  <span className="text-sm font-medium">{session.stakes_amount} tokens</span>
                </div>
              )}
            </div>
            <div className="text-sm font-medium">
              {session.participant_count}/{session.max_players} players
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-muted-foreground">
              Created by {session.creator_name}
            </span>
            
            <Button 
              size="sm" 
              onClick={() => onJoin(session.id)}
              disabled={session.user_joined}
              className="bg-primary hover:bg-primary/90"
            >
              {session.user_joined ? '✓ Joined' : 'Join Session'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Quick Actions Component
const QuickActions = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    <Button variant="outline" className="h-16 flex-col gap-1">
      <Zap className="h-5 w-5" />
      <span className="text-xs">Quick Match</span>
    </Button>
    <Button variant="outline" className="h-16 flex-col gap-1">
      <Users className="h-5 w-5" />
      <span className="text-xs">Find Players</span>
    </Button>
    <Button variant="outline" className="h-16 flex-col gap-1">
      <Calendar className="h-5 w-5" />
      <span className="text-xs">Book Court</span>
    </Button>
    <Button variant="outline" className="h-16 flex-col gap-1">
      <Trophy className="h-5 w-5" />
      <span className="text-xs">Tournament</span>
    </Button>
  </div>
);

// Main Component with Improved Structure
const PlayMockup = () => {
  // Mock state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('recommended');
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all');
  const [stakesFilter, setStakesFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [radiusKm, setRadiusKm] = useState(50);
  
  // Mock data
  const user = useAuth().user;
  const { recommendations } = useLocationBasedRecommendations(radiusKm);
  const { nearbyPlayers, hasLocation } = useLocationBasedSessions(radiusKm);
  const { sessions } = useSafeRealTimeSessions('active', user.id);
  const { regularTokens } = usePlayerTokens();

  // Active filters count
  const activeFiltersCount = [
    sessionTypeFilter !== 'all',
    stakesFilter !== 'all',
    sortBy !== 'distance'
  ].filter(Boolean).length;

  // Handlers
  const handleJoinSession = (sessionId: string) => {
    console.log('Joining session:', sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    console.log('Deleting session:', sessionId);
  };

  const toggleFilterDrawer = () => setShowFilters(!showFilters);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="max-w-7xl mx-auto">
        
        {/* SIMPLIFIED STICKY HEADER */}
        <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b">
          <div className="p-4">
            {/* Gamification Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <XPProgressBar current={user.xp} toNext={user.xpToNext} level={user.level} />
              </div>
              <TokenCounter tokens={regularTokens} />
            </div>
            
            {/* Search & Action Bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search sessions or players…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"} 
                size="sm"
                onClick={toggleFilterDrawer}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="mr-2 h-5 w-5 p-0 text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
                Filters
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>
        </div>

        {/* FILTER DRAWER */}
        {showFilters && (
          <div className="border-b bg-muted/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button variant="ghost" size="sm" onClick={toggleFilterDrawer}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="match">Competitive</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Stakes</label>
                <Select value={stakesFilter} onValueChange={setStakesFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Stakes</SelectItem>
                    <SelectItem value="free">Free Play</SelectItem>
                    <SelectItem value="low">Low Stakes</SelectItem>
                    <SelectItem value="medium">Medium Stakes</SelectItem>
                    <SelectItem value="high">High Stakes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Sort</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="distance">Nearest First</SelectItem>
                    <SelectItem value="participants">Most Players</SelectItem>
                    <SelectItem value="stakes">Highest Stakes</SelectItem>
                    <SelectItem value="newest">Recently Created</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Range: {radiusKm}km</label>
                <Slider
                  value={[radiusKm]}
                  onValueChange={([value]) => setRadiusKm(value)}
                  max={100}
                  min={1}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* QUICK ACTIONS */}
          <QuickActions />

          {/* SMART CONTENT TABS */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recommended">
                <Sparkles className="h-4 w-4 mr-2" />
                For You
              </TabsTrigger>
              <TabsTrigger value="nearby">
                <MapPin className="h-4 w-4 mr-2" />
                Nearby
              </TabsTrigger>
              <TabsTrigger value="all">
                <Users className="h-4 w-4 mr-2" />
                All Sessions
              </TabsTrigger>
            </TabsList>
            
            {/* RECOMMENDED TAB */}
            <TabsContent value="recommended" className="space-y-6 mt-6">
              {/* Personalized Recommendations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Perfect Matches</h2>
                  <Badge variant="outline">{recommendations.length} found</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((session) => (
                    <UnifiedSessionCard 
                      key={session.id} 
                      session={session} 
                      onJoin={handleJoinSession}
                      variant="full"
                    />
                  ))}
                </div>
              </div>

              {/* Nearby Players */}
              {hasLocation && nearbyPlayers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Players Near You</h2>
                    <Badge variant="outline">{nearbyPlayers.length} nearby</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nearbyPlayers.slice(0, 4).map((player) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* NEARBY TAB */}
            <TabsContent value="nearby" className="space-y-6 mt-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Nearby Sessions</h2>
                  <Badge variant="outline">{sessions.length} within {radiusKm}km</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessions.map((session) => (
                    <UnifiedSessionCard 
                      key={session.id} 
                      session={session} 
                      onJoin={handleJoinSession}
                      variant="full"
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* ALL SESSIONS TAB */}
            <TabsContent value="all" className="space-y-6 mt-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">All Available Sessions</h2>
                  <Badge variant="outline">{sessions.length + recommendations.length} total</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...recommendations, ...sessions].map((session) => (
                    <UnifiedSessionCard 
                      key={session.id} 
                      session={session} 
                      onJoin={handleJoinSession}
                      variant="full"
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PlayMockup;