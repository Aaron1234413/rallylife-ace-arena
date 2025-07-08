import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MessageSquare, 
  Clock, 
  UserPlus,
  UserMinus,
  Zap
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
    isLookingToPlay
  } = useMemberPresence(clubId);

  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [sessionType, setSessionType] = useState('casual');
  const [availableHours, setAvailableHours] = useState('2');

  const lookingToPlayMembers = getMembersByStatus('looking_to_play');
  const onlineMembers = getMembersByStatus('online');
  const userIsLookingToPlay = isLookingToPlay();

  const handleSetAvailability = async () => {
    const availableUntil = new Date();
    availableUntil.setHours(availableUntil.getHours() + parseInt(availableHours));
    
    const success = await setPlayAvailability(
      availabilityMessage || undefined,
      sessionType,
      availableUntil
    );
    
    if (success) {
      setShowAvailabilityDialog(false);
      setAvailabilityMessage('');
    }
  };

  const handleStopLooking = async () => {
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
            <Users className="h-5 w-5 text-tennis-green-primary" />
            Who's Looking to Play
          </CardTitle>
          <Badge variant="secondary" className="bg-tennis-green-bg/50">
            {lookingToPlayMembers.length} active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current User Status */}
        <div className="flex items-center justify-between p-3 bg-tennis-green-bg/30 rounded-lg">
          {userIsLookingToPlay ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-tennis-green-dark">
                  You're looking to play!
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleStopLooking}
                disabled={updating}
                className="flex items-center gap-2"
              >
                {updating ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <UserMinus className="h-4 w-4" />
                )}
                Stop Looking
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-tennis-green-medium">
                Ready to play? Let others know!
              </span>
              <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm"
                    className="flex items-center gap-2"
                    disabled={updating}
                  >
                    <Zap className="h-4 w-4" />
                    I'm Looking to Play
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Set Play Availability</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Session Type
                      </label>
                      <Select value={sessionType} onValueChange={setSessionType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casual">Casual Play</SelectItem>
                          <SelectItem value="practice">Practice Session</SelectItem>
                          <SelectItem value="lesson">Looking for Lesson</SelectItem>
                          <SelectItem value="tournament">Tournament Play</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Available for (hours)
                      </label>
                      <Select value={availableHours} onValueChange={setAvailableHours}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hour</SelectItem>
                          <SelectItem value="2">2 hours</SelectItem>
                          <SelectItem value="3">3 hours</SelectItem>
                          <SelectItem value="4">4 hours</SelectItem>
                          <SelectItem value="6">6 hours</SelectItem>
                          <SelectItem value="24">All day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Message (optional)
                      </label>
                      <Textarea
                        value={availabilityMessage}
                        onChange={(e) => setAvailabilityMessage(e.target.value)}
                        placeholder="Any specific preferences or notes..."
                        className="resize-none"
                        rows={3}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleSetAvailability}
                      disabled={updating}
                      className="w-full"
                    >
                      {updating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Set Availability'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Members Looking to Play */}
        {lookingToPlayMembers.length > 0 ? (
          <div className="space-y-3">
            {lookingToPlayMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-tennis-green-bg/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user?.avatar_url} />
                      <AvatarFallback className="bg-tennis-green-primary text-white">
                        {member.user?.full_name?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-tennis-green-dark">
                      {member.user?.full_name || 'Unknown'}
                    </p>
                    {member.availability_message && (
                      <p className="text-sm text-tennis-green-medium">
                        {member.availability_message}
                      </p>
                    )}
                    <p className="text-xs text-tennis-green-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(member.last_seen), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Message
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-12 w-12 mx-auto mb-3 text-tennis-green-medium/50" />
            <p className="text-sm text-tennis-green-medium">
              No one is currently looking to play
            </p>
            <p className="text-xs text-tennis-green-medium/70 mt-1">
              Be the first to set your availability!
            </p>
          </div>
        )}

        {/* Quick Stats */}
        {(onlineMembers.length > 0 || lookingToPlayMembers.length > 0) && (
          <div className="flex items-center justify-between pt-3 border-t border-tennis-green-bg/30">
            <div className="flex items-center gap-4 text-sm text-tennis-green-medium">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                {onlineMembers.length} online
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-tennis-green-primary rounded-full" />
                {lookingToPlayMembers.length} looking to play
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}