import { ServiceBooking } from '@/hooks/useClubServices';

/**
 * Utility functions to ensure backward compatibility with ServiceBooking interface changes
 */

export function getBookingUserId(booking: ServiceBooking): string {
  return booking.player_id || booking.user_id || '';
}

export function getBookingPaymentMethod(booking: ServiceBooking): string {
  return booking.payment_type || booking.payment_method || 'unknown';
}

export function getBookingTokensUsed(booking: ServiceBooking): number {
  return booking.tokens_paid || booking.tokens_used || 0;
}

export function getBookingCashAmount(booking: ServiceBooking): number {
  return booking.usd_paid || booking.cash_amount_cents || 0;
}

/**
 * Creates a legacy-compatible booking object for components still using old field names
 */
export function toLegacyBooking(booking: ServiceBooking): ServiceBooking & {
  user_id: string;
  payment_method: string;
  tokens_used: number;
  cash_amount_cents: number;
} {
  return {
    ...booking,
    user_id: getBookingUserId(booking),
    payment_method: getBookingPaymentMethod(booking),
    tokens_used: getBookingTokensUsed(booking),
    cash_amount_cents: getBookingCashAmount(booking)
  };
}