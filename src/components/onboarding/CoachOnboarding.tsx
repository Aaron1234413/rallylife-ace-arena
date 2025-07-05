
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AvatarSelector } from './AvatarSelector';

interface CoachOnboardingProps {
  user: any;
  profile: any;
  onComplete: () => void;
}

export function CoachOnboarding({ user, profile, onComplete }: CoachOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    avatar_url: profile.avatar_url || '',
    coaching_focus: '',
    experience_years: '',
    location: '',
    bio: '',
    hourly_rate: ''
  });
  const [loading, setLoading] = useState(false);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStep1Submit = async () => {
    if (!formData.full_name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: formData.full_name,
          avatar_url: formData.avatar_url,
          location: formData.location
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
        return;
      }

      setStep(2);
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('coach_profiles')
        .insert({
          id: user.id,
          coaching_focus: formData.coaching_focus,
          experience_years: formData.experience_years ? parseInt(formData.experience_years) : null,
          bio: formData.bio,
          hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null
        });

      if (error) {
        console.error('Error creating coach profile:', error);
        toast.error('Failed to create coach profile');
        return;
      }

      onComplete();
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {step === 1 && (
        <Card className="border-tennis-green-light">
          <CardHeader className="bg-tennis-green-light text-white">
            <CardTitle>Step 1: Basic Information</CardTitle>
            <CardDescription className="text-tennis-green-bg">
              Let's start with the basics
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
              <Label>Choose Your Avatar</Label>
              <AvatarSelector
                selectedAvatar={formData.avatar_url}
                onAvatarSelect={(url) => updateFormData('avatar_url', url)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="e.g., New York, NY"
              />
            </div>

            <Button 
              onClick={handleStep1Submit} 
              disabled={loading}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
            >
              {loading ? 'Saving...' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="border-tennis-green-light">
          <CardHeader className="bg-tennis-green-light text-white">
            <CardTitle>Step 2: Coaching Profile</CardTitle>
            <CardDescription className="text-tennis-green-bg">
              Tell us about your coaching experience
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coaching_focus">Coaching Focus</Label>
              <Select onValueChange={(value) => updateFormData('coaching_focus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your coaching focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginners">Beginners</SelectItem>
                  <SelectItem value="intermediate">Intermediate Players</SelectItem>
                  <SelectItem value="advanced">Advanced Players</SelectItem>
                  <SelectItem value="junior">Junior Development</SelectItem>
                  <SelectItem value="competitive">Competitive Tennis</SelectItem>
                  <SelectItem value="fitness">Tennis Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Experience</Label>
              <Input
                id="experience_years"
                type="number"
                value={formData.experience_years}
                onChange={(e) => updateFormData('experience_years', e.target.value)}
                placeholder="e.g., 5"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => updateFormData('hourly_rate', e.target.value)}
                placeholder="e.g., 75"
                min="0"
                step="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Tell us about your coaching philosophy and experience..."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleStep2Submit} 
                disabled={loading}
                className="flex-1 bg-tennis-green-dark hover:bg-tennis-green-medium"
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
