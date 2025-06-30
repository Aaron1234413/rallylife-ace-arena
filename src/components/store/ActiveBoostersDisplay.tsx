
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Target, TrendingUp, Brain, BookOpen, Activity, 
  Users, Heart, Search, Plus, Moon, Sparkles, 
  GraduationCap, BarChart3, Gift, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserPerformanceBooster } from '@/hooks/usePerformanceBoosters';

interface ActiveBoostersDisplayProps {
  activeBoosters: UserPerformanceBooster[];
}

const iconMap = {
  Zap, Target, TrendingUp, Brain, BookOpen, Activity,
  Users, Heart, Search, Plus, Moon, Sparkles,
  GraduationCap, BarChart3, Gift
};

export function ActiveBoostersDisplay({ activeBoosters }: ActiveBoostersDisplayProps) {
  if (activeBoosters.length === 0) return null;

  return (
    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Zap className="h-5 w-5 animate-pulse" />
          Active Performance Boosters
          <Badge className="bg-green-100 text-green-700">
            {activeBoosters.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeBoosters.map((userBooster) => {
            const booster = userBooster.performance_boosters;
            const Icon = iconMap[booster.icon_name as keyof typeof iconMap] || Zap;
            
            return (
              <div
                key={userBooster.id}
                className={cn(
                  'relative p-4 rounded-lg border-2 border-green-300 bg-white/80',
                  'animate-pulse-glow'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500 text-white rounded-lg">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{booster.name}</p>
                    <p className="text-xs text-green-600 capitalize">
                      {booster.effect_type} booster
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-green-700">
                  <Clock className="h-3 w-3" />
                  <span>Active until next {booster.effect_type}</span>
                </div>
                
                {/* Pulsing effect indicator */}
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
