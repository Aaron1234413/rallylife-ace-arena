import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Crown, Award } from 'lucide-react';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: string;
}

interface BadgeSystemProps {
  badges: string[];
  className?: string;
}

export function BadgeSystem({ badges, className }: BadgeSystemProps) {
  const BADGE_DEFINITIONS: Record<string, Omit<BadgeData, 'earned' | 'earnedAt'>> = {
    rising_star: {
      id: 'rising_star',
      name: 'Rising Star',
      description: 'Reached level 5 - Your tennis journey begins!',
      icon: <Star className="h-4 w-4" fill="currentColor" />,
      rarity: 'common',
    },
    tennis_pro: {
      id: 'tennis_pro',
      name: 'Tennis Pro',
      description: 'Reached level 10 - You\'re getting serious!',
      icon: <Trophy className="h-4 w-4" fill="currentColor" />,
      rarity: 'rare',
    },
    champion: {
      id: 'champion',
      name: 'Champion',
      description: 'Reached level 20 - Elite player status!',
      icon: <Crown className="h-4 w-4" fill="currentColor" />,
      rarity: 'epic',
    },
    legend: {
      id: 'legend',
      name: 'Legend',
      description: 'Reached level 50 - Tennis legend!',
      icon: <Award className="h-4 w-4" fill="currentColor" />,
      rarity: 'legendary',
    },
  };

  const getRarityColor = (rarity: BadgeData['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'rare': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'legendary': return 'bg-orange-100 text-orange-700 border-orange-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const earnedBadges = Object.values(BADGE_DEFINITIONS)
    .map(badge => ({
      ...badge,
      earned: badges.includes(badge.id),
    }))
    .filter(badge => badge.earned);

  const upcomingBadges = Object.values(BADGE_DEFINITIONS)
    .map(badge => ({
      ...badge,
      earned: badges.includes(badge.id),
    }))
    .filter(badge => !badge.earned)
    .slice(0, 3); // Show next 3 badges to earn

  if (earnedBadges.length === 0 && upcomingBadges.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Badges & Achievements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Earned Badges ({earnedBadges.length})
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`relative p-3 rounded-lg border-2 ${getRarityColor(badge.rarity)} animate-scale-in`}
                >
                  <div className="flex flex-col items-center text-center space-y-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-current/10">
                      {badge.icon}
                    </div>
                    <span className="text-xs font-semibold">{badge.name}</span>
                    <Badge 
                      variant="secondary" 
                      className="text-xs capitalize"
                    >
                      {badge.rarity}
                    </Badge>
                  </div>
                  
                  {/* Shine effect for newly earned badges */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-lg pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Badges */}
        {upcomingBadges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Next to Unlock
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {upcomingBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    <div className="opacity-50">{badge.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      {badge.name}
                    </p>
                    <p className="text-xs text-muted-foreground/70 truncate">
                      {badge.description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {badge.rarity}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}