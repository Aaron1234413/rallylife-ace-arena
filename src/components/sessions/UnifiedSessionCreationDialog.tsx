import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  GraduationCap, 
  Heart, 
  CalendarDays,
  Clock,
  MapPin,
  Coins,
  Lock,
  Globe,
  Loader2
} from 'lucide-react';
import { useSessionManager } from '@/hooks/useSessionManager';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UnifiedSessionCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId?: string;
  defaultSessionType?: 'social_play' | 'training' | 'match' | 'wellbeing' | 'club_booking' | 'club_event';
  onSuccess?: () => void;
}

interface SessionFormData {
  session_type: 'social_play' | 'training' | 'match' | 'wellbeing' | 'club_booking' | 'club_event';
  title?: string;
  description?: string;
  format?: string;
  max_players: number;
  stakes_amount: number;
  location: string;
  notes?: string;
  is_private: boolean;
  start_datetime?: string;
  end_datetime?: string;
  cost_tokens?: number;
  cost_money?: number;
  payment_method?: 'tokens' | 'money';
}

const SESSION_TYPES = [
  {
    id: 'social_play',
    name: 'Social Play',
    icon: Users,
    description: 'Casual tennis with friends',
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  {
    id: 'training',
    name: 'Training',
    icon: GraduationCap,
    description: 'Skill development session',
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    id: 'match',
    name: 'Competitive Match',
    icon: Trophy,
    description: 'Competitive tennis match',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    id: 'wellbeing',
    name: 'Wellbeing',
    icon: Heart,
    description: 'Health and wellness focused',
    color: 'bg-pink-100 text-pink-800 border-pink-200'
  },
  {
    id: 'club_booking',
    name: 'Club Booking',
    icon: CalendarDays,
    description: 'Reserve club facilities',
    color: 'bg-orange-100 text-orange-800 border-orange-200'
  },
  {
    id: 'club_event',
    name: 'Club Event',
    icon: Clock,
    description: 'Organized club event',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200'
  }
] as const;

export function UnifiedSessionCreationDialog({
  open,
  onOpenChange,
  clubId,
  defaultSessionType = 'social_play',
  onSuccess
}: UnifiedSessionCreationDialogProps) {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<SessionFormData>({
    session_type: defaultSessionType,
    max_players: 4,
    stakes_amount: 0,
    location: '',
    is_private: false,
    payment_method: 'tokens'
  });

  const selectedSessionType = SESSION_TYPES.find(type => type.id === formData.session_type);

  const handleInputChange = (field: keyof SessionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (!formData.location.trim()) return 'Location is required';
    if (formData.max_players < 2) return 'At least 2 players required';
    if (formData.max_players > 20) return 'Maximum 20 players allowed';
    
    // Club-specific validations
    if (clubId && (formData.session_type === 'club_booking' || formData.session_type === 'club_event')) {
      if (!formData.title?.trim()) return 'Title is required for club sessions';
      if (!formData.start_datetime) return 'Start time is required';
      if (!formData.end_datetime) return 'End time is required';
    }
    
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a session');
      return;
    }

    setCreating(true);

    try {
      const sessionData = {
        ...formData,
        creator_id: user.id,
        club_id: clubId || null,
        session_source: clubId ? 'club' : 'public'
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Session created successfully! 🎾', {
        description: 'Your session is now live and ready for players to join.',
      });

      onSuccess?.();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        session_type: defaultSessionType,
        max_players: 4,
        stakes_amount: 0,
        location: '',
        is_private: false,
        payment_method: 'tokens'
      });

    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedSessionType && <selectedSessionType.icon className="h-5 w-5" />}
            Create New Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Type Selection */}
          <div className="space-y-3">
            <Label>Session Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {SESSION_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      formData.session_type === type.id
                        ? 'ring-2 ring-tennis-green-primary bg-tennis-green-light/10'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleInputChange('session_type', type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-tennis-green-primary" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{type.name}</h4>
                          <p className="text-xs text-gray-500">{type.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              {/* Club sessions need title */}
              {clubId && (formData.session_type === 'club_booking' || formData.session_type === 'club_event') && (
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter session title"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Enter location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_players">Max Players</Label>
                  <Select
                    value={formData.max_players.toString()}
                    onValueChange={(value) => handleInputChange('max_players', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 5, 6, 8, 10, 12, 16, 20].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} players
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.session_type === 'match' && (
                <div className="space-y-2">
                  <Label htmlFor="format">Match Format</Label>
                  <Select
                    value={formData.format || ''}
                    onValueChange={(value) => handleInputChange('format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singles">Singles</SelectItem>
                      <SelectItem value="doubles">Doubles</SelectItem>
                      <SelectItem value="mixed_doubles">Mixed Doubles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              {/* Scheduling for club sessions */}
              {clubId && (formData.session_type === 'club_booking' || formData.session_type === 'club_event') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_datetime">Start Time *</Label>
                    <Input
                      id="start_datetime"
                      type="datetime-local"
                      value={formData.start_datetime || ''}
                      onChange={(e) => handleInputChange('start_datetime', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_datetime">End Time *</Label>
                    <Input
                      id="end_datetime"
                      type="datetime-local"
                      value={formData.end_datetime || ''}
                      onChange={(e) => handleInputChange('end_datetime', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Add session details..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special instructions or requirements..."
                  rows={2}
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Private Session</Label>
                    <p className="text-sm text-gray-500">Only invited players can join</p>
                  </div>
                  <Switch
                    checked={formData.is_private}
                    onCheckedChange={(checked) => handleInputChange('is_private', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stakes_amount">Stakes Amount (Tokens)</Label>
                  <Input
                    id="stakes_amount"
                    type="number"
                    min="0"
                    max="1000"
                    value={formData.stakes_amount}
                    onChange={(e) => handleInputChange('stakes_amount', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Players will pay this amount to join. Winner takes all stakes.
                  </p>
                </div>

                {/* Club-specific pricing */}
                {clubId && (formData.session_type === 'club_booking' || formData.session_type === 'club_event') && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <Select
                        value={formData.payment_method || 'tokens'}
                        onValueChange={(value: 'tokens' | 'money') => handleInputChange('payment_method', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tokens">Tokens</SelectItem>
                          <SelectItem value="money">Money</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cost_tokens">Cost (Tokens)</Label>
                        <Input
                          id="cost_tokens"
                          type="number"
                          min="0"
                          value={formData.cost_tokens || 0}
                          onChange={(e) => handleInputChange('cost_tokens', parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cost_money">Cost (Money)</Label>
                        <Input
                          id="cost_money"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.cost_money || 0}
                          onChange={(e) => handleInputChange('cost_money', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={creating}
              className="bg-tennis-green-primary hover:bg-tennis-green-dark text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  {selectedSessionType && <selectedSessionType.icon className="h-4 w-4 mr-2" />}
                  Create Session
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}