
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Users, Zap, MapPin, MessageSquare, UserPlus } from 'lucide-react';
import { FriendSelector } from './FriendSelector';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CreateSessionDialogProps {
  children: React.ReactNode;
}

export function CreateSessionDialog({ children }: CreateSessionDialogProps) {
  const { user } = useAuth();
  const { createSession, inviteParticipants, loading } = useSocialPlaySession();
  const [open, setOpen] = useState(false);
  
  const [sessionType, setSessionType] = useState<'singles' | 'doubles'>('singles');
  const [competitiveLevel, setCompetitiveLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const handleCreateSession = async () => {
    if (!user) return;

    setCreating(true);
    try {
      const sessionId = await createSession({
        session_type: sessionType,
        competitive_level: competitiveLevel,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (sessionId && selectedFriends.length > 0) {
        await inviteParticipants(selectedFriends);
        toast.success(`Session created and ${selectedFriends.length} player(s) invited!`);
      } else if (sessionId) {
        toast.success('Session created successfully!');
      }

      // Reset form
      setSessionType('singles');
      setCompetitiveLevel('medium');
      setLocation('');
      setNotes('');
      setSelectedFriends([]);
      setOpen(false);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const maxPlayers = sessionType === 'singles' ? 1 : 3; // Exclude current user

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Tennis Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Session Type */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Session Type
            </Label>
            <RadioGroup 
              value={sessionType} 
              onValueChange={(value) => {
                setSessionType(value as 'singles' | 'doubles');
                // Reset selected friends if switching to singles
                if (value === 'singles' && selectedFriends.length > 1) {
                  setSelectedFriends(selectedFriends.slice(0, 1));
                }
              }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="singles" id="singles" />
                <Label htmlFor="singles" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Singles</p>
                    <p className="text-sm text-muted-foreground">1 vs 1 match</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="doubles" id="doubles" />
                <Label htmlFor="doubles" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">Doubles</p>
                    <p className="text-sm text-muted-foreground">2 vs 2 match</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Competitive Level */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Competitive Level
            </Label>
            <RadioGroup 
              value={competitiveLevel} 
              onValueChange={(value) => setCompetitiveLevel(value as 'low' | 'medium' | 'high')}
              className="grid grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">🟢 Casual</p>
                    <p className="text-xs text-muted-foreground">Fun & relaxed</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">🟡 Moderate</p>
                    <p className="text-xs text-muted-foreground">Balanced play</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="flex-1 cursor-pointer">
                  <div>
                    <p className="font-medium">🔴 Intense</p>
                    <p className="text-xs text-muted-foreground">Competitive</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location (Optional)
            </Label>
            <Input
              id="location"
              placeholder="Tennis court, club, or area..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Session Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any additional details about the session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Separator />

          {/* Friend Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserPlus className="h-5 w-5" />
                Invite Players
                <span className="text-sm font-normal text-muted-foreground">
                  ({selectedFriends.length}/{maxPlayers} selected)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FriendSelector
                selectedFriends={selectedFriends}
                onFriendsChange={setSelectedFriends}
                maxSelections={maxPlayers}
                excludeUserIds={user ? [user.id] : []}
              />
            </CardContent>
          </Card>

          {/* Create Button */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSession}
              disabled={creating || loading}
              className="flex-1"
            >
              {creating ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
