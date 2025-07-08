import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Calendar, Clock, Users, MapPin, DollarSign, Trophy } from 'lucide-react';
import { useOpenSessions, OpenSession } from '@/hooks/useOpenSessions';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';

interface CreateOpenSessionDialogProps {
  clubId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Court {
  id: string;
  name: string;
  surface_type: string;
  hourly_rate_tokens: number;
  hourly_rate_money: number;
}

export function CreateOpenSessionDialog({ 
  clubId, 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateOpenSessionDialogProps) {
  const { createSession, creating } = useOpenSessions(clubId);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    session_type: 'casual' as const,
    title: '',
    description: '',
    court_id: '',
    scheduled_date: '',
    start_time: '',
    end_time: '',
    max_participants: 4,
    skill_level_min: 1,
    skill_level_max: 7,
    requires_approval: false,
    is_public: true,
    session_notes: '',
    payment_method: 'tokens' as const,
    cost_per_person_tokens: 0,
    cost_per_person_money: 0
  });

  // Load courts
  useEffect(() => {
    if (!isOpen || !clubId) return;

    const fetchCourts = async () => {
      setLoadingCourts(true);
      try {
        const { data, error } = await supabase
          .from('club_courts')
          .select('*')
          .eq('club_id', clubId)
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setCourts(data || []);
      } catch (error) {
        console.error('Error fetching courts:', error);
      } finally {
        setLoadingCourts(false);
      }
    };

    fetchCourts();
  }, [isOpen, clubId]);

  // Calculate duration and costs when times change
  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
      
      if (duration > 0 && formData.court_id) {
        const court = courts.find(c => c.id === formData.court_id);
        if (court) {
          const totalTokens = Math.floor((court.hourly_rate_tokens * duration) / 60);
          const totalMoney = (court.hourly_rate_money * duration) / 60;
          
          setFormData(prev => ({
            ...prev,
            cost_per_person_tokens: Math.floor(totalTokens / prev.max_participants),
            cost_per_person_money: Number((totalMoney / prev.max_participants).toFixed(2))
          }));
        }
      }
    }
  }, [formData.start_time, formData.end_time, formData.court_id, formData.max_participants, courts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.scheduled_date || !formData.start_time || !formData.end_time) {
      return;
    }

    const start = new Date(`2000-01-01T${formData.start_time}`);
    const end = new Date(`2000-01-01T${formData.end_time}`);
    const duration_minutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const sessionData: Partial<OpenSession> = {
      ...formData,
      duration_minutes,
      creator_type: 'member' // TODO: Detect if user is coach
    };

    const success = await createSession(sessionData);
    if (success) {
      onSuccess?.();
      onClose();
      // Reset form
      setFormData({
        session_type: 'casual',
        title: '',
        description: '',
        court_id: '',
        scheduled_date: '',
        start_time: '',
        end_time: '',
        max_participants: 4,
        skill_level_min: 1,
        skill_level_max: 7,
        requires_approval: false,
        is_public: true,
        session_notes: '',
        payment_method: 'tokens',
        cost_per_person_tokens: 0,
        cost_per_person_money: 0
      });
    }
  };

  const sessionTypes = [
    { value: 'casual', label: 'Casual Play', icon: '🎾' },
    { value: 'practice', label: 'Practice Session', icon: '💪' },
    { value: 'lesson', label: 'Group Lesson', icon: '📚' },
    { value: 'clinic', label: 'Tennis Clinic', icon: '🏆' },
    { value: 'tournament', label: 'Mini Tournament', icon: '🥇' }
  ];

  const skillLevelLabels = ['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0', '5.5', '6.0', '6.5', '7.0'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-tennis-green-primary" />
            Create Open Session
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Type */}
          <div className="space-y-2">
            <Label>Session Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sessionTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, session_type: type.value as any }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    formData.session_type === type.value
                      ? 'border-tennis-green-primary bg-tennis-green-bg text-tennis-green-dark'
                      : 'border-gray-200 hover:border-tennis-green-primary/50'
                  }`}
                >
                  <div className="text-lg mb-1">{type.icon}</div>
                  <div className="font-medium text-sm">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Evening Doubles Practice"
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional details about the session..."
                rows={3}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time *
              </Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time *</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Court Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Court (Optional)
            </Label>
            {loadingCourts ? (
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-muted-foreground">Loading courts...</span>
              </div>
            ) : (
              <Select 
                value={formData.court_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, court_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a court (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific court</SelectItem>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{court.name} ({court.surface_type})</span>
                        <Badge variant="outline" className="ml-2">
                          {court.hourly_rate_tokens} tokens/hr
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Participants */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Max Participants: {formData.max_participants}
            </Label>
            <Slider
              value={[formData.max_participants]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, max_participants: value }))}
              min={2}
              max={8}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2 players</span>
              <span>8 players</span>
            </div>
          </div>

          {/* Skill Level Range */}
          <div className="space-y-2">
            <Label>Skill Level Range</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Minimum</Label>
                <Select 
                  value={formData.skill_level_min.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, skill_level_min: parseFloat(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevelLabels.map((level, index) => (
                      <SelectItem key={level} value={(index * 0.5 + 1).toString()}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm text-muted-foreground">Maximum</Label>
                <Select 
                  value={formData.skill_level_max.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, skill_level_max: parseFloat(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {skillLevelLabels.map((level, index) => (
                      <SelectItem key={level} value={(index * 0.5 + 1).toString()}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Cost Display */}
          {formData.court_id && (formData.cost_per_person_tokens > 0 || formData.cost_per_person_money > 0) && (
            <div className="p-4 bg-tennis-green-bg/30 rounded-lg border border-tennis-green-primary/20">
              <Label className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4" />
                Cost Per Person
              </Label>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {formData.cost_per_person_tokens > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      {formData.cost_per_person_tokens} tokens
                    </Badge>
                  </div>
                )}
                {formData.cost_per_person_money > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      ${formData.cost_per_person_money.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Court costs will be split automatically among all participants
              </p>
            </div>
          )}

          {/* Session Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Requires Approval</Label>
                <p className="text-sm text-muted-foreground">Manually approve participants</p>
              </div>
              <Switch
                checked={formData.requires_approval}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_approval: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Public Session</Label>
                <p className="text-sm text-muted-foreground">Visible to all club members</p>
              </div>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
            </div>
          </div>

          {/* Session Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.session_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, session_notes: e.target.value }))}
              placeholder="Any special instructions or requirements..."
              rows={2}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={creating || !formData.title || !formData.scheduled_date || !formData.start_time || !formData.end_time}
              className="flex-1"
            >
              {creating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}