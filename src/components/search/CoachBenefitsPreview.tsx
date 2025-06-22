
import React from 'react';
import { Heart, Trophy, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CoachBenefitsPreviewProps {
  coachLevel: number;
  className?: string;
}

export function CoachBenefitsPreview({ coachLevel, className }: CoachBenefitsPreviewProps) {
  // Calculate benefits based on coach level (same logic as in database)
  const calculateBenefits = (level: number) => {
    if (level >= 40) {
      return { hp: 25, xp: 130, tier: 'Master' };
    } else if (level >= 25) {
      return { hp: 20, xp: 110, tier: 'Expert' };
    } else if (level >= 15) {
      return { hp: 15, xp: 90, tier: 'Advanced' };
    } else if (level >= 8) {
      return { hp: 12, xp: 75, tier: 'Intermediate' };
    } else if (level >= 3) {
      return { hp: 8, xp: 60, tier: 'Junior' };
    } else {
      return { hp: 5, xp: 45, tier: 'Novice' };
    }
  };

  const benefits = calculateBenefits(coachLevel);

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Star className="h-4 w-4 text-green-600" />
        <span className="text-xs font-semibold text-green-800">Lesson Benefits</span>
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
          {benefits.tier} Coach
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3 text-green-500" />
          <span className="text-green-700">+{benefits.hp} HP</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="h-3 w-3 text-yellow-500" />
          <span className="text-green-700">+{benefits.xp} XP</span>
        </div>
      </div>
      <p className="text-xs text-green-600 mt-1">Per 60-minute lesson</p>
    </div>
  );
}
