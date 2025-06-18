
import { useState, useEffect, useRef } from 'react';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';

export function useTrainingTimer() {
  const { sessionData } = useTrainingSession();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const checkInTriggeredRef = useRef(false);

  useEffect(() => {
    if (!sessionData.startTime) {
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Reset check-in triggered flag when session starts
    checkInTriggeredRef.current = false;

    // Start timer to track session duration
    timerRef.current = setInterval(() => {
      const startTime = new Date(sessionData.startTime!);
      const now = new Date();
      const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60); // in minutes
      
      setSessionDuration(duration);

      // Trigger check-in at 30 minutes if not already triggered
      if (duration >= 30 && !checkInTriggeredRef.current && !sessionData.midSessionCheckIn) {
        setShowCheckIn(true);
        checkInTriggeredRef.current = true;
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionData.startTime, sessionData.midSessionCheckIn]);

  const closeCheckIn = () => {
    setShowCheckIn(false);
  };

  return {
    showCheckIn,
    closeCheckIn,
    sessionDuration,
  };
}
