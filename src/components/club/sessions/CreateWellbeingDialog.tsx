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
import { Heart, Lock, Unlock, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { LocationInput } from '@/components/ui/location-input';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CreateWellbeingDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onWellbeingCreated?: () => void;
  clubId?: string | null;
}

export const CreateWellbeingDialog: React.FC<CreateWellbeingDialogProps> = ({
  children,
  open,
  onOpenChange,
  onWellbeingCreated,
  clubId,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [wellbeingType, setWellbeingType] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [duration, setDuration] = useState('45');
  const [isPrivate, setIsPrivate] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const isFormValid = () => {
    return location.trim() && wellbeingType && maxParticipants > 0;
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
        session_type: 'wellbeing',
        format: wellbeingType,
        max_players: maxParticipants,
        stakes_amount: 0, // Wellbeing sessions are free
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

      toast.success('Wellbeing session created successfully!');
      
      // Reset form
      setWellbeingType('');
      setLocation('');
      setNotes('');
      setMaxParticipants(6);
      setDuration('45');
      setIsPrivate(false);
      
      handleOpenChange(false);
      onWellbeingCreated?.();
    } catch (error) {
      console.error('Failed to create wellbeing session:', error);
      toast.error('Failed to create wellbeing session');
    } finally {
      setIsCreating(false);
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-600" />
          Create Wellbeing Session{clubId ? ' (Club)' : ''}
        </DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Wellbeing Type */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Wellbeing Activity</Label>
          <Select value={wellbeingType} onValueChange={setWellbeingType}>
            <SelectTrigger>
              <SelectValue placeholder="Select activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yoga">Yoga & Stretching</SelectItem>
              <SelectItem value="meditation">Meditation & Mindfulness</SelectItem>
              <SelectItem value="recovery">Recovery & Cool Down</SelectItem>
              <SelectItem value="breathing">Breathing Exercises</SelectItem>
              <SelectItem value="massage">Sports Massage</SelectItem>
              <SelectItem value="nutrition">Nutrition Workshop</SelectItem>
              <SelectItem value="general">General Wellness</SelectItem>
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
            placeholder="Wellness center, studio, or outdoor space"
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
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
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
              Only invited participants can join this session
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
            Session Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="What to bring, preparation needed, or other details..."
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
            {isCreating ? 'Creating Session...' : 'Create Wellbeing Session'}
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