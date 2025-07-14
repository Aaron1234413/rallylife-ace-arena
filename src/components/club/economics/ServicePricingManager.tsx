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
  Trophy,
  Trash2
} from 'lucide-react';
import { CreateServiceDialog } from './CreateServiceDialog';
import { EditServiceDialog } from './EditServiceDialog';
import { HybridPaymentSelector } from '../../payments/HybridPaymentSelector';
import { useClubServices, ClubService } from '@/hooks/useClubServices';
import { LoadingSpinner, EmptyState } from '@/components/ui/error-boundary';
import { toast } from 'sonner';

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
    return <LoadingSpinner message="Loading club services..." />;
  }

  const handleEditService = (service: ClubService) => {
    setSelectedService(service);
    setShowEditDialog(true);
  };

  const handleSaveService = async (serviceId: string, updates: Partial<ClubService>) => {
    try {
      await updateService(serviceId, updates);
      toast.success('Service updated successfully!');
    } catch (error) {
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    try {
      await deleteService(serviceId);
      toast.success('Service deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  if (!services || services.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-tennis-green-dark">Service Pricing</h3>
            <p className="text-sm text-tennis-green-medium">Manage your club's services and pricing</p>
          </div>
          {canManage && (
            <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 hover-scale">
              <Plus className="h-4 w-4" />
              Add New Service
            </Button>
          )}
        </div>

        <EmptyState
          icon={Trophy}
          title="No services yet"
          description="Start by creating your first service offering for club members."
          action={canManage ? {
            label: "Create First Service",
            onClick: () => setShowCreateDialog(true)
          } : undefined}
        />

        {canManage && (
          <>
            <CreateServiceDialog
              open={showCreateDialog}
              onOpenChange={setShowCreateDialog}
              club={club}
            />
            {selectedService && (
              <EditServiceDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                service={selectedService}
                onSave={handleSaveService}
                onDelete={handleDeleteService}
              />
            )}
          </>
        )}
      </div>
    );
  }

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-tennis-green-dark">Service Pricing</h3>
          <p className="text-sm text-tennis-green-medium">Manage your club's services and pricing</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2 hover-scale">
            <Plus className="h-4 w-4" />
            Add New Service
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:gap-6">
        {services.map((service) => (
          <Card key={service.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-200 hover-scale">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-lg text-tennis-green-dark">{service.name}</CardTitle>
                    <Badge 
                      variant={service.is_active ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {service.service_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  {service.description && (
                    <p className="text-sm text-tennis-green-medium mt-2 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>

                {canManage && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditService(service)}
                      className="flex items-center gap-2 hover-scale"
                    >
                      <Edit className="h-3 w-3" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover-scale"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-tennis-green-medium" />
                  <span className="text-tennis-green-dark">{service.duration_minutes || 60} min</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-tennis-green-medium" />
                  <span className="text-tennis-green-dark">Max {service.max_participants || 1}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="h-4 w-4 text-emerald-500" />
                  <span className="text-tennis-green-dark">{service.price_tokens} tokens</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-tennis-green-dark">${(service.price_usd || 0).toFixed(2)}</span>
                </div>
              </div>

              {service.hybrid_payment_enabled && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Payment Options:</p>
                  <HybridPaymentSelector
                    tokenPrice={service.price_tokens}
                    usdPrice={service.price_usd || 0} // Already in dollars
                    onPaymentChange={() => {}}
                    disabled={true}
                    preview={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pricing Guidelines */}
      <Card className="shadow-lg border-0">
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

      <CreateServiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        club={club}
      />

      {selectedService && (
        <EditServiceDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          service={selectedService}
          onSave={handleSaveService}
          onDelete={handleDeleteService}
        />
      )}
    </div>
  );
}