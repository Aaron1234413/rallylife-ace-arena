import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  Globe, 
  Lock, 
  Crown, 
  Calendar,
  Settings,
  UserPlus,
  MapPin,
  Activity,
  GraduationCap
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ClubMobileDashboard } from '@/components/club/dashboard/ClubMobileDashboard';
import { SimplifiedClubNav } from '@/components/club/navigation/SimplifiedClubNav';
import { MembersListSimple } from '@/components/club/MembersListSimple';
import { CoachesListSimple } from '@/components/club/CoachesListSimple';
import { SessionManagement } from '@/components/club/dashboard/SessionManagement';
import { CourtBooking } from '@/components/club/dashboard/CourtBooking';
import { ClubAnalyticsDashboard } from '@/components/club/analytics/ClubAnalyticsDashboard';
import { useClubAnalytics } from '@/hooks/useClubAnalytics';

export default function Club() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    clubs, 
    myClubs, 
    clubMembers, 
    loading, 
    fetchClubMembers 
  } = useClubs();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('play');

  // Find the club in either clubs or myClubs
  const club = [...clubs, ...myClubs].find(c => c.id === clubId);
  const isMember = myClubs.some(c => c.id === clubId);
  const isOwner = user?.id === club?.owner_id;
  
  const userMembership = clubMembers.find(m => m.user_id === user?.id);
  const canManageMembers = userMembership?.permissions?.can_manage_members || false;
  const canEditClub = userMembership?.permissions?.can_edit_club || false;
  
  // Mock check if user is a coach (would come from profiles table in real implementation)
  const isCoach = user?.email?.includes('coach') || false;

  // Load analytics data
  const { analytics, loading: analyticsLoading } = useClubAnalytics(club?.id || '');

  const handleRefresh = async () => {
    if (!club?.id) return;
    setRefreshing(true);
    await fetchClubMembers(club.id);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg">
        <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-32 bg-tennis-neutral-100 rounded-lg mb-6"></div>
            <div className="h-48 bg-tennis-neutral-100 rounded-lg mb-6"></div>
            <div className="text-center">
              <p className="text-tennis-green-dark">Loading club...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Club Not Found</h2>
          <p className="text-gray-700 mb-4">
            The club you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover-scale"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        </div>

        {/* Club Header */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex-shrink-0">
                <AvatarImage src={club.logo_url || undefined} />
                <AvatarFallback className="text-white font-bold text-xl">
                  {club.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 space-y-4">
                {/* Title and Badges Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                      {club.name}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isOwner && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-3 py-1">
                          <Crown className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                      <Badge variant={club.is_public ? "default" : "secondary"} className="px-3 py-1">
                        {club.is_public ? (
                          <><Globe className="h-3 w-3 mr-1" />Public</>
                        ) : (
                          <><Lock className="h-3 w-3 mr-1" />Private</>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {isOwner && (
                      <Button className="flex items-center gap-2 px-4 py-2 hover-scale">
                        <Settings className="h-4 w-4" />
                        Manage Club
                      </Button>
                    )}
                    {!isOwner && !isMember && (
                      <Button className="flex items-center gap-2 px-4 py-2 hover-scale">
                        <UserPlus className="h-4 w-4" />
                        Join Club
                      </Button>
                    )}
                  </div>
                </div>

                {/* Club Info and Description */}
                <div className="space-y-3 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{club.member_count} members</span>
                  </div>
                  
                  {club.description && (
                    <p className="text-gray-700 leading-relaxed">{club.description}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile-First Club Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <SimplifiedClubNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isMember={isMember}
            canManageMembers={canManageMembers}
            canEditClub={canEditClub}
            isCoach={isCoach}
          />

          <TabsContent value="play">
            <ClubMobileDashboard club={club} isMember={isMember} />
          </TabsContent>


          <TabsContent value="members">
            <MembersListSimple 
              club={club} 
              canManageMembers={canManageMembers}
            />
          </TabsContent>

          <TabsContent value="coaches">
            <CoachesListSimple club={club} canManage={canManageMembers} />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionManagement clubId={club.id} />
          </TabsContent>

          <TabsContent value="courts">
            <CourtBooking clubId={club.id} />
          </TabsContent>

          <TabsContent value="analytics">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-primary"></div>
              </div>
            ) : analytics ? (
              <ClubAnalyticsDashboard analytics={analytics} />
            ) : (
              <div className="text-center py-8">
                <p className="text-tennis-green-medium">Analytics data not available</p>
              </div>
            )}
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}