
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  Users, 
  BookOpen, 
  Sparkles,
  Plus
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';
import { SmartRecommendations } from './SmartRecommendations';
import { ActionButton } from './ActionButton';
import { CreateSocialPlayDialog } from '@/components/social-play/CreateSocialPlayDialog';
import { RecoveryQuickAction } from '@/components/recovery/RecoveryQuickAction';

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
  const { logActivity, refreshData } = useActivityLogs();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [socialPlayDialogOpen, setSocialPlayDialogOpen] = useState(false);
  
  const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
  
  const quickActions = [
    {
      id: 'match',
      title: 'Tennis Match',
      description: 'Record a competitive tennis match with detailed scoring',
      icon: Zap,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      rewards: { hp: -5, xp: 50, tokens: 25 },
      recommended: hpPercentage > 40,
      estimatedDuration: 90,
      difficulty: 'high' as const,
      navigateTo: '/start-match'
    },
    {
      id: 'training',
      title: 'Training Session',
      description: 'Practice drills, technique work, and skill development',
      icon: BookOpen,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      rewards: { hp: -5, xp: 30, tokens: 15 },
      recommended: hpPercentage > 30,
      estimatedDuration: 60,
      difficulty: 'medium' as const,
      navigateTo: '/start-training'
    },
    {
      id: 'social',
      title: 'Social Play',
      description: 'Create a session and invite friends to play together',
      icon: Users,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      rewards: { hp: 5, xp: 15, tokens: 12 },
      recommended: hpPercentage > 20,
      estimatedDuration: 45,
      difficulty: 'low' as const,
      openDialog: true
    }
  ];

  const handleQuickAction = async (action: typeof quickActions[0]) => {
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

    // For any other actions that might still use the old rest system
    try {
      setLoadingAction(action.id);
      console.log('Logging unified quick action:', action);
      
      // This would be for any remaining direct activity logging
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

  return (
    <div className="space-y-6">
      {/* Smart Recommendations */}
      <Card className="border-2 border-gradient-to-r from-purple-200 to-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Smart Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SmartRecommendations 
            hpData={hpData}
            xpData={xpData}
            onRecommendationClick={handleRecommendationClick}
          />
        </CardContent>
      </Card>

      {/* Enhanced Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <ActionButton
                key={action.id}
                action={action}
                onClick={() => handleQuickAction(action)}
                disabled={loadingAction !== null}
                loading={loadingAction === action.id}
              />
            ))}
            
            {/* Recovery Center Action */}
            <div className="lg:col-span-2">
              <RecoveryQuickAction className="w-full h-auto p-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="h-5 w-5 text-purple-200" />
                      <span className="font-semibold text-white">Recovery Center</span>
                    </div>
                    <p className="text-sm text-purple-100">
                      Restore your energy with meditation and stretching sessions
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-purple-200">Recommended</div>
                    <div className="text-xs text-purple-200">5-15 min</div>
                  </div>
                </div>
              </RecoveryQuickAction>
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
