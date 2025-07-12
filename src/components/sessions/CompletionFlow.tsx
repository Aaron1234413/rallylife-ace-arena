import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Trophy, Users, Coins, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUnifiedSessionCompletion } from '@/hooks/useUnifiedSessionCompletion';

interface CompletionFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: any;
  participants: any[];
  onComplete: () => void;
}

export function CompletionFlow({
  open,
  onOpenChange,
  session,
  participants,
  onComplete
}: CompletionFlowProps) {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [step, setStep] = useState<'select' | 'preview' | 'confirm'>('select');
  const [rewardPreview, setRewardPreview] = useState<any>(null);

  const {
    completeSession,
    validateCompletion,
    previewRewards,
    isCompleting,
    isValidating
  } = useUnifiedSessionCompletion();

  useEffect(() => {
    if (open && step === 'preview' && (selectedWinner || isDraw)) {
      loadRewardPreview();
    }
  }, [step, selectedWinner, isDraw, open]);

  const loadRewardPreview = async () => {
    const preview = await previewRewards(session.id, isDraw ? undefined : selectedWinner || undefined);
    setRewardPreview(preview);
  };

  const handleSelectWinner = (participantId: string) => {
    setSelectedWinner(participantId);
    setIsDraw(false);
    setStep('preview');
  };

  const handleDeclareSDraw = () => {
    setSelectedWinner(null);
    setIsDraw(true);
    setStep('preview');
  };

  const handleComplete = async () => {
    console.log('🏁 Starting session completion...', {
      sessionId: session.id,
      selectedWinner,
      isDraw,
      sessionType: session.session_type
    });
    
    setStep('confirm');
    
    // Calculate session duration from start time to now
    const startTime = new Date(session.start_time || session.created_at);
    const sessionDurationMinutes = Math.max(1, Math.floor((Date.now() - startTime.getTime()) / (1000 * 60)));
    
    const result = await completeSession(
      session.id,
      isDraw ? undefined : selectedWinner || undefined,
      undefined,
      {
        platform_fee_rate: 0.1,
        session_duration_minutes: sessionDurationMinutes
      }
    );

    console.log('🏁 Completion result:', result);

    if (result.success) {
      onComplete();
      onOpenChange(false);
      setStep('select');
      setSelectedWinner(null);
      setIsDraw(false);
    }
  };

  const selectedParticipant = participants.find(p => p.user_id === selectedWinner);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Complete Session
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Select the winner or declare a draw to complete the session.
            </div>

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants
              </h4>
              
              {participants.map((participant) => (
                <Card 
                  key={participant.user_id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelectWinner(participant.user_id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {participant.profiles?.full_name || participant.user_id}
                        </div>
                        {participant.stakes_contributed > 0 && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Coins className="h-3 w-3" />
                            {participant.stakes_contributed} tokens staked
                          </div>
                        )}
                      </div>
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Separator />

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleDeclareSDraw}
            >
              Declare Draw (Refund Stakes)
            </Button>
          </div>
        )}

        {step === 'preview' && rewardPreview && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {isDraw 
                  ? "Draw declared - all stakes will be refunded to participants"
                  : `${selectedParticipant?.profiles?.full_name || selectedParticipant?.user_id} selected as winner`
                }
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Reward Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Stakes</span>
                  <span className="font-medium">{rewardPreview.total_stakes} tokens</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Platform Fee (10%)</span>
                  <span className="font-medium text-muted-foreground">
                    -{rewardPreview.platform_fee} tokens
                  </span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-sm font-medium">
                  <span>{isDraw ? 'Refund Amount' : 'Winner Payout'}</span>
                  <span className="text-green-600">
                    {isDraw ? rewardPreview.total_stakes : rewardPreview.net_payout} tokens
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  • All participants earn base XP
                  • {isDraw ? 'Stakes refunded equally' : 'Winner gets bonus XP'}
                  • HP changes based on session type
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('select')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={isCompleting}
                className="flex-1"
              >
                {isCompleting ? 'Completing...' : 'Complete Session'}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <div className="text-sm">
              Processing completion and distributing rewards...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}