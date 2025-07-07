// Phase 4: Store Enhancement & Token Packs Types

export interface HealthPackItem {
  id: string;
  name: string;
  description: string;
  hp_restore: number;
  price_tokens: number;
  price_usd?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  instant_use: boolean;
  cooldown_hours?: number;
  icon_url?: string;
  effects?: {
    type: string;
    value: number;
    duration_hours?: number;
  }[];
}

export interface TokenPackItem {
  id: string;
  name: string;
  description: string;
  token_amount: number;
  bonus_tokens: number;
  price_usd: number;
  rate_per_token: number; // $0.007
  expiry_days: number; // 90 days
  target_type: 'player' | 'coach' | 'club';
  popular?: boolean;
  savings_percentage?: number;
  features?: string[];
  stripe_price_id?: string;
}

export interface AvatarItem {
  id: string;
  name: string;
  description: string;
  category: 'hair' | 'clothing' | 'accessories' | 'equipment';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  price_tokens: number;
  price_usd?: number;
  unlock_level?: number;
  image_url: string;
  is_premium: boolean;
  is_limited_time?: boolean;
  available_until?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly?: number;
  target_type: 'player' | 'coach' | 'club';
  features: string[];
  token_allocation: number;
  tier_level: number;
  is_popular?: boolean;
  stripe_price_id_monthly: string;
  stripe_price_id_yearly?: string;
  max_members?: number; // For club plans
  max_courts?: number; // For club plans
}

export interface StoreCategories {
  health_packs: HealthPackItem[];
  token_packs: TokenPackItem[];
  avatar_items: AvatarItem[];
  subscriptions: SubscriptionPlan[];
}

export interface StorePurchaseResult {
  success: boolean;
  error?: string;
  item_id?: string;
  transaction_id?: string;
  new_balance?: {
    tokens?: number;
    premium_tokens?: number;
    hp?: number;
  };
  checkout_url?: string; // For Stripe payments
}

export interface StoreFilters {
  category: 'all' | 'health_packs' | 'token_packs' | 'avatar_items' | 'subscriptions';
  price_range: 'all' | 'under_100' | '100_500' | '500_1000' | 'over_1000';
  token_type: 'all' | 'regular' | 'premium' | 'usd';
  rarity: 'all' | 'common' | 'rare' | 'epic' | 'legendary';
  target_type: 'all' | 'player' | 'coach' | 'club';
  sort_by: 'price_low' | 'price_high' | 'popular' | 'newest' | 'rarity';
}