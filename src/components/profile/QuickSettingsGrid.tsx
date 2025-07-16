import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Bell, Shield, Award } from 'lucide-react';
import { ProfileEditDialog } from '@/components/profile/ProfileEditDialog';
import { NotificationSettingsDialog } from '@/components/profile/NotificationSettingsDialog';
import { PrivacySettingsDialog } from '@/components/profile/PrivacySettingsDialog';
import { UTRManagementCard } from '@/components/profile/UTRManagementCard';

interface QuickSettingsGridProps {
  profile: any;
  onProfileUpdate: () => void;
}

export function QuickSettingsGrid({ profile, onProfileUpdate }: QuickSettingsGridProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Edit className="h-5 w-5" />
            Quick Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ProfileEditDialog profile={profile} onProfileUpdate={onProfileUpdate}>
              <Button 
                variant="outline" 
                className="w-full border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </ProfileEditDialog>

            <NotificationSettingsDialog>
              <Button 
                variant="outline" 
                className="w-full border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </NotificationSettingsDialog>

            <PrivacySettingsDialog profile={profile} onProfileUpdate={onProfileUpdate}>
              <Button 
                variant="outline" 
                className="w-full border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
            </PrivacySettingsDialog>

            <Button 
              variant="outline" 
              className="w-full border-tennis-green-medium text-tennis-green-dark hover:bg-tennis-green-light/20"
              onClick={() => {/* Future: Open achievements dialog */}}
            >
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </Button>
          </div>
        </CardContent>
      </Card>

      <UTRManagementCard profile={profile} onProfileUpdate={onProfileUpdate} />
    </div>
  );
}