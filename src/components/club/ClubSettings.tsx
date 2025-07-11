import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  Info, 
  Users, 
  MapPin,
  Clock,
  Crown,
  Share2,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { Club, useClubs } from '@/hooks/useClubs';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useClubSubscription } from '@/hooks/useClubSubscription';
import { useSubscriptionTiers } from '@/hooks/useSubscriptionTiers';
import { useTierEnforcement } from '@/hooks/useTierEnforcement';
import { SubscriptionStatus } from './SubscriptionStatus';
import { TierUpgradeModal } from './TierUpgradeModal';
import { UsageLimitWarning } from './UsageLimitWarning';
import { OperatingHoursEditor, OperatingHours } from './OperatingHoursEditor';
import { LocationInput } from '@/components/ui/location-input';
import { ClubInvitationManager } from './ClubInvitationManager';
import { CourtOperatingHours } from './CourtOperatingHours';
import { validateBookingTime } from '@/utils/operatingHoursValidation';
// import { MemberManagementPanel } from '../management/MemberManagementPanel';
// import { CourtManagementPanel } from '../management/CourtManagementPanel';

interface ClubSettingsProps {
  club: Club;
  onSettingsUpdate?: () => void;
  onNavigateToEconomics?: () => void;
}

export function ClubSettings({ club, onSettingsUpdate, onNavigateToEconomics }: ClubSettingsProps) {
  const { user } = useAuth();
  const { updateClub } = useClubs();
  const { subscription, usage, updateUsageTracking, upgradeSubscription, openCustomerPortal } = useClubSubscription(club.id);
  const { tiers } = useSubscriptionTiers();
  const [formData, setFormData] = useState({
    name: club.name,
    description: club.description || '',
    location: club.location || '',
    is_private: club.is_private ?? true,
    logo_url: club.logo_url || '',
    court_count: club.court_count || 1,
    coach_slots: club.coach_slots || 1,
    operating_hours: club.operating_hours || {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '08:00', close: '20:00' },
      sunday: { open: '08:00', close: '20:00' }
    }
  });
  const { tierLimits, usageStatus, checkCanAddCoach, checkCanAddCourt, getUpgradeRecommendation } = useTierEnforcement(subscription, usage, formData.court_count);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  const isOwner = user?.id === club.owner_id;
  
  // TODO: Get these from club membership permissions
  const canManageMembers = isOwner; // Temporary - should come from membership permissions
  const canEditClub = isOwner; // Temporary - should come from membership permissions

  // Get current tier info
  const currentTier = tiers.find(tier => tier.id === subscription?.tier_id) || { 
    id: 'community', 
    name: 'Community',
    member_limit: 50,
    coach_limit: 1,
    features: []
  };
  
  // Get max courts from tier limits (use actual subscription-based limits)
  const maxCourts = tierLimits.courtLimit === Infinity ? 999 : tierLimits.courtLimit;

  const validateSettings = () => {
    const courtCheck = checkCanAddCourt();
    const coachCheck = checkCanAddCoach();
    
    // Validate court count against tier limits
    if (formData.court_count > maxCourts) {
      if (!courtCheck.allowed) {
        toast.error(courtCheck.reason || `Your ${currentTier.name} plan allows up to ${maxCourts} courts. Upgrade to add more.`);
        onNavigateToEconomics?.();
        return false;
      }
    }
    
    // Validate coach slots against tier limits  
    if (formData.coach_slots > tierLimits.coachLimit) {
      if (!coachCheck.allowed) {
        toast.error(coachCheck.reason || `Your ${currentTier.name} plan allows up to ${tierLimits.coachLimit} coaches. Upgrade to add more.`);
        onNavigateToEconomics?.();
        return false;
      }
    }
    
    if (!formData.name.trim()) {
      toast.error('Club name is required');
      return false;
    }

    // Validate operating hours - ensure they're valid time ranges
    for (const [day, hours] of Object.entries(formData.operating_hours)) {
      if (hours && typeof hours === 'object' && 'open' in hours && 'close' in hours) {
        const openTime = hours.open;
        const closeTime = hours.close;
        
        if (openTime && closeTime && typeof openTime === 'string' && typeof closeTime === 'string') {
          // Simple validation to ensure close time is after open time
          const [openHour, openMin] = openTime.split(':').map(Number);
          const [closeHour, closeMin] = closeTime.split(':').map(Number);
          const openMinutes = openHour * 60 + openMin;
          const closeMinutes = closeHour * 60 + closeMin;
          
          if (closeMinutes <= openMinutes) {
            toast.error(`Invalid operating hours for ${day}: Close time must be after open time`);
            return false;
          }
        }
      }
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateSettings()) return;
    
    setIsUpdating(true);
    try {
      await updateClub(club.id, {
        name: formData.name.trim(),
        description: formData.description,
        location: formData.location,
        is_private: formData.is_private,
        logo_url: formData.logo_url,
        court_count: formData.court_count,
        coach_slots: formData.coach_slots,
        operating_hours: formData.operating_hours
      });
      
      // Trigger usage tracking update after successful save
      await updateUsageTracking();
      onSettingsUpdate?.();
      
      // Show success feedback with location info if updated
      const locationUpdated = formData.location !== (club.location || '');
      toast.success('Club settings saved successfully!', {
        description: locationUpdated 
          ? 'Your changes have been applied. Location will be visible on your club page.'
          : 'Your changes have been applied and are now visible across the platform.'
      });
    } catch (error) {
      console.error('Error updating club:', error);
      toast.error('Failed to save settings', {
        description: 'Please try again or contact support if the problem persists.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    // Mock delete functionality
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Club deleted successfully');
    // Would redirect to dashboard in real implementation
    console.log('Deleting club:', club.id);
  };

  const hasChanges = 
    formData.name !== club.name ||
    formData.description !== (club.description || '') ||
    formData.location !== (club.location || '') ||
    formData.is_private !== (club.is_private ?? true) ||
    formData.logo_url !== (club.logo_url || '') ||
    formData.court_count !== (club.court_count || 1) ||
    formData.coach_slots !== (club.coach_slots || 1) ||
    JSON.stringify(formData.operating_hours) !== JSON.stringify(club.operating_hours || {});

  // Get upgrade recommendation
  const upgradeRecommendation = getUpgradeRecommendation();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-First Header with Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-tennis-green-dark flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Club Settings
          </h2>
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Unsaved Changes
            </Badge>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm">
          <Badge className="bg-tennis-green-primary text-white capitalize self-start">
            {currentTier.name} Plan
          </Badge>
          <span className="text-tennis-green-medium">
            {maxCourts === 999 ? '∞' : maxCourts} courts • {tierLimits.coachLimit} coaches • {tierLimits.memberLimit} members
          </span>
        </div>
        
        <p className="text-sm text-tennis-green-medium">
          Manage your club&apos;s information and preferences
        </p>
      </div>

      {/* Usage Limit Warning - Show if approaching/at limits */}
      {upgradeRecommendation.shouldUpgrade && (
        <UsageLimitWarning
          subscription={subscription}
          usage={usage}
          onUpgrade={() => setShowUpgradeModal(true)}
          compact={true}
        />
      )}

      {/* Mobile-First: Save Actions at Top */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSave}
                disabled={isUpdating || !formData.name.trim()}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: club.name,
                    description: club.description || '',
                    location: club.location || '',
                    is_private: true, // Always private
                    logo_url: club.logo_url || '',
                    court_count: club.court_count || 1,
                    coach_slots: club.coach_slots || 1,
                    operating_hours: club.operating_hours || {
                      monday: { open: '06:00', close: '22:00' },
                      tuesday: { open: '06:00', close: '22:00' },
                      wednesday: { open: '06:00', close: '22:00' },
                      thursday: { open: '06:00', close: '22:00' },
                      friday: { open: '06:00', close: '22:00' },
                      saturday: { open: '08:00', close: '20:00' },
                      sunday: { open: '08:00', close: '20:00' }
                    }
                  });
                }}
                disabled={isUpdating}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabbed Settings Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-1 text-xs sm:text-sm">
            <Info className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Basic</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center gap-1 text-xs sm:text-sm">
            <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Members</span>
          </TabsTrigger>
          <TabsTrigger value="facilities" className="flex items-center gap-1 text-xs sm:text-sm">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Facilities</span>
          </TabsTrigger>
          {isOwner && (
            <TabsTrigger value="subscription" className="flex items-center gap-1 text-xs sm:text-sm">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
          )}
          {isOwner && (
            <TabsTrigger value="danger" className="flex items-center gap-1 text-xs sm:text-sm">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Danger</span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-tennis-green-dark flex items-center gap-2">
                <Info className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Club Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isUpdating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your club's mission, activities, and what makes it special..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  disabled={isUpdating}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Club Location</Label>
                <LocationInput
                  value={formData.location ? { address: formData.location } : null}
                  onChange={(locationData) => setFormData(prev => ({ ...prev, location: locationData?.address || '' }))}
                  placeholder="Club address or location"
                  disabled={isUpdating}
                />
                <p className="text-xs text-tennis-green-medium">
                  Help members find your club's physical location
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Club Logo URL</Label>
                <Input
                  id="logo"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                  disabled={isUpdating}
                />
                <p className="text-xs text-tennis-green-medium">
                  Provide a URL to your club&apos;s logo image
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <div className="space-y-6">
            <ClubInvitationManager
              clubId={club.id}
              isPrivate={true} // Always private
              onPrivacyChange={() => {}} // No-op since clubs are always private
            />
            {/* <MemberManagementPanel 
              clubId={club.id}
              canManage={canManageMembers || canEditClub}
            /> */}
          </div>
        </TabsContent>

        <TabsContent value="facilities" className="mt-6">
          <div className="space-y-6">
            {/* Court Management */}
            {/* <CourtManagementPanel 
              clubId={club.id}
              canManage={canManageMembers || canEditClub}
            /> */}
            
            {/* Operating Hours */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Set Operating Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OperatingHoursEditor
                    operatingHours={formData.operating_hours as OperatingHours}
                    onOperatingHoursChange={(hours) => setFormData(prev => ({ ...prev, operating_hours: hours }))}
                    disabled={isUpdating}
                  />
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        Operating hours determine when courts can be booked. 
                        Members can only make reservations during these times.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Operating Hours Preview */}
              <CourtOperatingHours 
                operatingHours={formData.operating_hours as OperatingHours}
              />
            </div>

            {/* Club Capacity */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Club Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="court_count">Number of Courts</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-tennis-green-medium">Max: {maxCourts === 999 ? '∞' : maxCourts}</span>
                        {formData.court_count >= maxCourts && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onNavigateToEconomics?.()}
                            className="text-xs h-6 px-2"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Upgrade
                          </Button>
                        )}
                      </div>
                    </div>
                    <Input
                      id="court_count"
                      type="number"
                      min="1"
                      max={maxCourts}
                      value={formData.court_count}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        if (value <= maxCourts) {
                          setFormData(prev => ({ ...prev, court_count: value }));
                        } else {
                          toast.error(`Your ${currentTier.name} plan allows up to ${maxCourts} courts`);
                          onNavigateToEconomics?.();
                        }
                      }}
                      disabled={isUpdating}
                      className={formData.court_count > maxCourts ? 'border-red-300' : ''}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="coach_slots">Coach Slots</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-tennis-green-medium">Max: {tierLimits.coachLimit}</span>
                        {formData.coach_slots >= tierLimits.coachLimit && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onNavigateToEconomics?.()}
                            className="text-xs h-6 px-2"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Upgrade
                          </Button>
                        )}
                      </div>
                    </div>
                    <Input
                      id="coach_slots"
                      type="number"
                      min="1"
                      max={tierLimits.coachLimit}
                      value={formData.coach_slots}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        if (value <= tierLimits.coachLimit) {
                          setFormData(prev => ({ ...prev, coach_slots: value }));
                        } else {
                          toast.error(`Your ${currentTier.name} plan allows up to ${tierLimits.coachLimit} coaches`);
                          onNavigateToEconomics?.();
                        }
                      }}
                      disabled={isUpdating}
                      className={formData.coach_slots > tierLimits.coachLimit ? 'border-red-300' : ''}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isOwner && (
          <TabsContent value="subscription" className="mt-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-tennis-green-primary" />
                  Subscription & Billing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SubscriptionStatus
                  clubId={club.id}
                  subscription={subscription}
                  usage={usage}
                  onUpgrade={() => setShowUpgradeModal(true)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isOwner && (
          <TabsContent value="danger" className="mt-6">
            <Card className="border-red-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">Delete Club</h4>
                  <p className="text-sm text-red-700 mb-3">
                    Once you delete a club, there is no going back. All members will be removed 
                    and all data will be permanently deleted.
                  </p>
                  
                  {!showDeleteConfirm ? (
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="text-red-700 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Club
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-800">
                        Are you absolutely sure? This action cannot be undone.
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
                          size="sm"
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Yes, Delete Club
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Bottom Save Actions */}
      {hasChanges && (
        <Card className="border-tennis-green-primary/30 bg-tennis-green-bg/30">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSave}
                disabled={isUpdating || !formData.name.trim()}
                className="flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setFormData({
                    name: club.name,
                    description: club.description || '',
                    location: club.location || '',
                    is_private: true, // Always private
                    logo_url: club.logo_url || '',
                    court_count: club.court_count || 1,
                    coach_slots: club.coach_slots || 1,
                    operating_hours: club.operating_hours || {
                      monday: { open: '06:00', close: '22:00' },
                      tuesday: { open: '06:00', close: '22:00' },
                      wednesday: { open: '06:00', close: '22:00' },
                      thursday: { open: '06:00', close: '22:00' },
                      friday: { open: '06:00', close: '22:00' },
                      saturday: { open: '08:00', close: '20:00' },
                      sunday: { open: '08:00', close: '20:00' }
                    }
                  });
                }}
                disabled={isUpdating}
                className="flex-1 sm:flex-initial"
              >
                Cancel
              </Button>
            </div>
            
            <p className="text-xs text-tennis-green-medium mt-3 text-center">
              Changes will be saved to your club profile and visible to all members
            </p>
          </CardContent>
        </Card>
      )}


      {/* Upgrade Modal */}
      <TierUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        clubId={club.id}
        currentSubscription={subscription}
      />
    </div>
  );
}