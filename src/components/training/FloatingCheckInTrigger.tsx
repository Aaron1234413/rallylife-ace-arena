
import React from 'react';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';
import { useTrainingTimer } from '@/hooks/useTrainingTimer';
import { MidSessionModal } from './MidSessionModal';

export function FloatingCheckInTrigger() {
  const { isSessionActive } = useTrainingSession();
  const { showCheckIn, closeCheckIn } = useTrainingTimer();

  // Only render if there's an active training session
  if (!isSessionActive) {
    return null;
  }

  return (
    <MidSessionModal
      isOpen={showCheckIn}
      onClose={closeCheckIn}
    />
  );
}
