
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { MidMatchCheckInModal } from './MidMatchCheckInModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const FloatingCheckInButton = () => {
  const { sessionData, isSessionActive, loading } = useMatchSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show if no active session or still loading
  if (!isSessionActive || !sessionData || loading) {
    return null;
  }

  // Calculate match duration
  const matchDuration = Math.floor((new Date().getTime() - sessionData.startTime.getTime()) / (1000 * 60));

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-14 w-14 rounded-full bg-tennis-green-dark hover:bg-tennis-green text-white shadow-lg relative"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          
          {/* Loading indicator */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <LoadingSpinner size="sm" className="text-white" />
            </div>
          )}
        </Button>
        
        {/* Duration and connection status indicators */}
        <div className="absolute -top-2 -left-2 space-y-1">
          {/* Duration indicator */}
          <div className="bg-white rounded-full px-2 py-1 shadow-sm border">
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
              <Clock className="h-3 w-3" />
              {matchDuration}m
            </div>
          </div>
          
          {/* Connection status */}
          <div className={`rounded-full px-2 py-1 shadow-sm border ${
            isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-1 text-xs font-medium">
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 text-green-600" />
                  <span className="text-green-700">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-600" />
                  <span className="text-red-700">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <MidMatchCheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
