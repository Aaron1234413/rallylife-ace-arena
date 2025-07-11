import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Users, 
  Coins, 
  Heart,
  Star,
  Clock,
  CheckCircle,
  Building
} from 'lucide-react';
import { UnifiedSession, SessionParticipant } from '@/hooks/useUnifiedSessions';
import { TokenDistributionSummary } from './TokenDistributionSummary';
import { cn } from '@/lib/utils';

interface WinnerSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: UnifiedSession;
  participants: SessionParticipant[];
  duration: number;
  onWinnerSelected: (winnerData: any) => Promise<void>;
  loading: boolean;
}

interface WinnerData {
  winner_id?: string;
  winning_team?: string[];
  is_draw?: boolean;
}

export function WinnerSelectionDialog({
  open,
  onOpenChange,
  session,
  participants,
  duration,
  onWinnerSelected,
  loading
}: WinnerSelectionDialogProps) {
  const [selectedWinner, setSelectedWinner] = useState<WinnerData>({});
  const [isDraw, setIsDraw] = useState(false);

  const totalStakes = session.stakes_amount * participants.length;
  const platformFee = Math.floor(totalStakes * 0.1);
  const winnerPayout = totalStakes - platformFee;
  
  // Calculate XP and HP impact based on duration
  const baseXP = Math.floor(duration / 60) * 10; // 10 XP per minute
  const hpReduction = session.session_type === 'challenge' ? Math.floor(duration / 300) * 5 : 0; // 5 HP per 5 minutes for challenges

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getParticipantInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleWinnerSelection = (participantId: string) => {
    if (isDraw) {
      setIsDraw(false);
    }
    setSelectedWinner({ winner_id: participantId });
  };

  const handleDrawSelection = () => {
    setIsDraw(true);
    setSelectedWinner({ is_draw: true });
  };

  const handleSubmit = async () => {
    if (!selectedWinner.winner_id && !isDraw) return;

    const winnerData = {
      ...selectedWinner,
      duration_seconds: duration,
      total_stakes: totalStakes,
      platform_fee: platformFee,
      winner_payout: isDraw ? 0 : winnerPayout,
      base_xp: baseXP,
      hp_reduction: hpReduction
    };

    await onWinnerSelected(winnerData);
  };

  const isValidSelection = selectedWinner.winner_id || isDraw;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Select Session Winner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{formatDuration(duration)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Participants</p>
                  <p className="font-medium">{participants.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Total Stakes</p>
                  <p className="font-medium">{totalStakes} tokens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winner Selection */}
          <div>
            <h3 className="font-medium mb-4">Select Winner</h3>
            <div className="grid grid-cols-1 gap-3">
              {participants.map((participant) => (
                <Card 
                  key={participant.id}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    selectedWinner.winner_id === participant.user_id
                      ? "ring-2 ring-primary shadow-md"
                      : "hover:ring-1 hover:ring-muted-foreground/20"
                  )}
                  onClick={() => handleWinnerSelection(participant.user_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.user?.avatar_url} />
                        <AvatarFallback>
                          {getParticipantInitials(participant.user?.full_name || 'Unknown')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {participant.user?.full_name || 'Unknown Player'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={participant.user_id === session.creator_id ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {participant.user_id === session.creator_id ? "Creator" : "Player"}
                          </Badge>
                          {participant.tokens_paid > 0 && (
                            <span className="text-xs text-muted-foreground">
                              Paid {participant.tokens_paid} tokens
                            </span>
                          )}
                        </div>
                      </div>
                      {selectedWinner.winner_id === participant.user_id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Draw Option */}
              <Card 
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  isDraw
                    ? "ring-2 ring-muted-foreground shadow-md"
                    : "hover:ring-1 hover:ring-muted-foreground/20"
                )}
                onClick={handleDrawSelection}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Draw / No Winner</p>
                      <p className="text-sm text-muted-foreground">
                        Stakes will be returned to participants
                      </p>
                    </div>
                    {isDraw && (
                      <CheckCircle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Token Distribution Summary */}
          {isValidSelection && (
            <>
              <Separator />
              <TokenDistributionSummary
                sessionType={session.session_type as 'challenge' | 'social' | 'training'}
                totalStakes={totalStakes}
                participantCount={participants.length}
                winnerId={selectedWinner.winner_id}
                winnerName={
                  selectedWinner.winner_id 
                    ? participants.find(p => p.user_id === selectedWinner.winner_id)?.user?.full_name 
                    : undefined
                }
                isDraw={isDraw}
                platformFeePercentage={10}
                participantContributions={participants.map(p => ({
                  userId: p.user_id,
                  userName: p.user?.full_name || 'Unknown Player',
                  contribution: p.tokens_paid || session.stakes_amount,
                  isWinner: selectedWinner.winner_id === p.user_id,
                  tokensReceived: isDraw 
                    ? p.tokens_paid || session.stakes_amount 
                    : selectedWinner.winner_id === p.user_id 
                    ? winnerPayout 
                    : 0
                }))}
              />

              {/* XP and HP Summary */}
              <Card className="bg-muted/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Additional Rewards
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">All Participants Receive:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Base XP:</span>
                        <span className="font-medium">+{baseXP}</span>
                      </div>
                      {hpReduction > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            HP Loss:
                          </span>
                          <span className="font-medium text-destructive">-{hpReduction}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValidSelection || loading}
              className="flex-1"
            >
              {loading ? 'Completing...' : 'Complete Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}