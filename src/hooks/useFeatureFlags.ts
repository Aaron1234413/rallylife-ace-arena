import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface FeatureFlags {
  useUnifiedSessions: boolean;
  enableRealTimeUpdates: boolean;
  enableSocialPlayMigration: boolean;
  enableTrainingMigration: boolean;
  enableMatchMigration: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  useUnifiedSessions: false,
  enableRealTimeUpdates: true,
  enableSocialPlayMigration: false,
  enableTrainingMigration: false,
  enableMatchMigration: false,
};

// Feature flag configuration - can be controlled per user or globally
const FEATURE_FLAG_CONFIG = {
  // Global rollout percentages (0-100)
  globalRollout: {
    useUnifiedSessions: 25, // 25% of users get unified sessions
    enableSocialPlayMigration: 10, // 10% get social play migration
    enableTrainingMigration: 5,    // 5% get training migration
    enableMatchMigration: 0,       // 0% get match migration (not ready)
  },
  
  // Override flags for specific user groups
  userOverrides: {
    // Example: Specific user IDs that should get all features
    enabledUsers: [] as string[],
    // Users that should be excluded from all experiments
    excludedUsers: [] as string[],
  },
};

export function useFeatureFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setFlags(DEFAULT_FLAGS);
      setIsLoading(false);
      return;
    }

    const calculateFlags = () => {
      const newFlags = { ...DEFAULT_FLAGS };

      // Check if user is excluded from all experiments
      if (FEATURE_FLAG_CONFIG.userOverrides.excludedUsers.includes(user.id)) {
        setFlags(newFlags);
        setIsLoading(false);
        return;
      }

      // Check if user should get all features enabled
      if (FEATURE_FLAG_CONFIG.userOverrides.enabledUsers.includes(user.id)) {
        setFlags({
          useUnifiedSessions: true,
          enableRealTimeUpdates: true,
          enableSocialPlayMigration: true,
          enableTrainingMigration: true,
          enableMatchMigration: true,
        });
        setIsLoading(false);
        return;
      }

      // Calculate based on user ID hash for consistent assignment
      const userHash = hashUserId(user.id);
      
      // Apply global rollout percentages
      newFlags.useUnifiedSessions = userHash % 100 < FEATURE_FLAG_CONFIG.globalRollout.useUnifiedSessions;
      newFlags.enableSocialPlayMigration = userHash % 100 < FEATURE_FLAG_CONFIG.globalRollout.enableSocialPlayMigration;
      newFlags.enableTrainingMigration = (userHash + 17) % 100 < FEATURE_FLAG_CONFIG.globalRollout.enableTrainingMigration;
      newFlags.enableMatchMigration = (userHash + 31) % 100 < FEATURE_FLAG_CONFIG.globalRollout.enableMatchMigration;

      setFlags(newFlags);
      setIsLoading(false);
    };

    calculateFlags();
  }, [user?.id]);

  // Simple hash function for consistent user assignment
  const hashUserId = (userId: string): number => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  };

  // Admin function to override flags (for testing)
  const overrideFlags = (overrides: Partial<FeatureFlags>) => {
    setFlags(prev => ({ ...prev, ...overrides }));
  };

  // Reset to calculated flags
  const resetFlags = () => {
    if (user?.id) {
      const userHash = hashUserId(user.id);
      const newFlags = { ...DEFAULT_FLAGS };
      
      newFlags.useUnifiedSessions = userHash % 100 < FEATURE_FLAG_CONFIG.globalRollout.useUnifiedSessions;
      newFlags.enableSocialPlayMigration = userHash % 100 < FEATURE_FLAG_CONFIG.globalRollout.enableSocialPlayMigration;
      newFlags.enableTrainingMigration = (userHash + 17) % 100 < FEATURE_FLAG_CONFIG.globalRollout.enableTrainingMigration;
      newFlags.enableMatchMigration = (userHash + 31) % 100 < FEATURE_FLAG_CONFIG.globalRollout.enableMatchMigration;
      
      setFlags(newFlags);
    }
  };

  return {
    flags,
    isLoading,
    overrideFlags,
    resetFlags,
    
    // Convenience getters
    shouldUseUnifiedSessions: flags.useUnifiedSessions,
    shouldMigrateSocialPlay: flags.enableSocialPlayMigration,
    shouldMigrateTraining: flags.enableTrainingMigration,
    shouldMigrateMatch: flags.enableMatchMigration,
  };
}

// Hook for A/B testing specific features
export function useABTest(testName: string, variants: string[] = ['A', 'B']) {
  const { user } = useAuth();
  const [variant, setVariant] = useState<string>(variants[0]);

  useEffect(() => {
    if (!user?.id) {
      setVariant(variants[0]);
      return;
    }

    // Create a hash specific to this test and user
    const testHash = hashString(`${testName}-${user.id}`);
    const variantIndex = testHash % variants.length;
    setVariant(variants[variantIndex]);
  }, [user?.id, testName, variants]);

  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  return variant;
}