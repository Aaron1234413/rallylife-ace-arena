import React, { useState, useEffect } from 'react';
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
import { Edit, Save, X } from 'lucide-react';
import { LocationInput } from '@/components/ui/location-input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LocationData {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  place_id?: string;
}

interface ProfileEditDialogProps {
  profile: any;
  onProfileUpdate: () => void;
  children?: React.ReactNode;
}

export const ProfileEditDialog: React.FC<ProfileEditDialogProps> = ({
  profile,
  onProfileUpdate,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (profile && open) {
      setFullName(profile.full_name || '');
      setLocation(profile.location ? { address: profile.location } : null);
    }
  }, [profile, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData: any = {
        full_name: fullName.trim() || null,
        location: location?.address || null,
        updated_at: new Date().toISOString()
      };

      // Add coordinates if available
      if (location?.coordinates) {
        updateData.latitude = location.coordinates.lat;
        updateData.longitude = location.coordinates.lng;
        updateData.location_updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setOpen(false);
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-base font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Location
            </Label>
            <LocationInput
              value={location}
              onChange={setLocation}
              placeholder="Enter your location"
            />
            <p className="text-xs text-muted-foreground">
              Your location helps us find nearby tennis sessions and players
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-tennis-green-primary hover:bg-tennis-green-medium"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};