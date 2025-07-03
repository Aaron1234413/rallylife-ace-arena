import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  Globe, 
  Lock, 
  Users, 
  Image,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { toast } from 'sonner';

interface ClubSettingsProps {
  club: Club;
  onSettingsUpdate: () => void;
}

export function ClubSettings({ club, onSettingsUpdate }: ClubSettingsProps) {
  const [formData, setFormData] = useState({
    name: club.name,
    description: club.description || '',
    is_public: club.is_public,
    logo_url: club.logo_url || ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      // Mock update functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Club settings updated successfully!');
      onSettingsUpdate();
      
      // In real implementation, would call the actual update function
      console.log('Updating club with data:', formData);
    } catch (error) {
      console.error('Error updating club:', error);
      toast.error('Failed to update club settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    // Mock delete functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Club deleted successfully');
    // Would redirect to dashboard in real implementation
    console.log('Deleting club:', club.id);
  };

  const hasChanges = 
    formData.name !== club.name ||
    formData.description !== (club.description || '') ||
    formData.is_public !== club.is_public ||
    formData.logo_url !== (club.logo_url || '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-tennis-green-dark flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Club Settings
        </h2>
        <p className="text-sm text-tennis-green-medium">
          Manage your club&apos;s information and preferences
        </p>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your club's mission, activities, and what makes it special..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              disabled={isUpdating}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Club Logo URL</Label>
            <Input
              id="logo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={formData.logo_url}
              onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
              disabled={isUpdating}
            />
            <p className="text-xs text-tennis-green-medium">
              Provide a URL to your club&apos;s logo image
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {formData.is_public ? (
                  <Globe className="h-4 w-4 text-green-600" />
                ) : (
                  <Lock className="h-4 w-4 text-gray-600" />
                )}
                <Label>Club Visibility</Label>
              </div>
              <p className="text-sm text-tennis-green-medium">
                {formData.is_public 
                  ? 'Anyone can discover and join this club'
                  : 'Members must be invited to join this club'
                }
              </p>
            </div>
            
            <Switch
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              disabled={isUpdating}
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-tennis-green-bg/30 rounded-lg">
            <Users className="h-4 w-4 text-tennis-green-primary" />
            <span className="text-sm">
              Current members: <strong>{club.member_count}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isUpdating || !hasChanges || !formData.name.trim()}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isUpdating ? 'Saving...' : 'Save Changes'}
        </Button>
        
        {hasChanges && (
          <Button
            variant="outline"
            onClick={() => {
              setFormData({
                name: club.name,
                description: club.description || '',
                is_public: club.is_public,
                logo_url: club.logo_url || ''
              });
            }}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Delete Club</h4>
            <p className="text-sm text-red-700 mb-3">
              Once you delete a club, there is no going back. All members will be removed 
              and all data will be permanently deleted.
            </p>
            
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Club
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-800">
                  Are you absolutely sure? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Delete Club
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}