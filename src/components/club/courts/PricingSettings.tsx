import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Coins, 
  Save, 
  RotateCcw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { useCourtBooking, Court } from '@/hooks/useCourtBooking';
import { toast } from 'sonner';

interface PricingSettingsProps {
  court: Court;
  canManage: boolean;
  onUpdate?: () => void;
}

export function PricingSettings({ court, canManage, onUpdate }: PricingSettingsProps) {
  const { updateCourt } = useCourtBooking();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hourly_rate_tokens: court.hourly_rate_tokens,
    hourly_rate_money: court.hourly_rate_money
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    if (formData.hourly_rate_tokens < 0 || formData.hourly_rate_money < 0) {
      toast.error('Rates cannot be negative');
      return;
    }

    if (formData.hourly_rate_tokens === 0 && formData.hourly_rate_money === 0) {
      toast.error('At least one payment method must have a rate greater than 0');
      return;
    }

    setLoading(true);
    try {
      await updateCourt(court.id, {
        hourly_rate_tokens: formData.hourly_rate_tokens,
        hourly_rate_money: formData.hourly_rate_money
      });
      
      setHasChanges(false);
      onUpdate?.();
    } catch (error) {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      hourly_rate_tokens: court.hourly_rate_tokens,
      hourly_rate_money: court.hourly_rate_money
    });
    setHasChanges(false);
  };

  const setPremiumPricing = () => {
    setFormData({
      hourly_rate_tokens: 100,
      hourly_rate_money: 50.00
    });
    setHasChanges(true);
  };

  const setStandardPricing = () => {
    setFormData({
      hourly_rate_tokens: 50,
      hourly_rate_money: 25.00
    });
    setHasChanges(true);
  };

  const setBudgetPricing = () => {
    setFormData({
      hourly_rate_tokens: 25,
      hourly_rate_money: 15.00
    });
    setHasChanges(true);
  };

  if (!canManage) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="font-medium mb-2">Access Restricted</h3>
          <p className="text-sm text-muted-foreground">
            Only club owners and admins can manage court pricing.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pricing Settings
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Set hourly rates for {court.name}
            </p>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Rates Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Coins className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">
                    {formData.hourly_rate_tokens}
                  </p>
                  <p className="text-sm text-blue-700">Tokens per hour</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-900">
                    ${formData.hourly_rate_money.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-700">USD per hour</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Presets */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Quick Pricing Presets</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={setBudgetPricing}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium">Budget</div>
                <div className="text-sm text-muted-foreground">25 tokens / $15</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={setStandardPricing}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium">Standard</div>
                <div className="text-sm text-muted-foreground">50 tokens / $25</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={setPremiumPricing}
              className="justify-start h-auto p-3"
            >
              <div className="text-left">
                <div className="font-medium">Premium</div>
                <div className="text-sm text-muted-foreground">100 tokens / $50</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Custom Pricing */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Custom Pricing</Label>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tokens" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Tokens per Hour
              </Label>
              <Input
                id="tokens"
                type="number"
                min="0"
                max="1000"
                value={formData.hourly_rate_tokens}
                onChange={(e) => handleInputChange('hourly_rate_tokens', parseInt(e.target.value) || 0)}
                placeholder="50"
              />
              <p className="text-xs text-muted-foreground">
                Members can pay with in-app tokens
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="money" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                USD per Hour
              </Label>
              <Input
                id="money"
                type="number"
                min="0"
                max="500"
                step="0.01"
                value={formData.hourly_rate_money}
                onChange={(e) => handleInputChange('hourly_rate_money', parseFloat(e.target.value) || 0)}
                placeholder="25.00"
              />
              <p className="text-xs text-muted-foreground">
                Members can pay with real money
              </p>
            </div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium mb-2">Pricing Guidelines</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Members can choose to pay with tokens or money (if both rates are set)</li>
            <li>• Set token rate to 0 to disable token payments</li>
            <li>• Set money rate to 0 to disable cash payments</li>
            <li>• Consider your local market rates when setting prices</li>
            <li>• Premium courts typically charge 2x standard rates</li>
          </ul>
        </div>

        {/* Payment Method Status */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={formData.hourly_rate_tokens > 0 ? "default" : "secondary"}>
            {formData.hourly_rate_tokens > 0 ? '✓' : '✗'} Token Payments
          </Badge>
          <Badge variant={formData.hourly_rate_money > 0 ? "default" : "secondary"}>
            {formData.hourly_rate_money > 0 ? '✓' : '✗'} Money Payments
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}