/**
 * RAKO Pricing System
 * 
 * Base pricing + 5% RAKO convenience fee
 * Applied to all club services including courts, coaching, and other services
 */

export interface PricingBreakdown {
  baseAmount: number; // in cents for money calculations
  convenienceFee: number; // in cents
  totalAmount: number; // in cents
  tokens: number;
  money: number; // in dollars for display
}

export interface ServiceItem {
  price_tokens: number;
  price_usd: number;
}

export interface CourtItem {
  hourly_rate_tokens: number;
  hourly_rate_money: number;
}

/**
 * Calculate pricing for court bookings
 */
export function calculateCourtPricing(
  court: CourtItem,
  durationHours: number
): PricingBreakdown {
  const tokens = court.hourly_rate_tokens * durationHours;
  const moneyRate = court.hourly_rate_money * durationHours;
  
  // Convert to cents for accurate calculation
  const baseAmount = Math.round(moneyRate * 100);
  const convenienceFee = Math.round(baseAmount * 0.05); // 5% RAKO fee
  const totalAmount = baseAmount + convenienceFee;
  
  return {
    baseAmount,
    convenienceFee,
    totalAmount,
    tokens,
    money: moneyRate
  };
}

/**
 * Calculate pricing for club services
 */
export function calculateServicePricing(service: ServiceItem): PricingBreakdown {
  const tokens = service.price_tokens;
  const money = service.price_usd;
  
  // Convert to cents for accurate calculation
  const baseAmount = Math.round(money * 100);
  const convenienceFee = Math.round(baseAmount * 0.05); // 5% RAKO fee
  const totalAmount = baseAmount + convenienceFee;
  
  return {
    baseAmount,
    convenienceFee,
    totalAmount,
    tokens,
    money
  };
}

/**
 * Calculate total pricing for multiple items
 */
export function calculateTotalPricing(
  items: PricingBreakdown[]
): PricingBreakdown {
  return items.reduce(
    (total, item) => ({
      baseAmount: total.baseAmount + item.baseAmount,
      convenienceFee: total.convenienceFee + item.convenienceFee,
      totalAmount: total.totalAmount + item.totalAmount,
      tokens: total.tokens + item.tokens,
      money: total.money + item.money
    }),
    { baseAmount: 0, convenienceFee: 0, totalAmount: 0, tokens: 0, money: 0 }
  );
}

/**
 * Format pricing breakdown for display
 */
export function formatPricingDisplay(pricing: PricingBreakdown) {
  return {
    basePrice: `$${(pricing.baseAmount / 100).toFixed(2)}`,
    convenienceFee: `$${(pricing.convenienceFee / 100).toFixed(2)}`,
    totalPrice: `$${(pricing.totalAmount / 100).toFixed(2)}`,
    tokens: `${pricing.tokens} tokens`,
    feePercentage: '5%'
  };
}

/**
 * Get RAKO fee rate
 */
export const RAKO_FEE_RATE = 0.05; // 5%