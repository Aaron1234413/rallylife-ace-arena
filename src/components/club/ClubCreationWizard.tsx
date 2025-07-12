import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  Settings, 
  Crown, 
  CheckCircle,
  Building,
  Clock,
  Info
} from 'lucide-react';
import { TierSelector } from './TierSelector';
import { OperatingHoursEditor, OperatingHours } from './OperatingHoursEditor';
import { useClubs } from '@/hooks/useClubs';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { LocationInput } from '@/components/ui/location-input';
import { toast } from 'sonner';

interface ClubCreationWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface ClubFormData {
  // Basic Info
  name: string;
  description: string;
  location: string;
  isPublic: boolean;
  
  // Operational Details
  courtCount: number;
  coachSlots: number;
  operatingHours: OperatingHours;
  
  // Subscription
  subscriptionTier: string;
}

const STEPS = [
  { id: 'basic', title: 'Basic Information', icon: Building },
  { id: 'operational', title: 'Operational Details', icon: Settings },
  { id: 'subscription', title: 'Choose Your Tier', icon: Crown },
  { id: 'review', title: 'Review & Create', icon: CheckCircle }
];

const DEFAULT_OPERATING_HOURS: OperatingHours = {
  monday: { open: '06:00', close: '22:00' },
  tuesday: { open: '06:00', close: '22:00' },
  wednesday: { open: '06:00', close: '22:00' },
  thursday: { open: '06:00', close: '22:00' },
  friday: { open: '06:00', close: '22:00' },
  saturday: { open: '08:00', close: '20:00' },
  sunday: { open: '08:00', close: '20:00' }
};

export function ClubCreationWizard({ onComplete, onCancel }: ClubCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    description: '',
    location: '',
    isPublic: true,
    courtCount: 2,
    coachSlots: 1,
    operatingHours: DEFAULT_OPERATING_HOURS,
    subscriptionTier: 'community'
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { createClub, myClubs } = useClubs();
  const { getTierLimits } = useSubscriptionTiers();

  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (STEPS[currentStep].id) {
      case 'basic':
        if (!formData.name.trim()) {
          errors.name = 'Club name is required';
        } else if (formData.name.length > 50) {
          errors.name = 'Club name must be 50 characters or less';
        }
        break;

      case 'operational':
        if (formData.courtCount < 1 || formData.courtCount > 50) {
          errors.courtCount = 'Court count must be between 1 and 50';
        }
        
        const tierLimits = getTierLimits(formData.subscriptionTier);
        if (formData.coachSlots > tierLimits.coachLimit) {
          errors.coachSlots = `Coach slots cannot exceed ${tierLimits.coachLimit} for ${formData.subscriptionTier} tier`;
        }
        
        // Validate operating hours
        const hasValidHours = Object.values(formData.operatingHours).some(day => 
          !day.closed && day.open && day.close && day.open < day.close
        );
        if (!hasValidHours) {
          errors.operatingHours = 'At least one day must be open with valid hours';
        }
        break;

      case 'subscription':
        if (!formData.subscriptionTier) {
          errors.subscriptionTier = 'Please select a subscription tier';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateClub = async () => {
    if (!validateCurrentStep() || isCreating) return;

    setIsCreating(true);
    try {
      // Check current club count against subscription limits
      const currentUserClubs = myClubs.length; // Get current owned clubs count
      const tierLimits = getTierLimits(formData.subscriptionTier);
      const maxClubsAllowed = formData.subscriptionTier === 'community' ? 1 : 
                            formData.subscriptionTier === 'core' ? 3 :
                            formData.subscriptionTier === 'plus' ? 10 : 999; // pro = unlimited

      if (currentUserClubs >= maxClubsAllowed) {
        toast.error(`Your ${formData.subscriptionTier} plan allows up to ${maxClubsAllowed} club${maxClubsAllowed > 1 ? 's' : ''}. Upgrade to create more clubs.`);
        setIsCreating(false);
        return;
      }

      await createClub({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        location: formData.location.trim() || undefined,
        is_public: formData.isPublic,
        court_count: formData.courtCount,
        coach_slots: formData.coachSlots,
        operating_hours: formData.operatingHours,
        subscription_tier: formData.subscriptionTier
      });
      
      onComplete();
    } catch (error) {
      console.error('Failed to create club:', error);
      toast.error('Failed to create club. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const updateFormData = (updates: Partial<ClubFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    if (formErrors && Object.keys(updates).some(key => formErrors[key])) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(updates).forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Create New Club</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
              </p>
            </div>
            <Button variant="ghost" onClick={onCancel} disabled={isCreating}>
              ✕
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-1">
                    <StepIcon className={`h-3 w-3 ${
                      index <= currentStep ? 'text-tennis-green-primary' : 'text-muted-foreground'
                    }`} />
                    <span className={index <= currentStep ? 'text-tennis-green-primary' : ''}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step Content */}
          {STEPS[currentStep].id === 'basic' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Building className="h-12 w-12 mx-auto text-tennis-green-primary" />
                <h3 className="text-xl font-semibold">Let's start with the basics</h3>
                <p className="text-muted-foreground">Tell us about your tennis club</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    Club Name *
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </label>
                  <Input
                    placeholder="e.g., Downtown Tennis Club"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    className={formErrors.name ? 'border-red-500' : ''}
                    maxLength={50}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formData.name.length}/50 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Description <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Textarea
                    placeholder="Tell others about your club's focus, skill level, location, or special features..."
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    maxLength={200}
                    className="min-h-[80px] resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/200 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Location <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <LocationInput
                    value={formData.location ? { address: formData.location } : null}
                    onChange={(locationData) => updateFormData({ location: locationData?.address || '' })}
                    placeholder="Club address or location"
                  />
                  <p className="text-xs text-muted-foreground">
                    Help members find your club's physical location
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-tennis-green-bg/30 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => updateFormData({ isPublic: e.target.checked })}
                        className="rounded mt-0.5"
                      />
                      <div className="flex-1">
                        <label htmlFor="isPublic" className="text-sm font-medium cursor-pointer">
                          Make this club public
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          Public clubs are visible to all users and can be joined by anyone. 
                          Private clubs require invitations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {STEPS[currentStep].id === 'operational' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <Settings className="h-12 w-12 mx-auto text-tennis-green-primary" />
                <h3 className="text-xl font-semibold">Operational Details</h3>
                <p className="text-muted-foreground">Configure your club's capacity and schedule</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                {/* Court Count & Coach Slots */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Courts *</label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={formData.courtCount}
                      onChange={(e) => updateFormData({ courtCount: parseInt(e.target.value) || 1 })}
                      className={formErrors.courtCount ? 'border-red-500' : ''}
                    />
                    {formErrors.courtCount && (
                      <p className="text-sm text-red-500">{formErrors.courtCount}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Courts available for booking by members
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Coach Positions *</label>
                    <Input
                      type="number"
                      min="1"
                      max={getTierLimits(formData.subscriptionTier).coachLimit}
                      value={formData.coachSlots}
                      onChange={(e) => updateFormData({ coachSlots: parseInt(e.target.value) || 1 })}
                      className={formErrors.coachSlots ? 'border-red-500' : ''}
                    />
                    {formErrors.coachSlots && (
                      <p className="text-sm text-red-500">{formErrors.coachSlots}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Maximum coaches that can offer services (limit: {getTierLimits(formData.subscriptionTier).coachLimit})
                    </p>
                  </div>
                </div>

                {/* Operating Hours */}
                <OperatingHoursEditor
                  operatingHours={formData.operatingHours}
                  onOperatingHoursChange={(hours) => updateFormData({ operatingHours: hours })}
                />
                {formErrors.operatingHours && (
                  <p className="text-sm text-red-500 text-center">{formErrors.operatingHours}</p>
                )}
              </div>
            </div>
          )}

          {STEPS[currentStep].id === 'subscription' && (
            <div className="space-y-6">
              <TierSelector
                selectedTier={formData.subscriptionTier}
                onTierSelect={(tier) => {
                  updateFormData({ subscriptionTier: tier });
                  // Adjust coach slots if exceeding new tier limit
                  const tierLimits = getTierLimits(tier);
                  if (formData.coachSlots > tierLimits.coachLimit) {
                    updateFormData({ coachSlots: tierLimits.coachLimit });
                  }
                }}
              />
              {formErrors.subscriptionTier && (
                <p className="text-sm text-red-500 text-center">{formErrors.subscriptionTier}</p>
              )}
            </div>
          )}

          {STEPS[currentStep].id === 'review' && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <CheckCircle className="h-12 w-12 mx-auto text-tennis-green-primary" />
                <h3 className="text-xl font-semibold">Review Your Club</h3>
                <p className="text-muted-foreground">Everything looks good? Let's create your club!</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-6">
                {/* Club Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {formData.name}
                      {formData.isPublic ? (
                        <Badge variant="default">Public</Badge>
                      ) : (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </CardTitle>
                    {formData.description && (
                      <p className="text-sm text-muted-foreground">{formData.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-lg">{formData.courtCount}</div>
                      <div className="text-muted-foreground">Courts</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">{formData.coachSlots}</div>
                      <div className="text-muted-foreground">Coach Positions</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg capitalize">{formData.subscriptionTier}</div>
                      <div className="text-muted-foreground">Tier</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Operating Hours Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Operating Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(formData.operatingHours).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize font-medium">{day}:</span>
                          <span className="text-muted-foreground">
                            {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>

        <div className="border-t p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 0 ? onCancel : handlePrevious}
              disabled={isCreating}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 0 ? 'Cancel' : 'Previous'}
            </Button>

            <Button
              onClick={currentStep === STEPS.length - 1 ? handleCreateClub : handleNext}
              disabled={isCreating}
              className="min-w-[120px]"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : currentStep === STEPS.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Club
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}