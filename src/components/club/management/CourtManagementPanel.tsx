import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Activity,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Court {
  id: string;
  name: string;
  description?: string;
  surface_type: string;
  hourly_rate_tokens: number;
  hourly_rate_money?: number;
  is_active: boolean;
  created_at: string;
}

interface CourtManagementPanelProps {
  clubId: string;
  canManage: boolean;
}

export function CourtManagementPanel({ clubId, canManage }: CourtManagementPanelProps) {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    surface_type: 'hard',
    hourly_rate_tokens: 50,
    hourly_rate_money: 0,
    is_active: true
  });

  useEffect(() => {
    fetchCourts();
  }, [clubId]);

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('club_courts')
        .select('*')
        .eq('club_id', clubId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCourts(data || []);
    } catch (error) {
      console.error('Error fetching courts:', error);
      toast.error('Failed to load courts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Court name is required');
      return;
    }

    try {
      if (editingCourt) {
        const { error } = await supabase
          .from('club_courts')
          .update({
            name: formData.name,
            description: formData.description,
            surface_type: formData.surface_type,
            hourly_rate_tokens: formData.hourly_rate_tokens,
            hourly_rate_money: formData.hourly_rate_money,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingCourt.id);

        if (error) throw error;
        toast.success('Court updated successfully');
      } else {
        const { error } = await supabase
          .from('club_courts')
          .insert({
            club_id: clubId,
            name: formData.name,
            description: formData.description,
            surface_type: formData.surface_type,
            hourly_rate_tokens: formData.hourly_rate_tokens,
            hourly_rate_money: formData.hourly_rate_money,
            is_active: formData.is_active
          });

        if (error) throw error;
        toast.success('Court added successfully');
      }

      fetchCourts();
      resetForm();
      setShowAddDialog(false);
      setEditingCourt(null);
    } catch (error) {
      console.error('Error saving court:', error);
      toast.error('Failed to save court');
    }
  };

  const handleDelete = async (courtId: string) => {
    if (!confirm('Are you sure you want to delete this court?')) return;

    try {
      const { error } = await supabase
        .from('club_courts')
        .delete()
        .eq('id', courtId);

      if (error) throw error;
      toast.success('Court deleted successfully');
      fetchCourts();
    } catch (error) {
      console.error('Error deleting court:', error);
      toast.error('Failed to delete court');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      surface_type: 'hard',
      hourly_rate_tokens: 50,
      hourly_rate_money: 0,
      is_active: true
    });
  };

  const openEditDialog = (court: Court) => {
    setEditingCourt(court);
    setFormData({
      name: court.name,
      description: court.description || '',
      surface_type: court.surface_type,
      hourly_rate_tokens: court.hourly_rate_tokens,
      hourly_rate_money: court.hourly_rate_money || 0,
      is_active: court.is_active
    });
    setShowAddDialog(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-tennis-green-medium">Loading courts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <MapPin className="h-5 w-5" />
              Court Management
            </CardTitle>
            {canManage && (
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Court
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCourt ? 'Edit Court' : 'Add New Court'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Court Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Center Court"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Court description or features"
                      />
                    </div>
                    <div>
                      <Label htmlFor="surface">Surface Type</Label>
                      <Select value={formData.surface_type} onValueChange={(value) => setFormData(prev => ({ ...prev, surface_type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hard">Hard Court</SelectItem>
                          <SelectItem value="clay">Clay Court</SelectItem>
                          <SelectItem value="grass">Grass Court</SelectItem>
                          <SelectItem value="indoor">Indoor Court</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tokens">Rate (Tokens/hour)</Label>
                        <Input
                          id="tokens"
                          type="number"
                          min="0"
                          value={formData.hourly_rate_tokens}
                          onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate_tokens: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="money">Rate ($/hour)</Label>
                        <Input
                          id="money"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.hourly_rate_money}
                          onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate_money: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="active">Court is active</Label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddDialog(false);
                          setEditingCourt(null);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit}>
                        {editingCourt ? 'Update Court' : 'Add Court'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {courts.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-tennis-green-medium mx-auto mb-4" />
              <h3 className="text-lg font-medium text-tennis-green-dark mb-2">No courts added yet</h3>
              <p className="text-tennis-green-medium mb-4">Add courts to start managing bookings</p>
              {canManage && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Court
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courts.map((court) => (
                <Card key={court.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-tennis-green-dark">{court.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant={court.is_active ? 'default' : 'secondary'}>
                          {court.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {canManage && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(court)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(court.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {court.description && (
                      <p className="text-sm text-tennis-green-medium">{court.description}</p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="h-4 w-4 text-tennis-green-medium" />
                        <span className="capitalize">{court.surface_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-tennis-green-medium" />
                        <span>{court.hourly_rate_tokens} tokens/hour</span>
                        {court.hourly_rate_money && court.hourly_rate_money > 0 && (
                          <span className="text-tennis-green-medium">or ${court.hourly_rate_money}/hour</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}