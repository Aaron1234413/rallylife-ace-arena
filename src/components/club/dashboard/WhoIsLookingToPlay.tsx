import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  PlayCircle, 
  Clock, 
  MessageCircle,
  Plus,
  X
} from 'lucide-react';
import { useMemberPresence } from '@/hooks/useMemberPresence';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatDistanceToNow } from 'date-fns';

interface WhoIsLookingToPlayProps {
  clubId: string;
}

export function WhoIsLookingToPlay({ clubId }: WhoIsLookingToPlayProps) {
  const { 
    memberStatuses, 
    loading, 
    updating,
    setPlayAvailability,
    stopLookingToPlay,
    getMembersByStatus,
    getCurrentUserStatus,
    isLookingToPlay
  } = useMemberPresence(clubId);

  const [showSetAvailability, setShowSetAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  const lookingToPlayMembers = getMembersByStatus('looking_to_play');
  const currentUserStatus = getCurrentUserStatus();
  const userIsLookingToPlay = isLookingToPlay();

  const handleSetAvailability = async () => {
    const success = await setPlayAvailability(availabilityMessage || undefined);
    if (success) {
      setShowSetAvailability(false);
      setAvailabilityMessage('');
    }
  };

  const handleStopLookingToPlay = async () => {
    await stopLookingToPlay();
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
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <PlayCircle className="h-5 w-5 text-tennis-green-primary" />
            Who's Looking to Play
          </CardTitle>
          <Badge variant="outline" className="text-tennis-green-medium">
            {lookingToPlayMembers.length} available
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User's Status Controls */}
        <div className="p-3 bg-tennis-green-bg/20 rounded-lg border">
          {userIsLookingToPlay ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-700">
                  You're looking to play
                </span>
                {currentUserStatus?.availability_message && (
                  <span className="text-xs text-tennis-green-medium">
                    "{currentUserStatus.availability_message}"
                  </span>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopLookingToPlay}
                disabled={updating}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Stop Looking to Play
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {!showSetAvailability ? (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowSetAvailability(true)}
                  disabled={updating}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  I'm Looking to Play
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="Optional message (e.g., 'Anyone for doubles?')"
                    value={availabilityMessage}
                    onChange={(e) => setAvailabilityMessage(e.target.value)}
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSetAvailability}
                      disabled={updating}
                      className="flex-1"
                    >
                      Set Available
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowSetAvailability(false);
                        setAvailabilityMessage('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Looking to Play Members */}
        {lookingToPlayMembers.length > 0 ? (
          <div className="space-y-3">
            {lookingToPlayMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-tennis-green-bg/10 transition-colors"
              >
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.user?.avatar_url} />
                    <AvatarFallback className="bg-tennis-green-primary text-white">
                      {member.user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-tennis-green-dark">
                    {member.user?.full_name || 'Unknown'}
                  </p>
                  {member.availability_message && (
                    <p className="text-sm text-tennis-green-medium mb-1">
                      "{member.availability_message}"
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-tennis-green-medium">
                    <Clock className="h-3 w-3" />
                    <span>
                      Available since {formatDistanceToNow(new Date(member.last_seen), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex-shrink-0"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
            <p className="text-sm text-tennis-green-medium">
              No members are currently looking to play
            </p>
            <p className="text-xs text-tennis-green-medium/70">
              Be the first to set your availability!
            </p>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center justify-center pt-2 border-t border-tennis-green-bg/30">
          <div className="flex items-center gap-2 text-xs text-tennis-green-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Live updates</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}