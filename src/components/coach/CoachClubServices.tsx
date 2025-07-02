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
  Users,
  DollarSign,
  Coins,
  Clock,
  GraduationCap
} from 'lucide-react';
import { useCoachServices, CoachService } from '@/hooks/useCoachServices';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CoachClubServicesProps {
  club: any;
  canManage: boolean;
}

const SERVICE_TYPES = [
  { value: 'lesson', label: 'Private Lesson' },
  { value: 'training', label: 'Training Session' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'assessment', label: 'Skill Assessment' },
  { value: 'group', label: 'Group Session' }
];

export function CoachClubServices({ club, canManage }: CoachClubServicesProps) {
  const { user } = useAuth();
  const { services, loading, fetchServices, createService, updateService, deleteService } = useCoachServices();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState<CoachService | null>(null);
  const [formData, setFormData] = useState({
    service_type: 'lesson',
    title: '',
    description: '',
    rate_tokens: 50,
    rate_money: 25.00,
    duration_minutes: 60,
    max_participants: 1
  });

  useEffect(() => {
    if (club?.id && user?.id) {
      fetchServices(club.id, user.id);
    }
  }, [club?.id, user?.id]);

  const resetForm = () => {
    setFormData({
      service_type: 'lesson',
      title: '',
      description: '',
      rate_tokens: 50,
      rate_money: 25.00,
      duration_minutes: 60,
      max_participants: 1
    });
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Service title is required');
      return;
    }

    if (formData.rate_tokens === 0 && formData.rate_money === 0) {
      toast.error('At least one payment method must have a rate greater than 0');
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService.id, {
          service_type: formData.service_type,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          rate_tokens: formData.rate_tokens,
          rate_money: formData.rate_money,
          duration_minutes: formData.duration_minutes,
          max_participants: formData.max_participants
        });
      } else {
        await createService({
          club_id: club.id,
          service_type: formData.service_type,
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          rate_tokens: formData.rate_tokens,
          rate_money: formData.rate_money,
          duration_minutes: formData.duration_minutes,
          max_participants: formData.max_participants
        });
      }
      
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (service: CoachService) => {
    setFormData({
      service_type: service.service_type,
      title: service.title,
      description: service.description || '',
      rate_tokens: service.rate_tokens,
      rate_money: service.rate_money,
      duration_minutes: service.duration_minutes,
      max_participants: service.max_participants
    });
    setEditingService(service);
    setShowAddDialog(true);
  };

  const handleDelete = async (service: CoachService) => {
    if (!confirm(`Are you sure you want to delete "${service.title}"?`)) {
      return;
    }

    try {
      await deleteService(service.id);
    } catch (error) {
      // Error handled by hook
    }
  };

  const toggleServiceStatus = async (service: CoachService) => {
    try {
      await updateService(service.id, { is_active: !service.is_active });
    } catch (error) {
      // Error handled by hook
    }
  };

  if (!canManage) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">Coach Services</h3>
          <p className="text-sm text-muted-foreground">
            Only coaches can manage their services in this club.
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
          <h2 className="text-2xl font-bold">My Coaching Services</h2>
          <p className="text-muted-foreground">
            Manage your coaching services for {club.name}
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Select 
                  value={formData.service_type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, service_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Beginner Tennis Lesson"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what's included in this service..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      duration_minutes: parseInt(e.target.value) || 60 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="participants">Max Participants</Label>
                  <Input
                    id="participants"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_participants}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      max_participants: parseInt(e.target.value) || 1 
                    }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokens">Rate (Tokens)</Label>
                  <Input
                    id="tokens"
                    type="number"
                    min="0"
                    value={formData.rate_tokens}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      rate_tokens: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="money">Rate ($)</Label>
                  <Input
                    id="money"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rate_money}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      rate_money: parseFloat(e.target.value) || 0 
                    }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingService ? 'Update Service' : 'Create Service'}
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

      {/* Services List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="font-medium mb-2">No Services Added</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first coaching service to start accepting bookings
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className={!service.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="capitalize">
                        {SERVICE_TYPES.find(t => t.value === service.service_type)?.label || service.service_type}
                      </Badge>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Max {service.max_participants}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{service.rate_tokens} tokens</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">${service.rate_money}</span>
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={service.is_active}
                        onCheckedChange={() => toggleServiceStatus(service)}
                      />
                      <span className="text-sm text-gray-600">
                        {service.is_active ? 'Active' : 'Inactive'}
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