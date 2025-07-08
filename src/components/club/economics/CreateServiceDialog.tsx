import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Settings,
  Coins,
  DollarSign,
  Users,
  Clock
} from 'lucide-react';

interface CreateServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: {
    id: string;
    name: string;
  };
}

export function CreateServiceDialog({ open, onOpenChange, club }: CreateServiceDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    service_type: '',
    price_tokens: 0,
    price_usd: 0,
    hybrid_payment_enabled: true,
    duration_minutes: 60,
    max_participants: 1,
    available_slots: 10
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Creating service:', formData);
    onOpenChange(false);
    // Reset form
    setFormData({
      name: '',
      description: '',
      service_type: '',
      price_tokens: 0,
      price_usd: 0,
      hybrid_payment_enabled: true,
      duration_minutes: 60,
      max_participants: 1,
      available_slots: 10
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-500" />
            Create New Service
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Private Tennis Lesson"
              required
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
                <SelectItem value="social">Social Play</SelectItem>
                <SelectItem value="court_booking">Court Booking</SelectItem>
                <SelectItem value="coaching_session">Coaching Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about the service..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration_minutes" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Duration (minutes)
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                min="15"
                step="15"
                required
              />
            </div>
            <div>
              <Label htmlFor="max_participants" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Max Participants
              </Label>
              <Input
                id="max_participants"
                type="number"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 1 })}
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="available_slots">Available Slots</Label>
            <Input
              id="available_slots"
              type="number"
              value={formData.available_slots}
              onChange={(e) => setFormData({ ...formData, available_slots: parseInt(e.target.value) || 0 })}
              min="1"
              placeholder="Number of available bookings"
              required
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Pricing</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_tokens" className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-emerald-500" />
                  Token Price
                </Label>
                <Input
                  id="price_tokens"
                  type="number"
                  value={formData.price_tokens}
                  onChange={(e) => setFormData({ ...formData, price_tokens: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="10"
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="price_usd" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  USD Price (cents)
                </Label>
                <Input
                  id="price_usd"
                  type="number"
                  value={formData.price_usd}
                  onChange={(e) => setFormData({ ...formData, price_usd: parseInt(e.target.value) || 0 })}
                  min="0"
                  step="50"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter in cents (e.g., 2500 = $25.00)
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hybrid_payment">Enable Hybrid Payments</Label>
                <p className="text-xs text-gray-500">
                  Allow customers to pay with tokens, USD, or combination
                </p>
              </div>
              <Switch
                id="hybrid_payment"
                checked={formData.hybrid_payment_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, hybrid_payment_enabled: checked })}
              />
            </div>

            {(formData.price_tokens > 0 && formData.price_usd > 0) && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  <strong>Token Equivalent:</strong> {formData.price_tokens} tokens = ${(formData.price_tokens / 100).toFixed(2)}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>USD Price:</strong> ${(formData.price_usd / 100).toFixed(2)}
                </p>
                {formData.price_usd > formData.price_tokens && (
                  <p className="text-xs text-blue-600 mt-1">
                    💡 Token price is {((1 - formData.price_tokens / formData.price_usd) * 100).toFixed(1)}% cheaper - encourages token usage!
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Service
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}