
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  Users, 
  BookOpen, 
  Heart, 
  Plus,
  Sparkles
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { toast } from 'sonner';
import { SmartRecommendations } from './SmartRecommendations';
import { ActionButton } from './ActionButton';
import { CreateSocialPlayDialog } from '@/components/social-play/CreateSocialPlayDialog';

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
    },
    {
      id: 'rest',
      title: 'Rest & Recovery',
      description: 'Restore your energy with proper rest and recovery',
      icon: Heart,
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      rewards: { hp: 0, xp: 10, tokens: 10 },
      recommended: hpPercentage < 40,
      estimatedDuration: 30,
      difficulty: 'low' as const,
      activityData: {
        activity_type: 'rest',
        activity_category: 'recovery',
        title: 'Rest & Recovery',
        description: 'Restore your energy with proper rest and recovery',
        duration_minutes: 30,
        intensity_level: 'low'
      }
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

    // Otherwise, log the activity as before
    try {
      setLoadingAction(action.id);
      console.log('Logging unified quick action:', action.activityData);
      
      const result = await logActivity(action.activityData);
      
      console.log('Quick action logged successfully:', result);
      
      // Show success message with actual results from database
      if (result) {
        const rewards = [];
        if (result.hp_change !== 0) {
          rewards.push(`${result.hp_change > 0 ? '+' : ''}${result.hp_change} HP`);
        }
        if (result.xp_earned > 0) {
          rewards.push(`+${result.xp_earned} XP`);
        }
        
        toast.success(`${action.title} completed!`, {
          description: rewards.join(' • ')
        });
      } else {
        toast.success(`${action.title} completed!`);
      }
      
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
