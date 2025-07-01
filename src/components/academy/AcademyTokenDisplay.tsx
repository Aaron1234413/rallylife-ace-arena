
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp } from 'lucide-react';

interface AcademyTokenDisplayProps {
  dailyEarned: number;
  dailyLimit: number;
  totalTokens: number;
}

export const AcademyTokenDisplay: React.FC<AcademyTokenDisplayProps> = ({
  dailyEarned,
  dailyLimit,
  totalTokens
}) => {
  const [animateEarnings, setAnimateEarnings] = useState(false);
  const progressPercentage = (dailyEarned / dailyLimit) * 100;

  useEffect(() => {
    // Trigger animation when component mounts
    setAnimateEarnings(true);
    const timer = setTimeout(() => setAnimateEarnings(false), 1000);
    return () => clearTimeout(timer);
  }, [dailyEarned]);

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Coins className="h-6 w-6 text-yellow-600" />
            <h3 className="text-lg font-semibold text-tennis-green-dark">
              Today's Academy Tokens
            </h3>
          </div>
          <Badge 
            variant={dailyEarned >= dailyLimit ? "default" : "secondary"}
            className={dailyEarned >= dailyLimit ? "bg-green-500" : ""}
          >
            {dailyEarned}/{dailyLimit}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Daily Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Token Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-tennis-green-bg rounded-lg">
              <div className={`text-2xl font-bold text-yellow-600 ${
                animateEarnings ? 'animate-pulse' : ''
              }`}>
                +{dailyEarned}
              </div>
              <div className="text-sm text-gray-600">Earned Today</div>
            </div>
            <div className="text-center p-3 bg-tennis-green-bg rounded-lg">
              <div className="text-2xl font-bold text-tennis-green-dark">
                {totalTokens}
              </div>
              <div className="text-sm text-gray-600">Total Balance</div>
            </div>
          </div>

          {/* Earning Opportunities */}
          <div className="bg-tennis-yellow-light p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-tennis-green-dark" />
              <span className="text-sm font-medium text-tennis-green-dark">
                Ways to Earn More
              </span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Daily Drill: 5 tokens</div>
              <div>• Quick Quiz: 1-3 tokens</div>
              <div>• Perfect Score Bonus: +2 tokens</div>
            </div>
          </div>
        </div>

        {/* Animated token popup */}
        {animateEarnings && (
          <div className="absolute top-4 right-4 animate-bounce">
            <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm font-bold">
              +{dailyEarned}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
