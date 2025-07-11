import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClubService } from '@/hooks/useClubServices';

interface EditServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ClubService | null;
  onSave: (serviceId: string, updates: Partial<ClubService>) => Promise<void>;
  onDelete: (serviceId: string) => Promise<void>;
}

export function EditServiceDialog({ 
  open, 
  onOpenChange, 
  service, 
  onSave, 
  onDelete 
}: EditServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_type: '',
    price_tokens: 0,
    price_usd: 0,
    hybrid_payment_enabled: true,
    duration_minutes: 60,
    max_participants: 1,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || '',
        service_type: service.service_type,
        price_tokens: service.price_tokens,
        price_usd: service.price_usd,
        hybrid_payment_enabled: service.hybrid_payment_enabled,
        duration_minutes: service.duration_minutes || 60,
        max_participants: service.max_participants || 1,
        is_active: service.is_active
      });
    }
  }, [service]);

  const handleSave = async () => {
    if (!service) return;
    
    setLoading(true);
    try {
      await onSave(service.id, formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!service) return;
    
    setLoading(true);
    try {
      await onDelete(service.id);
      onOpenChange(false);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting service:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Service</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Private Tennis Lesson"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the service"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="service_type">Service Type</Label>
            <Select 
              value={formData.service_type} 
              onValueChange={(value) => setFormData({ ...formData, service_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson">Lesson</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
                <SelectItem value="court_booking">Court Booking</SelectItem>
                <SelectItem value="coaching_session">Coaching Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_tokens">Token Price</Label>
              <Input
                id="price_tokens"
                type="number"
                value={formData.price_tokens}
                onChange={(e) => setFormData({ ...formData, price_tokens: parseInt(e.target.value) || 0 })}
                placeholder="500"
              />
            </div>
            <div>
              <Label htmlFor="price_usd">USD Price (cents)</Label>
              <Input
                id="price_usd"
                type="number"
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: parseInt(e.target.value) || 0 })}
                placeholder="2500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                ${(formData.price_usd / 100).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                placeholder="60"
              />
            </div>
            <div>
              <Label htmlFor="max_participants">Max Participants</Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="hybrid_payment">Hybrid Payment</Label>
            <Switch
              id="hybrid_payment"
              checked={formData.hybrid_payment_enabled}
              onCheckedChange={(checked) => setFormData({ ...formData, hybrid_payment_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active Service</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
          >
            Delete
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-background border rounded-lg p-6 max-w-sm">
              <h3 className="font-semibold mb-2">Delete Service</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Are you sure you want to delete this service? This action will deactivate it.
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
                  variant="destructive" 
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}