import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Zap, Users, Crown } from 'lucide-react';

interface UpgradeCardProps {
  variant?: 'dashboard' | 'store';
  className?: string;
}

export const UpgradeCard: React.FC<UpgradeCardProps> = ({ 
  variant = 'dashboard',
  className = '' 
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/payment-gate');
  };

  const features = [
    { icon: Trophy, text: 'Global leaderboards access', highlight: true },
    { icon: Crown, text: 'Premium achievements', highlight: true },
    { icon: Star, text: 'Exclusive avatar items', highlight: true },
    { icon: Users, text: 'Coach connections', highlight: true },
    { icon: Zap, text: 'Priority support', highlight: false }
  ];

  if (variant === 'dashboard') {
    return (
      <Card className={`bg-gradient-to-br from-tennis-yellow/10 to-amber-100/20 border-2 border-tennis-yellow/30 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
        <CardHeader className="relative overflow-hidden">
          <Badge className="absolute top-4 right-4 bg-tennis-yellow text-tennis-green-dark font-bold animate-pulse">
            🎉 SAVE $115!
          </Badge>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-tennis-yellow rounded-full flex items-center justify-center">
              <Crown className="h-5 w-5 text-tennis-green-dark" />
            </div>
            <div>
              <CardTitle className="text-xl text-tennis-green-dark">
                Upgrade to Annual
              </CardTitle>
              <p className="text-sm text-tennis-green-medium">
                Unlock full RAKO experience
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 line-through">$119.88/year</div>
            <div className="text-2xl font-bold text-tennis-green-primary">$4.99</div>
            <div className="text-xs text-tennis-yellow font-semibold">One-time • Full year access</div>
          </div>
          
          <div className="space-y-2">
            {features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <feature.icon className="h-4 w-4 text-tennis-green-primary" />
                <span className="text-tennis-green-dark">{feature.text}</span>
              </div>
            ))}
            <div className="text-xs text-tennis-green-medium">+ more premium features</div>
          </div>

          <Button 
            onClick={handleUpgrade}
            className="w-full bg-tennis-yellow hover:bg-tennis-yellow/90 text-tennis-green-dark font-bold"
          >
            🚀 Upgrade Now - $4.99
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Store variant - more detailed
  return (
    <Card className={`bg-gradient-to-br from-tennis-yellow/10 to-amber-100/20 border-4 border-tennis-yellow shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardHeader className="relative">
        <Badge className="absolute top-4 right-4 bg-tennis-yellow text-tennis-green-dark font-bold animate-pulse">
          🎉 LAUNCH SPECIAL
        </Badge>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-tennis-yellow rounded-full flex items-center justify-center">
            <Crown className="h-8 w-8 text-tennis-green-dark" />
          </div>
          <CardTitle className="text-2xl text-tennis-green-dark">
            Annual Subscription
          </CardTitle>
          <p className="text-tennis-green-medium">
            Unlock the complete RAKO experience
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-sm text-gray-500 line-through">$119.88/year</div>
          <div className="text-4xl font-bold text-tennis-green-primary">$4.99</div>
          <div className="text-sm font-semibold text-tennis-yellow">One-time payment • Full year access</div>
        </div>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-tennis-green-dark">Premium Features:</h4>
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <feature.icon className="h-5 w-5 text-tennis-green-primary" />
              <span className="text-tennis-green-dark">{feature.text}</span>
              {feature.highlight && (
                <Badge variant="secondary" className="ml-auto text-xs">PRO</Badge>
              )}
            </div>
          ))}
        </div>

        <div className="bg-tennis-yellow/10 p-4 rounded-lg border border-tennis-yellow/30">
          <div className="text-sm font-semibold text-tennis-green-dark mb-2">
            🔥 Limited Time Offer!
          </div>
          <div className="text-xs text-tennis-green-medium">
            This price will never be available again. Regular pricing starts at $9.99/month.
          </div>
        </div>

        <Button 
          onClick={handleUpgrade}
          className="w-full bg-tennis-yellow hover:bg-tennis-yellow/90 text-tennis-green-dark font-bold text-lg py-6"
        >
          🚀 Upgrade to Annual - $4.99
        </Button>
      </CardContent>
    </Card>
  );
};