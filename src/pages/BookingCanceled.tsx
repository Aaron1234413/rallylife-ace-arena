import React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export function BookingCanceled() {
  const handleReturnToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleTryAgain = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <XCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-orange-700 mb-2">
            Booking Canceled
          </h1>
          <p className="text-orange-600">
            Your court booking was canceled during payment. No charges were made to your account.
          </p>
        </div>

        <div className="space-y-4 mb-6 p-4 bg-orange-50/50 rounded-lg border border-orange-200">
          <div className="text-sm text-orange-700">
            <p className="font-medium mb-2">What happens next?</p>
            <ul className="text-left space-y-1 list-disc list-inside">
              <li>No payment was processed</li>
              <li>Your court selection was not reserved</li>
              <li>You can try booking again anytime</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleTryAgain}
            className="w-full bg-tennis-green-primary hover:bg-tennis-green-medium"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Booking Again
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReturnToDashboard}
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          Need help? <a href="/support" className="text-tennis-green-primary hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
}