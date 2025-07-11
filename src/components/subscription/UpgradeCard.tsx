import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
    navigate('/dashboard');
  };

  const features = [
    { icon: Trophy, text: 'Global leaderboards access', highlight: true },
    { icon: Crown, text: 'Premium achievements', highlight: true },
    { icon: Star, text: 'Exclusive avatar items', highlight: true },
    { icon: Users, text: 'Coach connections', highlight: true },
    { icon: Zap, text: 'Priority support', highlight: false }
  ];

  const PopoverDetailsContent = () => (
    <div className="w-80 space-y-4">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 bg-tennis-yellow rounded-full flex items-center justify-center">
          <Crown className="h-6 w-6 text-tennis-green-dark" />
        </div>
        <h3 className="font-bold text-tennis-green-dark">Annual Subscription</h3>
        <p className="text-sm text-tennis-green-medium">Unlock the complete RAKO experience</p>
      </div>
      
      <div className="text-center">
        <div className="text-sm text-gray-500 line-through">$119.88/year</div>
        <div className="text-3xl font-bold text-tennis-green-primary">$4.99</div>
        <div className="text-sm font-semibold text-tennis-yellow">One-time payment • Full year access</div>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-semibold text-tennis-green-dark text-sm">Premium Features:</h4>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <feature.icon className="h-4 w-4 text-tennis-green-primary" />
            <span className="text-sm text-tennis-green-dark">{feature.text}</span>
            {feature.highlight && (
              <Badge variant="secondary" className="ml-auto text-xs">PRO</Badge>
            )}
          </div>
        ))}
      </div>

      <div className="bg-tennis-yellow/10 p-3 rounded-lg border border-tennis-yellow/30">
        <div className="text-sm font-semibold text-tennis-green-dark mb-1">
          🔥 Limited Time Offer!
        </div>
        <div className="text-xs text-tennis-green-medium">
          This price will never be available again. Regular pricing starts at $9.99/month.
        </div>
      </div>

      <Button 
        onClick={handleUpgrade}
        className="w-full bg-tennis-yellow hover:bg-tennis-yellow/90 text-tennis-green-dark font-bold"
      >
        🚀 Upgrade Now - $4.99
      </Button>
    </div>
  );

  if (variant === 'dashboard') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={`bg-gradient-to-r from-tennis-yellow/20 to-tennis-yellow/30 border-tennis-yellow/50 text-tennis-green-dark hover:bg-tennis-yellow/40 font-medium ${className}`}
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Annual
            <Badge className="ml-2 bg-tennis-yellow text-tennis-green-dark text-xs animate-pulse">
              $4.99
            </Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-4">
          <PopoverDetailsContent />
        </PopoverContent>
      </Popover>
    );
  }

  // Store variant - same popover but different trigger styling
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          className={`bg-tennis-yellow hover:bg-tennis-yellow/90 text-tennis-green-dark font-bold text-lg py-6 px-8 ${className}`}
        >
          <Crown className="h-5 w-5 mr-2" />
          🚀 Upgrade to Annual - $4.99
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-4">
        <PopoverDetailsContent />
      </PopoverContent>
    </Popover>
  );
};