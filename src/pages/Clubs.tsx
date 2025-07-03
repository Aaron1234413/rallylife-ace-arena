import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter,
  Plus,
  Users,
  Crown,
  ArrowLeft,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { ClubCard } from '@/components/clubs/ClubCard';

export default function Clubs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clubs, myClubs, loading, joinClub, leaveClub } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minMembers: '',
    maxMembers: '',
    publicOnly: false
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter clubs based on search and filters
  const filteredClubs = clubs.filter(club => {
    // Search filter
    if (searchQuery && !club.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !club.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Member count filters
    if (filters.minMembers && club.member_count < parseInt(filters.minMembers)) {
      return false;
    }
    if (filters.maxMembers && club.member_count > parseInt(filters.maxMembers)) {
      return false;
    }

    // Public only filter
    if (filters.publicOnly && !club.is_public) {
      return false;
    }

    return true;
  });

  const isAlreadyMember = (clubId: string) => {
    return myClubs.some(club => club.id === clubId);
  };

  const getMemberRole = (clubId: string) => {
    const club = myClubs.find(c => c.id === clubId);
    if (!club) return undefined;
    return user?.id === club.owner_id ? 'owner' : 'member';
  };

  const resetFilters = () => {
    setFilters({
      minMembers: '',
      maxMembers: '',
      publicOnly: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-tennis-neutral-100 rounded-lg mb-6"></div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-48 bg-tennis-neutral-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-tennis-green-dark">
                Tennis Clubs
              </h1>
              <p className="text-tennis-green-medium">
                Discover clubs, manage memberships, and connect with fellow tennis players
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Club
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tennis-green-bg rounded-lg">
                  <Users className="h-5 w-5 text-tennis-green-primary" />
                </div>
                <div>
                  <p className="text-sm text-tennis-green-medium">Total Clubs</p>
                  <p className="text-xl font-bold text-tennis-green-dark">{clubs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tennis-green-bg rounded-lg">
                  <Crown className="h-5 w-5 text-tennis-green-primary" />
                </div>
                <div>
                  <p className="text-sm text-tennis-green-medium">My Clubs</p>
                  <p className="text-xl font-bold text-tennis-green-dark">{myClubs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-tennis-green-bg rounded-lg">
                  <TrendingUp className="h-5 w-5 text-tennis-green-primary" />
                </div>
                <div>
                  <p className="text-sm text-tennis-green-medium">Available</p>
                  <p className="text-xl font-bold text-tennis-green-dark">
                    {clubs.filter(c => c.is_public && !isAlreadyMember(c.id)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="discover" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="discover">Discover Clubs</TabsTrigger>
            <TabsTrigger value="my-clubs">My Clubs</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search clubs by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {(filters.minMembers || filters.maxMembers || filters.publicOnly) && (
                      <Badge variant="secondary" className="ml-2">Active</Badge>
                    )}
                  </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                  <div className="mt-4 p-4 border rounded-lg bg-tennis-green-bg/30">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium mb-1 text-tennis-green-dark">Min Members</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={filters.minMembers}
                          onChange={(e) => setFilters(prev => ({ ...prev, minMembers: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-tennis-green-dark">Max Members</label>
                        <Input
                          type="number"
                          placeholder="100"
                          value={filters.maxMembers}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxMembers: e.target.value }))}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="publicOnly"
                          checked={filters.publicOnly}
                          onChange={(e) => setFilters(prev => ({ ...prev, publicOnly: e.target.checked }))}
                          className="rounded"
                        />
                        <label htmlFor="publicOnly" className="text-sm font-medium text-tennis-green-dark">
                          Public clubs only
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" onClick={resetFilters} variant="outline">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-tennis-green-medium">
                {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            </div>

            {/* Clubs Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  isMember={isAlreadyMember(club.id)}
                  memberRole={getMemberRole(club.id)}
                  onJoin={joinClub}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredClubs.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium mb-2 text-tennis-green-dark">No clubs found</h3>
                  <p className="text-sm text-tennis-green-medium mb-4">
                    {searchQuery || Object.values(filters).some(Boolean) 
                      ? 'Try adjusting your search or filters' 
                      : 'No public clubs available yet'
                    }
                  </p>
                  {searchQuery || Object.values(filters).some(Boolean) ? (
                    <Button onClick={() => {
                      setSearchQuery('');
                      resetFilters();
                    }}>
                      Clear Search & Filters
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-clubs" className="space-y-6">
            {myClubs.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium mb-2 text-tennis-green-dark">No clubs joined yet</h3>
                  <p className="text-sm text-tennis-green-medium mb-4">
                    Join clubs to connect with other tennis players and access exclusive features
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Browse Clubs
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-tennis-green-dark">My Clubs</h2>
                    <p className="text-sm text-tennis-green-medium">
                      Clubs you&apos;re a member of ({myClubs.length})
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {myClubs.map((club) => (
                    <ClubCard
                      key={club.id}
                      club={club}
                      isMember={true}
                      memberRole={getMemberRole(club.id)}
                      onLeave={leaveClub}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Create Club Dialog - Simple inline dialog for now */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Create New Club</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Club Name *</label>
                  <Input placeholder="Enter club name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Describe your club..." />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Create Club
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}