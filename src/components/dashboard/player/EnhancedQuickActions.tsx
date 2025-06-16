
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Users, 
  BookOpen, 
  Trophy, 
  Heart, 
  Star, 
  Coins,
  Plus,
  ChevronRight 
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';

interface EnhancedQuickActionsProps {
  hpData: any;
  xpData: any;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<void>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<void>;
}

export function EnhancedQuickActions({ 
  hpData, 
  xpData, 
  onAddXP, 
  onRestoreHP, 
  onAddTokens 
}: EnhancedQuickActionsProps) {
  const { logActivity } = useActivityLogs();
  const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
  
  const quickActions = [
    {
      id: 'match',
      title: 'Log Match',
      description: 'Record a tennis match',
      icon: Zap,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      rewards: { hp: -10, xp: 50, tokens: 25 },
      recommended: hpPercentage > 40,
      activityData: {
        activity_type: 'match',
        activity_category: 'on_court',
        title: 'Tennis Match',
        duration_minutes: 90,
        intensity_level: 'high'
      }
    },
    {
      id: 'training',
      title: 'Training Session',
      description: 'Practice drills & skills',
      icon: BookOpen,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      rewards: { hp: -5, xp: 30, tokens: 15 },
      recommended: hpPercentage > 30,
      activityData: {
        activity_type: 'training',
        activity_category: 'on_court',
        title: 'Training Session',
        duration_minutes: 60,
        intensity_level: 'medium'
      }
    },
    {
      id: 'social',
      title: 'Social Play',
      description: 'Casual games with friends',
      icon: Users,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      rewards: { hp: -3, xp: 20, tokens: 10 },
      recommended: hpPercentage > 20,
      activityData: {
        activity_type: 'social',
        activity_category: 'social',
        title: 'Social Play',
        duration_minutes: 45,
        intensity_level: 'low'
      }
    },
    {
      id: 'rest',
      title: 'Rest & Recovery',
      description: 'Restore your energy',
      icon: Heart,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      rewards: { hp: 15, xp: 0, tokens: 0 },
      recommended: hpPercentage < 40,
      activityData: {
        activity_type: 'rest',
        activity_category: 'recovery',
        title: 'Rest & Recovery',
        duration_minutes: 30,
        intensity_level: 'low'
      }
    }
  ];

  const getRecommendation = () => {
    if (hpPercentage < 30) {
      return {
        title: "Rest Recommended",
        description: "Your HP is low. Consider resting or light activities.",
        action: "Rest & Recover",
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      };
    }
    if (hpPercentage < 60) {
      return {
        title: "Light Activity Suggested",
        description: "Perfect time for training or social play.",
        action: "Start Training",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    }
    return {
      title: "Ready for Action!",
      description: "You're in great shape for any activity.",
      action: "Log Match",
      color: "text-green-600",
      bgColor: "bg-green-50"
    };
  };

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    try {
      // Log the activity in the database
      await logActivity(action.activityData);
      
      // Apply HP changes
      if (action.rewards.hp > 0) {
        await onRestoreHP(action.rewards.hp, action.id, action.description);
      }
      
      // Apply XP changes
      if (action.rewards.xp > 0) {
        await onAddXP(action.rewards.xp, action.id, action.description);
      }
      
      // Apply Token changes
      if (action.rewards.tokens > 0) {
        await onAddTokens(action.rewards.tokens, 'regular', action.id, action.description);
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const recommendation = getRecommendation();

  return (
    <div className="space-y-4">
      {/* Recommendation Card */}
      <Card className={`border-l-4 ${recommendation.bgColor} border-l-current`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className={`font-semibold ${recommendation.color} mb-1`}>
                {recommendation.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {recommendation.description}
              </p>
              {hpData && (
                <p className="text-xs text-gray-500">
                  Current HP: {hpData.current_hp}/{hpData.max_hp} ({hpPercentage.toFixed(0)}%)
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              
              return (
                <Card 
                  key={action.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${action.bgColor} hover:scale-[1.02]`}
                  onClick={() => handleQuickAction(action)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${action.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{action.title}</h3>
                          {action.recommended && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {action.description}
                        </p>
                        
                        {/* Rewards Preview */}
                        <div className="flex items-center gap-3 text-xs">
                          {action.rewards.hp !== 0 && (
                            <div className="flex items-center gap-1">
                              <Heart className="h-3 w-3 text-red-500" />
                              <span className={`font-medium ${action.rewards.hp > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {action.rewards.hp > 0 ? '+' : ''}{action.rewards.hp}
                              </span>
                            </div>
                          )}
                          {action.rewards.xp > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span className="font-medium text-yellow-600">+{action.rewards.xp}</span>
                            </div>
                          )}
                          {action.rewards.tokens > 0 && (
                            <div className="flex items-center gap-1">
                              <Coins className="h-3 w-3 text-yellow-500" />
                              <span className="font-medium text-yellow-600">+{action.rewards.tokens}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
