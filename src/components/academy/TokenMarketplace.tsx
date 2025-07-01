import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  Sparkles, 
  Crown, 
  BookOpen, 
  Trophy,
  Zap,
  Gift,
  Lock,
  CheckCircle,
  Star
} from 'lucide-react';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useToast } from '@/hooks/use-toast';

interface PremiumItem {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'cosmetic' | 'booster' | 'special';
  cost: number;
  tokenType: 'regular' | 'premium';
  image?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  benefits: string[];
  isOwned: boolean;
  isPurchased: boolean;
}

interface TokenMarketplaceProps {
  className?: string;
}

// Mock premium items data
const PREMIUM_ITEMS: PremiumItem[] = [
  {
    id: '1',
    name: 'Pro Strategy Pack',
    description: 'Advanced tactical knowledge and professional insights',
    category: 'content',
    cost: 150,
    tokenType: 'regular',
    rarity: 'epic',
    benefits: [
      '50+ Advanced strategy questions',
      'Professional coaching insights',
      'Tournament tactics guide',
      'Match analysis scenarios'
    ],
    isOwned: false,
    isPurchased: false
  },
  {
    id: '2',
    name: 'Golden Campus Theme',
    description: 'Luxurious golden campus buildings and decorations',
    category: 'cosmetic',
    cost: 5,
    tokenType: 'premium',
    rarity: 'legendary',
    benefits: [
      'Gold-themed campus buildings',
      'Exclusive golden animations',
      'VIP status indicator',
      'Premium visual effects'
    ],
    isOwned: false,
    isPurchased: false
  },
  {
    id: '3',
    name: 'XP Booster Pack',
    description: 'Double XP for 7 days of academy activities',
    category: 'booster',
    cost: 75,
    tokenType: 'regular',
    rarity: 'rare',
    benefits: [
      '2x XP for 7 days',
      'Applies to all activities',
      'Stackable with events',
      'Instant activation'
    ],
    isOwned: false,
    isPurchased: false
  },
  {
    id: '4',
    name: 'Legendary Coach Avatar',
    description: 'Exclusive legendary coach avatar set',
    category: 'cosmetic',
    cost: 10,
    tokenType: 'premium',
    rarity: 'legendary',
    benefits: [
      'Unique legendary outfit',
      'Special coach animations',
      'Prestige indicator',
      'Collector badge'
    ],
    isOwned: false,
    isPurchased: false
  },
  {
    id: '5',
    name: 'Hint Master Bundle',
    description: '100 quiz hints for challenging questions',
    category: 'booster',
    cost: 50,
    tokenType: 'regular',
    rarity: 'common',
    benefits: [
      '100 quiz hints',
      'No cooldown period',
      'Works on all difficulties',
      'Transferable to friends'
    ],
    isOwned: false,
    isPurchased: false
  },
  {
    id: '6',
    name: 'Champion Archives',
    description: 'Exclusive content about tennis legends and history',
    category: 'content',
    cost: 200,
    tokenType: 'regular',
    rarity: 'epic',
    benefits: [
      'Legendary player profiles',
      'Historic match analyses',
      'Rare tournament footage',
      'Expert commentary tracks'
    ],
    isOwned: false,
    isPurchased: true
  }
];

const getRarityColor = (rarity: PremiumItem['rarity']) => {
  switch (rarity) {
    case 'common':
      return 'text-gray-600 bg-gray-100';
    case 'rare':
      return 'text-blue-600 bg-blue-100';
    case 'epic':
      return 'text-purple-600 bg-purple-100';
    case 'legendary':
      return 'text-yellow-600 bg-yellow-100';
  }
};

const getCategoryIcon = (category: PremiumItem['category']) => {
  switch (category) {
    case 'content':
      return <BookOpen className="h-4 w-4" />;
    case 'cosmetic':
      return <Sparkles className="h-4 w-4" />;
    case 'booster':
      return <Zap className="h-4 w-4" />;
    case 'special':
      return <Crown className="h-4 w-4" />;
  }
};

const PurchaseDialog: React.FC<{ item: PremiumItem; onPurchase: (item: PremiumItem) => void }> = ({ 
  item, 
  onPurchase 
}) => {
  const { regularTokens, premiumTokens } = usePlayerTokens();
  const currentTokens = item.tokenType === 'premium' ? premiumTokens : regularTokens;
  const canAfford = currentTokens >= item.cost;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="w-full"
          disabled={item.isPurchased || !canAfford}
        >
          {item.isPurchased ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Owned
            </>
          ) : !canAfford ? (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Insufficient Tokens
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Buy for {item.cost} {item.tokenType === 'premium' ? '💎' : '🪙'}
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Confirm Purchase
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-tennis-green-dark">{item.name}</h3>
            <p className="text-sm text-tennis-green-medium">{item.description}</p>
          </div>
          
          <div className="bg-tennis-green-bg/20 p-4 rounded-lg">
            <h4 className="font-medium text-tennis-green-dark mb-2">What you get:</h4>
            <ul className="space-y-1">
              {item.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-tennis-green-medium">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-tennis-green-dark">Cost:</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-tennis-green-dark">
                {item.cost} {item.tokenType === 'premium' ? '💎' : '🪙'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-tennis-green-medium">Your balance:</span>
            <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
              {currentTokens} {item.tokenType === 'premium' ? '💎' : '🪙'}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={() => onPurchase(item)}
              className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark"
              disabled={!canAfford}
            >
              Purchase Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PremiumItemCard: React.FC<{ item: PremiumItem; onPurchase: (item: PremiumItem) => void }> = ({ 
  item, 
  onPurchase 
}) => (
  <Card className={`relative transition-all hover:shadow-lg ${
    item.isPurchased ? 'bg-green-50 border-green-200' : 'bg-white'
  }`}>
    {item.rarity === 'legendary' && (
      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white p-1 rounded-full">
        <Crown className="h-3 w-3" />
      </div>
    )}
    
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {getCategoryIcon(item.category)}
          <CardTitle className="text-sm font-semibold text-tennis-green-dark">
            {item.name}
          </CardTitle>
        </div>
        <Badge className={getRarityColor(item.rarity)}>
          {item.rarity}
        </Badge>
      </div>
      <p className="text-xs text-tennis-green-medium">{item.description}</p>
    </CardHeader>
    
    <CardContent className="space-y-3">
      <div className="space-y-1">
        {item.benefits.slice(0, 2).map((benefit, index) => (
          <div key={index} className="flex items-center gap-2 text-xs text-tennis-green-medium">
            <CheckCircle className="h-3 w-3 text-green-600" />
            {benefit}
          </div>
        ))}
        {item.benefits.length > 2 && (
          <p className="text-xs text-tennis-green-medium">
            +{item.benefits.length - 2} more benefits
          </p>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <span className="text-sm font-bold text-tennis-green-dark">
            {item.cost}
          </span>
          <span className="text-lg">
            {item.tokenType === 'premium' ? '💎' : '🪙'}
          </span>
        </div>
        
        <PurchaseDialog item={item} onPurchase={onPurchase} />
      </div>
    </CardContent>
  </Card>
);

export const TokenMarketplace: React.FC<TokenMarketplaceProps> = ({ className }) => {
  const [items, setItems] = useState(PREMIUM_ITEMS);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  const handlePurchase = async (item: PremiumItem) => {
    try {
      // Here you would integrate with the actual token spending system
      setItems(prev => prev.map(i => 
        i.id === item.id ? { ...i, isPurchased: true, isOwned: true } : i
      ));
      
      toast({
        title: "Purchase Successful!",
        description: `You've unlocked ${item.name}`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.category === activeTab);

  const ownedItems = items.filter(item => item.isPurchased);

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-tennis-green-light/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-tennis-green-primary to-tennis-green-dark text-white p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            Token Marketplace
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {ownedItems.length} items owned
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="cosmetic" className="text-xs">Cosmetic</TabsTrigger>
            <TabsTrigger value="booster" className="text-xs">Boosters</TabsTrigger>
            <TabsTrigger value="special" className="text-xs">Special</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <PremiumItemCard 
                  key={item.id} 
                  item={item} 
                  onPurchase={handlePurchase}
                />
              ))}
            </div>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-tennis-green-medium">No items found in this category</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};