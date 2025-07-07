import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Star, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { TokenPackItem } from '@/types/store';
import { getTokenPacksByTarget } from '@/data/storeItems';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { Link } from 'react-router-dom';

interface TokenPurchaseFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokensNeeded: number;
  sessionTitle?: string;
  returnPath?: string; // Path to return to after purchase
}

export function TokenPurchaseFlow({ 
  open, 
  onOpenChange, 
  tokensNeeded, 
  sessionTitle,
  returnPath = '/play'
}: TokenPurchaseFlowProps) {
  const { regularTokens } = usePlayerTokens();
  const [selectedPack, setSelectedPack] = useState<TokenPackItem | null>(null);
  
  // Get available token packs
  const allPacks = getTokenPacksByTarget('player');
  
  // Calculate recommendations
  const recommendations = useMemo(() => {
    const tokensShort = tokensNeeded - regularTokens;
    
    // Find packs that meet the requirement
    const suitablePacks = allPacks
      .filter(pack => (pack.token_amount + pack.bonus_tokens) >= tokensShort)
      .sort((a, b) => {
        const aTotal = a.token_amount + a.bonus_tokens;
        const bTotal = b.token_amount + b.bonus_tokens;
        // Sort by value efficiency (tokens per dollar)
        const aEfficiency = aTotal / a.price_usd;
        const bEfficiency = bTotal / b.price_usd;
        return bEfficiency - aEfficiency;
      });

    // Create exact amount option if no perfect match
    const exactAmount: TokenPackItem = {
      id: 'exact',
      name: 'Exact Amount',
      description: `Get exactly ${tokensShort} tokens needed`,
      token_amount: tokensShort,
      bonus_tokens: 0,
      price_usd: Math.ceil(tokensShort * 0.007 * 100) / 100, // $0.007 per token, rounded up
      rate_per_token: 0.007,
      target_type: 'player',
      expiry_days: 90,
      features: ['Perfect for this session', 'No extra tokens needed'],
      popular: false,
      savings_percentage: 0
    };

    return {
      exact: exactAmount,
      recommended: suitablePacks.slice(0, 3),
      tokensShort
    };
  }, [tokensNeeded, regularTokens, allPacks]);

  const handlePackSelect = (pack: TokenPackItem) => {
    setSelectedPack(pack);
  };

  const handleProceedToStore = () => {
    const params = new URLSearchParams({
      category: 'tokens',
      needed: recommendations.tokensShort.toString(),
      returnTo: returnPath
    });
    
    if (sessionTitle) {
      params.set('session', sessionTitle);
    }
    
    window.location.href = `/store?${params.toString()}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-tennis-green-primary" />
            Purchase Tokens
            {sessionTitle && (
              <span className="text-sm font-normal text-gray-600">
                for "{sessionTitle}"
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">Token Status</h3>
                  <p className="text-sm text-gray-600">
                    You have {regularTokens} tokens, need {tokensNeeded} total
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-orange-600">
                    {recommendations.tokensShort}
                  </div>
                  <div className="text-sm text-gray-500">tokens needed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Purchase Options */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-tennis-green-primary" />
              Quick Purchase Options
            </h3>
            
            <div className="grid gap-4 md:grid-cols-2">
              {/* Exact Amount */}
              <Card 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedPack?.id === 'exact' ? 'ring-2 ring-tennis-green-primary border-tennis-green-primary' : ''
                }`}
                onClick={() => handlePackSelect(recommendations.exact)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Exact Amount</CardTitle>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      No Waste
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-tennis-green-bg/30 rounded-lg">
                      <div className="text-2xl font-bold text-tennis-green-primary">
                        {recommendations.exact.token_amount}
                      </div>
                      <div className="text-sm text-gray-600">tokens</div>
                    </div>
                    
                    <div className="space-y-2">
                      {recommendations.exact.features?.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-center border-t pt-3">
                      <div className="text-xl font-bold text-tennis-green-primary">
                        ${recommendations.exact.price_usd}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Value Recommendation */}
              {recommendations.recommended[0] && (
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedPack?.id === recommendations.recommended[0].id ? 'ring-2 ring-tennis-green-primary border-tennis-green-primary' : ''
                  } ${recommendations.recommended[0].popular ? 'border-yellow-400' : ''}`}
                  onClick={() => handlePackSelect(recommendations.recommended[0])}
                >
                  {recommendations.recommended[0].popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-400 text-yellow-900">
                        <Star className="h-3 w-3 mr-1" />
                        Best Value
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{recommendations.recommended[0].name}</CardTitle>
                      {recommendations.recommended[0].savings_percentage > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {recommendations.recommended[0].savings_percentage}% bonus
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center p-3 bg-tennis-green-bg/30 rounded-lg">
                        <div className="text-2xl font-bold text-tennis-green-primary">
                          {(recommendations.recommended[0].token_amount + recommendations.recommended[0].bonus_tokens).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">tokens</div>
                        
                        {recommendations.recommended[0].bonus_tokens > 0 && (
                          <div className="mt-1 text-xs text-green-600">
                            +{recommendations.recommended[0].bonus_tokens} bonus
                          </div>
                        )}
                      </div>

                      <div className="text-center border-t pt-3">
                        <div className="text-xl font-bold text-tennis-green-primary">
                          ${recommendations.recommended[0].price_usd}
                        </div>
                        <div className="text-xs text-gray-500">
                          Better value per token
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* All Available Packs */}
          {recommendations.recommended.length > 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Other Options</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {recommendations.recommended.slice(1).map((pack) => (
                  <Card 
                    key={pack.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedPack?.id === pack.id ? 'ring-2 ring-tennis-green-primary border-tennis-green-primary' : ''
                    }`}
                    onClick={() => handlePackSelect(pack)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <h4 className="font-medium">{pack.name}</h4>
                        <div className="text-lg font-bold text-tennis-green-primary">
                          {(pack.token_amount + pack.bonus_tokens).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">tokens</div>
                        <div className="font-semibold">${pack.price_usd}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            
            <Button 
              onClick={handleProceedToStore}
              className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-medium"
            >
              <span>Go to Store</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Helper Text */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              After purchasing tokens, you'll be able to return to 
              {sessionTitle ? ` "${sessionTitle}"` : ' your session'} and join.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}