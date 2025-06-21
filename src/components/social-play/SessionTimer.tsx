
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface SessionTimerProps {
  startTime: Date;
  isActive: boolean;
  className?: string;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ 
  startTime, 
  isActive, 
  className = "" 
}) => {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const updateDuration = () => {
      const now = new Date();
      const diffMs = now.getTime() - startTime.getTime();
      setDuration(Math.floor(diffMs / (1000 * 60))); // Convert to minutes
    };

    // Update immediately
    updateDuration();
    
    // Then update every minute
    const interval = setInterval(updateDuration, 60000);
    
    return () => clearInterval(interval);
  }, [startTime, isActive]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Clock className="h-4 w-4" />
      <span className="font-mono">{formatDuration(duration)}</span>
    </div>
  );
};
