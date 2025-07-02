import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Settings, 
  Globe, 
  Lock, 
  Upload,
  Save,
  AlertTriangle
} from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ClubSettingsProps {
  club: any;
  onSettingsUpdate: () => void;
}

export function ClubSettings({ club, onSettingsUpdate }: ClubSettingsProps) {
  const { user } = useAuth();
  const { updateClub } = useClubs();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: club.name || '',
    description: club.description || '',
    is_public: club.is_public || false,
    logo_url: club.logo_url || ''
  });

  const isOwner = user?.id === club.owner_id;

  if (!isOwner) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="font-medium mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground">
            Only club owners can access settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Club name is required');
      return;
    }

    setLoading(true);
    try {
      await updateClub(club.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        is_public: formData.is_public,
        logo_url: formData.logo_url.trim() || null
      });
      
      onSettingsUpdate();
      toast.success('Club settings updated successfully!');
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Club Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Club Logo */}
          <div className="space-y-3">
            <Label>Club Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={formData.logo_url || undefined} />
                <AvatarFallback>
                  {formData.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  placeholder="Logo URL (optional)"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste an image URL or leave empty for auto-generated logo
                </p>
              </div>
            </div>
          </div>

          {/* Club Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter club name"
              required
              maxLength={100}
            />
          </div>

          {/* Club Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your club's focus, activities, and community..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <Label>Privacy Settings</Label>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {formData.is_public ? (
                  <Globe className="h-5 w-5 text-blue-500" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-500" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formData.is_public ? 'Public Club' : 'Private Club'}
                    </span>
                    <Badge variant={formData.is_public ? "default" : "secondary"}>
                      {formData.is_public ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_public 
                      ? 'Anyone can discover and join your club'
                      : 'Only invited members can join your club'
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.is_public}
                onCheckedChange={(checked) => handleInputChange('is_public', checked)}
              />
            </div>
          </div>

          {/* Member Count Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Club Statistics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Members</span>
                <p className="font-medium">{club.member_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium">
                  {new Date(club.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
            
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setFormData({
                name: club.name || '',
                description: club.description || '',
                is_public: club.is_public || false,
                logo_url: club.logo_url || ''
              })}
            >
              Reset Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}