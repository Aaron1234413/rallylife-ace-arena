import React, { createContext, useContext, ReactNode } from 'react';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { SafeContextProvider } from '@/components/ui/safe-context-provider';

interface FeatureFlags {
  useUnifiedSessions: boolean;
  enableRealTimeUpdates: boolean;
  enableSocialPlayMigration: boolean;
  enableTrainingMigration: boolean;
  enableMatchMigration: boolean;
}

interface FeatureFlagContextType {
  flags: FeatureFlags;
  isLoading: boolean;
  overrideFlags: (overrides: Partial<FeatureFlags>) => void;
  resetFlags: () => void;
  shouldUseUnifiedSessions: boolean;
  shouldMigrateSocialPlay: boolean;
  shouldMigrateTraining: boolean;
  shouldMigrateMatch: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const featureFlags = useFeatureFlags();

  return (
    <SafeContextProvider 
      requireAuth={false}
      loadingMessage="Loading feature configuration..."
      fallbackComponent={
        <div className="text-center p-4">
          <p className="text-muted-foreground">Feature flags unavailable</p>
        </div>
      }
    >
      <FeatureFlagContext.Provider value={featureFlags}>
        {children}
      </FeatureFlagContext.Provider>
    </SafeContextProvider>
  );
}

export function useFeatureFlagContext() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }
  return context;
}