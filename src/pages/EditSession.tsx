import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormField } from '@/components/ui/form-field';
import { 
  Trophy, 
  Users, 
  GraduationCap, 
  Heart, 
  Lock, 
  Unlock, 
  MapPin,
  StickyNote,
  ArrowLeft,
  Save,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedSessions, type UnifiedSession } from '@/hooks/useUnifiedSessions';
import { LocationInput } from '@/components/ui/location-input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation schema
const editSessionSchema = z.object({
  sessionType: z.string().min(1, 'Session type is required'),
  format: z.enum(['singles', 'doubles']).optional(),
  maxPlayers: z.number().min(2, 'At least 2 players required').max(20, 'Maximum 20 players'),
  stakesAmount: z.number().min(0, 'Stakes cannot be negative'),
  location: z.string().min(1, 'Location is required'),
  notes: z.string().optional(),
  isPrivate: z.boolean(),
  invitationCode: z.string().optional()
});

type EditSessionForm = z.infer<typeof editSessionSchema>;

const EditSession = () => {
  const { user } = useAuth();
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, loading: sessionsLoading } = useUnifiedSessions();
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<UnifiedSession | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [originalData, setOriginalData] = useState<Partial<EditSessionForm> | null>(null);

  // Form setup
  const form = useForm<EditSessionForm>({
    resolver: zodResolver(editSessionSchema),
    defaultValues: {
      sessionType: '',
      format: 'singles',
      maxPlayers: 2,
      stakesAmount: 0,
      location: '',
      notes: '',
      isPrivate: false,
      invitationCode: ''
    }
  });

  const { watch, setValue, formState: { errors, isDirty } } = form;
  const watchedValues = watch();

  // Session types configuration
  const sessionTypes = [
    { 
      value: 'match', 
      label: 'Tennis Match', 
      icon: Trophy, 
      description: 'Competitive tennis match with scoring',
      color: 'text-blue-600'
    },
    { 
      value: 'social_play', 
      label: 'Social Play', 
      icon: Users, 
      description: 'Casual tennis session with friends',
      color: 'text-purple-600'
    },
    { 
      value: 'training', 
      label: 'Training Session', 
      icon: GraduationCap, 
      description: 'Practice drills and skill development',
      color: 'text-green-600'
    },
    { 
      value: 'wellbeing', 
      label: 'Wellbeing Session', 
      icon: Heart, 
      description: 'Recovery and mental wellness activities',
      color: 'text-pink-600'
    }
  ];

  // Load session data
  useEffect(() => {
    if (!sessionId || sessionsLoading) return;

    const foundSession = sessions.find(s => s.id === sessionId);
    
    if (!foundSession) {
      toast.error('Session not found');
      navigate('/sessions');
      return;
    }

    // Check if user can edit this session
    if (foundSession.creator_id !== user?.id) {
      toast.error('You can only edit sessions you created');
      navigate('/sessions');
      return;
    }

    // Check if session can be edited (not started/completed)
    if (foundSession.status === 'active' || foundSession.status === 'completed') {
      toast.error('Cannot edit a session that has already started or completed');
      navigate('/sessions');
      return;
    }

    setSession(foundSession);
    
    // Populate form with existing data
    const formData: EditSessionForm = {
      sessionType: foundSession.session_type,
      format: (foundSession.format as 'singles' | 'doubles') || 'singles',
      maxPlayers: foundSession.max_players,
      stakesAmount: foundSession.stakes_amount || 0,
      location: foundSession.location,
      notes: foundSession.notes || '',
      isPrivate: foundSession.is_private,
      invitationCode: foundSession.invitation_code || ''
    };

    // Set form values
    Object.entries(formData).forEach(([key, value]) => {
      setValue(key as keyof EditSessionForm, value);
    });

    setOriginalData(formData);
    setLoading(false);
  }, [sessionId, sessions, sessionsLoading, user, navigate, setValue]);

  // Track changes
  useEffect(() => {
    if (!originalData) return;
    
    const hasChanges = Object.keys(originalData).some(key => {
      const currentValue = watchedValues[key as keyof EditSessionForm];
      const originalValue = originalData[key as keyof EditSessionForm];
      return currentValue !== originalValue;
    });
    
    setHasUnsavedChanges(hasChanges);
  }, [watchedValues, originalData]);

  // Auto-adjust max players based on session type and format
  useEffect(() => {
    if (watchedValues.sessionType === 'match') {
      const newMaxPlayers = watchedValues.format === 'singles' ? 2 : 4;
      setValue('maxPlayers', newMaxPlayers);
    }
  }, [watchedValues.sessionType, watchedValues.format, setValue]);

  // Generate invitation code for private sessions
  useEffect(() => {
    if (watchedValues.isPrivate && !watchedValues.invitationCode) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      setValue('invitationCode', code);
    }
  }, [watchedValues.isPrivate, watchedValues.invitationCode, setValue]);

  // Save session changes with optimistic updates and rollback
  const handleSave = async (data: EditSessionForm) => {
    if (!session || !user) return;

    setSaving(true);
    
    // Store current session state for rollback
    const previousSession = { ...session };
    
    try {
      // Optimistic update - update local state immediately
      const optimisticSession: UnifiedSession = {
        ...session,
        session_type: data.sessionType,
        format: data.format,
        max_players: data.maxPlayers,
        stakes_amount: data.stakesAmount,
        location: data.location,
        notes: data.notes,
        is_private: data.isPrivate,
        invitation_code: data.invitationCode,
        updated_at: new Date().toISOString()
      };
      
      setSession(optimisticSession);

      // Perform server update
      const updateData = {
        session_type: data.sessionType,
        format: data.sessionType === 'match' ? data.format : null,
        max_players: data.maxPlayers,
        stakes_amount: data.stakesAmount,
        location: data.location.trim(),
        notes: data.notes?.trim() || null,
        is_private: data.isPrivate,
        invitation_code: data.isPrivate ? data.invitationCode : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', session.id)
        .eq('creator_id', user.id);

      if (error) throw error;

      // Update original data to reflect saved state
      setOriginalData(data);
      setHasUnsavedChanges(false);
      
      toast.success('Session updated successfully!');
      
      // Navigate back
      if (session.club_id) {
        navigate(`/club/${session.club_id}`);
      } else {
        navigate('/sessions');
      }
      
    } catch (error) {
      // Rollback optimistic update on error
      setSession(previousSession);
      
      console.error('Error updating session:', error);
      toast.error('Failed to update session. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Handle navigation with unsaved changes warning
  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) return;
    }
    
    if (session?.club_id) {
      navigate(`/club/${session.club_id}`);
    } else {
      navigate('/sessions');
    }
  };

  // Prevent navigation with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading || sessionsLoading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-gray-600 mb-4">The session you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => navigate('/sessions')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  const selectedSessionType = sessionTypes.find(type => type.value === watchedValues.sessionType);
  const SessionIcon = selectedSessionType?.icon || Trophy;

  return (
    <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-tennis-green-dark">
              Edit Session{session.club_id ? ' (Club)' : ''}
            </h1>
            <p className="text-gray-600 mt-1">
              Modify your tennis session details
            </p>
          </div>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg text-sm">
              <AlertTriangle className="h-4 w-4" />
              Unsaved changes
            </div>
          )}
        </div>

        {/* Edit Form */}
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <SessionIcon className={`h-6 w-6 ${selectedSessionType?.color}`} />
                <div>
                  <span>Session Details</span>
                  <p className="text-sm font-normal text-gray-600 mt-1">
                    {selectedSessionType?.description}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Session Type */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Session Type</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sessionTypes.map((type) => {
                    const TypeIcon = type.icon;
                    return (
                      <div
                        key={type.value}
                        onClick={() => setValue('sessionType', type.value)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          watchedValues.sessionType === type.value
                            ? 'border-tennis-green-medium bg-tennis-green-bg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TypeIcon className={`h-5 w-5 ${type.color}`} />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-gray-600">{type.description}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {errors.sessionType && (
                  <p className="text-red-600 text-sm">{errors.sessionType.message}</p>
                )}
              </div>

              {/* Format (for matches only) */}
              {watchedValues.sessionType === 'match' && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Match Format</Label>
                  <Select 
                    value={watchedValues.format} 
                    onValueChange={(value: 'singles' | 'doubles') => setValue('format', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singles">Singles (1 vs 1)</SelectItem>
                      <SelectItem value="doubles">Doubles (2 vs 2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Max Players */}
              {watchedValues.sessionType !== 'match' && (
                <FormField
                  id="maxPlayers"
                  label="Maximum Players"
                  type="number"
                  placeholder="2"
                  value={watchedValues.maxPlayers.toString()}
                  onChange={(e) => setValue('maxPlayers', parseInt(e.target.value) || 2)}
                  error={errors.maxPlayers?.message}
                />
              )}

              {/* Stakes */}
              <FormField
                id="stakesAmount"
                label="Stakes Amount (Tokens)"
                type="number"
                placeholder="0"
                value={watchedValues.stakesAmount.toString()}
                onChange={(e) => setValue('stakesAmount', parseInt(e.target.value) || 0)}
                error={errors.stakesAmount?.message}
                helpText="Set to 0 for free sessions"
              />

              {/* Location */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  Location *
                </Label>
                <LocationInput
                  value={watchedValues.location ? { address: watchedValues.location } : null}
                  onChange={(locationData) => setValue('location', locationData?.address || '')}
                  placeholder="e.g., Central Park Tennis Courts, NYC"
                />
                {errors.location && (
                  <p className="text-red-600 text-sm">{errors.location.message}</p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-gray-500" />
                  Notes (Optional)
                </Label>
                <Textarea
                  placeholder="Add any additional details about your session..."
                  value={watchedValues.notes}
                  onChange={(e) => setValue('notes', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Privacy Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold flex items-center gap-2">
                    {watchedValues.isPrivate ? (
                      <Lock className="h-4 w-4 text-red-500" />
                    ) : (
                      <Unlock className="h-4 w-4 text-green-500" />
                    )}
                    Private Session
                  </Label>
                  <Switch
                    checked={watchedValues.isPrivate}
                    onCheckedChange={(checked) => setValue('isPrivate', checked)}
                  />
                </div>
                
                <p className="text-sm text-gray-600">
                  {watchedValues.isPrivate 
                    ? 'Only people with the invitation link can join'
                    : 'Anyone can see and join this session'
                  }
                </p>

                {watchedValues.isPrivate && watchedValues.invitationCode && (
                  <div className="bg-gray-50 border rounded-lg p-3">
                    <p className="text-sm font-medium mb-2">Invitation Code:</p>
                    <code className="bg-white px-2 py-1 rounded text-sm border">
                      {watchedValues.invitationCode}
                    </code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleBack} 
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="flex-1 bg-tennis-green-medium hover:bg-tennis-green-dark"
              disabled={saving || !isDirty}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSession;