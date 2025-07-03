import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  X, 
  ChevronRight, 
  Lightbulb,
  Target,
  Zap,
  Gift,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ContextualTip {
  id: string;
  title: string;
  message: string;
  icon: React.ComponentType<any>;
  priority: 'low' | 'medium' | 'high';
  category: 'gameplay' | 'navigation' | 'social' | 'achievements';
  trigger: string;
  showOnce?: boolean;
}

interface ContextualHelpProps {
  currentRoute: string;
  userRole: 'player' | 'coach';
  userLevel?: number;
  hasCompletedTour?: boolean;
  className?: string;
}

const CONTEXTUAL_TIPS: ContextualTip[] = [
  {
    id: 'first_dashboard_visit',
    title: 'Welcome to Your Dashboard!',
    message: 'This is your command center. Check your HP, XP, and tokens regularly. Use quick actions to log activities and earn rewards.',
    icon: Target,
    priority: 'high',
    category: 'navigation',
    trigger: 'dashboard_first_visit',
    showOnce: true
  },
  {
    id: 'low_hp_warning',
    title: 'Low Health Points',
    message: 'Your HP is getting low! Visit the Wellbeing Center to restore HP through meditation, rest, or nutrition activities.',
    icon: Zap,
    priority: 'high',
    category: 'gameplay',
    trigger: 'low_hp'
  },
  {
    id: 'academy_introduction',
    title: 'Earn Tokens in Academy',
    message: 'Complete daily quizzes in the Academy to earn tokens and improve your tennis knowledge. Streak bonuses multiply your rewards!',
    icon: Lightbulb,
    priority: 'medium',
    category: 'gameplay',
    trigger: 'academy_first_visit',
    showOnce: true
  },
  {
    id: 'achievement_available',
    title: 'Achievement Ready!',
    message: 'You have achievements ready to claim. Visit your profile to collect your rewards and see your progress.',
    icon: Gift,
    priority: 'medium',
    category: 'achievements',
    trigger: 'achievement_available'
  },
  {
    id: 'level_up_celebration',
    title: 'Level Up! 🎉',
    message: 'Congratulations on leveling up! Check the store for new avatar items that might have unlocked.',
    icon: Star,
    priority: 'high',
    category: 'achievements',
    trigger: 'level_up'
  }
];

const COACH_TIPS: ContextualTip[] = [
  {
    id: 'coach_dashboard_intro',
    title: 'Coach Dashboard Overview',
    message: 'Track your CXP, CRP, and client earnings. Use quick actions to manage your coaching business effectively.',
    icon: Target,
    priority: 'high',
    category: 'navigation',
    trigger: 'coach_dashboard_first_visit',
    showOnce: true
  },
  {
    id: 'build_reputation',
    title: 'Build Your Reputation',
    message: 'Focus on earning CRP (Coach Reputation Points) by providing excellent service. Higher CRP means better visibility and more clients.',
    icon: Star,
    priority: 'medium',
    category: 'gameplay',
    trigger: 'low_crp'
  }
];

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  currentRoute,
  userRole,
  userLevel = 1,
  hasCompletedTour = false,
  className = ''
}) => {
  const [currentTip, setCurrentTip] = useState<ContextualTip | null>(null);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const allTips = userRole === 'coach' ? [...CONTEXTUAL_TIPS, ...COACH_TIPS] : CONTEXTUAL_TIPS;

  // Load dismissed tips from local storage
  useEffect(() => {
    const saved = localStorage.getItem('rako_dismissed_tips');
    if (saved) {
      setDismissedTips(JSON.parse(saved));
    }
  }, []);

  // Check for contextual tips based on current state
  useEffect(() => {
    const checkForTips = () => {
      // Don't show tips during tour
      if (!hasCompletedTour) return;

      // Route-based tips
      const routeTriggers: Record<string, string> = {
        '/': userRole === 'coach' ? 'coach_dashboard_first_visit' : 'dashboard_first_visit',
        '/academy': 'academy_first_visit'
      };

      const trigger = routeTriggers[currentRoute];
      if (trigger) {
        const tip = allTips.find(t => 
          t.trigger === trigger && 
          !dismissedTips.includes(t.id)
        );
        
        if (tip) {
          setCurrentTip(tip);
          setIsVisible(true);
          return;
        }
      }

      // Level-based tips
      if (userLevel >= 5 && !dismissedTips.includes('level_up_celebration')) {
        const levelTip = allTips.find(t => t.trigger === 'level_up');
        if (levelTip) {
          setCurrentTip(levelTip);
          setIsVisible(true);
          return;
        }
      }
    };

    // Delay to avoid showing tips immediately on route change
    const timer = setTimeout(checkForTips, 1500);
    return () => clearTimeout(timer);
  }, [currentRoute, userLevel, hasCompletedTour, dismissedTips, allTips, userRole]);

  const dismissTip = async (tipId: string, permanent: boolean = false) => {
    setIsVisible(false);
    setCurrentTip(null);

    if (permanent) {
      const newDismissed = [...dismissedTips, tipId];
      setDismissedTips(newDismissed);
      localStorage.setItem('rako_dismissed_tips', JSON.stringify(newDismissed));

      // Also save to database for persistence across devices
      try {
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          await supabase
            .from('profiles')
            .update({ 
              preferences: { 
                dismissed_tips: newDismissed 
              }
            })
            .eq('id', user.data.user.id);
        }
      } catch (error) {
        console.error('Error saving dismissed tips:', error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-tennis-yellow bg-tennis-yellow/10';
      case 'medium': return 'border-tennis-green-primary bg-tennis-green-bg';
      case 'low': return 'border-tennis-green-light bg-tennis-green-light/10';
      default: return 'border-tennis-green-light bg-tennis-green-light/10';
    }
  };

  if (!isVisible || !currentTip) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}>
      <Card className={`shadow-xl border-2 ${getPriorityColor(currentTip.priority)} animate-slide-up`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentTip.priority === 'high' ? 'bg-tennis-yellow/20' : 'bg-tennis-green-primary/20'
              }`}>
                <currentTip.icon className={`h-5 w-5 ${
                  currentTip.priority === 'high' ? 'text-tennis-yellow' : 'text-tennis-green-primary'
                }`} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-tennis-green-dark text-sm">
                  {currentTip.title}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissTip(currentTip.id)}
                  className="h-6 w-6 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-tennis-green-medium text-sm mb-3">
                {currentTip.message}
              </p>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {currentTip.category}
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissTip(currentTip.id, true)}
                    className="text-xs h-7 px-2"
                  >
                    Don't show again
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => dismissTip(currentTip.id)}
                    className="text-xs h-7 px-3 bg-tennis-green-primary hover:bg-tennis-green-dark"
                  >
                    Got it
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper hook for triggering contextual help
export const useContextualHelp = () => {
  const triggerHelp = (trigger: string, data?: any) => {
    // Dispatch custom event that ContextualHelp can listen to
    window.dispatchEvent(new CustomEvent('rako_help_trigger', {
      detail: { trigger, data }
    }));
  };

  return { triggerHelp };
};