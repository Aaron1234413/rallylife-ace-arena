import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Trophy, Users, Coins, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  const [step, setStep] = useState<'select' | 'preview' | 'confirm' | 'error'>('select');
  const [rewardPreview, setRewardPreview] = useState<any>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  
  const { toast } = useToast();

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
    setIsLoadingPreview(true);
    setCompletionError(null);
    
    try {
      const preview = await previewRewards(session.id, isDraw ? undefined : selectedWinner || undefined);
      setRewardPreview(preview);
    } catch (error) {
      console.error('Failed to load reward preview:', error);
      toast({
        title: "Preview Error",
        description: "Failed to calculate rewards. Please try again.",
        variant: "destructive"
      });
      setStep('select');
    } finally {
      setIsLoadingPreview(false);
    }
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
    setCompletionError(null);
    
    try {
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
        toast({
          title: "Session Completed!",
          description: "Rewards have been distributed to participants.",
        });
        onComplete();
        onOpenChange(false);
        resetState();
      } else {
        // Handle database/business logic errors
        const errorMessage = result.error || 'Failed to complete session';
        setCompletionError(errorMessage);
        setStep('error');
        
        toast({
          title: "Completion Failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      // Handle network/unexpected errors
      console.error('Session completion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setCompletionError(errorMessage);
      setStep('error');
      
      toast({
        title: "Completion Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive"
      });
    }
  };

  const resetState = () => {
    setStep('select');
    setSelectedWinner(null);
    setIsDraw(false);
    setRewardPreview(null);
    setCompletionError(null);
  };

  const handleRetry = () => {
    setCompletionError(null);
    setStep('preview');
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

        {step === 'preview' && (
          <div className="space-y-4">
            {isLoadingPreview ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Calculating rewards...
                </div>
              </div>
            ) : rewardPreview ? (
              <>
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
                    disabled={isCompleting}
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
              </>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load reward preview. Please go back and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-sm font-medium">
              Processing completion and distributing rewards...
            </div>
            <div className="text-xs text-muted-foreground">
              This may take a few moments
            </div>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-medium">Session completion failed</div>
                <div className="text-sm">
                  {completionError || 'An unexpected error occurred'}
                </div>
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="font-medium">What you can try:</div>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Check your internet connection</li>
                <li>Verify all participants are still active</li>
                <li>Try completing the session again</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('select')}
                className="flex-1"
              >
                Start Over
              </Button>
              <Button 
                onClick={handleRetry}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}