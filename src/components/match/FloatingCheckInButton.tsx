
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Clock } from 'lucide-react';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { MidMatchCheckInModal } from './MidMatchCheckInModal';

export const FloatingCheckInButton = () => {
  const { sessionData, isSessionActive } = useMatchSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Don't show if no active session
  if (!isSessionActive || !sessionData) {
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
          className="h-14 w-14 rounded-full bg-tennis-green-dark hover:bg-tennis-green text-white shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
        
        {/* Duration indicator */}
        <div className="absolute -top-2 -left-2 bg-white rounded-full px-2 py-1 shadow-sm border">
          <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
            <Clock className="h-3 w-3" />
            {matchDuration}m
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
