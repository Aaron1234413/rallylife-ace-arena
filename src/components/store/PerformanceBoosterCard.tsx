
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, Target, TrendingUp, Brain, BookOpen, Activity, 
  Users, Heart, Search, Plus, Moon, Sparkles, 
  GraduationCap, BarChart3, Gift, Clock, Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PerformanceBooster, BoosterCooldown } from '@/hooks/usePerformanceBoosters';

interface PerformanceBoosterCardProps {
  booster: PerformanceBooster;
  onPurchase: (params: { boosterId: string; tokenPrice: number }) => void;
  cooldown?: BoosterCooldown;
  userTokens: number;
  purchasing: boolean;
}

const iconMap = {
  Zap, Target, TrendingUp, Brain, BookOpen, Activity,
  Users, Heart, Search, Plus, Moon, Sparkles,
  GraduationCap, BarChart3, Gift
};

const rarityConfig = {
  common: {
    border: 'border-gray-300',
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    badge: 'bg-gray-100 text-gray-700'
  },
  rare: {
    border: 'border-blue-400',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700'
  },
  epic: {
    border: 'border-purple-400',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-700'
  },
  legendary: {
    border: 'border-yellow-400',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700'
  }
};

export function PerformanceBoosterCard({ 
  booster, 
  onPurchase, 
  cooldown, 
  userTokens, 
  purchasing 
}: PerformanceBoosterCardProps) {
  const Icon = iconMap[booster.icon_name as keyof typeof iconMap] || Zap;
  const rarity = rarityConfig[booster.rarity];
  
  const isOnCooldown = cooldown && new Date(cooldown.cooldown_expires_at) > new Date();
  const canAfford = userTokens >= booster.token_price;
  const canPurchase = !isOnCooldown && canAfford && !purchasing;

  const getCooldownTimeLeft = () => {
    if (!cooldown) return null;
    const now = new Date();
    const expires = new Date(cooldown.cooldown_expires_at);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getEffectDescription = () => {
    const effects = [];
    const data = booster.effect_data;
    
    if (data.hp_reduction) {
      effects.push(`${Math.round((1 - data.hp_reduction) * 100)}% less HP loss`);
    }
    if (data.xp_multiplier) {
      effects.push(`${data.xp_multiplier}x XP gain`);
    }
    if (data.hp_restore) {
      effects.push(`+${data.hp_restore} HP restore`);
    }
    if (data.token_bonus) {
      effects.push(`+${data.token_bonus} bonus tokens`);
    }
    if (data.comeback_xp_bonus) {
      effects.push(`+${data.comeback_xp_bonus} comeback XP`);
    }
    
    return effects.join(' • ');
  };

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
      rarity.border,
      rarity.bg,
      isOnCooldown && 'opacity-60'
    )}>
      {/* Rarity accent */}
      <div className={cn('absolute top-0 left-0 right-0 h-1', 
        booster.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
        booster.rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
        booster.rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
        'bg-gray-400'
      )} />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', 
              booster.rarity === 'legendary' ? 'bg-yellow-500 text-white' :
              booster.rarity === 'epic' ? 'bg-purple-500 text-white' :
              booster.rarity === 'rare' ? 'bg-blue-500 text-white' :
              'bg-gray-500 text-white'
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className={cn('text-sm font-bold', rarity.text)}>
                {booster.name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn('text-xs', rarity.badge)}>
                  {booster.rarity}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {booster.effect_type}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 leading-relaxed">
          {booster.description}
        </p>

        {getEffectDescription() && (
          <div className="p-2 bg-white/50 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-700">
              {getEffectDescription()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-600" />
            <span className="font-bold text-yellow-700">
              {booster.token_price}
            </span>
          </div>

          {isOnCooldown ? (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {getCooldownTimeLeft()}
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => onPurchase({ boosterId: booster.id, tokenPrice: booster.token_price })}
              disabled={!canPurchase}
              className={cn(
                'font-semibold',
                !canAfford && 'opacity-50 cursor-not-allowed'
              )}
            >
              {purchasing ? 'Buying...' : 'Purchase'}
            </Button>
          )}
        </div>

        {!canAfford && !isOnCooldown && (
          <p className="text-xs text-red-600 mt-1">
            Need {booster.token_price - userTokens} more tokens
          </p>
        )}
      </CardContent>
    </Card>
  );
}
