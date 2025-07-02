import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { ClubCard } from './ClubCard';
import { CreateClubDialog } from './CreateClubDialog';
import { useClubs } from '@/hooks/useClubs';
import { Users, Plus } from 'lucide-react';

export function MyClubsSection() {
  const { myClubs, loading, leaveClub } = useClubs();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Clubs
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Clubs
          </CardTitle>
          <CreateClubDialog />
        </div>
      </CardHeader>
      <CardContent>
        {myClubs.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs yet</h3>
            <p className="text-gray-600 mb-4">Create your first club or join an existing one to get started.</p>
            <CreateClubDialog 
              trigger={
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Create Your First Club
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {myClubs.map((club: any) => (
              <ClubCard
                key={club.id}
                club={club}
                isMember={true}
                memberRole={club.club_memberships?.[0]?.role}
                onLeave={leaveClub}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}