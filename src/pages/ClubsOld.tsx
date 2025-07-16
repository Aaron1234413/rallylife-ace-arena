import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus,
  Users,
  Crown,
  ArrowLeft
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { ClubCard } from '@/components/clubs/ClubCard';
// import { ClubCreationWizard } from '@/components/club/ClubCreationWizard'; // Archived for MVP

export default function Clubs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myClubs, loading, leaveClub } = useClubs();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Filter my clubs based on search only (no public discovery)
  const filteredClubs = myClubs.filter(club => {
    // Search filter for my clubs only
    const searchLower = searchQuery.toLowerCase();
    if (searchQuery && !(
      club.name.toLowerCase().includes(searchLower) ||
      club.description?.toLowerCase().includes(searchLower) ||
      club.location?.toLowerCase().includes(searchLower)
    )) {
      return false;
    }

    return true;
  });

  const getMemberRole = (clubId: string) => {
    const club = myClubs.find(c => c.id === clubId);
    if (!club) return undefined;
    return user?.id === club.owner_id ? 'owner' : 'member';
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
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
          <div className="flex flex-col gap-6">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 self-start"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-tennis-green-dark leading-tight">
                Tennis Clubs
              </h1>
              <p className="text-lg text-tennis-green-medium leading-relaxed max-w-2xl">
                Manage your club memberships and create private clubs. Join through invitations only.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 px-6 py-3 text-base hover-scale"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            Create Club
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <Card className="hover-scale animate-fade-in">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-tennis-green-medium font-medium">My Clubs</p>
                  <p className="text-2xl font-bold text-tennis-green-dark">{myClubs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-tennis-green-primary/10 to-tennis-green-primary/5 rounded-lg">
                  <Users className="h-5 w-5 text-tennis-green-primary" />
                </div>
                <div>
                  <p className="text-sm text-tennis-green-medium font-medium">Invitation Only</p>
                  <p className="text-lg font-semibold text-tennis-green-dark">Private Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Clubs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-tennis-green-dark">My Clubs</h2>
              <p className="text-sm text-tennis-green-medium">
                Private clubs you're a member of ({myClubs.length})
              </p>
            </div>
          </div>

          {/* Search My Clubs */}
          {myClubs.length > 0 && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search your clubs by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Clubs Grid */}
          {myClubs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="font-medium mb-2 text-tennis-green-dark">No clubs joined yet</h3>
                <p className="text-sm text-tennis-green-medium mb-4">
                  Create a new club or join through an invitation to get started
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Club
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Results Summary */}
              {searchQuery && (
                <div className="flex items-center justify-between py-1">
                  <p className="text-tennis-green-medium font-medium">
                    {filteredClubs.length} club{filteredClubs.length !== 1 ? 's' : ''} found
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredClubs.map((club) => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    isMember={true}
                    memberRole={getMemberRole(club.id)}
                  />
                ))}
              </div>

              {/* Empty Search State */}
              {filteredClubs.length === 0 && searchQuery && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2 text-tennis-green-dark">No clubs found</h3>
                    <p className="text-sm text-tennis-green-medium mb-4">
                      No clubs match your search for "{searchQuery}"
                    </p>
                    <Button onClick={() => setSearchQuery('')} variant="outline">
                      Clear Search
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Archived club creation - replaced with MVP message */}
        {showCreateDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-4">
              <h2 className="text-xl font-bold text-tennis-green-dark mb-4">Club Creation Coming Soon</h2>
              <p className="text-gray-700 mb-4">
                Club creation features will be available in a future update.
              </p>
              <button 
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 bg-tennis-green-primary text-white rounded-lg hover:bg-tennis-green-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}