import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Clock, 
  Users, 
  Coins, 
  Star, 
  TrendingUp,
  CheckCircle 
} from 'lucide-react';
import { UnifiedSession } from '@/hooks/useUnifiedSessions';

interface CompletionData {
  duration: number;
  winnerId?: string;
  winningTeam?: string;
  participants: number;
  tokensDistributed: number;
  hpReduction?: number;
  xpEarned?: number;
}

interface SessionCompletionSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  completionData: CompletionData | null;
  session: UnifiedSession;
}

export function SessionCompletionSummary({
  isOpen,
  onClose,
  completionData,
  session
}: SessionCompletionSummaryProps) {
  if (!completionData) return null;

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Calculate rewards based on duration and participation
  const baseXP = Math.min(completionData.duration * 2, 100); // 2 XP per minute, max 100
  const participationBonus = completionData.participants * 5; // 5 XP per participant
  const totalXP = baseXP + participationBonus;

  const platformFee = Math.floor(completionData.tokensDistributed * 0.1);
  const actualPayout = completionData.tokensDistributed - platformFee;

  // Estimated HP consumption (3-5 HP per 30 minutes)
  const estimatedHP = Math.ceil((completionData.duration / 30) * 4);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Session Completed!
          </DialogTitle>
          <DialogDescription>
            Great match! Here's a summary of your session results.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Overview */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(completionData.duration)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="font-medium">{completionData.participants} players</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winner Information */}
          {(completionData.winnerId || completionData.winningTeam) && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <h4 className="font-medium">Winner</h4>
                </div>
                <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {completionData.winningTeam || 'Individual Winner'}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Token Distribution */}
          {completionData.tokensDistributed > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-4 h-4 text-green-500" />
                  <h4 className="font-medium">Token Distribution</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Stakes:</span>
                    <span className="font-medium">{completionData.tokensDistributed} tokens</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Platform Fee (10%):</span>
                    <span>-{platformFee} tokens</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-green-600">
                    <span>Winner Payout:</span>
                    <span>+{actualPayout} tokens</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rewards Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-orange-500" />
                <h4 className="font-medium">Rewards Earned</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">XP Gained</p>
                    <p className="font-medium text-blue-600">+{totalXP} XP</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">HP</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">HP Consumed</p>
                    <p className="font-medium text-red-600">-{estimatedHP} HP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Type Info */}
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              {session.session_type === 'challenge' ? (
                <>🏆 Challenge completed! Great competitive spirit!</>
              ) : session.format === 'doubles' ? (
                <>🤝 Doubles match finished! Excellent teamwork!</>
              ) : (
                <>🎾 Practice session complete! Keep improving!</>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}