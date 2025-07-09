import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { EnhancedMemberCard } from './EnhancedMemberCard';
import { MemberSearchFilter, SearchFilters } from './MemberSearchFilter';
import { useEnhancedClubMembers } from '@/hooks/useEnhancedClubMembers';
import { Users, Search } from 'lucide-react';

interface EnhancedMembersListProps {
  clubId: string;
  onMessageMember?: (memberId: string) => void;
  showSearch?: boolean;
  compact?: boolean;
  title?: string;
}

export function EnhancedMembersList({ 
  clubId, 
  onMessageMember,
  showSearch = true,
  compact = false,
  title = "Club Members"
}: EnhancedMembersListProps) {
  const {
    filteredMembers,
    skillMatchedMembers,
    playersLookingToPlay,
    loading,
    searchFilters,
    setSearchFilters,
    totalMembers,
    filteredCount
  } = useEnhancedClubMembers(clubId);

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      {showSearch && (
        <MemberSearchFilter
          onSearch={handleSearch}
          totalMembers={totalMembers}
          filteredCount={filteredCount}
        />
      )}

      {/* Looking to Play Section */}
      {playersLookingToPlay.length > 0 && !searchFilters.searchTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-tennis-green-dark">
              <div className="w-3 h-3 bg-tennis-yellow rounded-full animate-pulse" />
              Players Looking to Play ({playersLookingToPlay.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {playersLookingToPlay.map((member) => (
                <EnhancedMemberCard
                  key={member.id}
                  member={member.user!}
                  clubId={clubId}
                  onMessage={onMessageMember}
                  compact={compact}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Matched Members */}
      {skillMatchedMembers.length > 0 && !searchFilters.searchTerm && !searchFilters.showOnlyLookingToPlay && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-tennis-green-dark">
              <Users className="h-5 w-5" />
              Similar Skill Level ({skillMatchedMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {skillMatchedMembers.map((member) => (
                <EnhancedMemberCard
                  key={member.id}
                  member={member.user!}
                  clubId={clubId}
                  onMessage={onMessageMember}
                  compact={compact}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Members or Search Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-tennis-green-dark">
            <Users className="h-5 w-5" />
            {searchFilters.searchTerm || searchFilters.showOnlyLookingToPlay || 
             searchFilters.location || searchFilters.utrRange[0] > 1 || 
             searchFilters.utrRange[1] < 16.5 || searchFilters.ustaRange[0] > 1 || 
             searchFilters.ustaRange[1] < 7
              ? `Search Results (${filteredCount})`
              : `${title} (${totalMembers})`
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <EmptyState
              icon={Search}
              title="No members found"
              description={
                searchFilters.searchTerm || searchFilters.showOnlyLookingToPlay ||
                searchFilters.location
                  ? "Try adjusting your search filters"
                  : "This club doesn't have any members yet"
              }
            />
          ) : (
            <div className="grid gap-3">
              {filteredMembers.map((member) => (
                <EnhancedMemberCard
                  key={member.id}
                  member={member.user!}
                  clubId={clubId}
                  onMessage={onMessageMember}
                  compact={compact}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}