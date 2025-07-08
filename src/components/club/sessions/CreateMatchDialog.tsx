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
import { Switch } from '@/components/ui/switch';
import { Trophy, Lock, Unlock, Coins } from 'lucide-react';
import { toast } from 'sonner';
import { LocationInput } from '@/components/ui/location-input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CreateMatchDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onMatchCreated?: () => void;
  clubId?: string | null;
}

export const CreateMatchDialog: React.FC<CreateMatchDialogProps> = ({
  children,
  open,
  onOpenChange,
  onMatchCreated,
  clubId,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>('singles');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [stakesAmount, setStakesAmount] = useState(0);
  const [isPrivate, setIsPrivate] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const isFormValid = () => {
    return location.trim() && matchType;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid() || !user) {
      return;
    }

    setIsCreating(true);

    try {
      // Create session in unified sessions table
      const sessionData = {
        creator_id: user.id,
        session_type: 'match',
        format: matchType,
        max_players: matchType === 'singles' ? 2 : 4,
        stakes_amount: stakesAmount,
        location: location.trim(),
        notes: notes.trim() || null,
        is_private: isPrivate,
        club_id: clubId,
        session_source: clubId ? 'member' : null,
        latitude: null,
        longitude: null,
        location_coordinates_set: false
      };

      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Automatically join the session as creator
      if (session && user) {
        const { error: joinError } = await supabase
          .rpc('join_session', {
            session_id_param: session.id,
            user_id_param: user.id
          });

        if (joinError) {
          console.error('Failed to auto-join session:', joinError);
        }
      }

      toast.success('Match session created successfully!');
      
      // Reset form
      setMatchType('singles');
      setLocation('');
      setNotes('');
      setStakesAmount(0);
      setIsPrivate(false);
      
      handleOpenChange(false);
      onMatchCreated?.();
    } catch (error) {
      console.error('Failed to create match session:', error);
      toast.error('Failed to create match session');
    } finally {
      setIsCreating(false);
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-600" />
          Create Tennis Match{clubId ? ' (Club)' : ''}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Match Type */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Match Type</Label>
          <RadioGroup
            value={matchType}
            onValueChange={(value) => setMatchType(value as 'singles' | 'doubles')}
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

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-medium">
            Location
          </Label>
          <LocationInput
            value={location ? { address: location } : null}
            onChange={(locationData) => setLocation(locationData?.address || '')}
            placeholder="Tennis court or venue"
          />
        </div>

        {/* Stakes */}
        <div className="space-y-2">
          <Label htmlFor="stakes" className="text-base font-medium flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Stakes (Tokens per player)
          </Label>
          <Input
            id="stakes"
            type="number"
            min="0"
            value={stakesAmount}
            onChange={(e) => setStakesAmount(Number(e.target.value))}
            placeholder="0"
          />
          <p className="text-sm text-muted-foreground">
            Optional: Set token stakes for competitive matches
          </p>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium flex items-center gap-2">
              {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              Private Match
            </Label>
            <p className="text-sm text-muted-foreground">
              Only invited players can join this match
            </p>
          </div>
          <Switch
            checked={isPrivate}
            onCheckedChange={setIsPrivate}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-base font-medium">
            Match Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Add any additional details about the match..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid() || isCreating}
            className="flex-1"
          >
            {isCreating ? 'Creating Match...' : 'Create Match'}
          </Button>
        </div>
      </form>
    </DialogContent>
  );

  // If we're controlling the dialog externally and no children are provided,
  // render the dialog without a trigger
  if (open !== undefined && !children) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        {dialogContent}
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
      {dialogContent}
    </Dialog>
  );
};