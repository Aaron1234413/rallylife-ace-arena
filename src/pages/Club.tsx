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
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ClubMobileDashboard } from '@/components/club/dashboard/ClubMobileDashboard';
import { SimplifiedClubNav } from '@/components/club/navigation/SimplifiedClubNav';
import { MembersListSimple } from '@/components/club/MembersListSimple';
import { CourtBooking } from '@/components/club/dashboard/CourtBooking';
import { ClubEconomics } from '@/components/club/economics/ClubEconomics';
import { ClubSettings } from '@/components/club/ClubSettings';

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
  const [economicsInitialTab, setEconomicsInitialTab] = useState('overview');

  // Find the club in either clubs or myClubs
  const club = [...clubs, ...myClubs].find(c => c.id === clubId);
  const isMember = myClubs.some(c => c.id === clubId);
  const isOwner = user?.id === club?.owner_id;
  
  const userMembership = clubMembers.find(m => m.user_id === user?.id);
  const canManageMembers = userMembership?.permissions?.can_manage_members || false;
  const canEditClub = userMembership?.permissions?.can_edit_club || false;
  
  // Mock check if user is a coach (would come from profiles table in real implementation)
  const isCoach = user?.email?.includes('coach') || false;


  useEffect(() => {
    if (club?.id) {
      fetchClubMembers(club.id);
    }
  }, [club?.id, fetchClubMembers]);

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
          <div className="animate-fade-in">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <div className="h-8 w-20 bg-tennis-neutral-100 rounded animate-pulse"></div>
            </div>
            
            {/* Club Card Skeleton */}
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 bg-tennis-neutral-100 rounded-full animate-pulse flex-shrink-0"></div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="space-y-2">
                      <div className="h-6 bg-tennis-neutral-100 rounded animate-pulse w-3/4"></div>
                      <div className="h-4 bg-tennis-neutral-100 rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="h-4 bg-tennis-neutral-100 rounded animate-pulse w-full"></div>
                    <div className="h-4 bg-tennis-neutral-100 rounded animate-pulse w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Navigation Skeleton */}
            <div className="h-12 bg-tennis-neutral-100 rounded animate-pulse"></div>
            
            {/* Content Skeleton */}
            <div className="space-y-4">
              <div className="h-32 bg-tennis-neutral-100 rounded animate-pulse"></div>
              <div className="h-48 bg-tennis-neutral-100 rounded animate-pulse"></div>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-tennis-green-dark animate-pulse">Loading club details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center animate-fade-in">
        <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Club Not Found</h2>
          <p className="text-gray-700 mb-6 text-sm sm:text-base">
            The club you're looking for doesn't exist or you don't have access to it.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
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

        {/* Mobile-Optimized Club Header */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 animate-fade-in">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex-shrink-0">
                <AvatarImage src={club.logo_url || undefined} />
                <AvatarFallback className="text-white font-bold text-lg sm:text-xl">
                  {club.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                {/* Title and Badges Row */}
                <div className="flex flex-col gap-3">
                  <div className="space-y-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {club.name}
                    </h1>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isOwner && (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 px-2 py-1 text-xs animate-scale-in">
                          <Crown className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                      <Badge variant="secondary" className="px-2 py-1 text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Mobile Action Buttons */}
                  <div className="flex gap-2 sm:hidden">
                    {!isOwner && !isMember && (
                      <Button size="sm" className="flex items-center gap-2 text-xs">
                        <UserPlus className="h-3 w-3" />
                        Join Club
                      </Button>
                    )}
                  </div>
                </div>

                {/* Club Info */}
                <div className="space-y-2 sm:space-y-3 border-t border-gray-100 pt-2 sm:pt-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="font-medium text-sm sm:text-base">{club.member_count} members</span>
                  </div>
                  
                  {club.location && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm sm:text-base">{club.location}</span>
                    </div>
                  )}
                  
                  {club.description && (
                    <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{club.description}</p>
                  )}
                </div>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden sm:flex gap-2 flex-shrink-0">
                {!isOwner && !isMember && (
                  <Button className="flex items-center gap-2 px-4 py-2 hover-scale">
                    <UserPlus className="h-4 w-4" />
                    Join Club
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile-First Club Navigation */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Reset economics tab to overview when navigating normally
          if (value === 'economics' && economicsInitialTab === 'subscription') {
            setEconomicsInitialTab('overview');
          }
        }} className="space-y-6">
          <SimplifiedClubNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isMember={isMember}
            canManageMembers={canManageMembers}
            canEditClub={canEditClub}
            isCoach={isCoach}
            isOwner={isOwner}
          />

          <TabsContent value="play">
            <ClubMobileDashboard 
              club={club} 
              isMember={isMember} 
              onNavigateToTab={setActiveTab}
            />
          </TabsContent>


          <TabsContent value="members">
            <MembersListSimple 
              club={club} 
              canManageMembers={canManageMembers}
            />
          </TabsContent>

          <TabsContent value="courts">
            <CourtBooking 
              clubId={club.id} 
              isOwner={isOwner}
              onNavigateToSettings={() => setActiveTab('settings')}
            />
          </TabsContent>

          <TabsContent value="economics">
            <ClubEconomics 
              club={club} 
              isOwner={isOwner} 
              canManage={canManageMembers || canEditClub}
              initialTab={economicsInitialTab}
            />
          </TabsContent>

          <TabsContent value="settings">
            <ClubSettings 
              club={club} 
              onSettingsUpdate={handleRefresh}
              onNavigateToEconomics={() => {
                setEconomicsInitialTab('subscription');
                setActiveTab('economics');
              }}
            />
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}