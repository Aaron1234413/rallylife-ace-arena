
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Sparkles, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LevelUpCelebrationProps {
  newLevel: number;
  previousLevel: number;
  rewards?: {
    xp: number;
    tokens: number;
    unlocks?: string[];
  };
  onClose: () => void;
  show: boolean;
}

export function LevelUpCelebration({ 
  newLevel, 
  previousLevel, 
  rewards,
  onClose,
  show 
}: LevelUpCelebrationProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show) {
      setAnimate(true);
      // Auto-close after 5 seconds
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className={cn(
        'max-w-md mx-4 border-4 border-yellow-400 shadow-2xl',
        animate && 'animate-scale-in'
      )}>
        <CardContent className="p-6 text-center bg-gradient-to-br from-yellow-50 to-orange-50">
          {/* Celebration Header */}
          <div className="mb-6">
            <div className="flex justify-center mb-3">
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-500 animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-spin" />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Level Up! 🎉
            </h2>
            
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge variant="outline" className="text-lg px-3 py-1">
                Level {previousLevel}
              </Badge>
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 animate-pulse" />
                ))}
              </div>
              <Badge className="text-lg px-3 py-1 bg-yellow-500 text-white">
                Level {newLevel}
              </Badge>
            </div>
            
            <p className="text-gray-600">
              Congratulations! You've reached a new level!
            </p>
          </div>

          {/* Rewards Section */}
          {rewards && (
            <div className="mb-6 space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center justify-center gap-2">
                <Gift className="h-5 w-5" />
                Level Rewards
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {rewards.xp > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold text-yellow-700">+{rewards.xp}</span>
                    </div>
                    <span className="text-xs text-gray-600">Bonus XP</span>
                  </div>
                )}
                
                {rewards.tokens > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Sparkles className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-blue-700">+{rewards.tokens}</span>
                    </div>
                    <span className="text-xs text-gray-600">Tokens</span>
                  </div>
                )}
              </div>

              {/* New Unlocks */}
              {rewards.unlocks && rewards.unlocks.length > 0 && (
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">New Unlocks:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {rewards.unlocks.map((unlock, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Star className="h-3 w-3" />
                        {unlock}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
          >
            Continue Playing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
