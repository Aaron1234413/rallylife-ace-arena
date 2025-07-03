import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Coins,
  CheckCircle,
  Zap,
  Gift
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DailyCheckInProps {
  currentStreak: number;
  hasCheckedInToday: boolean;
  onCheckInComplete: () => void;
}

export const DailyCheckIn: React.FC<DailyCheckInProps> = ({
  currentStreak,
  hasCheckedInToday,
  onCheckInComplete
}) => {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const getStreakBonus = (streak: number): number => {
    if (streak >= 30) return 25;
    if (streak >= 14) return 10;
    if (streak >= 7) return 5;
    if (streak >= 3) return 2;
    return 0;
  };

  const handleCheckIn = async () => {
    if (!user || hasCheckedInToday) return;

    setIsCheckingIn(true);
    try {
      const { data, error } = await supabase.rpc('academy_daily_check_in', {
        user_id: user.id
      });

      if (error) throw error;

      const result = data as any;
      if (result?.success) {
        setShowAnimation(true);
        
        // Show celebration toast
        toast({
          title: "🎉 Daily Check-in Complete!",
          description: `+${result.tokens_earned} tokens earned (${result.base_tokens} base + ${result.bonus_tokens} streak bonus)`,
        });

        // Hide animation after 2 seconds
        setTimeout(() => {
          setShowAnimation(false);
          onCheckInComplete();
        }, 2000);
      } else {
        toast({
          title: "Check-in Failed",
          description: result?.error || "Unable to complete check-in",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: "Error",
        description: "Failed to complete check-in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const baseTokens = 5;
  const bonusTokens = getStreakBonus(currentStreak + 1);
  const totalTokens = baseTokens + bonusTokens;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      {/* Celebration Animation Overlay */}
      {showAnimation && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center z-10 animate-pulse">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-xl font-bold">Check-in Complete!</div>
            <div className="text-sm">+{totalTokens} tokens earned</div>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-tennis-green-dark">Daily Check-in</h3>
                <p className="text-sm text-tennis-green-medium">
                  {hasCheckedInToday ? "✅ Completed today" : "Start your day with learning"}
                </p>
              </div>
            </div>
            
            {hasCheckedInToday && (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>

          {/* Streak Display */}
          <div className="bg-white/80 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-tennis-green-dark">Current Streak</span>
              <div className="flex items-center gap-1">
                <span className="text-orange-600 text-lg">🔥</span>
                <span className="font-bold text-tennis-green-dark">{currentStreak} days</span>
              </div>
            </div>
            
            {!hasCheckedInToday && (
              <div className="text-xs text-tennis-green-medium">
                Check in today to {currentStreak === 0 ? 'start' : 'continue'} your streak!
              </div>
            )}
          </div>

          {/* Rewards Preview */}
          {!hasCheckedInToday && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-tennis-green-dark">Today's Rewards:</div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  <Coins className="h-3 w-3 mr-1" />
                  +{baseTokens} Base Tokens
                </Badge>
                
                {bonusTokens > 0 && (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <Gift className="h-3 w-3 mr-1" />
                    +{bonusTokens} Streak Bonus
                  </Badge>
                )}
                
                <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                  +10 Knowledge Points
                </Badge>
              </div>

              {bonusTokens > 0 && (
                <div className="bg-gradient-to-r from-green-100 to-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Streak Bonus Active! 
                    </span>
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    {currentStreak + 1} days = +{bonusTokens} bonus tokens
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Check-in Button */}
          <Button
            onClick={handleCheckIn}
            disabled={hasCheckedInToday || isCheckingIn}
            className={`w-full ${
              hasCheckedInToday 
                ? 'bg-green-600 hover:bg-green-600' 
                : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
            } text-white font-semibold py-3`}
          >
            {isCheckingIn ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Checking in...
              </>
            ) : hasCheckedInToday ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Checked in today!
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Check in now (+{totalTokens} tokens)
              </>
            )}
          </Button>

          {/* Next Streak Milestone */}
          {!hasCheckedInToday && (
            <div className="text-center text-xs text-tennis-green-medium">
              {currentStreak < 3 && (
                <>Check in for {3 - currentStreak} more days to unlock streak bonuses!</>
              )}
              {currentStreak >= 3 && currentStreak < 7 && (
                <>Just {7 - currentStreak} more days for a bigger bonus!</>
              )}
              {currentStreak >= 7 && currentStreak < 14 && (
                <>{14 - currentStreak} days to the next bonus tier!</>
              )}
              {currentStreak >= 14 && currentStreak < 30 && (
                <>{30 - currentStreak} days to maximum bonus!</>
              )}
              {currentStreak >= 30 && (
                <>🏆 You've reached the maximum streak bonus!</>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};