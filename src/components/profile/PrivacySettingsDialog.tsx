import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, MapPin, MessageCircle, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PrivacySettingsDialogProps {
  profile: any;
  onProfileUpdate: () => void;
  children?: React.ReactNode;
}

export function PrivacySettingsDialog({ profile, onProfileUpdate, children }: PrivacySettingsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [matchHistoryVisibility, setMatchHistoryVisibility] = useState('public');
  const [locationSharing, setLocationSharing] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileVisibility(profile.profile_visibility || 'public');
      setMatchHistoryVisibility(profile.match_history_visibility || 'public');
      setLocationSharing(profile.location_sharing !== false);
      
      const contactPrefs = profile.contact_preferences || {};
      setAllowDirectMessages(contactPrefs.allow_direct_messages !== false);
      setShowEmail(contactPrefs.show_email === true);
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          profile_visibility: profileVisibility,
          match_history_visibility: matchHistoryVisibility,
          location_sharing: locationSharing,
          contact_preferences: {
            allow_direct_messages: allowDirectMessages,
            show_email: showEmail,
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Privacy settings updated');
      onProfileUpdate();
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Privacy Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Profile Visibility */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <Label className="text-base font-medium">Profile Visibility</Label>
            </div>
            <Select value={profileVisibility} onValueChange={setProfileVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see</SelectItem>
                <SelectItem value="players_only">Players Only</SelectItem>
                <SelectItem value="private">Private - Only you</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Who can view your profile information
            </p>
          </div>

          {/* Match History Visibility */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              <Label className="text-base font-medium">Match History</Label>
            </div>
            <Select value={matchHistoryVisibility} onValueChange={setMatchHistoryVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public - Everyone can see</SelectItem>
                <SelectItem value="players_only">Players Only</SelectItem>
                <SelectItem value="private">Private - Only you</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Who can see your match results
            </p>
          </div>

          {/* Location Sharing */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-red-600" />
              <div>
                <Label className="text-base font-medium">Location Sharing</Label>
                <p className="text-xs text-muted-foreground">Show your location to find nearby players</p>
              </div>
            </div>
            <Switch
              checked={locationSharing}
              onCheckedChange={setLocationSharing}
            />
          </div>

          {/* Direct Messages */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-purple-600" />
              <div>
                <Label className="text-base font-medium">Direct Messages</Label>
                <p className="text-xs text-muted-foreground">Allow other players to message you</p>
              </div>
            </div>
            <Switch
              checked={allowDirectMessages}
              onCheckedChange={setAllowDirectMessages}
            />
          </div>

          {/* Show Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-orange-600" />
              <div>
                <Label className="text-base font-medium">Show Email</Label>
                <p className="text-xs text-muted-foreground">Display email on your profile</p>
              </div>
            </div>
            <Switch
              checked={showEmail}
              onCheckedChange={setShowEmail}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}