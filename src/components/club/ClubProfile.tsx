import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Globe, 
  Lock, 
  Calendar,
  MapPin,
  UserPlus,
  Trophy,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClubs } from '@/hooks/useClubs';
import { JoinClubDialog } from './JoinClubDialog';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ClubProfileProps {
  club: any;
  isPreview?: boolean;
}

export function ClubProfile({ club, isPreview = false }: ClubProfileProps) {
  const { user } = useAuth();
  const { myClubs, joinClub } = useClubs();
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const isMember = myClubs.some(c => c.id === club.id);
  const isOwner = user?.id === club.owner_id;

  const handleQuickJoin = async () => {
    if (!club.is_public) {
      setShowJoinDialog(true);
      return;
    }

    try {
      await joinClub(club.id);
      toast.success('Successfully joined club!');
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Club Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 relative z-10">
            <Avatar className="h-24 w-24 border-4 border-white bg-white shadow-lg">
              <AvatarImage src={club.logo_url || undefined} />
              <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {club.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                  {club.name}
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={club.is_public ? "default" : "secondary"}>
                    {club.is_public ? (
                      <><Globe className="h-3 w-3 mr-1" />Public</>
                    ) : (
                      <><Lock className="h-3 w-3 mr-1" />Private</>
                    )}
                  </Badge>
                  {isOwner && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      Owner
                    </Badge>
                  )}
                  {isMember && !isOwner && (
                    <Badge variant="outline">Member</Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-600 mb-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{club.member_count} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Created {formatDistanceToNow(new Date(club.created_at), { addSuffix: true })}</span>
                </div>
                {club.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{club.location}</span>
                  </div>
                )}
              </div>

              {!isMember && !isPreview && (
                <Button onClick={handleQuickJoin} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {club.is_public ? 'Join Club' : 'Request to Join'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Club Description */}
      {club.description && (
        <Card>
          <CardHeader>
            <CardTitle>About This Club</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{club.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Club Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{club.member_count}</p>
                <p className="text-sm text-gray-600">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Events</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Trophy className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-600">Tournaments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatDistanceToNow(new Date(club.created_at))}
                </p>
                <p className="text-sm text-gray-600">Club Age</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Public Information */}
      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="font-medium">Visibility</span>
              <Badge variant={club.is_public ? "default" : "secondary"}>
                {club.is_public ? 'Public' : 'Private'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="font-medium">Join Policy</span>
              <span className="text-gray-600">
                {club.is_public ? 'Anyone can join' : 'Invitation only'}
              </span>
            </div>
            
            {club.location && (
              <div className="flex items-center justify-between py-2 border-b">
                <span className="font-medium">Location</span>
                <span className="text-gray-600 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {club.location}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between py-2">
              <span className="font-medium">Created</span>
              <span className="text-gray-600">
                {new Date(club.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Join Dialog */}
      {showJoinDialog && (
        <JoinClubDialog
          club={club}
          open={showJoinDialog}
          onOpenChange={setShowJoinDialog}
          onJoined={() => {
            setShowJoinDialog(false);
            toast.success('Join request sent!');
          }}
        />
      )}
    </div>
  );
}