
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSocialPlayEvents } from '@/hooks/useSocialPlayEvents';
import { SocialPlayParticipantSelector } from './SocialPlayParticipantSelector';
import { SocialPlayStakesPreview } from './SocialPlayStakesPreview';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { toast } from 'sonner';
import { LocationInput } from '@/components/ui/location-input';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { supabase } from '@/integrations/supabase/client';

export interface SelectedPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  skillLevel?: string;
  currentLevel?: number;
}

interface CreateSocialPlayDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEventCreated?: () => void;
  clubId?: string | null;
}

export const CreateSocialPlayDialog: React.FC<CreateSocialPlayDialogProps> = ({
  children,
  open,
  onOpenChange,
  onEventCreated,
  clubId,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { createEvent, isCreatingEvent } = useSocialPlayEvents();
  const { createSocialPlayInvitation } = useUnifiedInvitations();
  const { user } = useAuth();
  const { hpData } = usePlayerHP();

  // Form state
  const [title, setTitle] = useState('');
  const [sessionType, setSessionType] = useState<'singles' | 'doubles'>('singles');
  const [location, setLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [description, setDescription] = useState('');
  const [stakesAmount, setStakesAmount] = useState(0);

  // Player selection state
  const [selectedOpponent, setSelectedOpponent] = useState<SelectedPlayer | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<SelectedPlayer | null>(null);
  const [selectedOpponents, setSelectedOpponents] = useState<SelectedPlayer[]>([]);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const isFormValid = () => {
    const basicFieldsValid = title.trim() && location.trim() && scheduledDate && scheduledTime;
    
    // Check HP requirements for joining own session
    const hpCost = calculateHPCost(stakesAmount);
    const hasEnoughHP = !hpData || hpData.current_hp >= hpCost;
    
    return basicFieldsValid && hasEnoughHP;
  };

  const calculateHPCost = (stakes: number) => {
    if (stakes >= 100) return 25;
    if (stakes >= 50) return 15;
    if (stakes >= 20) return 10;
    if (stakes > 0) return 5;
    return 3; // Free sessions
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      return;
    }

    // Combine date and time
    const [hours, minutes] = scheduledTime.split(':').map(Number);
    const scheduledDateTime = new Date(scheduledDate!);
    scheduledDateTime.setHours(hours, minutes);

    try {
      // Create session in unified sessions table
      const sessionData = {
        creator_id: user?.id,
        session_type: 'social_play',
        format: sessionType,
        max_players: sessionType === 'singles' ? 2 : 4,
        stakes_amount: stakesAmount,
        location: location.trim(),
        notes: description.trim() || null,
        is_private: false,
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

      // Auto-join session with HP check
      if (session && user) {
        const { data: joinResult, error: joinError } = await supabase
          .rpc('join_session_with_hp_check', {
            session_id_param: session.id,
            user_id_param: user.id
          });

        const result = joinResult as { success: boolean; error?: string; hp_cost?: number };
        
        if (joinError || !result?.success) {
          console.error('Failed to auto-join session:', joinError || result?.error);
          toast.error(result?.error || 'Failed to join your own session');
          return;
        }
      }

      toast.success('Social play session created successfully!');

      // Reset form
      setTitle('');
      setLocation('');
      setScheduledDate(undefined);
      setScheduledTime('');
      setDescription('');
      setStakesAmount(0);
      setSelectedOpponent(null);
      setSelectedPartner(null);
      setSelectedOpponents([]);
      
      handleOpenChange(false);
      onEventCreated?.(); // This will trigger refresh in SessionManagement
    } catch (error) {
      console.error('Failed to create event or send invitations:', error);
      toast.error('Failed to create event or send invitations');
    }
  };

  const dialogContent = (
    <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Create Social Tennis Event{clubId ? ' (Club)' : ''}
        </DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - Takes 2 columns */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-base font-medium">
                Event Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Sunday Morning Tennis"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Session Type */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Session Type</Label>
              <RadioGroup
                value={sessionType}
                onValueChange={(value) => {
                  setSessionType(value as 'singles' | 'doubles');
                  // Reset selections when changing type
                  setSelectedOpponent(null);
                  setSelectedPartner(null);
                  setSelectedOpponents([]);
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

            {/* Player Selection - Simplified for now */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Session Details</Label>
              <p className="text-sm text-muted-foreground">
                Once created, you can invite players to join your {sessionType} session.
              </p>
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

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-base font-medium">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !scheduledDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const compareDate = new Date(date);
                        compareDate.setHours(0, 0, 0, 0);
                        return compareDate < today;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time" className="text-base font-medium">
                  Time
                </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-base font-medium">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                placeholder="Add any additional details about the event..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Stakes Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Stakes (Optional)</Label>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Enter token amount"
                  value={stakesAmount || ''}
                  onChange={(e) => setStakesAmount(Number(e.target.value) || 0)}
                  min="0"
                  max="500"
                />
                <div className="flex gap-2">
                  {[0, 10, 25, 50, 100].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={stakesAmount === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStakesAmount(amount)}
                    >
                      {amount === 0 ? 'Free' : `${amount} tokens`}
                    </Button>
                  ))}
                </div>
                
                {/* HP Cost Preview */}
                {hpData && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <div className="text-sm">
                      <span className="text-muted-foreground">HP Cost: </span>
                      <span className={`font-medium ${hpData.current_hp >= calculateHPCost(stakesAmount) ? 'text-green-600' : 'text-red-600'}`}>
                        {calculateHPCost(stakesAmount)} HP
                      </span>
                      <span className="text-muted-foreground ml-2">
                        (You have {hpData.current_hp} HP)
                      </span>
                    </div>
                    {hpData.current_hp < calculateHPCost(stakesAmount) && (
                      <span className="text-red-600 text-xs">Insufficient HP!</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={!isFormValid() || isCreatingEvent}
                className="flex-1"
              >
                {isCreatingEvent ? 'Creating Event...' : 'Create Event & Join Session'}
              </Button>
              {!isFormValid() && hpData && hpData.current_hp < calculateHPCost(stakesAmount) && (
                <p className="text-sm text-red-600 mt-2">
                  You need {calculateHPCost(stakesAmount)} HP to create and join this session.
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Stakes Preview Sidebar - Takes 1 column */}
        <div className="space-y-4">
          <SocialPlayStakesPreview
            sessionType={sessionType}
            selectedOpponent={selectedOpponent}
            selectedPartner={selectedPartner}
            selectedOpponents={selectedOpponents}
          />
        </div>
      </div>
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
