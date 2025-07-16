
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AvatarSelector } from './AvatarSelector';
import { UTRSetup } from '../profile/UTRSetup';
import { LocationInput, LocationData } from '@/components/ui/location-input';
import { CheckCircle, MapPin, Calendar, Trophy, Heart } from 'lucide-react';

interface PlayerOnboardingProps {
  user: any;
  profile: any;
  onComplete: () => void;
}

export function PlayerOnboarding({ user, profile, onComplete }: PlayerOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    avatar_url: profile.avatar_url || '',
    location: null as LocationData | null,
    utr_rating: null as number | null,
    utr_verified: false,
    manual_level: '',
    availability: {
      monday: [] as string[],
      tuesday: [] as string[],
      wednesday: [] as string[],
      thursday: [] as string[],
      friday: [] as string[],
      saturday: [] as string[],
      sunday: [] as string[]
    }
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const timeSlots = ['Morning (6-12)', 'Afternoon (12-17)', 'Evening (17-22)'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Step 1: Basic Info
  const handleStep1Submit = async () => {
    if (!formData.full_name.trim() || !formData.location?.address?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          location: formData.location.address
        })
        .eq('id', user.id);

      if (error) throw error;
      setStep(2);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: UTR Verification Complete
  const handleUTRComplete = (utrRating?: number, manualLevel?: string) => {
    updateFormData('utr_rating', utrRating || null);
    updateFormData('utr_verified', !!utrRating);
    updateFormData('manual_level', manualLevel || '');
    setStep(3);
  };

  // Step 3: Availability Setup
  const handleAvailabilityToggle = (day: string, timeSlot: string) => {
    const currentDayAvailability = formData.availability[day as keyof typeof formData.availability] || [];
    const isSelected = currentDayAvailability.includes(timeSlot);
    
    const newAvailability = isSelected 
      ? currentDayAvailability.filter(slot => slot !== timeSlot)
      : [...currentDayAvailability, timeSlot];

    updateFormData('availability', {
      ...formData.availability,
      [day]: newAvailability
    });
  };

  const handleStep3Submit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          utr_rating: formData.utr_rating,
          utr_verified: formData.utr_verified,
          manual_level: formData.manual_level,
          availability: formData.availability
        })
        .eq('id', user.id);

      if (error) throw error;
      setStep(4);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to save availability');
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Welcome Complete
  const handleFinalComplete = async () => {
    try {
      setLoading(true);
      
      // Ensure token initialization for onboarding completion
      const { error: tokenError } = await supabase.rpc('initialize_player_tokens', {
        user_id: user?.id
      });
      
      if (tokenError) {
        console.error('Error initializing tokens:', tokenError);
        // Don't block onboarding completion for token initialization errors
      }
      
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still complete onboarding even if token initialization fails
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: MapPin },
    { number: 2, title: 'UTR Verification', icon: Trophy },
    { number: 3, title: 'Availability', icon: Calendar },
    { number: 4, title: 'Welcome', icon: Heart }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((stepItem, index) => {
            const StepIcon = stepItem.icon;
            const isActive = step === stepItem.number;
            const isCompleted = step > stepItem.number;
            
            return (
              <div key={stepItem.number} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isActive ? 'bg-tennis-green-dark text-white' : 
                    isCompleted ? 'bg-tennis-green-light text-white' : 
                    'bg-gray-200 text-gray-500'}
                `}>
                  {isCompleted ? <CheckCircle className="h-6 w-6" /> : <StepIcon className="h-6 w-6" />}
                </div>
                <div className="ml-3 hidden md:block">
                  <p className={`text-sm font-medium ${isActive ? 'text-tennis-green-dark' : 'text-gray-500'}`}>
                    {stepItem.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-tennis-green-light' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card className="border-tennis-green-light">
          <CardHeader className="bg-tennis-green-light text-white">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription className="text-tennis-green-bg">
              Let's start with your basic details
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => updateFormData('full_name', e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <LocationInput
                value={formData.location}
                onChange={(location) => updateFormData('location', location)}
                placeholder="Enter your location (e.g., New York, NY)"
              />
            </div>

            <div className="space-y-2">
              <Label>Choose Your Avatar</Label>
              <AvatarSelector
                selectedAvatar={formData.avatar_url}
                onAvatarSelect={(url) => updateFormData('avatar_url', url)}
              />
            </div>

            <Button 
              onClick={handleStep1Submit} 
              disabled={loading}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
            >
              {loading ? 'Saving...' : 'Continue to UTR Verification'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: UTR Verification */}
      {step === 2 && (
        <Card className="border-tennis-green-light">
          <CardHeader className="bg-tennis-green-light text-white">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              UTR Verification
            </CardTitle>
            <CardDescription className="text-tennis-green-bg">
              Get verified with your official UTR rating for better matches
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <UTRSetup
              userId={user.id}
              firstName={formData.full_name.split(' ')[0]}
              lastName={formData.full_name.split(' ').slice(1).join(' ')}
              email={user.email}
              onComplete={handleUTRComplete}
            />
            
            <div className="mt-6 flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                variant="ghost"
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Availability Setup */}
      {step === 3 && (
        <Card className="border-tennis-green-light">
          <CardHeader className="bg-tennis-green-light text-white">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              When Do You Play?
            </CardTitle>
            <CardDescription className="text-tennis-green-bg">
              Set your availability to find matches at the right times
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid gap-4">
              {daysOfWeek.map(day => (
                <div key={day} className="space-y-2">
                  <Label className="capitalize text-base font-medium">{day}</Label>
                  <div className="flex gap-2 flex-wrap">
                    {timeSlots.map(timeSlot => {
                      const isSelected = formData.availability[day as keyof typeof formData.availability]?.includes(timeSlot);
                      return (
                        <Button
                          key={timeSlot}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAvailabilityToggle(day, timeSlot)}
                          className={isSelected ? "bg-tennis-green-dark hover:bg-tennis-green-medium" : ""}
                        >
                          {timeSlot}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleStep3Submit} 
                disabled={loading}
                className="flex-1 bg-tennis-green-dark hover:bg-tennis-green-medium"
              >
                {loading ? 'Saving...' : 'Complete Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Welcome to MVP */}
      {step === 4 && (
        <Card className="border-tennis-green-light">
          <CardHeader className="bg-tennis-green-light text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🎾</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to Rako!</CardTitle>
            <CardDescription className="text-tennis-green-bg">
              You're all set to start finding tennis matches
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">UTR Status</h3>
                  <div className="flex items-center justify-center gap-2">
                    {formData.utr_verified ? (
                      <>
                        <Badge variant="default" className="bg-green-600">
                          UTR {formData.utr_rating} Verified
                        </Badge>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </>
                    ) : (
                      <Badge variant="outline" className="border-orange-400 text-orange-600">
                        {formData.manual_level ? `Manual: ${formData.manual_level}` : 'Not Set'}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Location</h3>
                  <p className="text-blue-700">{formData.location?.address || 'Not set'}</p>
                </div>
              </div>

              <div className="p-4 bg-tennis-green-bg/20 rounded-lg">
                <h3 className="font-semibold text-tennis-green-dark mb-2">What's Next?</h3>
                <ul className="text-sm text-tennis-green-medium space-y-1">
                  <li>• Find players at your skill level</li>
                  <li>• Challenge others and earn tokens</li>
                  <li>• Level up with XP and achievements</li>
                  <li>• Shop for gear with earned tokens</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleFinalComplete} 
              className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium text-lg py-6"
            >
              Start Playing Rako! 🎾
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
