import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Coins, Trophy, Building, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface TokenDistributionSummaryProps {
  sessionType: 'challenge' | 'social' | 'training';
  participants: Array<{
    id: string;
    name: string;
    stakesContributed: number;
    isWinner?: boolean;
  }>;
  totalStakes: number;
  platformFeePercentage?: number;
  platformFeeAmount: number;
  winnerReward: number;
  className?: string;
}

export function TokenDistributionSummary({
  sessionType,
  participants,
  totalStakes,
  platformFeePercentage = 10,
  platformFeeAmount,
  winnerReward,
  className
}: TokenDistributionSummaryProps) {
  const winner = participants.find(p => p.isWinner);
  const isTrainingSession = sessionType === 'training';

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-tennis-yellow" />
          Token Distribution Summary
          <Badge variant="outline" className="ml-auto">
            {sessionType}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Participant Contributions */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participant Contributions
          </h4>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{participant.name}</span>
                  {participant.isWinner && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      <Trophy className="h-3 w-3 mr-1" />
                      Winner
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-tennis-yellow" />
                  <span className="font-medium">{participant.stakesContributed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Financial Breakdown */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Financial Breakdown
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Stakes Collected:</span>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4 text-tennis-yellow" />
                <span className="font-bold">{totalStakes}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-red-600">
              <span className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Platform Fee ({platformFeePercentage}%):
              </span>
              <div className="flex items-center gap-1">
                <span className="font-medium">-{platformFeeAmount}</span>
              </div>
            </div>

            <Separator />

            {isTrainingSession ? (
              <div className="flex justify-between items-center text-green-600 font-medium">
                <span>Training Pool:</span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span>{totalStakes - platformFeeAmount}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center text-green-600 font-medium">
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Winner Reward:
                </span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span>{winnerReward}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Winner Information */}
        {winner && !isTrainingSession && (
          <>
            <Separator />
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-green-600" />
                <h4 className="font-medium text-green-800">Winner Details</h4>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Winner:</span>
                  <span className="font-medium text-green-800">{winner.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Stakes Contributed:</span>
                  <span className="font-medium text-green-800">{winner.stakesContributed} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Total Reward:</span>
                  <span className="font-bold text-green-800">{winnerReward} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Net Gain:</span>
                  <span className="font-bold text-green-800">
                    +{winnerReward - winner.stakesContributed} tokens
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Platform Fee Information */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Platform Fee Notice</h4>
              <p className="text-xs text-blue-600">
                A {platformFeePercentage}% platform fee ({platformFeeAmount} tokens) is automatically deducted 
                from all session stakes to support platform operations and development.
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Summary */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Transaction Summary</h4>
          <div className="text-xs space-y-1">
            <p>• All token transfers are processed automatically</p>
            <p>• Winners receive tokens immediately after session completion</p>
            <p>• Transaction history is available in your token dashboard</p>
            <p>• Platform fees help maintain and improve the service</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}