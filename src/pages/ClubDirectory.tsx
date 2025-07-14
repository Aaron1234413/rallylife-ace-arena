import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter,
  Users, 
  Globe, 
  Lock,
  UserPlus,
  ArrowLeft,
  MapPin,
  Calendar
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { JoinClubDialog } from '@/components/club/JoinClubDialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function ClubDirectory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clubs, myClubs, loading, joinClub } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minMembers: '',
    maxMembers: ''
  });
  const [selectedClub, setSelectedClub] = useState<any>(null);

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

                    // Remove public filter since all clubs are private now

    return true;
  });

  const isAlreadyMember = (clubId: string) => {
    return myClubs.some(club => club.id === clubId);
  };

  const handleJoinClub = async (clubId: string) => {
    try {
      await joinClub(clubId);
      toast.success('Successfully joined club!');
    } catch (error) {
      // Error handled by hook
    }
  };

  const resetFilters = () => {
    setFilters({
      minMembers: '',
      maxMembers: ''
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
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Club Directory
                  </h1>
                  <p className="text-gray-600">
                    Discover tennis clubs - All clubs are private and require invitations to join
                  </p>
                </div>
          </div>
        </div>

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
                {(filters.minMembers || filters.maxMembers) && (
                  <Badge variant="secondary" className="ml-2">Active</Badge>
                )}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Min Members</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minMembers}
                      onChange={(e) => setFilters(prev => ({ ...prev, minMembers: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Members</label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={filters.maxMembers}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxMembers: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lock className="h-4 w-4" />
                    <span>All clubs are private and invitation-only</span>
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
          <p className="text-gray-600">
            {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Clubs Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClubs.map((club) => (
            <Card key={club.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={club.logo_url || undefined} />
                    <AvatarFallback>
                      {club.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{club.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Invitation Only
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{club.member_count} members</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {club.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {club.description}
                  </p>
                )}
                
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                  <Calendar className="h-3 w-3" />
                  <span>Created {formatDistanceToNow(new Date(club.created_at), { addSuffix: true })}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/club/${club.id}`)}
                    className="flex-1"
                  >
                    View Club
                  </Button>
                  
                  {!isAlreadyMember(club.id) ? (
                    <Badge variant="outline" className="px-3 py-1 text-xs">
                      <Lock className="h-3 w-3 mr-1" />
                      Invitation Required
                    </Badge>
                  ) : (
                    <Badge variant="default" className="px-3 py-1">
                      Member
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredClubs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">No clubs found</h3>
              <p className="text-sm text-gray-600 mb-4">
                {searchQuery || Object.values(filters).some(Boolean) 
                  ? 'Try adjusting your search or filters' 
                  : 'No clubs available'
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

        {/* Note: Join Club Dialog removed since all clubs are invitation-only */}
      </div>
    </div>
  );
}