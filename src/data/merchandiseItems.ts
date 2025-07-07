// Physical Tennis Merchandise from Diadem Sports

export interface MerchandiseItem {
  id: string;
  name: string;
  description: string;
  category: 'rackets' | 'strings' | 'balls' | 'shoes' | 'apparel' | 'bags' | 'accessories';
  price_usd: number;
  price_tokens?: number; // Optional token price for rewards
  image_url: string;
  brand: string;
  external_url: string; // Link to Diadem store
  features: string[];
  in_stock: boolean;
  rating?: number;
  reviews?: number;
}

// Tennis Rackets
export const tennisRackets: MerchandiseItem[] = [
  {
    id: 'nova_v3_team',
    name: 'Nova V3 Team',
    description: 'Perfect balance of power and control for competitive players',
    category: 'rackets',
    price_usd: 199.95,
    price_tokens: 2000,
    image_url: '/merchandise/nova-v3-team.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/nova-v3-team',
    features: ['100 sq in head size', 'Lightweight frame', 'Power & control balance'],
    in_stock: true,
    rating: 4.8,
    reviews: 156
  },
  {
    id: 'elevate_v3',
    name: 'Elevate V3',
    description: 'Advanced racket for tournament-level performance',
    category: 'rackets',
    price_usd: 249.95,
    price_tokens: 2500,
    image_url: '/merchandise/elevate-v3.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/elevate-v3',
    features: ['98 sq in head size', 'Professional weight', 'Enhanced spin'],
    in_stock: true,
    rating: 4.9,
    reviews: 89
  },
  {
    id: 'super_25_junior',
    name: 'Super 25 Junior Racket',
    description: 'Perfect starter racket for young players',
    category: 'rackets',
    price_usd: 79.95,
    price_tokens: 800,
    image_url: '/merchandise/super-25-junior.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/super-25-junior',
    features: ['25 inch length', 'Lightweight design', 'Kid-friendly grip'],
    in_stock: true,
    rating: 4.7,
    reviews: 234
  }
];

// Tennis Shoes
export const tennisShoes: MerchandiseItem[] = [
  {
    id: 'court_burst',
    name: 'Diadem Court Burst',
    description: 'High-performance tennis shoes for aggressive play',
    category: 'shoes',
    price_usd: 129.95,
    price_tokens: 1300,
    image_url: '/merchandise/court-burst.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/court-burst',
    features: ['Durable construction', 'Superior grip', 'Comfortable fit'],
    in_stock: true,
    rating: 4.8,
    reviews: 342
  },
  {
    id: 'court_flo',
    name: 'Diadem Court Flo',
    description: 'Lightweight tennis shoes for speed and agility',
    category: 'shoes',
    price_usd: 119.95,
    price_tokens: 1200,
    image_url: '/merchandise/court-flo.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/court-flo',
    features: ['Breathable design', 'Lightweight construction', 'Enhanced mobility'],
    in_stock: true,
    rating: 4.6,
    reviews: 178
  }
];

// Tennis Strings
export const tennisStrings: MerchandiseItem[] = [
  {
    id: 'evolution_string',
    name: 'Evolution Tennis String',
    description: 'Premium polyester string for spin and control',
    category: 'strings',
    price_usd: 14.95,
    price_tokens: 150,
    image_url: '/merchandise/evolution-string.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/evolution-string',
    features: ['Polyester construction', 'Enhanced spin', 'Excellent durability'],
    in_stock: true,
    rating: 4.7,
    reviews: 267
  },
  {
    id: 'impulse_string',
    name: 'Impulse Tennis String',
    description: 'Responsive string for power and feel',
    category: 'strings',
    price_usd: 14.95,
    price_tokens: 150,
    image_url: '/merchandise/impulse-string.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/impulse-string',
    features: ['Responsive feel', 'Power enhancement', 'All-court versatility'],
    in_stock: true,
    rating: 4.9,
    reviews: 198
  }
];

// Tennis Balls
export const tennisBalls: MerchandiseItem[] = [
  {
    id: 'championship_balls',
    name: 'Championship Tennis Balls',
    description: 'Official tournament-grade tennis balls',
    category: 'balls',
    price_usd: 12.95,
    price_tokens: 130,
    image_url: '/merchandise/championship-balls.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/championship-balls',
    features: ['Tournament approved', 'Consistent bounce', 'Long-lasting'],
    in_stock: true,
    rating: 4.5,
    reviews: 456
  }
];

// Apparel
export const tennisApparel: MerchandiseItem[] = [
  {
    id: 'performance_polo',
    name: 'Performance Tennis Polo',
    description: 'Moisture-wicking polo for optimal comfort',
    category: 'apparel',
    price_usd: 49.95,
    price_tokens: 500,
    image_url: '/merchandise/performance-polo.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/performance-polo',
    features: ['Moisture-wicking fabric', 'UV protection', 'Athletic fit'],
    in_stock: true,
    rating: 4.6,
    reviews: 123
  },
  {
    id: 'performance_socks',
    name: 'Performance Tennis Socks',
    description: 'Cushioned socks for all-day comfort',
    category: 'apparel',
    price_usd: 16.95,
    price_tokens: 170,
    image_url: '/merchandise/performance-socks.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/performance-socks',
    features: ['Cushioned sole', 'Moisture management', 'Reinforced heel'],
    in_stock: true,
    rating: 4.8,
    reviews: 289
  }
];

// Bags & Accessories
export const tennisBags: MerchandiseItem[] = [
  {
    id: 'tour_bag',
    name: 'Tour Tennis Bag',
    description: 'Professional-grade tennis bag for all your gear',
    category: 'bags',
    price_usd: 89.95,
    price_tokens: 900,
    image_url: '/merchandise/tour-bag.jpg',
    brand: 'Diadem',
    external_url: 'https://diademsports.com/products/tour-bag',
    features: ['Multiple compartments', 'Racket storage', 'Durable construction'],
    in_stock: true,
    rating: 4.7,
    reviews: 167
  }
];

// Combined merchandise catalog
export const merchandiseItems: MerchandiseItem[] = [
  ...tennisRackets,
  ...tennisShoes,
  ...tennisStrings,
  ...tennisBalls,
  ...tennisApparel,
  ...tennisBags
];

// Helper functions
export const getMerchandiseByCategory = (category: MerchandiseItem['category']): MerchandiseItem[] => {
  return merchandiseItems.filter(item => item.category === category);
};

export const getFeaturedMerchandise = (): MerchandiseItem[] => {
  return merchandiseItems.filter(item => item.rating && item.rating >= 4.7);
};

export const merchandiseCategories = [
  { id: 'rackets', name: 'Rackets', icon: '🎾' },
  { id: 'shoes', name: 'Shoes', icon: '👟' },
  { id: 'strings', name: 'Strings', icon: '🔗' },
  { id: 'balls', name: 'Balls', icon: '⚽' },
  { id: 'apparel', name: 'Apparel', icon: '👕' },
  { id: 'bags', name: 'Bags', icon: '🎒' }
];