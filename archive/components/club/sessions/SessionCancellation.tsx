import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Coins, 
  DollarSign,
  Calendar,
  Target,
  GraduationCap,
  Users
} from 'lucide-react';
import { ClubSession } from '@/hooks/useClubSessions';

interface SessionCancellationProps {
  session: ClubSession | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (sessionId: string, reason?: string) => Promise<void>;
}

const CANCELLATION_REASONS = [
  'Schedule conflict',
  'Weather conditions',
  'Personal emergency',
  'Illness',
  'Equipment issues',
  'Changed my mind',
  'Other'
];

export function SessionCancellation({ session, isOpen, onClose, onConfirm }: SessionCancellationProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  if (!session) return null;

  const getRefundInfo = () => {
    const now = new Date();
    const sessionStart = new Date(session.start_datetime);
    const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    let refundPolicy = '';

    if (hoursUntilSession >= 24) {
      refundPercentage = 1.0;
      refundPolicy = 'Full refund (24+ hours notice)';
    } else if (hoursUntilSession >= 12) {
      refundPercentage = 0.8;
      refundPolicy = '80% refund (12-24 hours notice)';
    } else if (hoursUntilSession >= 4) {
      refundPercentage = 0.5;
      refundPolicy = '50% refund (4-12 hours notice)';
    } else if (hoursUntilSession >= 2) {
      refundPercentage = 0.0;
      refundPolicy = 'No refund (less than 4 hours notice)';
    } else {
      refundPercentage = 0.0;
      refundPolicy = 'Cancellation not allowed (less than 2 hours notice)';
    }

    const refundTokens = Math.floor(session.cost_tokens * refundPercentage);
    const refundMoney = session.cost_money * refundPercentage;

    return {
      percentage: refundPercentage,
      policy: refundPolicy,
      tokens: refundTokens,
      money: refundMoney,
      canCancel: hoursUntilSession >= 2
    };
  };

  const getSessionTypeIcon = () => {
    switch (session.session_type) {
      case 'court_booking':
        return <Target className="h-4 w-4" />;
      case 'coaching':
        return <GraduationCap className="h-4 w-4" />;
      case 'group_training':
        return <Users className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const handleConfirmCancellation = async () => {
    if (!session) return;

    const reason = selectedReason === 'Other' ? customReason.trim() : selectedReason;
    if (!reason) {
      return;
    }

    setIsCancelling(true);
    try {
      await onConfirm(session.id, reason);
      onClose();
      setSelectedReason('');
      setCustomReason('');
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const refundInfo = getRefundInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Cancel Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Details */}
          <div className="p-4 bg-tennis-green-bg/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-tennis-green-primary/10 rounded-lg">
                {getSessionTypeIcon()}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{session.title}</h3>
                <p className="text-sm text-tennis-green-medium mt-1">
                  {format(new Date(session.start_datetime), 'PPP p')} - 
                  {format(new Date(session.end_datetime), 'p')}
                </p>
                {session.description && (
                  <p className="text-sm text-tennis-green-medium mt-1">{session.description}</p>
                )}
              </div>
              <Badge className="bg-tennis-green-primary/20 text-tennis-green-dark">
                {session.session_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Refund Information */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refund Information
            </h4>
            
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Refund Policy:</span>
                <span className="text-sm">{refundInfo.policy}</span>
              </div>
              
              {refundInfo.percentage > 0 && (
                <div className="space-y-1">
                  {session.cost_tokens > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Coins className="h-3 w-3" />
                        Tokens refund:
                      </span>
                      <span className="font-medium">{refundInfo.tokens} tokens</span>
                    </div>
                  )}
                  {session.cost_money > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Money refund:
                      </span>
                      <span className="font-medium">${refundInfo.money.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {!refundInfo.canCancel ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This session cannot be cancelled as it starts in less than 2 hours. 
                Please contact club management for assistance.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Cancellation Reason */}
              <div className="space-y-3">
                <h4 className="font-medium">Reason for Cancellation</h4>
                
                <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                  {CANCELLATION_REASONS.map((reason) => (
                    <div key={reason} className="flex items-center space-x-2">
                      <RadioGroupItem value={reason} id={reason} />
                      <Label htmlFor={reason} className="text-sm">{reason}</Label>
                    </div>
                  ))}
                </RadioGroup>

                {selectedReason === 'Other' && (
                  <Textarea
                    placeholder="Please specify the reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={3}
                  />
                )}
              </div>

              {/* Warning */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Once cancelled, this session cannot be restored. 
                  {refundInfo.percentage > 0 
                    ? ' The refund will be processed within 1-3 business days.'
                    : ' No refund will be issued for this cancellation.'
                  }
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        {refundInfo.canCancel && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCancelling}
            >
              Keep Session
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancellation}
              disabled={
                isCancelling || 
                !selectedReason || 
                (selectedReason === 'Other' && !customReason.trim())
              }
            >
              {isCancelling ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}