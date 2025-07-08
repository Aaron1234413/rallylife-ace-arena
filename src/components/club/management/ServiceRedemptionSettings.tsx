import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Save, Settings } from 'lucide-react';
import { ServiceRedemptionSettings } from '@/types/club';
import { toast } from 'sonner';

interface ServiceRedemptionSettingsProps {
  clubId: string;
}

const defaultSettings: ServiceRedemptionSettings[] = [
  {
    service_type: 'court_booking',
    redemption_percentage: 80,
    max_tokens_per_transaction: 100,
    daily_limit: 300,
    enabled: true
  },
  {
    service_type: 'coaching',
    redemption_percentage: 70,
    max_tokens_per_transaction: 150,
    daily_limit: 450,
    enabled: true
  },
  {
    service_type: 'events',
    redemption_percentage: 60,
    max_tokens_per_transaction: 200,
    daily_limit: 600,
    enabled: true
  },
  {
    service_type: 'food_beverage',
    redemption_percentage: 50,
    max_tokens_per_transaction: 50,
    daily_limit: 150,
    enabled: true
  },
  {
    service_type: 'merchandise',
    redemption_percentage: 40,
    max_tokens_per_transaction: 100,
    daily_limit: 300,
    enabled: false
  }
];

export function ServiceRedemptionSettingsComponent({ clubId }: ServiceRedemptionSettingsProps) {
  const [settings, setSettings] = useState<ServiceRedemptionSettings[]>(defaultSettings);
  const [loading, setSaving] = useState(false);

  const getServiceName = (serviceType: string) => {
    const names: Record<string, string> = {
      court_booking: 'Court Bookings',
      coaching: 'Coaching Sessions',
      events: 'Events & Tournaments',
      food_beverage: 'Food & Beverages',
      merchandise: 'Merchandise'
    };
    return names[serviceType] || serviceType;
  };

  const getServiceIcon = (serviceType: string) => {
    const icons: Record<string, string> = {
      court_booking: '🎾',
      coaching: '👨‍🏫',
      events: '🏆',
      food_beverage: '🍽️',
      merchandise: '🛍️'
    };
    return icons[serviceType] || '📋';
  };

  const updateSetting = (index: number, field: keyof ServiceRedemptionSettings, value: any) => {
    const newSettings = [...settings];
    newSettings[index] = { ...newSettings[index], [field]: value };
    setSettings(newSettings);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Service redemption settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Service Redemption Settings
          </CardTitle>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {settings.map((setting, index) => (
            <div key={setting.service_type} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getServiceIcon(setting.service_type)}</span>
                  <div>
                    <h3 className="font-medium">{getServiceName(setting.service_type)}</h3>
                    <p className="text-sm text-gray-500">Configure token redemption rules</p>
                  </div>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={(enabled) => updateSetting(index, 'enabled', enabled)}
                />
              </div>

              {setting.enabled && (
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Redemption Percentage */}
                  <div className="space-y-2">
                    <Label>Redemption Percentage</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[setting.redemption_percentage]}
                        onValueChange={([value]) => updateSetting(index, 'redemption_percentage', value)}
                        max={100}
                        min={0}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>0%</span>
                        <span className="font-medium">{setting.redemption_percentage}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* Max Tokens Per Transaction */}
                  <div className="space-y-2">
                    <Label htmlFor={`max-tokens-${setting.service_type}`}>
                      Max Tokens/Transaction
                    </Label>
                    <Input
                      id={`max-tokens-${setting.service_type}`}
                      type="number"
                      value={setting.max_tokens_per_transaction || ''}
                      onChange={(e) => updateSetting(index, 'max_tokens_per_transaction', parseInt(e.target.value) || 0)}
                      placeholder="No limit"
                    />
                  </div>

                  {/* Daily Limit */}
                  <div className="space-y-2">
                    <Label htmlFor={`daily-limit-${setting.service_type}`}>
                      Daily Limit
                    </Label>
                    <Input
                      id={`daily-limit-${setting.service_type}`}
                      type="number"
                      value={setting.daily_limit || ''}
                      onChange={(e) => updateSetting(index, 'daily_limit', parseInt(e.target.value) || 0)}
                      placeholder="No limit"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-sm">ℹ️</div>
            <div className="text-sm">
              <div className="font-medium text-blue-800 mb-1">Redemption Settings Guide</div>
              <ul className="space-y-1 text-blue-700">
                <li>• <strong>Redemption Percentage:</strong> How much of a service cost can be paid with tokens</li>
                <li>• <strong>Max Tokens/Transaction:</strong> Maximum tokens that can be used in a single transaction</li>
                <li>• <strong>Daily Limit:</strong> Maximum tokens a member can spend per day on this service</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}