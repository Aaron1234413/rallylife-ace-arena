import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserPlus, 
  Users, 
  Globe, 
  Lock,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface JoinClubDialogProps {
  club: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoined?: () => void;
}

export function JoinClubDialog({ club, open, onOpenChange, onJoined }: JoinClubDialogProps) {
  const { user } = useAuth();
  const { joinClub, myClubs } = useClubs();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isMember = myClubs.some(c => c.id === club.id);

  const handleJoin = async () => {
    if (isMember) {
      toast.error('You are already a member of this club');
      return;
    }

    setLoading(true);
    try {
      if (club.is_public) {
        // Public club - join immediately
        await joinClub(club.id);
        toast.success('Successfully joined club!');
        onJoined?.();
      } else {
        // Private club - send join request (would need to implement this)
        // For now, we'll show a message that the feature is coming soon
        toast.info('Join requests for private clubs coming soon!');
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  if (isMember) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Already a Member</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <Badge className="mb-4">Member</Badge>
            <p className="text-gray-600">
              You are already a member of {club.name}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Join Club
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Club Info */}
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={club.logo_url || undefined} />
              <AvatarFallback>
                {club.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold truncate">{club.name}</h3>
                <Badge variant={club.is_public ? "default" : "secondary"} className="text-xs">
                  {club.is_public ? (
                    <><Globe className="h-3 w-3 mr-1" />Public</>
                  ) : (
                    <><Lock className="h-3 w-3 mr-1" />Private</>
                  )}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="h-3 w-3" />
                <span>{club.member_count} members</span>
              </div>
            </div>
          </div>

          {/* Join Type Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              {club.is_public ? (
                <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
              ) : (
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
              )}
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  {club.is_public ? 'Instant Join' : 'Join Request'}
                </h4>
                <p className="text-sm text-blue-700">
                  {club.is_public 
                    ? 'You will be added to the club immediately'
                    : 'Your request will be sent to club admins for approval'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Message for Private Clubs */}
          {!club.is_public && (
            <div className="space-y-2">
              <Label htmlFor="message">Introduction Message (Optional)</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell the club admins why you'd like to join..."
                rows={3}
                maxLength={300}
              />
              <p className="text-xs text-gray-500">
                {message.length}/300 characters
              </p>
            </div>
          )}

          {/* Warning for Private Clubs */}
          {!club.is_public && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium">Private Club</p>
                <p className="text-amber-700">
                  This club requires approval from administrators. You'll be notified when your request is reviewed.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleJoin}
              disabled={loading}
              className="flex-1 flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {loading 
                ? 'Processing...' 
                : club.is_public 
                  ? 'Join Club' 
                  : 'Send Request'
              }
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}