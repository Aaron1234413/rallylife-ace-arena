import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings,
  Plus,
  Edit,
  Coins,
  DollarSign,
  Users,
  Clock,
  Trophy
} from 'lucide-react';
import { CreateServiceDialog } from './CreateServiceDialog';
import { EditServiceDialog } from './EditServiceDialog';
import { HybridPaymentSelector } from '../../payments/HybridPaymentSelector';
import { useClubServices, ClubService } from '@/hooks/useClubServices';

interface ServicePricingManagerProps {
  club: {
    id: string;
    name: string;
  };
  canManage: boolean;
}

export function ServicePricingManager({ club, canManage }: ServicePricingManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<ClubService | null>(null);
  const { services, loading, updateService, deleteService } = useClubServices(club.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleEditService = (service: ClubService) => {
    setSelectedService(service);
    setShowEditDialog(true);
  };

  const handleSaveService = async (serviceId: string, updates: Partial<ClubService>) => {
    await updateService(serviceId, updates);
  };

  const handleDeleteService = async (serviceId: string) => {
    await deleteService(serviceId);
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'lesson': return Users;
      case 'tournament': return Trophy;
      case 'court_booking': return Clock;
      case 'coaching_session': return Settings;
      default: return Settings;
    }
  };

  const getServiceTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'tournament': return 'bg-red-100 text-red-800';
      case 'court_booking': return 'bg-green-100 text-green-800';
      case 'coaching_session': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Service Pricing Management
              </CardTitle>
              {canManage && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Service
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Manage pricing for club services, lessons, tournaments, and court bookings. 
              Set token prices, USD prices, or enable hybrid payments.
            </p>
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="space-y-4">
          {services.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No services configured yet.</p>
                {canManage && (
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="mt-2"
                  >
                    Create Your First Service
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            services.map((service) => {
              const Icon = getServiceIcon(service.service_type);
            
            return (
              <Card key={service.id} className={`${!service.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-blue-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {service.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Organized by {service.organizer_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getServiceTypeColor(service.service_type)}>
                            {service.service_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant={service.is_active ? 'default' : 'secondary'}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>Max {service.max_participants}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Coins className="h-4 w-4 text-emerald-500" />
                          <span>{service.price_tokens} tokens</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-green-500" />
                          <span>${(service.price_usd / 100).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Hybrid Payment Preview */}
                      {service.hybrid_payment_enabled && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Payment Options:</p>
                          <HybridPaymentSelector
                            tokenPrice={service.price_tokens}
                            usdPrice={service.price_usd}
                            onPaymentChange={() => {}}
                            disabled={true}
                            preview={true}
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          Hybrid payments: {service.hybrid_payment_enabled ? 'Enabled' : 'Disabled'}
                        </div>
                        {canManage && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-2"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit Service
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }))}
        </div>

        {/* Pricing Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pricing Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-medium text-emerald-900 mb-2">Token Pricing</h4>
                <p className="text-sm text-emerald-700">
                  Set competitive token prices to encourage use of club token pool. 
                  Remember: $1 = 100 tokens conversion rate.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Hybrid Payments</h4>
                <p className="text-sm text-blue-700">
                  Enable hybrid payments to give members flexibility. 
                  Members can pay with tokens, cash, or a combination.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-900 mb-2">Revenue Optimization</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Set token prices 10-15% lower than USD to encourage token usage</li>
                <li>• Use tournaments and events as token-only to drive engagement</li>
                <li>• Offer premium services with hybrid payment options</li>
                <li>• Monitor usage patterns and adjust pricing accordingly</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateServiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        club={club}
      />

      <EditServiceDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        service={selectedService}
        onSave={handleSaveService}
        onDelete={handleDeleteService}
      />
    </>
  );
}