import { useState } from 'react';

export function useJoinSessionState() {
  const [joiningSessionId, setJoiningSessionId] = useState<string | null>(null);
  
  const startJoining = (sessionId: string) => {
    setJoiningSessionId(sessionId);
  };
  
  const stopJoining = () => {
    setJoiningSessionId(null);
  };
  
  const isJoining = (sessionId: string) => {
    return joiningSessionId === sessionId;
  };
  
  return {
    isJoining,
    startJoining,
    stopJoining
  };
}