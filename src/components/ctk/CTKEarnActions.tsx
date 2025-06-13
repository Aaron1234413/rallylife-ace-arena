
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trophy, BookOpen, Target, Star, Coins } from 'lucide-react';
import { useCoachTokens } from '@/hooks/useCoachTokens';

export function CTKEarnActions() {
  const { addTokens, addTokensLoading } = useCoachTokens();

  const handleEarnTokens = (amount: number, source: string, description: string) => {
    addTokens({
      amount,
      source,
      description
    });
  };

  const actions = [
    {
      icon: Users,
      title: 'Successful Coaching Session',
      description: 'Complete a successful 1-on-1 coaching session',
      tokens: 15,
      source: 'successful_coaching',
      color: 'text-blue-600'
    },
    {
      icon: Trophy,
      title: 'Premium Content Sale',
      description: 'Sell premium training content or courses',
      tokens: 25,
      source: 'premium_content',
      color: 'text-green-600'
    },
    {
      icon: BookOpen,
      title: 'Platform Engagement',
      description: 'Active participation in community forums',
      tokens: 10,
      source: 'platform_engagement',
      color: 'text-purple-600'
    },
    {
      icon: Target,
      title: 'Player Achievement Bonus',
      description: 'Bonus when your players reach milestones',
      tokens: 20,
      source: 'player_achievement_bonus',
      color: 'text-orange-600'
    },
    {
      icon: Star,
      title: 'Positive Review Received',
      description: 'Earn tokens from 5-star player reviews',
      tokens: 12,
      source: 'positive_review',
      color: 'text-yellow-600'
    }
  ];

  return (
    <Card className="border-tennis-green-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Earn Coach Tokens
        </CardTitle>
        <CardDescription>
          Complete coaching activities to earn CTK for professional development
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.source} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${action.color} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className="font-medium text-sm text-tennis-green-dark">
                      {action.title}
                    </p>
                    <p className="text-xs text-tennis-green-medium mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={addTokensLoading}
                  onClick={() => handleEarnTokens(action.tokens, action.source, action.title)}
                  className="text-xs"
                >
                  +{action.tokens} CTK
                </Button>
              </div>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-tennis-green-bg rounded-lg">
          <p className="text-xs text-tennis-green-dark">
            💡 <strong>Tip:</strong> Use your CTK to purchase marketing tools, analytics upgrades, and professional development resources!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
