import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronDown
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

// Mock data for demonstration
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
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </Link>
    </div>
  );

  // Unified session card component
  const SessionCard = ({ session }: { session: any }) => {
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
        case 'match': return 'bg-red-50 text-red-700 border-red-200';
        case 'social': return 'bg-green-50 text-green-700 border-green-200';
        case 'training': return 'bg-blue-50 text-blue-700 border-blue-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    const TypeIcon = getTypeIcon(session.session_type);

    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1">
                <TypeIcon className="h-4 w-4 text-primary flex-shrink-0" />
                <h3 className="font-semibold text-sm line-clamp-1">{session.title}</h3>
              </div>
              <Badge variant="outline" className={`text-xs ${getTypeColor(session.session_type)} flex-shrink-0 ml-2`}>
                {session.session_type}
              </Badge>
            </div>

            {/* Location and Distance */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="line-clamp-1">{session.location}</span>
              </div>
              {session.distance_km && (
                <Badge variant="outline" className="text-xs">
                  {session.distance_km.toFixed(1)}km
                </Badge>
              )}
            </div>

            {/* Participants and Stakes */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs">
                  <Users className="h-3 w-3" />
                  <span>{session.participant_count}/{session.max_players}</span>
                </div>
                {session.stakes_amount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-600">
                    <Coins className="h-3 w-3" />
                    <span>{session.stakes_amount}</span>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                by {session.creator_name}
              </div>
            </div>

            {/* Notes */}
            {session.notes && (
              <p className="text-xs text-muted-foreground line-clamp-2 italic">
                "{session.notes}"
              </p>
            )}

            {/* Action Button */}
            <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
              Join Session
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Smart content sections
  const ForYouContent = () => (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h3 className="text-lg font-semibold mb-1">Recommended for You</h3>
        <p className="text-sm text-muted-foreground">Sessions matched to your preferences and location</p>
      </div>
      
      {/* Top recommendations with enhanced cards */}
      <div className="space-y-3">
        {mockSessions
          .sort((a, b) => b.recommendation_score - a.recommendation_score)
          .slice(0, 2)
          .map((session) => (
            <Card key={session.id} className="border-l-4 border-l-blue-500 bg-blue-50/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">{session.title}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(session.recommendation_score * 100)}% match
                  </Badge>
                </div>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{session.location} • {session.distance_km}km away</span>
                  </div>
                  <p className="italic">Perfect match for your skill level and preferred session type</p>
                </div>
                <Button size="sm" className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
                  Join Now - Recommended
                </Button>
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Regular sessions */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">Other Sessions</h4>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mockSessions.slice(2).map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </div>
    </div>
  );

  const NearbyContent = () => (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h3 className="text-lg font-semibold mb-1">Sessions Near You</h3>
        <p className="text-sm text-muted-foreground">Sorted by distance within 25km</p>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mockSessions
          .sort((a, b) => a.distance_km - b.distance_km)
          .map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
      </div>
    </div>
  );

  const AllSessionsContent = () => (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h3 className="text-lg font-semibold mb-1">All Available Sessions</h3>
        <p className="text-sm text-muted-foreground">Browse all sessions or use filters to narrow down</p>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            <Button className="bg-primary hover:bg-primary/90">
              Create First Session
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayMockup;