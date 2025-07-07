import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  GraduationCap, 
  Clock, 
  DollarSign, 
  Coins, 
  Plus, 
  X, 
  Star,
  Award,
  Target,
  Users,
  Trophy
} from 'lucide-react';
import { Club } from '@/hooks/useClubs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CoachService {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_tokens: number;
  price_money: number;
  service_type: 'individual' | 'group' | 'intensive' | 'assessment';
  max_participants: number;
  is_active: boolean;
  specializations: string[];
}

interface CoachServiceSetupProps {
  club: Club;
  isCoach: boolean;
}

const SERVICE_TYPES = [
  { value: 'individual', label: 'Individual Lesson', icon: Target },
  { value: 'group', label: 'Group Lesson', icon: Users },
  { value: 'intensive', label: 'Intensive Training', icon: Trophy },
  { value: 'assessment', label: 'Skills Assessment', icon: Award }
];

const SPECIALIZATIONS = [
  'Beginner Coaching',
  'Advanced Technique',
  'Singles Strategy',
  'Doubles Strategy',
  'Mental Game',
  'Fitness Training',
  'Junior Development',
  'Tournament Preparation',
  'Injury Prevention',
  'Serve & Volley',
  'Baseline Play',
  'Return of Serve'
];

export function CoachServiceSetup({ club, isCoach }: CoachServiceSetupProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<CoachService[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<CoachService | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [priceTokens, setPriceTokens] = useState('50');
  const [priceMoney, setPriceMoney] = useState('30');
  const [serviceType, setServiceType] = useState<'individual' | 'group' | 'intensive' | 'assessment'>('individual');
  const [maxParticipants, setMaxParticipants] = useState('1');
  const [isActive, setIsActive] = useState(true);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);

  useEffect(() => {
    fetchServices();
  }, [club.id, user?.id]);

  const fetchServices = async () => {
    if (!user?.id || !isCoach) return;

    try {
      // Mock data for coach services
      const mockServices: CoachService[] = [
        {
          id: '1',
          name: 'Individual Tennis Lesson',
          description: 'One-on-one coaching session focused on technique improvement',
          duration_minutes: 60,
          price_tokens: 75,
          price_money: 45,
          service_type: 'individual',
          max_participants: 1,
          is_active: true,
          specializations: ['Advanced Technique', 'Singles Strategy']
        },
        {
          id: '2',
          name: 'Group Training Session',
          description: 'Small group training for skill development and match play',
          duration_minutes: 90,
          price_tokens: 40,
          price_money: 25,
          service_type: 'group',
          max_participants: 4,
          is_active: true,
          specializations: ['Beginner Coaching', 'Group Dynamics']
        }
      ];

      setServices(mockServices);
    } catch (error) {
      console.error('Error fetching coach services:', error);
      toast.error('Failed to load services');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setDuration('60');
    setPriceTokens('50');
    setPriceMoney('30');
    setServiceType('individual');
    setMaxParticipants('1');
    setIsActive(true);
    setSelectedSpecializations([]);
    setEditingService(null);
  };

  const handleEdit = (service: CoachService) => {
    setName(service.name);
    setDescription(service.description);
    setDuration(service.duration_minutes.toString());
    setPriceTokens(service.price_tokens.toString());
    setPriceMoney(service.price_money.toString());
    setServiceType(service.service_type);
    setMaxParticipants(service.max_participants.toString());
    setIsActive(service.is_active);
    setSelectedSpecializations(service.specializations);
    setEditingService(service);
    setIsEditing(true);
  };

  const handleSaveService = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const serviceData: CoachService = {
        id: editingService?.id || `service-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        duration_minutes: parseInt(duration),
        price_tokens: parseInt(priceTokens),
        price_money: parseFloat(priceMoney),
        service_type: serviceType,
        max_participants: parseInt(maxParticipants),
        is_active: isActive,
        specializations: selectedSpecializations
      };

      if (editingService) {
        // Update existing service
        setServices(prev => prev.map(s => s.id === editingService.id ? serviceData : s));
        toast.success('Service updated successfully');
      } else {
        // Add new service
        setServices(prev => [...prev, serviceData]);
        toast.success('Service created successfully');
      }

      resetForm();
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      setServices(prev => prev.filter(s => s.id !== serviceId));
      toast.success('Service deleted successfully');
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const toggleSpecialization = (specialization: string) => {
    setSelectedSpecializations(prev =>
      prev.includes(specialization)
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    );
  };

  const getServiceTypeIcon = (type: string) => {
    const serviceType = SERVICE_TYPES.find(st => st.value === type);
    const Icon = serviceType?.icon || GraduationCap;
    return <Icon className="h-4 w-4" />;
  };

  if (!isCoach) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="font-medium mb-2">Coach Access Required</h3>
          <p className="text-sm text-muted-foreground">
            Only registered coaches can set up services.
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
          <h2 className="text-lg font-semibold text-tennis-green-dark">Coach Services</h2>
          <p className="text-sm text-tennis-green-medium">
            Manage your coaching services and pricing
          </p>
        </div>
        
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
        )}
      </div>

      {/* Service Creation/Edit Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingService ? 'Edit Service' : 'Create New Service'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Individual Tennis Lesson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Select value={serviceType} onValueChange={(value: any) => setServiceType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe what this service includes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Duration and Participants */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                    <SelectItem value="120">120 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">Max Participants</Label>
                <Select value={maxParticipants} onValueChange={setMaxParticipants}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 8].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price_tokens">Price (Tokens)</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="price_tokens"
                    type="number"
                    placeholder="50"
                    value={priceTokens}
                    onChange={(e) => setPriceTokens(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_money">Price (Money)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="price_money"
                    type="number"
                    step="0.01"
                    placeholder="30.00"
                    value={priceMoney}
                    onChange={(e) => setPriceMoney(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="space-y-3">
              <Label>Specializations</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <Badge
                    key={spec}
                    variant={selectedSpecializations.includes(spec) ? "default" : "outline"}
                    className="cursor-pointer justify-center p-2"
                    onClick={() => toggleSpecialization(spec)}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-3 bg-tennis-green-bg/30 rounded-lg">
              <div>
                <Label htmlFor="is_active">Service Active</Label>
                <p className="text-sm text-tennis-green-medium">
                  Active services can be booked by club members
                </p>
              </div>
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveService}
                disabled={loading || !name.trim() || !description.trim()}
                className="flex-1"
              >
                {loading ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Services */}
      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getServiceTypeIcon(service.service_type)}
                    <h3 className="font-semibold">{service.name}</h3>
                    {!service.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  
                  <p className="text-tennis-green-medium text-sm mb-3">
                    {service.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-tennis-green-medium" />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-tennis-green-medium" />
                      <span>Max {service.max_participants}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="h-3 w-3 text-tennis-green-medium" />
                      <span>{service.price_tokens} tokens</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-tennis-green-medium" />
                      <span>${service.price_money}</span>
                    </div>
                  </div>

                  {service.specializations.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {service.specializations.slice(0, 3).map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                        {service.specializations.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.specializations.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))

        }
        {services.length === 0 && !isEditing && (
          <Card>
            <CardContent className="p-8 text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2">No Services Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first coaching service to start accepting bookings
              </p>
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Service
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
