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
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  DollarSign, 
  Clock, 
  MapPin, 
  User,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

interface PaymentBreakdown {
  tokens: number;
  cash: number;
  totalServiceValue: number;
  savings: number;
  savingsPercentage: number;
}

interface ServiceDetails {
  name: string;
  type: string;
  organizerName?: string;
  duration?: number;
  location?: string;
  description?: string;
}

interface PaymentConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  paymentBreakdown: PaymentBreakdown;
  serviceDetails: ServiceDetails;
  userTokenBalance: number;
}

export function PaymentConfirmationDialog({
  open,
  onClose,
  onConfirm,
  loading,
  paymentBreakdown,
  serviceDetails,
  userTokenBalance
}: PaymentConfirmationDialogProps) {
  const { tokens, cash, totalServiceValue, savings, savingsPercentage } = paymentBreakdown;
  
  const isTokenOnlyPayment = tokens > 0 && cash === 0;
  const isCashOnlyPayment = cash > 0 && tokens === 0;
  const isHybridPayment = tokens > 0 && cash > 0;
  
  const remainingTokens = userTokenBalance - tokens;
  const isLowTokenBalance = remainingTokens < 50; // Warn if less than 50 tokens remain

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Confirm Your Booking
          </DialogTitle>
          <DialogDescription>
            Please review your payment details before confirming your booking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Details */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Service Details</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Service:</span>
                <span className="font-medium text-blue-900">{serviceDetails.name}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-blue-700">Type:</span>
                <Badge variant="outline" className="text-xs">
                  {serviceDetails.type.replace('_', ' ')}
                </Badge>
              </div>
              
              {serviceDetails.organizerName && (
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Organizer:
                  </span>
                  <span className="font-medium text-blue-900">{serviceDetails.organizerName}</span>
                </div>
              )}
              
              {serviceDetails.duration && (
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Duration:
                  </span>
                  <span className="font-medium text-blue-900">{serviceDetails.duration} min</span>
                </div>
              )}
              
              {serviceDetails.location && (
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location:
                  </span>
                  <span className="font-medium text-blue-900">{serviceDetails.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="p-4 bg-gray-50 border rounded-lg">
            <h4 className="font-medium text-sm mb-3">Payment Breakdown</h4>
            
            <div className="space-y-3">
              {/* Token Payment */}
              {tokens > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Tokens:</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{tokens} tokens</div>
                    <div className="text-xs text-gray-500">
                      ${(tokens * 0.01).toFixed(2)} value
                    </div>
                  </div>
                </div>
              )}
              
              {/* Cash Payment */}
              {cash > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Cash:</span>
                  </div>
                  <div className="font-medium">${cash.toFixed(2)}</div>
                </div>
              )}
              
              {/* Total */}
              <div className="border-t pt-3 flex items-center justify-between font-medium">
                <span>Total Service Value:</span>
                <span>${totalServiceValue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Type Badge */}
          <div className="flex justify-center">
            {isTokenOnlyPayment && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                <Coins className="h-3 w-3 mr-1" />
                Token-Only Payment
              </Badge>
            )}
            {isCashOnlyPayment && (
              <Badge className="bg-green-100 text-green-800 border-green-300">
                <DollarSign className="h-3 w-3 mr-1" />
                Cash-Only Payment
              </Badge>
            )}
            {isHybridPayment && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                <Coins className="h-3 w-3 mr-1" />
                Hybrid Payment
              </Badge>
            )}
          </div>

          {/* Savings Info */}
          {savings > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">Great Savings!</span>
              </div>
              <p className="text-sm text-emerald-700">
                You're saving ${savings.toFixed(2)} ({savingsPercentage.toFixed(1)}% off) by using tokens!
              </p>
            </div>
          )}

          {/* Token Balance Warning */}
          {isLowTokenBalance && tokens > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Low Token Balance</span>
              </div>
              <p className="text-sm text-amber-700">
                After this purchase, you'll have {remainingTokens} tokens remaining.
                {remainingTokens < 20 && " Consider purchasing more tokens soon."}
              </p>
            </div>
          )}

          {/* Cash Only Warning */}
          {isCashOnlyPayment && userTokenBalance > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Info className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Token Tip</span>
              </div>
              <p className="text-sm text-blue-700">
                You have {userTokenBalance} tokens available. Consider using some tokens to save money on this purchase!
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Booking...
              </div>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}