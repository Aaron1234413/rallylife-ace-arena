import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
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
  Timer,
  Flame
} from 'lucide-react';
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
import { XPDisplay } from '@/components/xp/XPDisplay';

// Mock data for demonstration with enhanced gamification
const mockPlayerStats = {
  level: 12,
  xp: 2850,
  xpToNext: 3000,
  tokens: 1240,
  streak: 7,
  wins: 34,
  totalMatches: 52
};

const mockSessions = [
  {
    id: '1',
    title: 'Singles Match - Competitive',
    session_type: 'match',
    location: 'Central Park Courts',
    creator_name: 'Alex Johnson',
    participant_count: 1,
    max_players: 2,
    stakes_amount: 50,
    status: 'waiting',
    created_at: new Date().toISOString(),
    distance_km: 1.2,
    recommendation_score: 0.95,
    notes: 'Looking for an intermediate level player for a competitive singles match'
  },
  {
    id: '2',
    title: 'Doubles Social Game',
    session_type: 'social',
    location: 'Riverside Tennis Club',
    creator_name: 'Sarah Chen',
    participant_count: 2,
    max_players: 4,
    stakes_amount: 0,
    status: 'waiting',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    distance_km: 2.8,
    recommendation_score: 0.87,
    notes: 'Fun doubles match, all skill levels welcome!'
  },
  {
    id: '3',
    title: 'Training Session',
    session_type: 'training',
    location: 'Elite Tennis Academy',
    creator_name: 'Mike Rodriguez',
    participant_count: 3,
    max_players: 6,
    stakes_amount: 25,
    status: 'waiting',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    distance_km: 0.8,
    recommendation_score: 0.78,
    notes: 'Focused on improving serve technique'
  }
];

const PlayMockup = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('for-you');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sessionTypeFilter, setSessionTypeFilter] = useState('all');
  const [stakesFilter, setStakesFilter] = useState('all');
  const [distanceFilter, setDistanceFilter] = useState('all');

  // Quick action buttons for the sticky header
  const QuickActions = () => (
    <div className="flex items-center gap-2">
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
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

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSessionTypeFilter('all');
                  setStakesFilter('all');
                  setDistanceFilter('all');
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      
      <Link to="/sessions/create">
        <Button size="sm" className="bg-tennis-green-primary hover:bg-tennis-green-accent text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </Link>
    </div>
  );

  // Enhanced session card with gamification
  const SessionCard = ({ session, isRecommended = false }: { session: any, isRecommended?: boolean }) => {
    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'match': return Trophy;
        case 'social': return Users;
        case 'training': return Star;
        default: return Gamepad2;
      }
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'match': return 'bg-tennis-neutral-50 text-tennis-green-dark border-tennis-green-primary/30';
        case 'social': return 'bg-tennis-green-subtle text-tennis-green-dark border-tennis-green-accent/30';
        case 'training': return 'bg-tennis-green-bg text-tennis-green-dark border-tennis-green-medium/30';
        default: return 'bg-tennis-neutral-100 text-tennis-green-dark border-tennis-neutral-300';
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
    const reward = getRewardPreview(session.stakes_amount, session.session_type);

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
                  {session.title}
                </h3>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className={`text-xs ${getTypeColor(session.session_type)} transition-colors`}>
                  {session.session_type}
                </Badge>
                {isRecommended && (
                  <Badge className="text-xs bg-tennis-green-accent text-white">
                    {Math.round(session.recommendation_score * 100)}% match
                  </Badge>
                )}
              </div>
            </div>

            {/* Location with enhanced styling */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1 font-medium">{session.location}</span>
              </div>
              {session.distance_km && (
                <Badge variant="outline" className="text-xs bg-tennis-green-subtle text-tennis-green-dark border-tennis-green-primary/30">
                  {session.distance_km.toFixed(1)}km
                </Badge>
              )}
            </div>

            {/* Enhanced participants section */}
            <div className="flex items-center justify-between p-2 bg-tennis-green-bg/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs font-medium">
                  <Users className="h-3 w-3 text-tennis-green-primary" />
                  <span>{session.participant_count}/{session.max_players}</span>
                </div>
                <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-tennis-green-primary transition-all duration-300"
                    style={{ width: `${(session.participant_count / session.max_players) * 100}%` }}
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                by {session.creator_name}
              </div>
            </div>

            {/* Gamified rewards preview */}
            <div className="flex items-center justify-between p-2 bg-gradient-to-r from-tennis-green-subtle to-tennis-green-bg rounded-lg border border-tennis-green-primary/20">
              <div className="flex items-center gap-3">
                {session.stakes_amount > 0 && (
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

            {/* Notes with better styling */}
            {session.notes && (
              <div className="p-2 bg-tennis-green-bg/30 rounded-lg border-l-2 border-l-tennis-green-primary/30">
                <p className="text-xs text-muted-foreground italic line-clamp-2">
                  "{session.notes}"
                </p>
              </div>
            )}

            {/* Enhanced action button */}
            <Button 
              size="sm" 
              className={`w-full font-semibold transition-all duration-300 group-hover:shadow-lg ${
                isRecommended 
                  ? 'bg-gradient-to-r from-tennis-green-accent to-tennis-green-primary hover:from-tennis-green-primary hover:to-tennis-green-accent text-white shadow-lg' 
                  : 'bg-tennis-green-primary hover:bg-tennis-green-accent text-white'
              }`}
            >
              {isRecommended ? (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Join Recommended Match
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Join Session
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Smart content sections with enhanced gamification
  const ForYouContent = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-tennis-green-primary to-tennis-green-accent bg-clip-text text-transparent">
          ✨ Recommended for You
        </h3>
        <p className="text-sm text-muted-foreground">
          AI-powered matches based on your skill level, location, and preferences
        </p>
      </div>
      
      {/* Top recommendations with enhanced cards */}
      <div className="space-y-4">
        {mockSessions
          .sort((a, b) => b.recommendation_score - a.recommendation_score)
          .slice(0, 2)
          .map((session) => (
            <SessionCard key={session.id} session={session} isRecommended={true} />
          ))}
      </div>

      {/* Section divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="text-sm font-medium text-muted-foreground bg-background px-4">
          Other Sessions
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Regular sessions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockSessions.slice(2).map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );

  const NearbyContent = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-tennis-green-accent to-tennis-green-primary bg-clip-text text-transparent">
          📍 Sessions Near You
        </h3>
        <p className="text-sm text-muted-foreground">
          Sorted by distance • All within 25km radius
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockSessions
          .sort((a, b) => a.distance_km - b.distance_km)
          .map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
      </div>
    </div>
  );

  const AllSessionsContent = () => (
    <div className="space-y-6">
      <div className="text-center py-4">
        <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-tennis-green-dark to-tennis-green-primary bg-clip-text text-transparent">
          🎾 All Available Sessions
        </h3>
        <p className="text-sm text-muted-foreground">
          Browse all sessions or use filters to narrow down your search
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">🎾 Play</h1>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search sessions, players, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>

            {/* Quick Actions */}
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Player Stats Widget - Using Design System */}
      <div className="mb-6">
        <Card className="border-2 border-tennis-green-primary/20 bg-gradient-to-r from-tennis-green-subtle to-tennis-green-bg-alt">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Level & XP - Enhanced with XP Display component styling */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-tennis-green-primary" />
                  <span className="font-bold text-lg text-tennis-green-dark">Lv.{mockPlayerStats.level}</span>
                </div>
                <XPDisplay
                  currentLevel={mockPlayerStats.level}
                  currentXP={mockPlayerStats.xp}
                  xpToNextLevel={mockPlayerStats.xpToNext - mockPlayerStats.xp}
                  size="small"
                  showLevel={false}
                />
              </div>

              {/* Tokens */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-5 w-5 text-tennis-yellow" />
                  <span className="font-bold text-lg text-tennis-green-dark">{mockPlayerStats.tokens}</span>
                </div>
                <p className="text-xs text-muted-foreground">Tokens</p>
              </div>

              {/* Streak */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="h-5 w-5 text-tennis-yellow-dark" />
                  <span className="font-bold text-lg text-tennis-green-dark">{mockPlayerStats.streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>

              {/* Win Rate */}
              <div className="flex flex-col items-center p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-tennis-green-accent" />
                  <span className="font-bold text-lg text-tennis-green-dark">
                    {Math.round((mockPlayerStats.wins / mockPlayerStats.totalMatches) * 100)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Smart Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="for-you" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              For You
            </TabsTrigger>
            <TabsTrigger value="nearby" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Nearby
            </TabsTrigger>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              All Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="for-you">
            <ForYouContent />
          </TabsContent>

          <TabsContent value="nearby">
            <NearbyContent />
          </TabsContent>

          <TabsContent value="all">
            <AllSessionsContent />
          </TabsContent>
        </Tabs>

        {/* Empty State (when no sessions) */}
        <div className="hidden text-center py-12">
          <Gamepad2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No Sessions Available
          </h3>
          <p className="text-muted-foreground mb-4">
            Be the first to create a session in your area!
          </p>
          <Link to="/sessions/create">
            <Button className="bg-tennis-green-primary hover:bg-tennis-green-accent text-white">
              Create First Session
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayMockup;