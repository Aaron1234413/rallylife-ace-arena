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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { GraduationCap, Lock, Unlock, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { LocationInput } from '@/components/ui/location-input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CreateTrainingDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTrainingCreated?: () => void;
  clubId?: string | null;
}

export const CreateTrainingDialog: React.FC<CreateTrainingDialogProps> = ({
  children,
  open,
  onOpenChange,
  onTrainingCreated,
  clubId,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [trainingType, setTrainingType] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [duration, setDuration] = useState('60');
  const [isPrivate, setIsPrivate] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const isFormValid = () => {
    return location.trim() && trainingType && maxParticipants > 0;
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
        session_type: 'training',
        format: trainingType,
        max_players: maxParticipants,
        stakes_amount: 0, // Training is typically free
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

      toast.success('Training session created successfully!');
      
      // Reset form
      setTrainingType('');
      setLocation('');
      setNotes('');
      setMaxParticipants(4);
      setDuration('60');
      setIsPrivate(false);
      
      handleOpenChange(false);
      onTrainingCreated?.();
    } catch (error) {
      console.error('Failed to create training session:', error);
      toast.error('Failed to create training session');
    } finally {
      setIsCreating(false);
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-green-600" />
          Create Training Session{clubId ? ' (Club)' : ''}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Training Type */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Training Focus</Label>
          <Select value={trainingType} onValueChange={setTrainingType}>
            <SelectTrigger>
              <SelectValue placeholder="Select training type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technique">Technique Practice</SelectItem>
              <SelectItem value="fitness">Fitness & Conditioning</SelectItem>
              <SelectItem value="drills">Tennis Drills</SelectItem>
              <SelectItem value="strategy">Strategy & Tactics</SelectItem>
              <SelectItem value="serves">Serve Practice</SelectItem>
              <SelectItem value="volleys">Volley Practice</SelectItem>
              <SelectItem value="general">General Practice</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-base font-medium">
            Location
          </Label>
          <LocationInput
            value={location ? { address: location } : null}
            onChange={(locationData) => setLocation(locationData?.address || '')}
            placeholder="Tennis court or training facility"
          />
        </div>

        {/* Participants & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="participants" className="text-base font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Max Participants
            </Label>
            <Input
              id="participants"
              type="number"
              min="1"
              max="20"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Duration
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base font-medium flex items-center gap-2">
              {isPrivate ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              Private Session
            </Label>
            <p className="text-sm text-muted-foreground">
              Only invited players can join this training
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
            Training Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Describe the training goals, equipment needed, or other details..."
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
            {isCreating ? 'Creating Session...' : 'Create Training Session'}
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