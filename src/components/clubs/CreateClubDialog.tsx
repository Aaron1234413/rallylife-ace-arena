import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Globe, Lock } from 'lucide-react';
import { useClubs } from '@/hooks/useClubs';

interface CreateClubDialogProps {
  trigger?: React.ReactNode;
}

export function CreateClubDialog({ trigger }: CreateClubDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
  });
  const [loading, setLoading] = useState(false);
  const { createClub } = useClubs();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    setLoading(true);
    try {
      await createClub({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        is_public: formData.is_public,
      });
      
      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        is_public: true,
      });
      setOpen(false);
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Create Club
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create New Club
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Club Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter club name"
              required
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your club..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              {formData.is_public ? (
                <Globe className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-amber-600" />
              )}
              <div>
                <Label htmlFor="visibility" className="text-sm font-medium">
                  Club Visibility
                </Label>
                <p className="text-xs text-gray-600">
                  {formData.is_public 
                    ? 'Anyone can discover and join your club'
                    : 'Club is private and invite-only'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={formData.is_public ? "default" : "secondary"} className="text-xs">
                {formData.is_public ? "Public" : "Private"}
              </Badge>
              <Switch
                id="visibility"
                checked={formData.is_public}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? 'Creating...' : 'Create Club'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}