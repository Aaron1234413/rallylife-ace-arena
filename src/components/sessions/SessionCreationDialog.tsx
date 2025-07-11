import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSessionManager } from '@/hooks/useSessionManager';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { HPReductionPreview } from './HPReductionPreview';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trophy, 
  Users, 
  GraduationCap,
  MapPin,
  Coins,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SessionType = 'challenge' | 'social' | 'training';

interface SessionTypeOption {
  type: SessionType;
  name: string;
  icon: React.ElementType;
  description: string;
  features: string[];
  color: string;
}

interface SessionCreationData {
  sessionType: SessionType;
  location: string;
  maxPlayers: number;
  stakes: number;
}

interface SessionCreationDialogProps {
  clubId?: string;
  trigger?: React.ReactNode;
  onSessionCreated?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

const sessionTypes: SessionTypeOption[] = [
  {
    type: 'challenge',
    name: 'Challenge',
    icon: Trophy,
    description: 'Competitive match with stakes and HP reduction',
    features: ['Stakes required', 'HP reduction', 'Winner takes all', '2-4 players'],
    color: 'from-amber-500 to-orange-600'
  },
  {
    type: 'social',
    name: 'Social',
    icon: Users,
    description: 'Casual play with optional stakes, no HP loss',
    features: ['Optional stakes', 'No HP reduction', 'Relaxed environment', '2-4 players'],
    color: 'from-blue-500 to-cyan-600'
  },
  {
    type: 'training',
    name: 'Training',
    icon: GraduationCap,
    description: 'Practice session with fixed cost and unlimited players',
    features: ['Fixed entry cost', 'No HP reduction', 'Skill building', 'Unlimited players'],
    color: 'from-green-500 to-emerald-600'
  }
];

export function SessionCreationDialog({ 
  clubId, 
  trigger,
  onSessionCreated,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess
}: SessionCreationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { createSession } = useSessionManager({ clubId });
  const { regularTokens } = usePlayerTokens();
  const { hpData } = usePlayerHP();
  const { xpData } = usePlayerXP();

  const [formData, setFormData] = useState<SessionCreationData>({
    sessionType: 'challenge',
    location: '',
    maxPlayers: 2,
    stakes: 10
  });

  const resetForm = () => {
    setFormData({
      sessionType: 'challenge',
      location: '',
      maxPlayers: 2,
      stakes: 10
    });
    setCurrentStep(1);
    setErrors({});
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required';
      }
      
      if (formData.sessionType !== 'training') {
        if (formData.maxPlayers < 2 || formData.maxPlayers > 4) {
          newErrors.maxPlayers = 'Must be between 2-4 players';
        }
      } else {
        if (formData.maxPlayers < 1) {
          newErrors.maxPlayers = 'Must be at least 1 player';
        }
      }
    }

    if (step === 3) {
      if (formData.sessionType === 'training') {
        if (formData.stakes < 1) {
          newErrors.stakes = 'Training cost must be at least 1 token';
        }
      } else {
        if (formData.stakes < 5) {
          newErrors.stakes = 'Stakes must be at least 5 tokens';
        }
      }
      
      if (formData.stakes > regularTokens) {
        newErrors.stakes = 'Insufficient tokens';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const selectedType = sessionTypes.find(t => t.type === formData.sessionType);
      const sessionTitle = `${selectedType?.name} Session`;

      await createSession({
        title: sessionTitle,
        description: `${selectedType?.description} at ${formData.location}`,
        location: formData.location,
        max_participants: formData.maxPlayers,
        session_type: formData.sessionType,
        stakes_amount: formData.stakes,
        club_id: clubId,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        skill_level: 'all'
      });

      toast.success('Session created successfully!');
      setOpen(false);
      resetForm();
      onSessionCreated?.();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Choose Session Type</h3>
              <p className="text-muted-foreground">Select the type of session you want to create</p>
            </div>
            
            <div className="space-y-3">
              {sessionTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card 
                    key={type.type}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      formData.sessionType === type.type 
                        ? "ring-2 ring-primary shadow-md" 
                        : "hover:ring-1 hover:ring-muted-foreground/20"
                    )}
                    onClick={() => setFormData(prev => ({ ...prev, sessionType: type.type }))}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-br",
                          type.color
                        )}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{type.name}</CardTitle>
                            {formData.sessionType === type.type && (
                              <Badge variant="default" className="text-xs">Selected</Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm mt-1">
                            {type.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1">
                        {type.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Session Details</h3>
              <p className="text-muted-foreground">Set location and player count</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Central Tennis Club, Court 1"
                  className={errors.location ? "border-destructive" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPlayers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Number of Players
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      maxPlayers: Math.max(1, prev.maxPlayers - 1) 
                    }))}
                    disabled={formData.maxPlayers <= (formData.sessionType === 'training' ? 1 : 2)}
                  >
                    -
                  </Button>
                  <span className="min-w-[3rem] text-center font-medium">
                    {formData.maxPlayers}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      maxPlayers: formData.sessionType === 'training' 
                        ? prev.maxPlayers + 1 
                        : Math.min(4, prev.maxPlayers + 1) 
                    }))}
                    disabled={formData.sessionType !== 'training' && formData.maxPlayers >= 4}
                  >
                    +
                  </Button>
                </div>
                {formData.sessionType !== 'training' && (
                  <p className="text-sm text-muted-foreground">
                    {formData.sessionType === 'challenge' ? 'Challenge' : 'Social'} sessions: 2-4 players
                  </p>
                )}
                {formData.sessionType === 'training' && (
                  <p className="text-sm text-muted-foreground">
                    Training sessions: unlimited players
                  </p>
                )}
                {errors.maxPlayers && (
                  <p className="text-sm text-destructive">{errors.maxPlayers}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold">Token Configuration</h3>
              <p className="text-muted-foreground">
                {formData.sessionType === 'training' 
                  ? 'Set the fixed entry cost' 
                  : 'Set the stakes amount'}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stakes" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  {formData.sessionType === 'training' ? 'Entry Cost' : 'Stakes Amount'} *
                </Label>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      stakes: Math.max(formData.sessionType === 'training' ? 1 : 5, prev.stakes - 5) 
                    }))}
                    disabled={formData.stakes <= (formData.sessionType === 'training' ? 1 : 5)}
                  >
                    -5
                  </Button>
                  <div className="flex-1 text-center">
                    <Input
                      id="stakes"
                      type="number"
                      value={formData.stakes}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        stakes: Math.max(0, parseInt(e.target.value) || 0) 
                      }))}
                      className={cn("text-center", errors.stakes ? "border-destructive" : "")}
                      min={formData.sessionType === 'training' ? 1 : 5}
                      max={regularTokens}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      stakes: Math.min(regularTokens, prev.stakes + 5) 
                    }))}
                    disabled={formData.stakes + 5 > regularTokens}
                  >
                    +5
                  </Button>
                </div>
                {errors.stakes && (
                  <p className="text-sm text-destructive">{errors.stakes}</p>
                )}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Available tokens: {regularTokens}</span>
                  <span>
                    {formData.sessionType === 'training' 
                      ? `Minimum: 1 token` 
                      : `Minimum: 5 tokens`}
                  </span>
                </div>
              </div>

              {formData.sessionType !== 'training' && (
                <div className="space-y-3">
                  {/* Stakes Distribution Preview */}
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div className="text-sm flex-1">
                            <p className="font-medium">Stakes Distribution Preview:</p>
                            <div className="space-y-1 mt-2">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Stakes Pool:</span>
                                <span className="font-medium">{formData.stakes * formData.maxPlayers} tokens</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Platform Fee (10%):</span>
                                <span className="font-medium text-destructive">
                                  -{Math.floor(formData.stakes * formData.maxPlayers * 0.1)} tokens
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-1">
                                <span className="font-medium">Winner Receives:</span>
                                <span className="font-bold text-tennis-green-primary">
                                  {Math.floor(formData.stakes * formData.maxPlayers * 0.9)} tokens
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Insufficient Balance Warning */}
                  {formData.stakes > regularTokens && (
                    <Card className="border-destructive/20 bg-destructive/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive" />
                          <div className="text-sm">
                            <p className="font-medium text-destructive">Insufficient Token Balance</p>
                            <p className="text-muted-foreground">
                              You need {formData.stakes} tokens but only have {regularTokens} available.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* HP Impact Preview */}
              {hpData && xpData && (
                <HPReductionPreview
                  sessionType={formData.sessionType}
                  playerLevel={xpData.current_level}
                  currentHP={hpData.current_hp}
                  maxHP={hpData.max_hp}
                  className="mt-4"
                />
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const defaultTrigger = (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Create Session
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (!newOpen) {
        resetForm();
      }
    }}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Session</span>
            <Badge variant="outline">{currentStep} of 3</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {renderStepContent()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? () => setOpen(false) : handlePrevious}
            disabled={loading}
            className="gap-2"
          >
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                Previous
              </>
            )}
          </Button>

          {currentStep < 3 ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Session'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}