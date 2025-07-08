import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Star, Calendar, MessageCircle } from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';

interface CoachesListSimpleProps {
  club: {
    id: string;
    name: string;
  };
  canManage?: boolean;
}

export function CoachesListSimple({ club, canManage }: CoachesListSimpleProps) {
  const { clubMembers, loading, fetchClubMembers } = useClubs();

  React.useEffect(() => {
    if (club.id) {
      fetchClubMembers(club.id);
    }
  }, [club.id, fetchClubMembers]);

  // Filter for coaches
  const coaches = clubMembers.filter(membership => 
    membership.role === 'coach' || membership.profiles?.email?.includes('coach')
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-tennis-green-primary" />
            Club Coaches ({coaches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coaches.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
              <p className="text-tennis-green-medium">No coaches found</p>
              <p className="text-sm text-tennis-green-medium/70">
                This club doesn't have any registered coaches yet
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {coaches.map((membership) => {
                const coachUser = membership.profiles || { 
                  full_name: 'Unknown Coach', 
                  avatar_url: null 
                };

                return (
                  <div
                    key={membership.id}
                    className="flex items-start gap-4 p-4 border border-tennis-green-bg rounded-lg hover:shadow-md transition-shadow"
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={coachUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-tennis-green-primary text-white text-lg">
                        {coachUser.full_name?.substring(0, 2).toUpperCase() || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <p className="font-semibold text-lg text-tennis-green-dark">
                          {coachUser.full_name}
                        </p>
                        <Badge className="bg-green-100 text-green-800">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          Coach
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>5.0 rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Available</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-tennis-green-medium">
                        Professional tennis coach with 10+ years experience
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coming Soon Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark">Coach Features Coming Soon</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
            <p className="font-medium text-tennis-green-dark">Coach Booking System</p>
            <p className="text-sm text-tennis-green-medium">Schedule lessons and view coach availability</p>
            <Badge variant="secondary" className="mt-2">Phase 4</Badge>
          </div>
          
          <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
            <p className="font-medium text-tennis-green-dark">Coach Profiles & Reviews</p>
            <p className="text-sm text-tennis-green-medium">Detailed coach information, specialties, and ratings</p>
            <Badge variant="secondary" className="mt-2">Phase 2</Badge>
          </div>
          
          <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
            <p className="font-medium text-tennis-green-dark">Direct Messaging</p>
            <p className="text-sm text-tennis-green-medium">Contact coaches directly for questions and scheduling</p>
            <Badge variant="secondary" className="mt-2">Phase 6</Badge>
          </div>

          {canManage && (
            <div className="p-3 bg-tennis-green-bg/30 rounded-lg">
              <p className="font-medium text-tennis-green-dark">Coach Management</p>
              <p className="text-sm text-tennis-green-medium">Add coaches, manage services, and set pricing</p>
              <Badge variant="secondary" className="mt-2">Phase 2</Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}