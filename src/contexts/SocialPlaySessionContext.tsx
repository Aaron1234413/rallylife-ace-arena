
import React, { createContext, useContext, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Simplified context for Phase 1 - just basic event joining functionality
interface SocialPlaySessionContextType {
  joinEvent: (eventId: string) => Promise<void>;
  loading: boolean;
}

const SocialPlaySessionContext = createContext<SocialPlaySessionContextType | undefined>(undefined);

export function SocialPlaySessionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  const joinEvent = async (eventId: string) => {
    // Simplified event joining logic for Phase 1
    console.log('Joining event:', eventId);
    toast({
      title: 'Event Joined',
      description: 'You have successfully joined the event!',
    });
  };

  return (
    <SocialPlaySessionContext.Provider
      value={{
        joinEvent,
        loading: false
      }}
    >
      {children}
    </SocialPlaySessionContext.Provider>
  );
}

export function useSocialPlaySession() {
  const context = useContext(SocialPlaySessionContext);
  if (context === undefined) {
    throw new Error('useSocialPlaySession must be used within a SocialPlaySessionProvider');
  }
  return context;
}
