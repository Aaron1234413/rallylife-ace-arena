
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
  
  // Smart contextual analysis with enhanced intelligence
  const contextualData = useMemo(() => {
    const currentHour = new Date().getHours();
    const isEarlyMorning = currentHour >= 6 && currentHour < 10;
    const isEvening = currentHour >= 17 && currentHour < 21;
    const isLateNight = currentHour >= 21 || currentHour < 6;
    
    // Analyze recent activity patterns with enhanced intelligence
    const recentActivities = activities?.slice(0, 10) || [];
    const lastActivity = recentActivities[0];
    const hoursSinceLastActivity = lastActivity ? 
      (Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60) : 24;
    
    // Calculate activity streak and patterns
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivityCount = activities?.filter(activity => 
      new Date(activity.created_at) > weekAgo
    ).length || 0;
    
    const isActiveStreak = recentActivityCount >= 3;
    const needsRecovery = hpPercentage < 40 || hoursSinceLastActivity > 12;
    const nearLevelUp = xpData && xpData.xp_to_next_level < 50;
    
    // Enhanced player state analysis
    const energyLevel = hpPercentage > 80 ? 'peak' : 
                       hpPercentage > 60 ? 'high' : 
                       hpPercentage > 40 ? 'moderate' : 
                       hpPercentage > 20 ? 'low' : 'critical';
    
    const motivationLevel = isActiveStreak && recentActivityCount > 5 ? 'excellent' :
                           isActiveStreak ? 'high' : 
                           recentActivityCount > 2 ? 'good' : 
                           hoursSinceLastActivity < 48 ? 'moderate' : 'needs-boost';
    
    // Activity type recommendations based on recent patterns
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
  }, [hpData, xpData, activities, hpPercentage]);

  // Enhanced quick actions with better visual configuration
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

    // Enhanced contextual information generation
    return baseActions.map(action => {
      let contextualMessage = '';
      let recommended = false;
      let urgency: 'low' | 'medium' | 'high' = 'low';
      let availability = true;
      
      // Advanced energy-based recommendations
      const playerEnergyLevel = contextualData.recommendations.energy;
      if (action.energyRequirement === 'high' && playerEnergyLevel === 'high') {
        contextualMessage = `Perfect energy level for ${action.title.toLowerCase()}! Your HP is optimal for intense activity.`;
        recommended = true;
        urgency = 'high';
      } else if (action.energyRequirement === 'high' && playerEnergyLevel === 'low') {
        contextualMessage = `Consider recovery first - your current HP (${Math.round(contextualData.playerState.hpPercentage)}%) is too low for intense activity`;
        availability = false;
      } else if (action.energyRequirement === 'low' && playerEnergyLevel === 'low') {
        contextualMessage = `Great low-energy option for your current state (${Math.round(contextualData.playerState.hpPercentage)}% HP)`;
        recommended = true;
        urgency = 'medium';
      } else if (action.energyRequirement === 'medium' && playerEnergyLevel === 'medium') {
        contextualMessage = `Well-balanced activity for your current energy level`;
        recommended = true;
        urgency = 'medium';
      }

      // Enhanced time-based recommendations
      const currentTimeContext = contextualData.timeOfDay.isEarlyMorning ? 'morning' : 
                                contextualData.timeOfDay.isEvening ? 'evening' : 'afternoon';
      
      if (action.timePreference?.includes(currentTimeContext)) {
        if (!contextualMessage) {
          contextualMessage = `Perfect timing! ${contextualData.timeOfDay.currentHour}:00 is ideal for ${action.title.toLowerCase()}`;
        }
        recommended = true;
        if (urgency === 'low') urgency = 'medium';
      }

      // Activity pattern and variety recommendations
      if (contextualData.recommendations.variety === 'needed') {
        if (!contextualData.activity.recentTypes.includes(action.varietyType)) {
          contextualMessage = contextualMessage || `Add variety to your routine - you haven't done ${action.title.toLowerCase()} recently`;
          recommended = true;
          urgency = 'medium';
        }
      }

      // Activity gap recommendations
      if (contextualData.activity.hoursSinceLastActivity > 48 && action.energyRequirement === 'low') {
        contextualMessage = `Perfect comeback activity after ${Math.round(contextualData.activity.hoursSinceLastActivity)} hours`;
        recommended = true;
        urgency = 'medium';
      }

      // Enhanced XP progress recommendations
      if (contextualData.playerState.nearLevelUp && action.rewards.xp >= 30) {
        contextualMessage = `${action.rewards.xp} XP will help you reach Level ${xpData.current_level + 1}! Only ${xpData.xp_to_next_level} XP needed.`;
        recommended = true;
        urgency = 'high';
      }

      // Enhanced streak maintenance with better urgency logic
      if (contextualData.activity.isActiveStreak && contextualData.recommendations.motivation === 'high') {
        if (!contextualMessage) {
          contextualMessage = `Maintain your ${contextualData.activity.recentActivityCount}-activity streak!`;
        }
        // Properly handle urgency level escalation
        const urgencyLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
        const currentIndex = urgencyLevels.indexOf(urgency);
        const newIndex = Math.min(currentIndex + 1, urgencyLevels.length - 1);
        urgency = urgencyLevels[newIndex];
      }

      // Motivation boost recommendations
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
      toast.error(`This activity is not recommended with your current energy level (${Math.round(contextualData.playerState.hpPercentage)}% HP)`);
      return;
    }

    // Enhanced navigation and dialog handling
    if (action.navigateTo) {
      console.log(`Navigating to ${action.navigateTo} for ${action.title}`);
      navigate(action.navigateTo);
      return;
    }

    if (action.openDialog && action.id === 'social') {
      console.log('Opening social play dialog with contextual data:', contextualData);
      setSocialPlayDialogOpen(true);
      return;
    }

    try {
      setLoadingAction(action.id);
      console.log('Logging enhanced contextual quick action:', { 
        action: action.title, 
        context: contextualData.playerState,
        timing: contextualData.timeOfDay 
      });
      
      toast.success(`${action.title} completed! Context: ${action.description}`);
      await refreshData();
      
    } catch (error) {
      console.error('Error logging contextual quick action:', error);
      toast.error('Failed to log activity. Please try again.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRecommendationClick = (actionId: string) => {
    const action = quickActions.find(a => a.id === actionId);
    if (action) {
      console.log('Recommendation clicked:', { actionId, action: action.title, context: contextualData });
      handleQuickAction(action);
    }
  };

  const handleOpenRecoveryCenter = () => {
    console.log('Opening Recovery Center with contextual data:', {
      hpPercentage: contextualData.playerState.hpPercentage,
      energyLevel: contextualData.playerState.energyLevel,
      needsRecovery: contextualData.playerState.needsRecovery
    });
    setRecoveryCenterOpen(true);
  };

  if (recoveryCenterOpen) {
    return (
      <RecoveryCenter onBack={() => setRecoveryCenterOpen(false)} />
    );
  }

  // Enhanced action sorting with contextual intelligence
  const sortedActions = [...quickActions].sort((a, b) => {
    // First priority: availability
    if (a.availability !== b.availability) return a.availability ? -1 : 1;
    
    // Second priority: recommended actions
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    
    // Third priority: urgency level
    if (a.urgency !== b.urgency) {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    }
    
    // Fourth priority: contextual perfect timing
    const aPerfectTiming = a.contextualInfo?.perfectTiming || false;
    const bPerfectTiming = b.contextualInfo?.perfectTiming || false;
    if (aPerfectTiming !== bPerfectTiming) return aPerfectTiming ? -1 : 1;
    
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Enhanced Smart Recommendations with better visual hierarchy */}
      <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-purple-200/50 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-indigo-500/5"></div>
        <CardHeader className="relative pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Smart Recommendations
              </h2>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Personalized suggestions based on your current state
              </p>
            </div>
            <div className="flex gap-2">
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200 shadow-sm"
              >
                <Activity className="h-3 w-3 mr-1" />
                {contextualData.playerState.energyLevel} energy
              </Badge>
              <Badge 
                variant="outline" 
                className="border-blue-200 text-blue-700 bg-blue-50 shadow-sm"
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                {contextualData.recommendations.motivation} motivation
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <SmartRecommendations 
            hpData={hpData}
            xpData={xpData}
            contextualData={contextualData}
            onRecommendationClick={handleRecommendationClick}
          />
        </CardContent>
      </Card>

      {/* Enhanced Activity Intelligence Card */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border-slate-200 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-gray-800">Activity Intelligence</span>
                <p className="text-xs text-gray-600 mt-0.5">
                  AI-powered insights about your tennis journey
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm border">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <div>
                  <div className="text-xs text-gray-500">This Week</div>
                  <div className="font-bold text-gray-800">{contextualData.activity.recentActivityCount}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 shadow-sm border">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-500">Energy</div>
                  <div className="font-bold text-gray-800 capitalize">{contextualData.playerState.energyLevel}</div>
                </div>
              </div>
              {contextualData.activity.hoursSinceLastActivity > 24 && (
                <div className="flex items-center gap-2 bg-orange-50 rounded-lg px-3 py-1.5 shadow-sm border border-orange-200">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-xs text-orange-600">Last Activity</div>
                    <div className="font-bold text-orange-800">{Math.round(contextualData.activity.hoursSinceLastActivity)}h ago</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions with superior visual hierarchy */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
              <Plus className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-800">Smart Quick Actions</h2>
              <p className="text-sm text-gray-600 font-normal mt-1">
                Contextually prioritized activities tailored for you
              </p>
            </div>
            <div className="flex gap-2">
              <Badge 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI Prioritized
              </Badge>
              <Badge 
                variant="secondary" 
                className="bg-purple-100 text-purple-700 border-purple-200 shadow-sm"
              >
                <Target className="h-3 w-3 mr-1" />
                {sortedActions.filter(a => a.recommended).length} recommended
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
            
            {/* Enhanced Recovery Center Action */}
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
