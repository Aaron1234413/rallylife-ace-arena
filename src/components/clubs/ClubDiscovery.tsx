import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ClubCard } from './ClubCard';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { Search, Globe } from 'lucide-react';

export function ClubDiscovery() {
  const { clubs, myClubs, loading, joinClub } = useClubs();
  const { user } = useAuth();

  // Filter out clubs the user is already a member of
  const availableClubs = clubs.filter(club => 
    !myClubs.some(myClub => myClub.id === club.id) && 
    club.owner_id !== user?.id
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Discover Clubs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Discover Clubs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {availableClubs.length === 0 ? (
          <EmptyState
            icon={Globe}
            title="No clubs to discover"
            description="All available public clubs are already joined or there are no public clubs yet."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableClubs.map((club) => (
              <ClubCard
                key={club.id}
                club={club}
                isMember={false}
                onJoin={joinClub}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}