import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Trophy, Settings, Calendar } from 'lucide-react';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

interface NotificationSettingsDialogProps {
  children?: React.ReactNode;
}

export function NotificationSettingsDialog({ children }: NotificationSettingsDialogProps) {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences();

  const handleToggle = (key: string, value: boolean) => {
    updatePreferences({ [key]: value });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="animate-pulse h-4 bg-gray-200 rounded w-32"></div>
                <div className="animate-pulse h-6 bg-gray-200 rounded w-10"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-blue-600" />
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={preferences?.email_notifications || false}
                onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
                disabled={isUpdating}
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-green-600" />
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Browser notifications</p>
                </div>
              </div>
              <Switch
                checked={preferences?.push_notifications || false}
                onCheckedChange={(checked) => handleToggle('push_notifications', checked)}
                disabled={isUpdating}
              />
            </div>

            {/* Match Requests */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-tennis-green-medium" />
                <div>
                  <Label className="text-base font-medium">Match Requests</Label>
                  <p className="text-xs text-muted-foreground">New match invitations</p>
                </div>
              </div>
              <Switch
                checked={preferences?.match_requests || false}
                onCheckedChange={(checked) => handleToggle('match_requests', checked)}
                disabled={isUpdating}
              />
            </div>

            {/* Achievements */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <div>
                  <Label className="text-base font-medium">Achievements</Label>
                  <p className="text-xs text-muted-foreground">Level ups and unlocks</p>
                </div>
              </div>
              <Switch
                checked={preferences?.achievements || false}
                onCheckedChange={(checked) => handleToggle('achievements', checked)}
                disabled={isUpdating}
              />
            </div>

            {/* System Updates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-4 w-4 text-gray-600" />
                <div>
                  <Label className="text-base font-medium">System Updates</Label>
                  <p className="text-xs text-muted-foreground">App updates and maintenance</p>
                </div>
              </div>
              <Switch
                checked={preferences?.system_updates || false}
                onCheckedChange={(checked) => handleToggle('system_updates', checked)}
                disabled={isUpdating}
              />
            </div>

            {/* Weekly Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-purple-600" />
                <div>
                  <Label className="text-base font-medium">Weekly Summary</Label>
                  <p className="text-xs text-muted-foreground">Weekly activity reports</p>
                </div>
              </div>
              <Switch
                checked={preferences?.weekly_summary || false}
                onCheckedChange={(checked) => handleToggle('weekly_summary', checked)}
                disabled={isUpdating}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}