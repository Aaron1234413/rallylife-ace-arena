// Phase 4: Store Enhancement & Token Packs Data

import { 
  HealthPackItem, 
  TokenPackItem, 
  AvatarItem, 
  SubscriptionPlan, 
  StoreCategories 
} from '@/types/store';

// Health Packs
export const healthPacks: HealthPackItem[] = [
  {
    id: 'small_health_potion',
    name: 'Small Health Potion',
    description: 'Restore 25 HP instantly',
    hp_restore: 25,
    price_tokens: 50,
    price_usd: 0.35,
    rarity: 'common',
    instant_use: true,
    icon_url: '/icons/health-potion-small.png'
  },
  {
    id: 'medium_health_potion',
    name: 'Medium Health Potion',
    description: 'Restore 50 HP instantly',
    hp_restore: 50,
    price_tokens: 90,
    price_usd: 0.63,
    rarity: 'common',
    instant_use: true,
    icon_url: '/icons/health-potion-medium.png'
  },
  {
    id: 'large_health_potion',
    name: 'Large Health Potion',
    description: 'Restore 75 HP instantly',
    hp_restore: 75,
    price_tokens: 125,
    price_usd: 0.88,
    rarity: 'rare',
    instant_use: true,
    icon_url: '/icons/health-potion-large.png'
  },
  {
    id: 'recovery_elixir',
    name: 'Recovery Elixir',
    description: 'Restore to full HP and prevent decay for 24 hours',
    hp_restore: 100,
    price_tokens: 200,
    price_usd: 1.40,
    rarity: 'epic',
    instant_use: true,
    cooldown_hours: 24,
    icon_url: '/icons/recovery-elixir.png',
    effects: [
      { type: 'prevent_decay', value: 1, duration_hours: 24 }
    ]
  },
  {
    id: 'legendary_vitality',
    name: 'Legendary Vitality Serum',
    description: 'Full HP restore + 25 max HP boost for 7 days',
    hp_restore: 100,
    price_tokens: 500,
    price_usd: 3.50,
    rarity: 'legendary',
    instant_use: true,
    cooldown_hours: 168, // 7 days
    icon_url: '/icons/vitality-serum.png',
    effects: [
      { type: 'max_hp_boost', value: 25, duration_hours: 168 },
      { type: 'prevent_decay', value: 1, duration_hours: 168 }
    ]
  }
];

// Token Packs for Players
export const playerTokenPacks: TokenPackItem[] = [
  {
    id: 'player_starter_pack',
    name: 'Starter Pack',
    description: 'Perfect for casual players getting started',
    token_amount: 1000,
    bonus_tokens: 100,
    price_usd: 7.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'player',
    savings_percentage: 14,
    features: ['90-day validity', 'Beginner friendly', 'Perfect for casual play']
  },
  {
    id: 'player_value_pack',
    name: 'Value Pack',
    description: 'Most popular choice for regular players',
    token_amount: 5000,
    bonus_tokens: 750,
    price_usd: 35.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'player',
    popular: true,
    savings_percentage: 15,
    features: ['90-day validity', 'Great value', 'Most popular choice']
  },
  {
    id: 'player_pro_pack',
    name: 'Pro Pack',
    description: 'For serious competitors and active players',
    token_amount: 10000,
    bonus_tokens: 2000,
    price_usd: 70.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'player',
    savings_percentage: 20,
    features: ['90-day validity', 'Premium support', 'Tournament ready']
  },
  {
    id: 'player_elite_pack',
    name: 'Elite Pack',
    description: 'Ultimate pack for professional players',
    token_amount: 25000,
    bonus_tokens: 6250,
    price_usd: 175.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'player',
    savings_percentage: 25,
    features: ['90-day validity', 'Elite benefits', 'Priority support', 'Exclusive content']
  }
];

// Token Packs for Coaches
export const coachTokenPacks: TokenPackItem[] = [
  {
    id: 'coach_basic_pack',
    name: 'Coach Basic Pack',
    description: 'Essential tokens for new coaches',
    token_amount: 2000,
    bonus_tokens: 300,
    price_usd: 14.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'coach',
    savings_percentage: 15,
    features: ['90-day validity', 'Client management tools', 'Basic analytics']
  },
  {
    id: 'coach_professional_pack',
    name: 'Professional Pack',
    description: 'Comprehensive package for active coaches',
    token_amount: 10000,
    bonus_tokens: 2000,
    price_usd: 70.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'coach',
    popular: true,
    savings_percentage: 20,
    features: ['90-day validity', 'Advanced analytics', 'Priority bookings', 'Marketing tools']
  },
  {
    id: 'coach_academy_pack',
    name: 'Academy Pack',
    description: 'Perfect for coaching academies and multi-coach facilities',
    token_amount: 50000,
    bonus_tokens: 15000,
    price_usd: 350.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'coach',
    savings_percentage: 30,
    features: ['90-day validity', 'Multi-coach support', 'Academy management', 'Bulk discounts']
  }
];

// Token Packs for Clubs
export const clubTokenPacks: TokenPackItem[] = [
  {
    id: 'club_community_pack',
    name: 'Community Pack',
    description: 'Perfect for small community clubs',
    token_amount: 10000,
    bonus_tokens: 1500,
    price_usd: 70.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'club',
    savings_percentage: 15,
    features: ['90-day validity', 'Member redemptions', 'Basic services', 'Community events']
  },
  {
    id: 'club_standard_pack',
    name: 'Standard Club Pack',
    description: 'Enhanced package for active clubs',
    token_amount: 25000,
    bonus_tokens: 5000,
    price_usd: 175.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'club',
    popular: true,
    savings_percentage: 20,
    features: ['90-day validity', 'Premium services', 'Event hosting', 'Advanced booking']
  },
  {
    id: 'club_premium_pack',
    name: 'Premium Club Pack',
    description: 'Comprehensive solution for large clubs',
    token_amount: 50000,
    bonus_tokens: 12500,
    price_usd: 350.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'club',
    savings_percentage: 25,
    features: ['90-day validity', 'All services', 'Tournament hosting', 'Priority support']
  },
  {
    id: 'club_enterprise_pack',
    name: 'Enterprise Pack',
    description: 'Ultimate solution for tennis resorts and large facilities',
    token_amount: 100000,
    bonus_tokens: 30000,
    price_usd: 700.00,
    rate_per_token: 0.007,
    expiry_days: 90,
    target_type: 'club',
    savings_percentage: 30,
    features: ['90-day validity', 'Enterprise features', 'Custom integrations', 'Dedicated support']
  }
];

// Avatar Items
export const avatarItems: AvatarItem[] = [
  {
    id: 'basic_tennis_shirt',
    name: 'Classic Tennis Shirt',
    description: 'A timeless white tennis shirt',
    category: 'clothing',
    rarity: 'common',
    price_tokens: 100,
    image_url: '/avatars/tennis-shirt-basic.png',
    is_premium: false
  },
  {
    id: 'pro_tennis_shoes',
    name: 'Professional Tennis Shoes',
    description: 'High-performance court shoes',
    category: 'equipment',
    rarity: 'rare',
    price_tokens: 300,
    price_usd: 2.10,
    unlock_level: 5,
    image_url: '/avatars/tennis-shoes-pro.png',
    is_premium: false
  },
  {
    id: 'championship_headband',
    name: 'Championship Headband',
    description: 'Worn by tournament champions',
    category: 'accessories',
    rarity: 'epic',
    price_tokens: 500,
    price_usd: 3.50,
    unlock_level: 10,
    image_url: '/avatars/headband-championship.png',
    is_premium: true
  },
  {
    id: 'legendary_racket',
    name: 'Legendary Carbon Racket',
    description: 'The ultimate professional racket',
    category: 'equipment',
    rarity: 'legendary',
    price_tokens: 1000,
    price_usd: 7.00,
    unlock_level: 20,
    image_url: '/avatars/racket-legendary.png',
    is_premium: true
  }
];

// Subscription Plans
export const subscriptionPlans: SubscriptionPlan[] = [
  // Player Plans
  {
    id: 'player_basic',
    name: 'Player Basic',
    description: 'Essential features for casual players',
    price_monthly: 9.99,
    price_yearly: 99.99,
    target_type: 'player',
    features: [
      '100 monthly tokens',
      'Basic analytics',
      'Court booking',
      'Match tracking',
      'Community access'
    ],
    token_allocation: 100,
    tier_level: 1,
    stripe_price_id_monthly: 'price_player_basic_monthly',
    stripe_price_id_yearly: 'price_player_basic_yearly'
  },
  {
    id: 'player_premium',
    name: 'Player Premium',
    description: 'Advanced features for serious players',
    price_monthly: 19.99,
    price_yearly: 199.99,
    target_type: 'player',
    features: [
      '250 monthly tokens',
      'Advanced analytics',
      'Priority booking',
      'Coach connections',
      'Tournament access',
      'Premium avatar items'
    ],
    token_allocation: 250,
    tier_level: 2,
    is_popular: true,
    stripe_price_id_monthly: 'price_player_premium_monthly',
    stripe_price_id_yearly: 'price_player_premium_yearly'
  },
  {
    id: 'player_pro',
    name: 'Player Pro',
    description: 'Ultimate package for professional players',
    price_monthly: 39.99,
    price_yearly: 399.99,
    target_type: 'player',
    features: [
      '500 monthly tokens',
      'Professional analytics',
      'Exclusive courts',
      'Personal coaching',
      'Tournament privileges',
      'All avatar items',
      'Priority support'
    ],
    token_allocation: 500,
    tier_level: 3,
    stripe_price_id_monthly: 'price_player_pro_monthly',
    stripe_price_id_yearly: 'price_player_pro_yearly'
  },
  // Coach Plans
  {
    id: 'coach_standard',
    name: 'Coach Standard',
    description: 'Essential tools for coaching professionals',
    price_monthly: 29.99,
    price_yearly: 299.99,
    target_type: 'coach',
    features: [
      '200 monthly tokens',
      'Client management',
      'Scheduling tools',
      'Basic analytics',
      'Payment processing'
    ],
    token_allocation: 200,
    tier_level: 1,
    stripe_price_id_monthly: 'price_coach_standard_monthly',
    stripe_price_id_yearly: 'price_coach_standard_yearly'
  },
  {
    id: 'coach_professional',
    name: 'Coach Professional',
    description: 'Advanced coaching platform',
    price_monthly: 59.99,
    price_yearly: 599.99,
    target_type: 'coach',
    features: [
      '500 monthly tokens',
      'Advanced client analytics',
      'Automated scheduling',
      'Video analysis tools',
      'Marketing features',
      'Club partnerships'
    ],
    token_allocation: 500,
    tier_level: 2,
    is_popular: true,
    stripe_price_id_monthly: 'price_coach_professional_monthly',
    stripe_price_id_yearly: 'price_coach_professional_yearly'
  }
];

// Combined Store Categories
export const storeCategories: StoreCategories = {
  health_packs: healthPacks,
  token_packs: [...playerTokenPacks, ...coachTokenPacks, ...clubTokenPacks],
  avatar_items: avatarItems,
  subscriptions: subscriptionPlans
};

// Helper functions
export const getTokenPacksByTarget = (targetType: 'player' | 'coach' | 'club'): TokenPackItem[] => {
  return storeCategories.token_packs.filter(pack => pack.target_type === targetType);
};

export const getSubscriptionsByTarget = (targetType: 'player' | 'coach' | 'club'): SubscriptionPlan[] => {
  return storeCategories.subscriptions.filter(plan => plan.target_type === targetType);
};

export const getItemsByRarity = (rarity: 'common' | 'rare' | 'epic' | 'legendary'): (HealthPackItem | AvatarItem)[] => {
  return [
    ...storeCategories.health_packs.filter(item => item.rarity === rarity),
    ...storeCategories.avatar_items.filter(item => item.rarity === rarity)
  ];
};