// Basic types for club management features

export interface MemberSpendingLimit {
  member_id: string;
  monthly_limit: number;
  daily_limit?: number;
  service_restrictions: string[];
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

export interface ServiceRedemptionSettings {
  service_type: string;
  redemption_percentage: number;
  max_tokens_per_transaction: number;
  daily_limit: number;
  enabled: boolean;
}