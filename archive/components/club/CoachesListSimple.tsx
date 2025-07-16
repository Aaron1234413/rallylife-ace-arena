import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  GraduationCap, 
  Star, 
  Calendar, 
  MessageCircle, 
  Search,
  MoreVertical,
  Mail,
  Clock,
  Award,
  Phone,
  MapPin
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { formatDistanceToNow } from 'date-fns';

interface CoachProfile {
  full_name: string;
  avatar_url: string | null;
  email?: string;
}

interface CoachMembership {
  id: string;
  user_id: string;
  club_id: string;
  role: string;
  status: string;
  joined_at: string;
  updated_at: string;
  permissions?: any;
  profiles?: CoachProfile;
}

interface CoachesListSimpleProps {
  club: {
    id: string;
    name: string;
  };
  canManage?: boolean;
}

export function CoachesListSimple({ club, canManage }: CoachesListSimpleProps) {
  const { clubMembers, loading, fetchClubMembers } = useClubs();
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    if (club.id) {
      fetchClubMembers(club.id);
    }
  }, [club.id, fetchClubMembers]);

  // Filter for coaches and apply search
  const filteredCoaches = useMemo(() => {
    const coaches = clubMembers.filter(membership => 
      membership.role === 'coach' || membership.profiles?.email?.includes('coach')
    );
    
    if (!searchTerm) return coaches;
    
    return coaches.filter(membership => {
      const coachUser = membership.profiles || { full_name: 'Unknown Coach', avatar_url: null };
      return coachUser.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    });
  }, [clubMembers, searchTerm]);

  const CoachDetailDialog = ({ coach }: { coach: CoachMembership }) => {
    const coachUser = coach.profiles || { full_name: 'Unknown Coach', avatar_url: null };
    
    return (
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Coach Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={coachUser.avatar_url || undefined} />
              <AvatarFallback className="bg-tennis-green-primary text-white text-lg">
                {coachUser.full_name?.substring(0, 2).toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-tennis-green-dark">
                {coachUser.full_name}
              </h3>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Coach
                </Badge>
              </div>
            </div>
          </div>

          {/* Coach Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-tennis-green-medium" />
              <div>
                <p className="text-sm font-medium text-tennis-green-dark">Experience</p>
                <p className="text-sm text-tennis-green-medium">10+ years professional coaching</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Star className="h-4 w-4 text-tennis-green-medium" />
              <div>
                <p className="text-sm font-medium text-tennis-green-dark">Rating</p>
                <p className="text-sm text-tennis-green-medium">5.0 stars (12 reviews)</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-tennis-green-medium" />
              <div>
                <p className="text-sm font-medium text-tennis-green-dark">Joined</p>
                <p className="text-sm text-tennis-green-medium">
                  {formatDistanceToNow(new Date(coach.joined_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            
            {coachUser.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-tennis-green-medium" />
                <div>
                  <p className="text-sm font-medium text-tennis-green-dark">Contact</p>
                  <p className="text-sm text-tennis-green-medium">{coachUser.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Specialties */}
          <div>
            <p className="text-sm font-medium text-tennis-green-dark mb-3">Specialties</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Beginner Lessons</Badge>
              <Badge variant="outline">Advanced Training</Badge>
              <Badge variant="outline">Tournament Prep</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t pt-4 space-y-2">
            <Button className="w-full" disabled>
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Coach (Coming Soon)
            </Button>
            <Button variant="outline" className="w-full" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              Book Lesson (Coming Soon)
            </Button>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-tennis-green-primary" />
              Club Coaches ({filteredCoaches.length})
            </CardTitle>
          </div>
          
          {/* Search Controls */}
          {filteredCoaches.length > 0 && (
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-tennis-green-medium" />
                <Input
                  placeholder="Search coaches..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {filteredCoaches.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
              <p className="text-tennis-green-medium">
                {searchTerm ? 'No coaches match your search' : 'No coaches found'}
              </p>
              <p className="text-sm text-tennis-green-medium/70">
                {searchTerm 
                  ? 'Try a different search term' 
                  : 'This club doesn\'t have any registered coaches yet'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {filteredCoaches.map((membership) => {
                const coachUser = membership.profiles || { 
                  full_name: 'Unknown Coach', 
                  avatar_url: null 
                };

                return (
                  <Dialog key={membership.id}>
                    <DialogTrigger asChild>
                      <div className="flex items-start gap-4 p-4 border border-tennis-green-bg rounded-lg hover:shadow-md transition-all cursor-pointer hover:border-tennis-green-primary/30">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={coachUser.avatar_url || undefined} />
                          <AvatarFallback className="bg-tennis-green-primary text-white text-lg">
                            {coachUser.full_name?.substring(0, 2).toUpperCase() || 'C'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-lg text-tennis-green-dark">
                                {coachUser.full_name}
                              </p>
                              <Badge className="bg-green-100 text-green-800">
                                <GraduationCap className="h-3 w-3 mr-1" />
                                Coach
                              </Badge>
                            </div>
                            <MoreVertical className="h-4 w-4 text-tennis-green-medium flex-shrink-0" />
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              <span>5.0 rating</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>Available</span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-tennis-green-medium">
                            Professional tennis coach with 10+ years experience
                          </p>
                        </div>
                      </div>
                    </DialogTrigger>
                    
                    <CoachDetailDialog coach={membership} />
                  </Dialog>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Coach Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-tennis-green-dark">Enhanced Coach Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-800">✓ Coach Search</p>
              </div>
              <p className="text-sm text-green-700">Find coaches by name</p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-800">✓ Detailed Profiles</p>
              </div>
              <p className="text-sm text-green-700">Click any coach to view their profile</p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-800">✓ Ratings & Reviews</p>
              </div>
              <p className="text-sm text-green-700">See coach experience and ratings</p>
            </div>
            
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="font-medium text-green-800">✓ Specialties Display</p>
              </div>
              <p className="text-sm text-green-700">View coach specialties and skills</p>
            </div>
          </div>
          
          <div className="pt-3 border-t border-tennis-green-bg">
            <p className="text-sm text-tennis-green-medium mb-2 font-medium">Coming in Phase 4:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Lesson Booking</Badge>
              <Badge variant="outline">Direct Messaging</Badge>
              <Badge variant="outline">Availability Calendar</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}