import { useMemo } from 'react';
import { useSubscriptionTiers } from './useSubscriptionTiers';
import { ClubSubscription, ClubUsage } from './useClubSubscription';

export interface TierLimits {
  memberLimit: number;
  coachLimit: number;
  courtLimit: number;
  features: string[];
  canInviteMembers: boolean;
  canAddCoaches: boolean;
  canAddCourts: boolean;
  hasRealtimeUpdates: boolean;
  hasSessionAnalytics: boolean;
  hasRecurringScheduling: boolean;
  hasPeakPricing: boolean;
  hasCustomBranding: boolean;
}

export interface UsageStatus {
  memberUsagePercent: number;
  coachUsagePercent: number;
  courtUsagePercent: number;
  isNearMemberLimit: boolean;
  isNearCoachLimit: boolean;
  isNearCourtLimit: boolean;
  isAtMemberLimit: boolean;
  isAtCoachLimit: boolean;
  isAtCourtLimit: boolean;
}

export function useTierEnforcement(
  subscription: ClubSubscription | null,
  usage: ClubUsage | null,
  currentCourtCount?: number
) {
  const { getTierLimits } = useSubscriptionTiers();

  const tierLimits = useMemo((): TierLimits => {
    const tierId = subscription?.tier_id || 'community';
    const baseLimits = getTierLimits(tierId);
    
    return {
      memberLimit: baseLimits.memberLimit,
      coachLimit: baseLimits.coachLimit,
      courtLimit: baseLimits.courtLimit === -1 ? Infinity : baseLimits.courtLimit, // Handle unlimited courts
      features: baseLimits.features,
      canInviteMembers: true, // All tiers can invite
      canAddCoaches: true, // All tiers can add coaches
      canAddCourts: true, // All tiers can add courts
      hasRealtimeUpdates: tierId !== 'community',
      hasSessionAnalytics: tierId !== 'community',
      hasRecurringScheduling: ['plus', 'pro'].includes(tierId),
      hasPeakPricing: ['plus', 'pro'].includes(tierId),
      hasCustomBranding: tierId === 'pro'
    };
  }, [subscription?.tier_id, getTierLimits]);

  const usageStatus = useMemo((): UsageStatus => {
    if (!usage || !tierLimits) {
      return {
        memberUsagePercent: 0,
        coachUsagePercent: 0,
        courtUsagePercent: 0,
        isNearMemberLimit: false,
        isNearCoachLimit: false,
        isNearCourtLimit: false,
        isAtMemberLimit: false,
        isAtCoachLimit: false,
        isAtCourtLimit: false
      };
    }

    const memberUsagePercent = (usage.active_members / tierLimits.memberLimit) * 100;
    const coachUsagePercent = (usage.active_coaches / tierLimits.coachLimit) * 100;
    const courtUsagePercent = tierLimits.courtLimit === Infinity 
      ? 0 // Unlimited courts
      : ((currentCourtCount || 0) / tierLimits.courtLimit) * 100;

    return {
      memberUsagePercent,
      coachUsagePercent,
      courtUsagePercent,
      isNearMemberLimit: memberUsagePercent >= 80,
      isNearCoachLimit: coachUsagePercent >= 80,
      isNearCourtLimit: courtUsagePercent >= 80,
      isAtMemberLimit: usage.active_members >= tierLimits.memberLimit,
      isAtCoachLimit: usage.active_coaches >= tierLimits.coachLimit,
      isAtCourtLimit: tierLimits.courtLimit !== Infinity && (currentCourtCount || 0) >= tierLimits.courtLimit
    };
  }, [usage, tierLimits, currentCourtCount]);

  const checkCanInviteMember = (): { allowed: boolean; reason?: string } => {
    if (!tierLimits || !usage) {
      return { allowed: true };
    }

    if (usageStatus.isAtMemberLimit) {
      return {
        allowed: false,
        reason: `You've reached your member limit of ${tierLimits.memberLimit}. Upgrade your plan to invite more members.`
      };
    }

    return { allowed: true };
  };

  const checkCanAddCoach = (): { allowed: boolean; reason?: string } => {
    if (!tierLimits || !usage) {
      return { allowed: true };
    }

    if (usageStatus.isAtCoachLimit) {
      return {
        allowed: false,
        reason: `You've reached your coach limit of ${tierLimits.coachLimit}. Upgrade your plan to add more coaches.`
      };
    }

    return { allowed: true };
  };

  const checkCanAddCourt = (): { allowed: boolean; reason?: string } => {
    if (!tierLimits) {
      return { allowed: true };
    }

    if (usageStatus.isAtCourtLimit) {
      return {
        allowed: false,
        reason: tierLimits.courtLimit === Infinity 
          ? 'Unlimited courts available' 
          : `You've reached your court limit of ${tierLimits.courtLimit}. Upgrade your plan to add more courts.`
      };
    }

    return { allowed: true };
  };

  const checkFeatureAccess = (feature: string): boolean => {
    if (!tierLimits) return false;
    
    switch (feature) {
      case 'realtime_updates':
        return tierLimits.hasRealtimeUpdates;
      case 'session_analytics':
        return tierLimits.hasSessionAnalytics;
      case 'recurring_scheduling':
        return tierLimits.hasRecurringScheduling;
      case 'peak_pricing':
        return tierLimits.hasPeakPricing;
      case 'custom_branding':
        return tierLimits.hasCustomBranding;
      default:
        return true; // Default features available to all
    }
  };

  const getUpgradeRecommendation = (): { shouldUpgrade: boolean; reason: string; suggestedTier?: string } => {
    if (!subscription || !usage) {
      return { shouldUpgrade: false, reason: '' };
    }

    const currentTier = subscription.tier_id;

    if (usageStatus.isNearMemberLimit || usageStatus.isNearCoachLimit || usageStatus.isNearCourtLimit) {
      if (currentTier === 'community') {
        return {
          shouldUpgrade: true,
          reason: 'You\'re approaching your limits. Upgrade to Core for higher limits and real-time features.',
          suggestedTier: 'core'
        };
      } else if (currentTier === 'core') {
        return {
          shouldUpgrade: true,
          reason: 'You\'re approaching your limits. Upgrade to Plus for higher limits and token rollover.',
          suggestedTier: 'plus'
        };
      } else if (currentTier === 'plus') {
        return {
          shouldUpgrade: true,
          reason: 'You\'re approaching your limits. Upgrade to Pro for unlimited capacity and custom branding.',
          suggestedTier: 'pro'
        };
      }
    }

    return { shouldUpgrade: false, reason: '' };
  };

  return {
    tierLimits,
    usageStatus,
    checkCanInviteMember,
    checkCanAddCoach,
    checkCanAddCourt,
    checkFeatureAccess,
    getUpgradeRecommendation
  };
}