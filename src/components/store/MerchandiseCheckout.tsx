import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Coins, 
  DollarSign, 
  CreditCard, 
  MapPin, 
  Package, 
  Truck,
  ArrowLeft
} from 'lucide-react';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { MerchandiseItem } from '@/data/merchandiseItems';

interface MerchandiseCheckoutProps {
  item: MerchandiseItem;
  onBack: () => void;
}

interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export function MerchandiseCheckout({ item, onBack }: MerchandiseCheckoutProps) {
  const { tokenData, spendTokens } = usePlayerTokens();
  const [tokensToUse, setTokensToUse] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  });

  // Token calculations (1 token = $0.01)
  const tokenValue = 0.01;
  const maxTokensUsable = Math.min(
    tokenData?.regular_tokens || 0, 
    Math.floor(item.price_usd / tokenValue)
  );
  const tokenDiscount = tokensToUse * tokenValue;
  const cashAmount = Math.max(0, item.price_usd - tokenDiscount);
  
  // Estimated shipping (simplified - would normally use shipping API)
  const estimatedShipping = 5.99;
  const totalAmount = cashAmount + estimatedShipping;

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isAddressValid = () => {
    return shippingAddress.name &&
           shippingAddress.addressLine1 &&
           shippingAddress.city &&
           shippingAddress.state &&
           shippingAddress.postalCode;
  };

  const handleCheckout = async () => {
    if (!isAddressValid()) {
      toast.error('Please fill in all required shipping information');
      return;
    }

    if (cashAmount > 0 && cashAmount < 0.50) {
      toast.error('Minimum card payment is $0.50. Please use more tokens.');
      return;
    }

    setIsProcessing(true);

    try {
      // First spend tokens if being used
      if (tokensToUse > 0) {
        const tokenSuccess = await spendTokens(
          tokensToUse,
          'regular',
          'merchandise',
          `Purchase: ${item.name}`
        );
        
        if (!tokenSuccess) {
          throw new Error('Failed to spend tokens');
        }
      }

      // Create the merchandise order
      const { data, error } = await supabase.functions.invoke('process-merchandise-order', {
        body: {
          item_id: item.id,
          item_name: item.name,
          item_price_usd: item.price_usd,
          tokens_used: tokensToUse,
          cash_amount: cashAmount,
          shipping_cost: estimatedShipping,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          item_metadata: {
            category: item.category,
            brand: item.brand,
            features: item.features,
            external_url: item.external_url
          }
        }
      });

      if (error) throw error;

      if (data?.payment_url) {
        // Redirect to Stripe checkout
        window.location.href = data.payment_url;
      } else {
        // Order completed (no cash payment needed)
        toast.success('Order placed successfully!');
        onBack();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Store
        </Button>
        <h2 className="text-2xl font-bold text-tennis-green-dark">Checkout</h2>
      </div>

      {/* Item Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <div className="text-lg font-bold text-tennis-green-dark mt-1">
                ${item.price_usd.toFixed(2)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-tennis-yellow" />
            Token Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-tennis-yellow/10 rounded-lg">
            <span className="text-sm font-medium">Available Tokens:</span>
            <Badge className="bg-tennis-yellow text-tennis-green-dark">
              {(tokenData?.regular_tokens || 0).toLocaleString()}
            </Badge>
          </div>

          {maxTokensUsable > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Tokens to use:</label>
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-tennis-yellow" />
                  <span className="font-bold">{tokensToUse.toLocaleString()}</span>
                </div>
              </div>
              
              <Slider
                value={[tokensToUse]}
                onValueChange={([value]) => setTokensToUse(value)}
                max={maxTokensUsable}
                step={10}
                className="w-full"
              />
              
              <div className="text-xs text-tennis-green-medium text-center">
                Max: {maxTokensUsable.toLocaleString()} tokens (${(maxTokensUsable * tokenValue).toFixed(2)} value)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={shippingAddress.name}
                onChange={(e) => handleAddressChange('name', e.target.value)}
                placeholder="John Doe"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="address1">Address Line 1 *</Label>
              <Input
                id="address1"
                value={shippingAddress.addressLine1}
                onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="address2">Address Line 2</Label>
              <Input
                id="address2"
                value={shippingAddress.addressLine2}
                onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                placeholder="Apt, suite, etc. (optional)"
              />
            </div>
            
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={shippingAddress.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                placeholder="New York"
              />
            </div>
            
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={shippingAddress.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="NY"
              />
            </div>
            
            <div>
              <Label htmlFor="postal">Postal Code *</Label>
              <Input
                id="postal"
                value={shippingAddress.postalCode}
                onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                placeholder="10001"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Item Price:</span>
            <span>${item.price_usd.toFixed(2)}</span>
          </div>
          
          {tokensToUse > 0 && (
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Coins className="h-3 w-3 text-tennis-yellow" />
                Token Discount:
              </span>
              <span className="text-tennis-green-primary">-${tokenDiscount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Truck className="h-3 w-3" />
              Shipping:
            </span>
            <span>${estimatedShipping.toFixed(2)}</span>
          </div>
          
          <Separator />
          
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span className="text-lg">${totalAmount.toFixed(2)}</span>
          </div>
          
          {cashAmount > 0 && (
            <div className="text-sm text-tennis-green-medium">
              Card payment: ${cashAmount.toFixed(2)} + ${estimatedShipping.toFixed(2)} shipping
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checkout Button */}
      <Button
        className="w-full bg-tennis-green-primary hover:bg-tennis-green-primary/90 text-white font-bold py-3"
        onClick={handleCheckout}
        disabled={isProcessing || !isAddressValid() || (cashAmount > 0 && cashAmount < 0.50)}
      >
        {isProcessing ? (
          'Processing Order...'
        ) : (
          <>
            {tokensToUse > 0 && cashAmount > 0 ? 'Complete Hybrid Payment' : 
             tokensToUse > 0 ? 'Complete Token Payment' : 
             'Complete Card Payment'}
            {totalAmount > 0 && ` - $${totalAmount.toFixed(2)}`}
          </>
        )}
      </Button>

      {cashAmount > 0 && cashAmount < 0.50 && (
        <p className="text-xs text-red-500 text-center">
          Minimum card payment is $0.50. Use more tokens to reduce cash amount.
        </p>
      )}
    </div>
  );
}