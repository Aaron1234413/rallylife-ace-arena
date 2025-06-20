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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Users, MapPin } from 'lucide-react';
import { FriendSelector } from './FriendSelector';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';

interface Player {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface CreateSocialPlayDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CreateSocialPlayDialog: React.FC<CreateSocialPlayDialogProps> = ({
  children,
  open,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [sessionType, setSessionType] = useState<'singles' | 'doubles'>('singles');
  const [competitiveLevel, setCompetitiveLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [location, setLocation] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Player[]>([]);
  
  const { createSession, isCreatingSession } = useSocialPlaySessions();

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const handleFriendSelect = (player: Player) => {
    setSelectedFriends(prev => [...prev, player]);
  };

  const handleFriendRemove = (playerId: string) => {
    setSelectedFriends(prev => prev.filter(p => p.id !== playerId));
  };

  const handleCreateSession = async () => {
    if (selectedFriends.length === 0) {
      return;
    }

    createSession({
      session_type: sessionType,
      competitive_level: competitiveLevel,
      location: location.trim() || undefined,
      participants: selectedFriends.map(p => p.id),
    });

    // Reset form and close dialog
    setSessionType('singles');
    setCompetitiveLevel('medium');
    setLocation('');
    setSelectedFriends([]);
    handleOpenChange(false);
  };

  const maxParticipants = sessionType === 'singles' ? 1 : 3;

  // If we're controlling the dialog externally and no children are provided,
  // render the dialog without a trigger
  if (open !== undefined && !children) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create Social Play Session
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Session Type */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Session Type</Label>
              <RadioGroup
                value={sessionType}
                onValueChange={(value) => {
                  setSessionType(value as 'singles' | 'doubles');
                  // Reset selected friends if switching to more restrictive type
                  if (value === 'singles' && selectedFriends.length > 1) {
                    setSelectedFriends(prev => prev.slice(0, 1));
                  }
                }}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="singles" id="singles" />
                  <Label htmlFor="singles">Singles (1v1)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doubles" id="doubles" />
                  <Label htmlFor="doubles">Doubles (2v2)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Competitive Level */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Intensity Level</Label>
              <RadioGroup
                value={competitiveLevel}
                onValueChange={(value) => setCompetitiveLevel(value as 'low' | 'medium' | 'high')}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Casual</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Competitive</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">Intense</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-base font-medium">
                Location (Optional)
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="location"
                  placeholder="Where will you play?"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Friend Selection */}
            <FriendSelector
              selectedFriends={selectedFriends}
              onFriendSelect={handleFriendSelect}
              onFriendRemove={handleFriendRemove}
              maxSelection={maxParticipants}
            />

            {/* Create Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateSession}
                disabled={selectedFriends.length === 0 || isCreatingSession}
                className="flex-1"
              >
                {isCreatingSession ? 'Creating...' : `Create Session & Invite ${selectedFriends.length} Player${selectedFriends.length !== 1 ? 's' : ''}`}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isCreatingSession}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Standard implementation with trigger
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Social Play Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Session Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Session Type</Label>
            <RadioGroup
              value={sessionType}
              onValueChange={(value) => {
                setSessionType(value as 'singles' | 'doubles');
                // Reset selected friends if switching to more restrictive type
                if (value === 'singles' && selectedFriends.length > 1) {
                  setSelectedFriends(prev => prev.slice(0, 1));
                }
              }}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="singles" id="singles" />
                <Label htmlFor="singles">Singles (1v1)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="doubles" id="doubles" />
                <Label htmlFor="doubles">Doubles (2v2)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Competitive Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Intensity Level</Label>
            <RadioGroup
              value={competitiveLevel}
              onValueChange={(value) => setCompetitiveLevel(value as 'low' | 'medium' | 'high')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Casual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Competitive</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">Intense</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium">
              Location (Optional)
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="location"
                placeholder="Where will you play?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Friend Selection */}
          <FriendSelector
            selectedFriends={selectedFriends}
            onFriendSelect={handleFriendSelect}
            onFriendRemove={handleFriendRemove}
            maxSelection={maxParticipants}
          />

          {/* Create Button */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateSession}
              disabled={selectedFriends.length === 0 || isCreatingSession}
              className="flex-1"
            >
              {isCreatingSession ? 'Creating...' : `Create Session & Invite ${selectedFriends.length} Player${selectedFriends.length !== 1 ? 's' : ''}`}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreatingSession}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
