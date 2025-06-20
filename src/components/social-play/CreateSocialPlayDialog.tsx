
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Users, MapPin, Calendar, Clock, Trophy, Star, Smile } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { FriendSelector } from './FriendSelector';
import { useSocialPlaySessions } from '@/hooks/useSocialPlaySessions';

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
}

interface CreateSocialPlayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSocialPlayDialog({ open, onOpenChange }: CreateSocialPlayDialogProps) {
  const { createSession, isCreatingSession } = useSocialPlaySessions();
  
  const [sessionType, setSessionType] = useState<'singles' | 'doubles'>('singles');
  const [competitiveLevel, setCompetitiveLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [location, setLocation] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);

  const handleFriendSelect = (friend: User) => {
    if (selectedFriends.length < 3) {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const handleFriendRemove = (friendId: string) => {
    setSelectedFriends(selectedFriends.filter(f => f.id !== friendId));
  };

  const handleCreateSession = () => {
    createSession({
      session_type: sessionType,
      competitive_level: competitiveLevel,
      location: location.trim() || undefined,
      participants: selectedFriends.map(f => f.id)
    });
    
    // Reset form
    setSessionType('singles');
    setCompetitiveLevel('medium');
    setLocation('');
    setSelectedFriends([]);
    onOpenChange(false);
  };

  const getCompetitiveLevelConfig = (level: string) => {
    switch (level) {
      case 'low':
        return { label: 'Chill', icon: Smile, color: 'text-green-600', description: 'Relaxed, fun play' };
      case 'medium':
        return { label: 'Fun', icon: Star, color: 'text-blue-600', description: 'Balanced competitive play' };
      case 'high':
        return { label: 'Competitive', icon: Trophy, color: 'text-red-600', description: 'Serious, competitive match' };
      default:
        return { label: 'Fun', icon: Star, color: 'text-blue-600', description: 'Balanced competitive play' };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="h-6 w-6 text-purple-600" />
            Create Social Play Session
          </DialogTitle>
          <p className="text-muted-foreground">
            Set up a tennis session and invite friends to join you!
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Session Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Session Type</Label>
            <RadioGroup
              value={sessionType}
              onValueChange={(value: 'singles' | 'doubles') => setSessionType(value)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="singles" id="singles" />
                <Label htmlFor="singles" className="flex-1 cursor-pointer">
                  <div className="font-medium">Singles</div>
                  <div className="text-sm text-muted-foreground">1v1 tennis match</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="doubles" id="doubles" />
                <Label htmlFor="doubles" className="flex-1 cursor-pointer">
                  <div className="font-medium">Doubles</div>
                  <div className="text-sm text-muted-foreground">2v2 tennis match</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Competitive Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Competitive Level</Label>
            <RadioGroup
              value={competitiveLevel}
              onValueChange={(value: 'low' | 'medium' | 'high') => setCompetitiveLevel(value)}
              className="grid grid-cols-1 gap-3"
            >
              {['low', 'medium', 'high'].map((level) => {
                const config = getCompetitiveLevelConfig(level);
                const IconComponent = config.icon;
                return (
                  <div key={level} className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value={level} id={level} />
                    <Label htmlFor={level} className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 ${config.color}`} />
                        <span className="font-medium">{config.label}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">{config.description}</div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-base font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location (Optional)
            </Label>
            <Input
              id="location"
              placeholder="e.g., Central Park Tennis Courts"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />
          </div>

          <Separator />

          {/* Friend Selector */}
          <FriendSelector
            selectedFriends={selectedFriends}
            onFriendSelect={handleFriendSelect}
            onFriendRemove={handleFriendRemove}
            maxSelection={3}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isCreatingSession}
            >
              Cancel
            </Button>
            <AnimatedButton
              onClick={handleCreateSession}
              disabled={isCreatingSession}
              loading={isCreatingSession}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Create Session
            </AnimatedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
