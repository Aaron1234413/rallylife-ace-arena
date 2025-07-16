import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins } from 'lucide-react';

interface AcademyTokenDisplayProps {
  dailyTokensEarned: number;
  dailyTokenLimit: number;
}

export const AcademyTokenDisplay: React.FC<AcademyTokenDisplayProps> = ({
  dailyTokensEarned,
  dailyTokenLimit
}) => {
  const [animatedTokens, setAnimatedTokens] = useState(dailyTokensEarned);
  const [showEarnAnimation, setShowEarnAnimation] = useState(false);

  useEffect(() => {
    if (dailyTokensEarned > animatedTokens) {
      setShowEarnAnimation(true);
      const timer = setTimeout(() => {
        setAnimatedTokens(dailyTokensEarned);
        setShowEarnAnimation(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAnimatedTokens(dailyTokensEarned);
    }
  }, [dailyTokensEarned, animatedTokens]);

  const progressPercentage = (dailyTokensEarned / dailyTokenLimit) * 100;
  const tokensRemaining = dailyTokenLimit - dailyTokensEarned;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-tennis-green-light/20 relative overflow-hidden">
      {/* Earning Animation */}
      {showEarnAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-tennis-green-primary text-white px-4 py-2 rounded-full animate-bounce">
            +{dailyTokensEarned - animatedTokens} 🪙
          </div>
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Coins className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-tennis-green-dark">Today's Tokens</h3>
                <p className="text-sm text-tennis-green-medium">Daily learning rewards</p>
              </div>
            </div>
          </div>

          {/* Token Counter */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl font-bold text-tennis-green-dark transition-all duration-500">
                {animatedTokens}
              </span>
              <span className="text-lg text-tennis-green-medium">/</span>
              <span className="text-lg text-tennis-green-medium">{dailyTokenLimit}</span>
              <span className="text-2xl">🪙</span>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-1">
              <Progress 
                value={progressPercentage} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-tennis-green-medium">
                <span>Daily Progress</span>
                <span>
                  {tokensRemaining > 0 
                    ? `${tokensRemaining} more available` 
                    : 'Daily limit reached!'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            {progressPercentage === 100 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 font-medium">🎉 Daily goal complete!</p>
                <p className="text-green-600 text-sm">Come back tomorrow for more</p>
              </div>
            ) : progressPercentage >= 70 ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 font-medium">🔥 You're on fire!</p>
                <p className="text-blue-600 text-sm">Just {tokensRemaining} more to go</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-800 font-medium">⚡ Keep learning!</p>
                <p className="text-yellow-600 text-sm">Earn {tokensRemaining} more tokens today</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};