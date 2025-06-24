
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Users, 
  BookOpen,
  Plus,
  Sparkles,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';
import { SmartRecommendations } from './SmartRecommendations';
import { ActionButton } from './ActionButton';
import { CreateSocialPlayDialog } from '@/components/social-play/CreateSocialPlayDialog';
import { RecoveryCenter, RecoveryQuickAction } from '@/components/recovery';

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
  const navigate = useNavigate();
  const { activities, refreshData } = useActivityLogs();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [socialPlayDialogOpen, setSocialPlayDialogOpen] = useState(false);
  const [recoveryCenterOpen, setRecoveryCenterOpen] = useState(false);
  
  const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
  const xpProgress = xpData ? (xpData.current_xp / (xpData.current_xp + xpData.xp_to_next_level)) * 100 : 0;
  
  // Smart contextual analysis
  const contextualData = useMemo(() => {
    const currentHour = new Date().getHours();
    const isEarlyMorning = currentHour >= 6 && currentHour < 10;
    const isEvening = currentHour >= 17 && currentHour < 21;
    const isLateNight = currentHour >= 21 || currentHour < 6;
    
    // Analyze recent activity patterns
    const recentActivities = activities?.slice(0, 5) || [];
    const lastActivity = recentActivities[0];
    const hoursSinceLastActivity = lastActivity ? 
      (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60) : 24;
    
    // Calculate activity streak (activities in last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivityCount = activities?.filter(activity => 
      new Date(activity.created_at) > weekAgo
    ).length || 0;
    
    const isActiveStreak = recentActivityCount >= 3;
    const needsRecovery = hpPercentage < 40 || hoursSinceLastActivity > 12;
    const nearLevelUp = xpData && xpData.xp_to_next_level < 50;
    
    return {
      timeOfDay: { isEarlyMorning, isEvening, isLateNight },
      activity: { 
        hoursSinceLastActivity, 
        isActiveStreak, 
        recentActivityCount,
        lastActivityType: lastActivity?.activity_type 
      },
      playerState: { needsRecovery, nearLevelUp },
      recommendations: {
        energy: hpPercentage > 70 ? 'high' : hpPercentage > 40 ? 'medium' : 'low',
        motivation: isActiveStreak ? 'high' : recentActivityCount > 1 ? 'medium' : 'low'
      }
    };
  }, [hpData, xpData, activities, hpPercentage]);

  // Dynamic action configuration with contextual intelligence
  const quickActions = useMemo(() => {
    const baseActions = [
      {
        id: 'match',
        title: 'Tennis Match',
        baseDescription: 'Record a competitive tennis match with detailed scoring',
        icon: Zap,
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        rewards: { hp: -15, xp: 50, tokens: 25 },
        energyRequirement: 'high',
        estimatedDuration: 90,
        difficulty: 'high' as const,
        navigateTo: '/start-match',
        timePreference: ['morning', 'evening']
      },
      {
        id: 'training',
        title: 'Training Session',
        baseDescription: 'Practice drills, technique work, and skill development',
        icon: BookOpen,
        color: 'bg-gradient-to-r from-green-500 to-green-600',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        rewards: { hp: -8, xp: 30, tokens: 15 },
        energyRequirement: 'medium',
        estimatedDuration: 60,
        difficulty: 'medium' as const,
        navigateTo: '/start-training',
        timePreference: ['morning', 'afternoon', 'evening']
      },
      {
        id: 'social',
        title: 'Social Play',
        baseDescription: 'Create a session and invite friends to play together',
        icon: Users,
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        rewards: { hp: 5, xp: 15, tokens: 12 },
        energyRequirement: 'low',
        estimatedDuration: 45,
        difficulty: 'low' as const,
        openDialog: true,
        timePreference: ['afternoon', 'evening']
      }
    ];

    // Add contextual information to each action
    return baseActions.map(action => {
      let contextualMessage = '';
      let recommended = false;
      let urgency: 'low' | 'medium' | 'high' = 'low';
      let availability = true;
      
      // Energy-based recommendations
      if (action.energyRequirement === 'high' && contextualData.recommendations.energy === 'high') {
        contextualMessage = `Perfect energy level for ${action.title.toLowerCase()}!`;
        recommended = true;
        urgency = 'high';
      } else if (action.energyRequirement === 'high' && contextualData.recommendations.energy === 'low') {
        contextualMessage = `Consider recovery first - low energy for intense activity`;
        availability = false;
      } else if (action.energyRequirement === 'low' && contextualData.recommendations.energy === 'low') {
        contextualMessage = `Great low-energy option for current state`;
        recommended = true;
        urgency = 'medium';
      }

      // Time-based recommendations
      const currentTimeContext = contextualData.timeOfDay.isEarlyMorning ? 'morning' : 
                                contextualData.timeOfDay.isEvening ? 'evening' : 'afternoon';
      
      if (action.timePreference?.includes(currentTimeContext)) {
        if (!contextualMessage) {
          contextualMessage = `Ideal time for ${action.title.toLowerCase()}`;
        }
        recommended = true;
      }

      // Activity pattern based recommendations
      if (contextualData.activity.hoursSinceLastActivity > 24 && action.energyRequirement === 'low') {
        contextualMessage = `Great way to get back into activity`;
        recommended = true;
        urgency = 'medium';
      }

      // XP progress recommendations
      if (contextualData.playerState.nearLevelUp && action.rewards.xp >= 30) {
        contextualMessage = `${action.rewards.xp} XP - Perfect for leveling up!`;
        recommended = true;
        urgency = 'high';
      }

      // Streak maintenance
      if (contextualData.activity.isActiveStreak && contextualData.recommendations.motivation === 'high') {
        if (!contextualMessage) {
          contextualMessage = `Keep your winning streak going!`;
        }
        urgency = Math.max(urgency === 'low' ? 'medium' : urgency === 'medium' ? 'high' : 'high', urgency as any);
      }

      return {
        ...action,
        description: contextualMessage || action.baseDescription,
        recommended,
        urgency,
        availability,
        contextualInfo: {
          energyMatch: action.energyRequirement === contextualData.recommendations.energy,
          timeMatch: action.timePreference?.includes(currentTimeContext),
          motivationBoost: contextualData.recommendations.motivation === 'high'
        }
      };
    });
  }, [contextualData]);

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    if (!action.availability) {
      toast.error('This activity is not recommended with your current energy level');
      return;
    }

    // If action has navigateTo, navigate instead of logging activity
    if (action.navigateTo) {
      navigate(action.navigateTo);
      return;
    }

    // If action should open dialog, open it
    if (action.openDialog && action.id === 'social') {
      setSocialPlayDialogOpen(true);
      return;
    }

    try {
      setLoadingAction(action.id);
      console.log('Logging contextual quick action:', action);
      
      toast.success(`${action.title} completed!`);
      await refreshData();
      
    } catch (error) {
      console.error('Error logging quick action:', error);
      toast.error('Failed to log activity. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRecommendationClick = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      handleQuickAction(action);
    }
  };

  const handleOpenRecoveryCenter = () => {
    console.log('Opening Recovery Center from quick actions');
    setRecoveryCenterOpen(true);
  };

  if (recoveryCenterOpen) {
    return (
      <RecoveryCenter onBack={() => setRecoveryCenterOpen(false)} />
    );
  }

  // Sort actions by priority (recommended + urgency first)
  const sortedActions = [...quickActions].sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    if (a.urgency !== b.urgency) {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Smart Recommendations with enhanced contextual data */}
      <Card className="border-2 border-gradient-to-r from-purple-200 to-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Smart Recommendations
            <Badge variant="secondary" className="ml-auto">
              {contextualData.recommendations.energy} energy
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartRecommendations 
            hpData={hpData}
            xpData={xpData}
            contextualData={contextualData}
            onRecommendationClick={handleRecommendationClick}
          />
        </CardContent>
      </Card>

      {/* Contextual Activity Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Activity Insights:</span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {contextualData.activity.recentActivityCount} activities this week
              </span>
              {contextualData.activity.hoursSinceLastActivity > 24 && (
                <span className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="h-3 w-3" />
                  {Math.round(contextualData.activity.hoursSinceLastActivity)}h since last activity
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions with contextual priority */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
            <Badge variant="outline" className="ml-auto text-xs">
              Smart sorted
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedActions.map((action) => (
              <ActionButton
                key={action.id}
                action={action}
                onClick={() => handleQuickAction(action)}
                disabled={loadingAction !== null || !action.availability}
                loading={loadingAction === action.id}
                contextual={true}
              />
            ))}
            
            {/* Recovery Center Action - Enhanced with contextual awareness */}
            <RecoveryQuickAction
              onOpenRecoveryCenter={handleOpenRecoveryCenter}
              urgent={contextualData.playerState.needsRecovery}
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Play Dialog */}
      <CreateSocialPlayDialog 
        open={socialPlayDialogOpen} 
        onOpenChange={setSocialPlayDialogOpen}
      />
    </div>
  );
}
