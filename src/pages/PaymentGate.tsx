import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Shield, Trophy, Zap, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function PaymentGate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          itemId: 'launch-promo',
          itemName: 'RAKO Launch Promotion - Full Year Access',
          cashAmount: 4.99,
          tokensToUse: 0
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to create payment session. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const features = [
    { icon: Trophy, text: 'Compete in global leaderboards', premium: true },
    { icon: Zap, text: 'Track your tennis progress & stats', premium: false },
    { icon: Shield, text: 'Achievement system & rewards', premium: true },
    { icon: Star, text: 'Exclusive avatar customization', premium: true },
    { icon: CheckCircle, text: 'Coach connections & training', premium: true },
    { icon: Clock, text: 'Court booking system', premium: true }
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge className="bg-tennis-yellow text-tennis-green-dark font-orbitron font-bold px-6 py-2 text-lg">
            🎮 LIMITED TIME OFFER
          </Badge>
          <h1 className="text-3xl md:text-4xl font-orbitron font-bold text-tennis-green-dark">
            Welcome to RAKO, {user.user_metadata?.full_name || 'Player'}!
          </h1>
          <p className="text-lg text-tennis-green-medium max-w-2xl mx-auto">
            You're almost ready to start your tennis gaming journey. Complete your membership with our special launch offer.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Preview */}
          <Card className="border-2 border-tennis-green-bg/30">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-orbitron text-tennis-green-medium">
                Free Preview
              </CardTitle>
              <div className="text-3xl font-bold text-tennis-green-dark">$0</div>
              <p className="text-sm text-gray-600">Limited access</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className={`h-5 w-5 ${feature.premium ? 'text-gray-400' : 'text-tennis-green-primary'}`} />
                  <span className={feature.premium ? 'text-gray-400 line-through' : 'text-tennis-green-dark'}>
                    {feature.text}
                  </span>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-6" 
                onClick={() => navigate('/dashboard')}
              >
                Continue with Limited Access
              </Button>
            </CardContent>
          </Card>

          {/* Premium Launch Offer */}
          <Card className="border-4 border-tennis-yellow bg-gradient-to-br from-tennis-green-dark/5 to-tennis-yellow/5 relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Badge className="bg-tennis-yellow text-tennis-green-dark font-bold animate-pulse">
                SAVE $115!
              </Badge>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-orbitron text-tennis-green-dark">
                Launch Special
              </CardTitle>
              <div className="space-y-2">
                <div className="text-sm text-gray-500 line-through">$119.88/year</div>
                <div className="text-4xl font-bold text-tennis-green-primary">$4.99</div>
                <div className="text-sm font-semibold text-tennis-yellow">One-time payment • Full year access</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className="h-5 w-5 text-tennis-green-primary" />
                  <span className="text-tennis-green-dark">{feature.text}</span>
                  {feature.premium && (
                    <Badge variant="secondary" className="ml-auto text-xs">PRO</Badge>
                  )}
                </div>
              ))}
              <div className="bg-tennis-yellow/10 p-4 rounded-lg border border-tennis-yellow/30 mt-6">
                <div className="text-sm font-semibold text-tennis-green-dark mb-2">
                  🔥 Launch Offer Expires Soon!
                </div>
                <div className="text-xs text-tennis-green-medium">
                  This price will never be available again. Regular pricing starts at $9.99/month.
                </div>
              </div>
              <Button 
                className="w-full bg-tennis-yellow hover:bg-tennis-yellow/90 text-tennis-green-dark font-orbitron font-bold text-lg py-6 mt-6" 
                onClick={handlePurchase}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : '🚀 Unlock Full Access - $4.99'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="text-center space-y-4 pt-8 border-t border-tennis-green-bg/30">
          <div className="flex justify-center items-center gap-4 text-sm text-tennis-green-medium">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Secure Payment
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Instant Access
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              No Hidden Fees
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            By continuing, you agree to our terms of service. Payment is processed securely through Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}