import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  AlertTriangle, 
  Coins, 
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface CancelSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  session: {
    id: string;
    title: string;
    scheduled_date: string;
    start_time: string;
    cost_per_person_tokens: number;
    cost_per_person_money: number;
  } | null;
  loading?: boolean;
}

export function CancelSessionDialog({
  isOpen,
  onClose,
  onConfirm,
  session,
  loading = false
}: CancelSessionDialogProps) {
  const [reason, setReason] = useState('');
  const [refundInfo, setRefundInfo] = useState<{
    percentage: number;
    tokensRefund: number;
    moneyRefund: number;
    hoursUntilSession: number;
  } | null>(null);

  useEffect(() => {
    if (session && isOpen) {
      // Calculate refund information
      const sessionDateTime = new Date(`${session.scheduled_date}T${session.start_time}`);
      const now = new Date();
      const hoursUntilSession = (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      let percentage = 0;
      if (hoursUntilSession < 0) {
        percentage = 0; // Session already started
      } else if (hoursUntilSession >= 24) {
        percentage = 100; // 24+ hours: 100% refund
      } else if (hoursUntilSession >= 2) {
        percentage = 75; // 2-24 hours: 75% refund
      } else {
        percentage = 50; // Less than 2 hours: 50% refund
      }

      const tokensRefund = Math.floor(session.cost_per_person_tokens * (percentage / 100));
      const moneyRefund = session.cost_per_person_money * (percentage / 100);

      setRefundInfo({
        percentage,
        tokensRefund,
        moneyRefund,
        hoursUntilSession: Math.max(0, hoursUntilSession)
      });
    }
  }, [session, isOpen]);

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason('');
  };

  const handleClose = () => {
    onClose();
    setReason('');
  };

  if (!session || !refundInfo) return null;

  const sessionDateTime = new Date(`${session.scheduled_date}T${session.start_time}`);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Cancel Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">{session.title}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(sessionDateTime, 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{format(sessionDateTime, 'h:mm a')}</span>
              </div>
            </div>
          </div>

          {/* Refund Information */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={refundInfo.percentage >= 75 ? "default" : refundInfo.percentage >= 50 ? "secondary" : "destructive"}>
                {refundInfo.percentage}% Refund
              </Badge>
              <span className="text-xs text-gray-600">
                {refundInfo.hoursUntilSession < 2 ? 'Less than 2 hours' :
                 refundInfo.hoursUntilSession < 24 ? '2-24 hours' : '24+ hours'} until session
              </span>
            </div>

            <div className="space-y-2">
              {session.cost_per_person_tokens > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    Tokens refund:
                  </span>
                  <span className="font-medium">{refundInfo.tokensRefund} tokens</span>
                </div>
              )}

              {session.cost_per_person_money > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Money refund:
                  </span>
                  <span className="font-medium">${refundInfo.moneyRefund.toFixed(2)}</span>
                </div>
              )}

              {refundInfo.percentage === 0 && (
                <p className="text-sm text-red-600">
                  No refund available - session has already started or passed.
                </p>
              )}
            </div>
          </div>

          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="Let participants know why you're cancelling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Warning for participants */}
          <div className="text-xs text-gray-600 bg-amber-50 p-2 rounded border border-amber-200">
            <p>All participants will receive a full refund regardless of the cancellation timing.</p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Keep Session
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}