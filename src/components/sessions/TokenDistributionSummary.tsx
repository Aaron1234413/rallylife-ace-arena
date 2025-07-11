import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Trophy, 
  Users, 
  TrendingUp, 
  Building, 
  DollarSign,
  Percent,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TokenDistributionSummaryProps {
  sessionType: 'challenge' | 'social' | 'training';
  totalStakes: number;
  participantCount: number;
  winnerId?: string;
  winnerName?: string;
  isDraw?: boolean;
  platformFeePercentage?: number;
  participantContributions?: Array<{
    userId: string;
    userName: string;
    contribution: number;
    isWinner?: boolean;
    tokensReceived: number;
  }>;
  className?: string;
}

export function TokenDistributionSummary({
  sessionType,
  totalStakes,
  participantCount,
  winnerId,
  winnerName,
  isDraw = false,
  platformFeePercentage = 10,
  participantContributions = [],
  className
}: TokenDistributionSummaryProps) {
  
  // Calculate platform fee and payouts
  const platformFee = Math.floor(totalStakes * (platformFeePercentage / 100));
  const netPayout = totalStakes - platformFee;
  const individualStakes = participantCount > 0 ? totalStakes / participantCount : 0;
  
  // Determine distribution type
  const isNoStakes = sessionType === 'training' || totalStakes === 0;
  const isReturnStakes = isDraw || sessionType === 'social';
  
  const getDistributionTitle = () => {
    if (isNoStakes) return 'No Token Stakes';
    if (isReturnStakes) return 'Stakes Returned to All';
    return 'Winner Takes Payout';
  };
  
  const getDistributionIcon = () => {
    if (isNoStakes) return CheckCircle;
    if (isReturnStakes) return Users;
    return Trophy;
  };
  
  const getDistributionColor = () => {
    if (isNoStakes) return 'text-tennis-green-primary';
    if (isReturnStakes) return 'text-blue-600';
    return 'text-amber-600';
  };

  const DistributionIcon = getDistributionIcon();

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DistributionIcon className={`h-5 w-5 ${getDistributionColor()}`} />
          Token Distribution Summary
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Distribution Type Banner */}
        <div className={`rounded-lg p-4 border ${
          isNoStakes 
            ? 'bg-tennis-green-subtle/20 border-tennis-green-primary/20' 
            : isReturnStakes 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <DistributionIcon className={`h-6 w-6 ${getDistributionColor()}`} />
            <div>
              <h3 className="font-semibold">{getDistributionTitle()}</h3>
              <p className="text-sm text-muted-foreground">
                {isNoStakes && 'This session has no token stakes'}
                {isReturnStakes && !isNoStakes && 'All participants get their stakes back'}
                {!isReturnStakes && !isNoStakes && 'Winner receives the total payout after platform fee'}
              </p>
            </div>
          </div>
        </div>

        {!isNoStakes && (
          <>
            {/* Stakes Breakdown */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Stakes Breakdown
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{totalStakes}</p>
                    <p className="text-sm text-muted-foreground">Total Stakes</p>
                  </div>
                </div>
                
                <div className="bg-muted/30 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{participantCount}</p>
                    <p className="text-sm text-muted-foreground">Participants</p>
                  </div>
                </div>
              </div>

              {/* Platform Fee Visualization */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    Platform Fee ({platformFeePercentage}%)
                  </span>
                  <span className="font-medium">{platformFee} tokens</span>
                </div>
                
                <Progress 
                  value={platformFeePercentage} 
                  className="h-2 bg-muted"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Fee: {platformFee} tokens</span>
                  <span>Payout: {netPayout} tokens</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Distribution Details */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Payout Distribution
              </h4>

              {!isReturnStakes ? (
                // Winner takes all scenario
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium">Winner Payout</p>
                        <p className="text-sm text-muted-foreground">
                          {winnerName || 'Selected winner'} receives
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-amber-600 hover:bg-amber-700">
                      <Coins className="h-3 w-3 mr-1" />
                      {netPayout} tokens
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    Other participants receive no token rewards
                  </div>
                </div>
              ) : (
                // Stakes returned scenario
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Stakes Returned</p>
                        <p className="text-sm text-muted-foreground">
                          Each participant gets {Math.floor(individualStakes)} tokens back
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 hover:bg-blue-700">
                      <Coins className="h-3 w-3 mr-1" />
                      {Math.floor(individualStakes)} each
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground text-center">
                    No platform fee deducted for returned stakes
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Participant Contributions (if provided) */}
        {participantContributions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participant Contributions
              </h4>
              
              <div className="space-y-2">
                {participantContributions.map((participant) => (
                  <div 
                    key={participant.userId} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      participant.isWinner 
                        ? 'bg-amber-50 border-amber-200' 
                        : 'bg-muted/30 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {participant.isWinner && <Trophy className="h-4 w-4 text-amber-600" />}
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {participant.userName}
                          {participant.isWinner && (
                            <Badge variant="secondary" className="text-xs">Winner</Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Contributed {participant.contribution} tokens
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {participant.tokensReceived > 0 ? '+' : ''}{participant.tokensReceived}
                      </p>
                      <p className="text-xs text-muted-foreground">tokens received</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Platform Fee Notice */}
        {!isNoStakes && (
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="text-sm">
                <p className="font-medium">Platform Fee Transparency</p>
                <p className="text-muted-foreground">
                  {platformFeePercentage}% platform fee supports server costs, feature development, and community events
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}