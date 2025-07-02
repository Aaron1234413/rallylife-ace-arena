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
  Activity
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ClubDashboard } from '@/components/club/ClubDashboard';
import { MembersList } from '@/components/club/MembersList';

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

  // Find the club in either clubs or myClubs
  const club = [...clubs, ...myClubs].find(c => c.id === clubId);
  const isMember = myClubs.some(c => c.id === clubId);
  const isOwner = user?.id === club?.owner_id;
  
  const userMembership = clubMembers.find(m => m.user_id === user?.id);
  const canManageMembers = userMembership?.permissions?.can_manage_members || false;
  const canEditClub = userMembership?.permissions?.can_edit_club || false;

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
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
        </div>

        {/* Club Header */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <Avatar className="h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600">
                <AvatarImage src={club.logo_url || undefined} />
                <AvatarFallback className="text-white font-bold text-xl">
                  {club.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                    {club.name}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isOwner && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                        <Crown className="h-3 w-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                    <Badge variant={club.is_public ? "default" : "secondary"}>
                      {club.is_public ? (
                        <><Globe className="h-3 w-3 mr-1" />Public</>
                      ) : (
                        <><Lock className="h-3 w-3 mr-1" />Private</>
                      )}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{club.member_count} members</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDistanceToNow(new Date(club.created_at), { addSuffix: true })}</span>
                  </div>
                </div>

                {club.description && (
                  <p className="text-gray-700 mb-4">{club.description}</p>
                )}

                <div className="flex gap-2 flex-wrap">
                  {isOwner && (
                    <Button size="sm" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Manage Club
                    </Button>
                  )}
                  {!isOwner && !isMember && (
                    <Button size="sm" className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Join Club
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Club Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            {canEditClub && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            <ClubDashboard club={club} />
          </TabsContent>

          <TabsContent value="members">
            <MembersList 
              club={club} 
              members={clubMembers}
              canManageMembers={canManageMembers}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          {canEditClub && (
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Club Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="font-medium mb-2">Coming Soon</h3>
                    <p className="text-sm">Club settings and configuration will be available soon.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}