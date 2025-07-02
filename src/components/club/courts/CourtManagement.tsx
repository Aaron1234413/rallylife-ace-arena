import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin,
  DollarSign,
  Coins,
  Settings
} from 'lucide-react';
import { useCourtBooking, Court } from '@/hooks/useCourtBooking';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CourtManagementProps {
  club: any;
  canManage: boolean;
}

const SURFACE_TYPES = [
  { value: 'hard', label: 'Hard Court' },
  { value: 'clay', label: 'Clay Court' },
  { value: 'grass', label: 'Grass Court' },
  { value: 'indoor', label: 'Indoor Court' },
  { value: 'synthetic', label: 'Synthetic Court' }
];

export function CourtManagement({ club, canManage }: CourtManagementProps) {
  const { user } = useAuth();
  const { courts, loading, fetchCourts, createCourt, updateCourt, deleteCourt } = useCourtBooking();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    surface_type: 'hard',
    hourly_rate_tokens: 50,
    hourly_rate_money: 25.00,
    description: ''
  });

  useEffect(() => {
    if (club?.id) {
      fetchCourts(club.id);
    }
  }, [club?.id]);

  const resetForm = () => {
    setFormData({
      name: '',
      surface_type: 'hard',
      hourly_rate_tokens: 50,
      hourly_rate_money: 25.00,
      description: ''
    });
    setEditingCourt(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Court name is required');
      return;
    }

    try {
      if (editingCourt) {
        await updateCourt(editingCourt.id, {
          name: formData.name.trim(),
          surface_type: formData.surface_type,
          hourly_rate_tokens: formData.hourly_rate_tokens,
          hourly_rate_money: formData.hourly_rate_money,
          description: formData.description.trim() || undefined
        });
      } else {
        await createCourt(club.id, {
          name: formData.name.trim(),
          surface_type: formData.surface_type,
          hourly_rate_tokens: formData.hourly_rate_tokens,
          hourly_rate_money: formData.hourly_rate_money,
          description: formData.description.trim() || undefined
        });
      }
      
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (court: Court) => {
    setFormData({
      name: court.name,
      surface_type: court.surface_type,
      hourly_rate_tokens: court.hourly_rate_tokens,
      hourly_rate_money: court.hourly_rate_money,
      description: court.description || ''
    });
    setEditingCourt(court);
    setShowAddDialog(true);
  };

  const handleDelete = async (court: Court) => {
    if (!confirm(`Are you sure you want to delete "${court.name}"? This will also delete all bookings for this court.`)) {
      return;
    }

    try {
      await deleteCourt(court.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const toggleCourtStatus = async (court: Court) => {
    try {
      await updateCourt(court.id, { is_active: !court.is_active });
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!canManage) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground">
            Only club owners and admins can manage courts.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Court Management</h2>
          <p className="text-muted-foreground">
            Add and manage courts for your club
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Court
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCourt ? 'Edit Court' : 'Add New Court'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Court Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Court 1, Center Court"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surface">Surface Type</Label>
                <Select 
                  value={formData.surface_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, surface_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SURFACE_TYPES.map(surface => (
                      <SelectItem key={surface.value} value={surface.value}>
                        {surface.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokens">Hourly Rate (Tokens)</Label>
                  <Input
                    id="tokens"
                    type="number"
                    min="0"
                    value={formData.hourly_rate_tokens}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      hourly_rate_tokens: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="money">Hourly Rate ($)</Label>
                  <Input
                    id="money"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.hourly_rate_money}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      hourly_rate_money: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Additional details about this court..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCourt ? 'Update Court' : 'Create Court'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courts List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : courts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">No Courts Added</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first court to start accepting bookings
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Court
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((court) => (
            <Card key={court.id} className={!court.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {SURFACE_TYPES.find(s => s.value === court.surface_type)?.label || court.surface_type}
                      </Badge>
                      <Badge variant={court.is_active ? "default" : "secondary"}>
                        {court.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(court)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(court)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{court.hourly_rate_tokens} tokens/hr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">${court.hourly_rate_money}/hr</span>
                    </div>
                  </div>

                  {court.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {court.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={court.is_active}
                        onCheckedChange={() => toggleCourtStatus(court)}
                      />
                      <span className="text-sm text-gray-600">
                        {court.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}