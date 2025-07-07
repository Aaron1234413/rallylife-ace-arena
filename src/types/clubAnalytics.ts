// Phase 5: Club Analytics & Management Types

export interface ClubTokenPool {
  id: string;
  club_id: string;
  month_year: string;
  allocated_tokens: number;
  rollover_tokens: number;
  purchased_tokens: number;
  used_tokens: number;
  overdraft_tokens: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyUsage {
  month: string;
  allocated: number;
  used: number;
  purchased: number;
  rollover: number;
  efficiency_percentage: number;
}

export interface RedemptionByService {
  service_type: 'court_booking' | 'coaching' | 'events' | 'merchandise' | 'food_beverage' | 'other';
  service_name: string;
  tokens_redeemed: number;
  transaction_count: number;
  percentage_of_total: number;
  average_per_transaction: number;
}

export interface MemberTokenActivity {
  member_id: string;
  member_name: string;
  member_avatar?: string;
  total_redeemed: number;
  last_activity: string;
  favorite_service: string;
  monthly_spending: number;
  spending_limit?: number;
}

export interface ClubTokenAnalytics {
  current_pool: ClubTokenPool;
  monthly_usage_trend: MonthlyUsage[];
  redemption_breakdown: RedemptionByService[];
  member_activity: MemberTokenActivity[];
  financial_offset: number; // Value covered by tokens
}

export interface ServiceRedemptionSettings {
  service_type: string;
  redemption_percentage: number; // 0-100
  max_tokens_per_transaction?: number;
  daily_limit?: number;
  enabled: boolean;
}

export interface MemberSpendingLimit {
  member_id: string;
  monthly_limit: number;
  daily_limit?: number;
  service_restrictions?: string[];
  override_permissions: boolean;
}

export interface OverdraftAlert {
  id: string;
  club_id: string;
  alert_type: 'warning' | 'critical' | 'limit_reached';
  threshold_percentage: number;
  current_overdraft: number;
  max_overdraft_allowed: number;
  triggered_at: string;
  resolved_at?: string;
}