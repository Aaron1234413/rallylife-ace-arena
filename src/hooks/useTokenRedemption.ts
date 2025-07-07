import { useState } from 'react';
import { useClubTokenPool } from './useClubTokenPool';
import { toast } from 'sonner';

export interface RedemptionCalculation {
  maxTokensAllowed: number;
  tokensToUse: number;
  tokenValue: number;
  cashAmount: number;
  redemptionPercentage: number;
  savings: number;
}

export interface ServiceConfig {
  name: string;
  maxRedemptionPercentage: number; // e.g., 25 for 25%
  timeRestrictions?: {
    allowedDays?: string[];
    allowedHours?: { start: string; end: string };
  };
}

const DEFAULT_SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  court_booking: {
    name: 'Court Booking',
    maxRedemptionPercentage: 30,
    timeRestrictions: {
      allowedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }
  },
  coaching_lesson: {
    name: 'Coaching Lesson',
    maxRedemptionPercentage: 25
  },
  group_clinic: {
    name: 'Group Clinic',
    maxRedemptionPercentage: 20
  },
  equipment_rental: {
    name: 'Equipment Rental',
    maxRedemptionPercentage: 50
  },
  club_merchandise: {
    name: 'Club Merchandise',
    maxRedemptionPercentage: 15
  }
};

export function useTokenRedemption(clubId: string) {
  const { checkTokenAvailability, processTokenRedemption, getAvailableTokens } = useClubTokenPool(clubId);
  const [calculating, setCalculating] = useState(false);

  const calculateRedemption = (
    serviceType: string,
    totalServiceValue: number,
    requestedTokens?: number
  ): RedemptionCalculation => {
    const serviceConfig = DEFAULT_SERVICE_CONFIGS[serviceType];
    const tokenRate = 0.007; // $0.007 per token
    
    if (!serviceConfig) {
      throw new Error(`Unknown service type: ${serviceType}`);
    }

    // Calculate maximum tokens allowed based on percentage limit
    const maxTokenValue = totalServiceValue * (serviceConfig.maxRedemptionPercentage / 100);
    const maxTokensAllowed = Math.floor(maxTokenValue / tokenRate);

    // Determine tokens to use
    const tokensToUse = requestedTokens 
      ? Math.min(requestedTokens, maxTokensAllowed)
      : maxTokensAllowed;

    // Calculate values
    const tokenValue = tokensToUse * tokenRate;
    const cashAmount = totalServiceValue - tokenValue;
    const redemptionPercentage = (tokenValue / totalServiceValue) * 100;
    const savings = tokenValue;

    return {
      maxTokensAllowed,
      tokensToUse,
      tokenValue,
      cashAmount,
      redemptionPercentage,
      savings
    };
  };

  const validateRedemption = async (
    serviceType: string,
    totalServiceValue: number,
    tokensToUse: number,
    scheduledDateTime?: Date
  ): Promise<{ valid: boolean; errors: string[] }> => {
    const errors: string[] = [];
    const serviceConfig = DEFAULT_SERVICE_CONFIGS[serviceType];

    if (!serviceConfig) {
      errors.push(`Service type "${serviceType}" is not supported`);
      return { valid: false, errors };
    }

    // Check token availability
    const tokensAvailable = await checkTokenAvailability(tokensToUse);
    if (!tokensAvailable) {
      errors.push('Insufficient tokens available in club pool');
    }

    // Check percentage limits
    const calculation = calculateRedemption(serviceType, totalServiceValue, tokensToUse);
    if (calculation.redemptionPercentage > serviceConfig.maxRedemptionPercentage) {
      errors.push(`Token redemption cannot exceed ${serviceConfig.maxRedemptionPercentage}% for ${serviceConfig.name}`);
    }

    // Check time restrictions
    if (scheduledDateTime && serviceConfig.timeRestrictions) {
      const { allowedDays, allowedHours } = serviceConfig.timeRestrictions;
      
      if (allowedDays) {
        const dayName = scheduledDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (!allowedDays.includes(dayName)) {
          errors.push(`Token redemption for ${serviceConfig.name} is not allowed on ${dayName}s`);
        }
      }

      if (allowedHours) {
        const hour = scheduledDateTime.getHours();
        const startHour = parseInt(allowedHours.start.split(':')[0]);
        const endHour = parseInt(allowedHours.end.split(':')[0]);
        
        if (hour < startHour || hour >= endHour) {
          errors.push(`Token redemption for ${serviceConfig.name} is only allowed between ${allowedHours.start} and ${allowedHours.end}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  };

  const executeRedemption = async (
    playerId: string,
    serviceType: string,
    serviceDetails: any,
    totalServiceValue: number,
    tokensToUse: number
  ): Promise<boolean> => {
    setCalculating(true);

    try {
      // Validate redemption first
      const validation = await validateRedemption(
        serviceType, 
        totalServiceValue, 
        tokensToUse,
        serviceDetails.scheduledDateTime ? new Date(serviceDetails.scheduledDateTime) : undefined
      );

      if (!validation.valid) {
        validation.errors.forEach(error => toast.error(error));
        return false;
      }

      // Calculate cash amount
      const calculation = calculateRedemption(serviceType, totalServiceValue, tokensToUse);

      // Process the redemption
      const success = await processTokenRedemption(
        playerId,
        serviceType,
        serviceDetails,
        tokensToUse,
        calculation.cashAmount,
        totalServiceValue
      );

      return success;
    } catch (error) {
      console.error('Error executing redemption:', error);
      toast.error('Failed to process token redemption');
      return false;
    } finally {
      setCalculating(false);
    }
  };

  const getServiceConfig = (serviceType: string): ServiceConfig | null => {
    return DEFAULT_SERVICE_CONFIGS[serviceType] || null;
  };

  const getAvailableServices = (): ServiceConfig[] => {
    return Object.values(DEFAULT_SERVICE_CONFIGS);
  };

  return {
    calculateRedemption,
    validateRedemption,
    executeRedemption,
    getServiceConfig,
    getAvailableServices,
    calculating,
    availableTokens: getAvailableTokens()
  };
}