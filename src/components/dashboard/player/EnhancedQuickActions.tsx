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
  AlertTriangle,
  Activity,
  Target
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';
import { SmartRecommendations } from './SmartRecommendations';
import { ActionButton } from './ActionButton';
import { CreateSocialPlayDialog } from '@/components/social-play/CreateSocialPlayDialog';
import { RecoveryCenter, RecoveryQuickAction } from '@/components/recovery';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { activities, refreshData, loading: activitiesLoading, logActivity } = useActivityLogs();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [socialPlayDialogOpen, setSocialPlayDialogOpen] = useState(false);
  const [recoveryCenterOpen, setRecoveryCenterOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
  const xpProgress = xpData ? (xpData.current_xp / (xpData.current_xp + xpData.xp_to_next_level)) * 100 : 0;
  
  
  const contextualData = useMemo(() => {
    const currentHour = new Date().getHours();
    const isEarlyMorning = currentHour >= 6 && currentHour < 10;
    const isEvening = currentHour >= 17 && currentHour < 21;
    const isLateNight = currentHour >= 21 || currentHour < 6;
    
    // Analyze real activity patterns
    const recentActivities = activities?.slice(0, 10) || [];
    const lastActivity = recentActivities[0];
    const hoursSinceLastActivity = lastActivity ? 
      (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60) : 24;
    
    // Calculate real activity streak and patterns
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivityCount = activities?.filter(activity => 
      new Date(activity.created_at) > weekAgo
    ).length || 0;
    
    const isActiveStreak = recentActivityCount >= 3;
    const needsRecovery = hpPercentage <= 5 || hoursSinceLastActivity > 12; // Updated: Only block at 5% HP or below
    const nearLevelUp = xpData && xpData.xp_to_next_level < 50;
    
    // Real player state analysis based on actual HP data
    const energyLevel = hpPercentage > 80 ? 'peak' : 
                       hpPercentage > 60 ? 'high' : 
                       hpPercentage > 40 ? 'moderate' : 
                       hpPercentage > 20 ? 'low' : 'critical';
    
    const motivationLevel = isActiveStreak && recentActivityCount > 5 ? 'excellent' :
                           isActiveStreak ? 'high' : 
                           recentActivityCount > 2 ? 'good' : 
                           hoursSinceLastActivity < 48 ? 'moderate' : 'needs-boost';
    
    // Activity type recommendations based on real recent patterns
    const recentTypes = recentActivities.slice(0, 5).map(a => a.activity_type);
    const hasRecentTraining = recentTypes.includes('training');
    const hasRecentMatch = recentTypes.includes('match');
    const hasRecentSocial = recentTypes.includes('social');
    
    return {
      timeOfDay: { isEarlyMorning, isEvening, isLateNight, currentHour },
      activity: { 
        hoursSinceLastActivity, 
        isActiveStreak, 
        recentActivityCount,
        lastActivityType: lastActivity?.activity_type,
        recentTypes,
        hasRecentTraining,
        hasRecentMatch, 
        hasRecentSocial
      },
      playerState: { 
        needsRecovery, 
        nearLevelUp, 
        energyLevel, 
        motivationLevel,
        hpPercentage,
        xpProgress 
      },
      recommendations: {
        energy: hpPercentage > 70 ? 'high' : hpPercentage > 40 ? 'medium' : 'low',
        motivation: isActiveStreak ? 'high' : recentActivityCount > 1 ? 'medium' : 'low',
        variety: recentTypes.length < 2 ? 'needed' : 'good'
      }
    };
  }, [hpData, xpData, activities, hpPercentage, activitiesLoading]);

  
  const quickActions = useMemo(() => {
    const baseActions = [
      {
        id: 'match',
        title: 'Tennis Match',
        baseDescription: 'Record a competitive tennis match with detailed scoring',
        icon: Zap,
        color: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        rewards: { hp: -15, xp: 50, tokens: 25 },
        energyRequirement: 'high' as const,
        estimatedDuration: 90,
        difficulty: 'high' as const,
        navigateTo: '/start-match',
        timePreference: ['morning', 'evening'],
        varietyType: 'competitive'
      },
      {
        id: 'training',
        title: 'Training Session',
        baseDescription: 'Practice drills, technique work, and skill development',
        icon: BookOpen,
        color: 'bg-gradient-to-br from-green-500 via-green-600 to-emerald-700',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        rewards: { hp: -8, xp: 30, tokens: 15 },
        energyRequirement: 'medium' as const,
        estimatedDuration: 60,
        difficulty: 'medium' as const,
        navigateTo: '/start-training',
        timePreference: ['morning', 'afternoon', 'evening'],
        varietyType: 'skill-building'
      },
      {
        id: 'social',
        title: 'Social Play',
        baseDescription: 'Create a session and invite friends to play together',
        icon: Users,
        color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        rewards: { hp: 5, xp: 15, tokens: 12 },
        energyRequirement: 'low' as const,
        estimatedDuration: 45,
        difficulty: 'low' as const,
        openDialog: true,
        timePreference: ['afternoon', 'evening'],
        varietyType: 'social'
      }
    ];

    return baseActions.map(action => {
      let contextualMessage = '';
      let recommended = false;
      let urgency: 'low' | 'medium' | 'high' = 'low';
      let availability = true;
      
      // Updated energy-based recommendations using actual HP data
      const playerEnergyLevel = contextualData.recommendations.energy;
      if (action.energyRequirement === 'high' && playerEnergyLevel === 'high') {
        contextualMessage = `Perfect energy level for ${action.title.toLowerCase()}! Your HP (${Math.round(contextualData.playerState.hpPercentage)}%) is optimal for intense activity.`;
        recommended = true;
        urgency = 'high';
      } else if (action.energyRequirement === 'high' && hpPercentage <= 5) {
        contextualMessage = `Recovery needed first - your HP (${Math.round(contextualData.playerState.hpPercentage)}%) is critically low for intense activity`;
        availability = false;
      } else if (action.energyRequirement === 'low' && playerEnergyLevel === 'low') {
        contextualMessage = `Great low-energy option for your current state (${Math.round(contextualData.playerState.hpPercentage)}% HP)`;
        recommended = true;
        urgency = 'medium';
      } else if (action.energyRequirement === 'medium' && playerEnergyLevel === 'medium') {
        contextualMessage = `Well-balanced activity for your current energy level (${Math.round(contextualData.playerState.hpPercentage)}% HP)`;
        recommended = true;
        urgency = 'medium';
      }

      // Real time-based recommendations
      const currentTimeContext = contextualData.timeOfDay.isEarlyMorning ? 'morning' : 
                                contextualData.timeOfDay.isEvening ? 'evening' : 'afternoon';
      
      if (action.timePreference?.includes(currentTimeContext)) {
        if (!contextualMessage) {
          contextualMessage = `Perfect timing! ${contextualData.timeOfDay.currentHour}:00 is ideal for ${action.title.toLowerCase()}`;
        }
        recommended = true;
        if (urgency === 'low') urgency = 'medium';
      }

      // Real activity pattern analysis
      if (contextualData.recommendations.variety === 'needed') {
        if (!contextualData.activity.recentTypes.includes(action.varietyType)) {
          contextualMessage = contextualMessage || `Add variety to your routine - you haven't done ${action.title.toLowerCase()} recently`;
          recommended = true;
          urgency = 'medium';
        }
      }

      // Real activity gap analysis
      if (contextualData.activity.hoursSinceLastActivity > 48 && action.energyRequirement === 'low') {
        contextualMessage = `Perfect comeback activity after ${Math.round(contextualData.activity.hoursSinceLastActivity)} hours`;
        recommended = true;
        urgency = 'medium';
      }

      // Real XP progress recommendations using actual XP data
      if (contextualData.playerState.nearLevelUp && action.rewards.xp >= 30) {
        contextualMessage = `${action.rewards.xp} XP will help you reach Level ${xpData.current_level + 1}! Only ${xpData.xp_to_next_level} XP needed.`;
        recommended = true;
        urgency = 'high';
      }

      // Real streak maintenance
      if (contextualData.activity.isActiveStreak && contextualData.recommendations.motivation === 'high') {
        if (!contextualMessage) {
          contextualMessage = `Maintain your ${contextualData.activity.recentActivityCount}-activity streak!`;
        }
        const urgencyLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
        const currentIndex = urgencyLevels.indexOf(urgency);
        const newIndex = Math.min(currentIndex + 1, urgencyLevels.length - 1);
        urgency = urgencyLevels[newIndex];
      }

      // Real motivation boost recommendations
      if (contextualData.playerState.motivationLevel === 'needs-boost' && action.varietyType === 'social') {
        contextualMessage = contextualMessage || `Social activity can help boost motivation and enjoyment`;
        recommended = true;
        urgency = 'medium';
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
          motivationBoost: contextualData.recommendations.motivation === 'high',
          varietyBonus: !contextualData.activity.recentTypes.includes(action.varietyType),
          perfectTiming: action.timePreference?.includes(currentTimeContext) && 
                        contextualData.recommendations.energy === action.energyRequirement
        }
      };
    });
  }, [contextualData, xpData, activities, hpPercentage]);

  const handleQuickAction = async (action: typeof quickActions[0]) => {
    if (!action.availability) {
      toast.error(`This activity is not recommended with your current energy level (${Math.round(contextualData.playerState.hpPercentage)}% HP). Consider recovery first.`);
      return;
    }

    // Real backend integration for navigation
    if (action.navigateTo) {
      console.log(`Navigating to ${action.navigateTo} for ${action.title}`);
      navigate(action.navigateTo);
      return;
    }

    // Real social play dialog integration
    if (action.openDialog && action.id === 'social') {
      console.log('Opening social play dialog with real contextual data:', contextualData);
      setSocialPlayDialogOpen(true);
      return;
    }

    // Real activity logging with proper error handling
    try {
      setLoadingAction(action.id);
      console.log('Logging real activity with backend integration:', { 
        action: action.title, 
        context: contextualData.playerState,
        timing: contextualData.timeOfDay 
      });
      
      // Use real activity logging function - removed hp_impact since it's calculated by backend
      const result = await logActivity({
        activity_type: action.id,
        activity_category: 'quick_action',
        title: action.title,
        description: action.description,
        duration_minutes: action.estimatedDuration,
        intensity_level: action.difficulty,
        is_competitive: action.id === 'match',
        metadata: {
          contextual_recommendations: action.contextualInfo,
          energy_level: contextualData.playerState.energyLevel,
          time_context: contextualData.timeOfDay.currentHour,
          expected_rewards: action.rewards
        }
      });

      if (result?.success) {
        toast.success(`${action.title} logged successfully! ${result.hp_change > 0 ? '+' : ''}${result.hp_change} HP, +${result.xp_earned} XP`);
        
        // Real-time data refresh
        await refreshData();
      } else {
        throw new Error('Failed to log activity');
      }
      
    } catch (error) {
      console.error('Error logging real activity:', error);
      toast.error('Failed to log activity. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRecommendationClick = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      console.log('Real recommendation clicked:', { actionId, action: action.title, context: contextualData });
      handleQuickAction(action);
    }
  };

  const handleOpenRecoveryCenter = () => {
    console.log('Opening Recovery Center with real HP data:', {
      currentHP: hpData?.current_hp,
      maxHP: hpData?.max_hp,
      hpPercentage: contextualData.playerState.hpPercentage,
      energyLevel: contextualData.playerState.energyLevel,
      needsRecovery: contextualData.playerState.needsRecovery
    });
    setRecoveryCenterOpen(true);
  };

  // Show loading state while activities are loading
  if (activitiesLoading && !activities?.length) {
    return (
      <div className="space-y-4 px-3 sm:px-0">
        <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="ml-3 text-sm sm:text-base text-gray-600">Loading your activity insights...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (recoveryCenterOpen) {
    return (
      <RecoveryCenter onBack={() => setRecoveryCenterOpen(false)} />
    );
  }

  // Mobile-first action sorting with backend data
  const sortedActions = [...quickActions].sort((a, b) => {
    // First priority: availability (based on real HP data)
    if (a.availability !== b.availability) return a.availability ? -1 : 1;
    
    // Second priority: recommended actions (based on real activity patterns)
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    
    // Third priority: urgency level (based on real player state)
    if (a.urgency !== b.urgency) {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    }
    
    // Fourth priority: contextual perfect timing (based on real data analysis)
    const aPerfectTiming = a.contextualInfo?.perfectTiming || false;
    const bPerfectTiming = b.contextualInfo?.perfectTiming || false;
    if (aPerfectTiming !== bPerfectTiming) return aPerfectTiming ? -1 : 1;
    
    return 0;
  });

  return (
    <div 
      className="space-y-4 sm:space-y-6 px-3 sm:px-0"
      role="main"
      aria-label="Tennis Activity Quick Actions"
    >
      {/* Skip link for accessibility */}
      <a href="#quick-actions" className="skip-link">
        Skip to Quick Actions
      </a>

      {/* Smart Recommendations - Simplified */}
      <SmartRecommendations 
        hpData={hpData}
        xpData={xpData}
        contextualData={contextualData}
        onRecommendationClick={handleRecommendationClick}
      />

      {/* Enhanced Quick Actions */}
      <Card 
        id="quick-actions"
        className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50"
      >
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 pb-3 sm:pb-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Smart Quick Actions</h2>
                <p className="text-gray-600 font-normal mt-1 text-xs sm:text-sm">
                  Powered by real activity data and player insights
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md text-xs"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI Prioritized
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-purple-100 text-purple-700 border-purple-200 shadow-sm text-xs"
              >
                <Target className="h-3 w-3 mr-1" />
                {sortedActions.filter(a => a.recommended).length} recommended
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2">
            {sortedActions.map((action, index) => (
              <div 
                key={action.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ActionButton
                  action={action}
                  onClick={() => handleQuickAction(action)}
                  disabled={loadingAction !== null || !action.availability}
                  loading={loadingAction === action.id}
                  contextual={true}
                />
              </div>
            ))}
            
            {/* Recovery Center Action */}
            <div 
              className="animate-fade-in"
              style={{ animationDelay: `${sortedActions.length * 100}ms` }}
            >
              <RecoveryQuickAction
                onOpenRecoveryCenter={handleOpenRecoveryCenter}
              />
            </div>
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
