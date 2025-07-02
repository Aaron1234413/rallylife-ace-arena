import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Zap, 
  Users, 
  Trophy, 
  Star, 
  CheckCircle,
  ArrowRight,
  Gem
} from 'lucide-react';

const SubscriptionModels = () => {
  return (
    <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-tennis-green-dark">
            Rally Life Subscription Models
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Two strategic approaches to maximize user acquisition and engagement
          </p>
        </div>

        {/* Model A */}
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
              Model A: "The Accelerator"
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Ultra-affordable with massive user base potential
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Tier A */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  Court Rookie
                </CardTitle>
                <div className="text-2xl font-bold text-gray-600">FREE</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Level Cap: 15</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Token Earning: 1x base rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">XP Earning: 1x base rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">5 social play sessions/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Core tennis tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic challenges</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rally Plus A */}
            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white">POPULAR</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Rally Plus
                </CardTitle>
                <div className="text-3xl font-bold text-blue-600">$3.99</div>
                <div className="text-sm text-gray-500">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold">Unlimited Level Cap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold">2x Token Earning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-semibold">1.75x XP Earning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All premium content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">50 bonus tokens/week</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Early access (1 week)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-300 my-12"></div>

        {/* Model B */}
        <div className="space-y-6">
          <div className="text-center">
            <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
              Model B: "The Value Stack"
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              Higher value perception with premium positioning
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Tier B */}
            <Card className="border-2 border-gray-200">
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  Court Explorer
                </CardTitle>
                <div className="text-2xl font-bold text-gray-600">FREE</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Level Cap: 10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Token Earning: 1x base rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">XP Earning: 1x base rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">3 social play sessions/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Core tennis tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Basic challenges</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rally Elite B */}
            <Card className="border-2 border-purple-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white">ELITE</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  Rally Elite
                </CardTitle>
                <div className="text-3xl font-bold text-purple-600">$6.99</div>
                <div className="text-sm text-gray-500">/month</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-semibold">Unlimited Level Cap</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-semibold">3x Token Earning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-semibold">2x XP Earning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Unlimited + priority sessions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">All premium + exclusive content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">25 bonus tokens/day</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Early access (2 weeks)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Elite tournaments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FOMO Strategy */}
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Star className="h-5 w-5" />
              FOMO Strategy for Both Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-orange-800 mb-2">Progressive Level Gates</h4>
              <div className="grid sm:grid-cols-2 gap-2 text-sm">
                <div>• Level 5: Advanced match tracking</div>
                <div>• Level 10: Coach marketplace access</div>
                <div>• Level 15: Custom training plans</div>
                <div>• Level 20: Premium tournaments</div>
                <div>• Level 25: Elite coaching tools</div>
                <div>• Level 30+: Exclusive high-stakes matches</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-orange-800 mb-2">Limited-Time Offers</h4>
              <div className="space-y-1 text-sm">
                <div>• "First 1000 subscribers get lifetime 50% bonus tokens"</div>
                <div>• "Beta features available only to subscribers"</div>
                <div>• Monthly subscriber-only events with rare rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Choose Model A if:</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">
                You want maximum user acquisition and believe in volume-based revenue with viral growth potential.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800">Choose Model B if:</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700">
                You want to position as a premium tennis platform with higher per-user value and exclusivity appeal.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom note */}
        <Card className="bg-tennis-green-light border-tennis-green">
          <CardContent className="text-center py-6">
            <p className="text-tennis-green-dark font-medium">
              Both models create the "level up to unlock more earning potential" loop while maintaining different price points for different market strategies.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionModels;