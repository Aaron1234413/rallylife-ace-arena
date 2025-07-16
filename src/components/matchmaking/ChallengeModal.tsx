import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Target } from 'lucide-react';
import { useMatchmaking } from '@/hooks/useMatchmaking';

interface ChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opponent: {
    id: string;
    full_name: string;
    avatar_url?: string;
    skill_level: string;
    location?: string;
    utr_rating?: number;
    stake_preference?: string;
  };
}

export function ChallengeModal({ open, onOpenChange, opponent }: ChallengeModalProps) {
  const { createMatch, isCreating } = useMatchmaking();
  const [formData, setFormData] = useState({
    scheduled_time: '',
    court_location: '',
    stake_amount: 0,
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createMatch.mutateAsync({
        opponent_id: opponent.id,
        scheduled_time: formData.scheduled_time || undefined,
        court_location: formData.court_location || undefined,
        stake_amount: formData.stake_amount || 0
      });
      
      onOpenChange(false);
      setFormData({
        scheduled_time: '',
        court_location: '',
        stake_amount: 0,
        message: ''
      });
    } catch (error) {
      // Error handled by the hook
    }
  };

  const getSkillLevelDisplay = (skillLevel: string) => {
    return skillLevel.replace('level_', 'Level ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Challenge Player</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Player Info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={opponent.avatar_url} />
              <AvatarFallback>
                {opponent.full_name?.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">{opponent.full_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {getSkillLevelDisplay(opponent.skill_level)}
                </Badge>
                {opponent.utr_rating && (
                  <span className="text-xs text-muted-foreground">
                    UTR: {opponent.utr_rating}
                  </span>
                )}
              </div>
              {opponent.location && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {opponent.location}
                </div>
              )}
            </div>
          </div>

          {/* Challenge Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Preferred Date & Time
                </Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stakes" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  Stakes (tokens)
                </Label>
                <Input
                  id="stakes"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stake_amount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, stake_amount: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Court Location
              </Label>
              <Input
                id="location"
                placeholder="Tennis court or club name"
                value={formData.court_location}
                onChange={(e) => setFormData(prev => ({ ...prev, court_location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreating}
              >
                {isCreating ? 'Sending...' : 'Send Challenge'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}