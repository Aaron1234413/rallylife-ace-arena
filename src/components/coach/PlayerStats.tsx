import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Star, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerStatsProps {
  hp: number;
  xp: number;
  tokens: number;
}

export function PlayerStats({ hp, xp, tokens }: PlayerStatsProps) {
  const hpPercentage = (hp / 100) * 100; // Assuming max HP is 100
  
  const getHPStatus = (percentage: number) => {
    if (percentage >= 80) return { 
      label: 'Excellent', 
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      progressColor: 'bg-gradient-to-r from-green-400 to-green-600'
    };
    if (percentage >= 40) return { 
      label: percentage >= 60 ? 'Good' : 'Fair', 
      bgGradient: percentage >= 60 ? 'from-blue-50 to-sky-50' : 'from-yellow-50 to-orange-50',
      borderColor: percentage >= 60 ? 'border-blue-200' : 'border-yellow-200',
      progressColor: percentage >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    };
    return { 
      label: 'Low', 
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      progressColor: 'bg-gradient-to-r from-orange-400 to-orange-600'
    };
  };

  const hpStatus = getHPStatus(hpPercentage);

  return (
    <Card className="w-full bg-gradient-to-br from-white via-tennis-green-bg/20 to-tennis-green-subtle/30 border border-tennis-green-light/30 shadow-xl">
      <CardContent className="p-4 sm:p-6">
        <div className="text-center mb-4">
          <h3 className="font-orbitron text-lg sm:text-xl text-tennis-green-dark font-bold">
            Coach Vitals
          </h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* HP Section */}
          <div className={cn(
            "p-4 rounded-2xl border-2 transition-all duration-500 transform hover:scale-105",
            `bg-gradient-to-br ${hpStatus.bgGradient}`,
            hpStatus.borderColor,
            "shadow-md hover:shadow-lg"
          )}>
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Heart className="h-5 w-5 text-red-400" fill="none" />
                <span className="font-orbitron text-sm font-bold text-gray-900">Health</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{hp}</div>
              <Progress 
                value={hpPercentage} 
                className="h-2 bg-gray-200 rounded-full"
                indicatorClassName={cn("transition-all duration-1000 rounded-full", hpStatus.progressColor)}
              />
              <Badge variant="secondary" className="text-xs font-semibold">
                {hpStatus.label}
              </Badge>
            </div>
          </div>

          {/* XP Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <span className="font-orbitron text-sm font-bold text-gray-900">Experience</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{xp}</div>
              <Badge variant="outline" className="text-xs font-semibold text-yellow-700 border-yellow-300">
                Total XP
              </Badge>
            </div>
          </div>

          {/* Tokens Section */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 shadow-md hover:shadow-lg transition-all duration-500 transform hover:scale-105">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Coins className="h-5 w-5 text-purple-500" />
                <span className="font-orbitron text-sm font-bold text-gray-900">Tokens</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{tokens}</div>
              <Badge variant="secondary" className="text-xs font-semibold bg-white/90 border-purple-200">
                Regular
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}