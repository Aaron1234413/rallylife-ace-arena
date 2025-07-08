import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Bell, DollarSign, TrendingDown, Settings } from 'lucide-react';
import { OverdraftAlert } from '@/types/club';
import { toast } from 'sonner';

interface OverdraftMonitoringProps {
  clubId: string;
}

const mockOverdraftAlerts: OverdraftAlert[] = [
  {
    id: '1',
    club_id: 'club1',
    alert_type: 'warning',
    threshold_percentage: 80,
    current_overdraft: 400,
    max_overdraft_allowed: 500,
    triggered_at: '2024-01-07T10:30:00Z'
  },
  {
    id: '2',
    club_id: 'club1',
    alert_type: 'critical',
    threshold_percentage: 95,
    current_overdraft: 475,
    max_overdraft_allowed: 500,
    triggered_at: '2024-01-07T14:15:00Z'
  }
];

interface OverdraftSettings {
  max_overdraft_allowed: number;
  warning_threshold: number;
  critical_threshold: number;
  auto_purchase_enabled: boolean;
  emergency_contact_email: string;
}

export function OverdraftMonitoring({ clubId }: OverdraftMonitoringProps) {
  const [alerts] = useState<OverdraftAlert[]>(mockOverdraftAlerts);
  const [settings, setSettings] = useState<OverdraftSettings>({
    max_overdraft_allowed: 500,
    warning_threshold: 80,
    critical_threshold: 95,
    auto_purchase_enabled: false,
    emergency_contact_email: 'admin@club.com'
  });
  const [saving, setSaving] = useState(false);

  const currentOverdraft = 400; // This would come from the current token pool
  const overdraftPercentage = (currentOverdraft / settings.max_overdraft_allowed) * 100;

  const updateSettings = (field: keyof OverdraftSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // In real implementation, save to database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Overdraft settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'limit_reached': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'limit_reached': return <TrendingDown className="h-4 w-4 text-red-800" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Overdraft Status */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className={currentOverdraft > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Current Overdraft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-red-600">
                {currentOverdraft.toLocaleString()} tokens
              </div>
              <Progress 
                value={overdraftPercentage} 
                className="h-2"
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {overdraftPercentage.toFixed(1)}% of limit
                </span>
                <span className="font-medium">
                  Limit: {settings.max_overdraft_allowed.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-red-600">
                ${(currentOverdraft * 0.007).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">outstanding debt</div>
              <div className="text-xs">
                <span className="text-gray-500">Rate: </span>
                <span className="font-medium">$0.007/token</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {alerts.filter(a => !a.resolved_at).length}
              </div>
              <div className="text-xs text-gray-500">unresolved alerts</div>
              {alerts.filter(a => !a.resolved_at).length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Action Required
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdraft Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Overdraft Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="max-overdraft">Maximum Overdraft Allowed</Label>
                <Input
                  id="max-overdraft"
                  type="number"
                  value={settings.max_overdraft_allowed}
                  onChange={(e) => updateSettings('max_overdraft_allowed', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum tokens that can be spent beyond pool balance
                </p>
              </div>

              <div>
                <Label htmlFor="warning-threshold">Warning Threshold (%)</Label>
                <Input
                  id="warning-threshold"
                  type="number"
                  value={settings.warning_threshold}
                  onChange={(e) => updateSettings('warning_threshold', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Send warning when overdraft reaches this percentage
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="critical-threshold">Critical Threshold (%)</Label>
                <Input
                  id="critical-threshold"
                  type="number"
                  value={settings.critical_threshold}
                  onChange={(e) => updateSettings('critical_threshold', parseInt(e.target.value))}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Send critical alert when overdraft reaches this percentage
                </p>
              </div>

              <div>
                <Label htmlFor="emergency-email">Emergency Contact Email</Label>
                <Input
                  id="emergency-email"
                  type="email"
                  value={settings.emergency_contact_email}
                  onChange={(e) => updateSettings('emergency_contact_email', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email to notify when critical thresholds are reached
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveSettings} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${getAlertColor(alert.alert_type)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.alert_type)}
                    <div>
                      <div className="font-medium capitalize">
                        {alert.alert_type} Alert
                      </div>
                      <div className="text-sm">
                        Overdraft: {alert.current_overdraft} / {alert.max_overdraft_allowed} tokens
                        ({alert.threshold_percentage}% threshold)
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      {new Date(alert.triggered_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(alert.triggered_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No overdraft alerts to display.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}