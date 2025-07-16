import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Activity,
  Clock,
  Crown,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useCourtBooking } from '@/hooks/useCourtBooking';
import { useTierEnforcement } from '@/hooks/useTierEnforcement';

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

interface CourtManagementProps {
  club: any;
  canManage: boolean;
}

const SURFACE_TYPES = [
  { value: 'hard', label: 'Hard Court' },
  { value: 'clay', label: 'Clay Court' },
  { value: 'grass', label: 'Grass Court' },
  { value: 'indoor', label: 'Indoor Court' }
];

export function CourtManagement({ club, canManage }: CourtManagementProps) {
  const { courts, loading, fetchCourts, createCourt, updateCourt, deleteCourt } = useCourtBooking();
  const { tierLimits, usageStatus, checkCanAddCourt, getUpgradeRecommendation } = useTierEnforcement(
    null, 
    null, 
    courts.length
  );
  
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
    if (club.id) {
      fetchCourts(club.id);
    }
  }, [club.id, fetchCourts]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Court name is required');
      return;
    }

    // Check if adding a new court
    if (!editingCourt) {
      const courtCheck = checkCanAddCourt();
      if (!courtCheck.allowed) {
        toast.error(courtCheck.reason);
        return;
      }
    }

    try {
      if (editingCourt) {
        await updateCourt(editingCourt.id, {
          name: formData.name,
          description: formData.description,
          surface_type: formData.surface_type,
          hourly_rate_tokens: formData.hourly_rate_tokens,
          hourly_rate_money: formData.hourly_rate_money,
          is_active: formData.is_active
        });
      } else {
        await createCourt(club.id, {
          name: formData.name,
          description: formData.description,
          surface_type: formData.surface_type,
          hourly_rate_tokens: formData.hourly_rate_tokens,
          hourly_rate_money: formData.hourly_rate_money
        });
      }

      resetForm();
      setShowAddDialog(false);
      setEditingCourt(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEdit = (court: Court) => {
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

  const handleDelete = async (court: Court) => {
    if (!confirm(`Are you sure you want to delete "${court.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteCourt(court.id);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const toggleCourtStatus = async (court: Court) => {
    try {
      await updateCourt(court.id, { is_active: !court.is_active });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Access restriction check
  if (!canManage) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Settings className="h-12 w-12 text-tennis-green-medium mx-auto mb-4" />
            <h3 className="text-lg font-medium text-tennis-green-dark mb-2">Access Restricted</h3>
            <p className="text-tennis-green-medium">You don't have permission to manage courts</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
                <MapPin className="h-5 w-5" />
                Court Management
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
                <span>{courts.length} of {tierLimits.courtLimit === Infinity ? '∞' : tierLimits.courtLimit} courts</span>
                {tierLimits.courtLimit !== Infinity && (
                  <Badge variant={courts.length >= tierLimits.courtLimit ? "destructive" : "secondary"}>
                    {tierLimits.courtLimit - courts.length} remaining
                  </Badge>
                )}
              </div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={resetForm} 
                  className="flex items-center gap-2"
                  disabled={courts.length >= tierLimits.courtLimit && tierLimits.courtLimit !== Infinity}
                >
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Court Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Center Court"
                      required
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
                        {SURFACE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
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
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddDialog(false);
                        setEditingCourt(null);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCourt ? 'Update Court' : 'Add Court'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Court limit warning */}
          {courts.length >= tierLimits.courtLimit && tierLimits.courtLimit !== Infinity && (
            <Alert className="mb-4">
              <Crown className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>You've reached your court limit. Upgrade to add more courts.</span>
                <Button 
                  size="sm" 
                  className="ml-4"
                  onClick={() => {
                    const recommendation = getUpgradeRecommendation();
                    if (recommendation.shouldUpgrade) {
                      // Navigate to economics page would be handled by parent
                      toast.info(`Upgrade to ${recommendation.suggestedTier || 'a higher tier'} for more courts`);
                    }
                  }}
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Upgrade
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-tennis-green-medium">Loading courts...</div>
            </div>
          ) : courts.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-tennis-green-medium mx-auto mb-4" />
              <h3 className="text-lg font-medium text-tennis-green-dark mb-2">No courts added yet</h3>
              <p className="text-tennis-green-medium mb-4">Add courts to start managing bookings</p>
              <Button 
                onClick={() => setShowAddDialog(true)}
                disabled={courts.length >= tierLimits.courtLimit && tierLimits.courtLimit !== Infinity}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Court
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Court count info */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-tennis-green-medium" />
                  <span className="text-sm text-tennis-green-medium">
                    {courts.filter(c => c.is_active).length} active courts • {courts.length} total
                  </span>
                </div>
                {tierLimits.courtLimit !== Infinity && (
                  <span className="text-sm text-tennis-green-medium">
                    Limit: {tierLimits.courtLimit}
                  </span>
                )}
              </div>

              {/* Courts grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courts.map((court) => (
                  <Card key={court.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-tennis-green-dark">{court.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={court.is_active ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => toggleCourtStatus(court)}
                          >
                            {court.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(court)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(court)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}