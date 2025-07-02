
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Dumbbell, 
  Users, 
  Heart, 
  Target,
  Calendar,
  Star,
  Plus,
  Activity
} from 'lucide-react';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';
import { useRealTimeSessions } from '@/hooks/useRealTimeSessions';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UnifiedActivityActionsProps {
  onActivityCompleted?: () => void;
  className?: string;
}

const unifiedActivities = [
  {
    id: 'match',
    title: 'Tennis Match',
    description: 'Record a competitive tennis match',
    icon: Trophy,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    rewards: {
      hp: { initial: -15, restoration: 10, net: -5 },
      xp: 50,
      tokens: 25
    },
    estimatedDuration: 90,
    intensity: 'high',
    activityData: {
      activity_type: 'match',
      activity_category: 'on_court',
      duration_minutes: 90,
      intensity_level: 'high',
      is_competitive: true
    }
  },
  {
    id: 'training',
    title: 'Training Session',
    description: 'Practice drills and technique work',
    icon: Dumbbell,
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    rewards: {
      hp: { initial: -8, restoration: 5, net: -3 },
      xp: 30,
      tokens: 15
    },
    estimatedDuration: 60,
    intensity: 'medium',
    activityData: {
      activity_type: 'training',
      activity_category: 'on_court',
      duration_minutes: 60,
      intensity_level: 'medium'
    }
  },
  {
    id: 'lesson',
    title: 'Tennis Lesson',
    description: 'Coaching session with instructor',
    icon: Users,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    rewards: {
      hp: { initial: -5, restoration: 8, net: 3 },
      xp: 40,
      tokens: 20
    },
    estimatedDuration: 60,
    intensity: 'medium',
    activityData: {
      activity_type: 'lesson',
      activity_category: 'educational',
      duration_minutes: 60,
      intensity_level: 'medium'
    }
  },
  {
    id: 'social',
    title: 'Social Play',
    description: 'Casual games with friends',
    icon: Heart,
    color: 'bg-gradient-to-r from-pink-500 to-pink-600',
    rewards: {
      hp: { initial: -2, restoration: 8, net: 6 },
      xp: 20,
      tokens: 10
    },
    estimatedDuration: 45,
    intensity: 'low',
    activityData: {
      activity_type: 'social',
      activity_category: 'social',
      duration_minutes: 45,
      intensity_level: 'low'
    }
  },
  {
    id: 'practice',
    title: 'Solo Practice',
    description: 'Individual skill development',
    icon: Target,
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    rewards: {
      hp: { initial: -6, restoration: 4, net: -2 },
      xp: 25,
      tokens: 12
    },
    estimatedDuration: 45,
    intensity: 'medium',
    activityData: {
      activity_type: 'practice',
      activity_category: 'on_court',
      duration_minutes: 45,
      intensity_level: 'medium'
    }
  },
  {
    id: 'daily_login',
    title: 'Daily Check-in',
    description: 'Daily login bonus',
    icon: Calendar,
    color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
    rewards: {
      hp: { initial: 0, restoration: 5, net: 5 },
      xp: 10,
      tokens: 10
    },
    estimatedDuration: 0,
    intensity: 'none',
    activityData: {
      activity_type: 'daily_login',
      activity_category: 'social',
      duration_minutes: 0,
      intensity_level: 'low'
    }
  },
  {
    id: 'achievement',
    title: 'Achievement Unlocked',
    description: 'Celebrate your accomplishments',
    icon: Star,
    color: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    rewards: {
      hp: { initial: 0, restoration: 10, net: 10 },
      xp: 100,
      tokens: 50
    },
    estimatedDuration: 0,
    intensity: 'none',
    activityData: {
      activity_type: 'achievement',
      activity_category: 'social',
      duration_minutes: 0,
      intensity_level: 'low'
    }
  }
];

export function UnifiedActivityActions({ onActivityCompleted, className }: UnifiedActivityActionsProps) {
  const { logActivity, refreshData } = useActivityLogs();
  const { createTrainingSession, startTrainingSession, updateSessionData } = useTrainingSession();
  const { user } = useAuth();
  
  // Only call useRealTimeSessions when user is available to prevent crashes
  const realTimeSessionsHook = user?.id ? useRealTimeSessions('my-sessions', user.id) : null;
  const completeSession = realTimeSessionsHook?.completeSession;
  const navigate = useNavigate();
  const [loadingActivity, setLoadingActivity] = useState<string | null>(null);

  const handleActivityLog = async (activity: typeof unifiedActivities[0]) => {
    try {
      setLoadingActivity(activity.id);
      
      // Handle training and lesson sessions through unified session system
      if (activity.id === 'training' || activity.id === 'lesson') {
        console.log('Creating unified training/lesson session:', activity);
        
        // Create session in unified sessions table
        const sessionId = await createTrainingSession({
          sessionType: activity.id,
          intensity: activity.intensity,
          estimatedDuration: activity.estimatedDuration,
          startTime: new Date().toISOString()
        });
        
        // Update local session data with session ID
        updateSessionData({
          sessionId,
          sessionType: activity.id,
          intensity: activity.intensity,
          estimatedDuration: activity.estimatedDuration,
          startTime: new Date().toISOString()
        });
        
        // Start the session
        await startTrainingSession(sessionId);
        
        toast.success(`${activity.title} started!`, {
          description: 'Session is now active in your Sessions tab'
        });
        
        // Navigate to training session (you can create a training UI or redirect to sessions)
        navigate('/sessions');
        return;
      }
      
      // Handle wellbeing sessions through unified session system  
      if (activity.id === 'wellbeing') {
        console.log('Creating unified wellbeing session:', activity);
        
        // Use the meditation RPC function for immediate completion
        const { data, error } = await supabase.rpc('complete_meditation_session', {
          meditation_type: 'meditation',
          duration_minutes: activity.estimatedDuration,
          notes: `Wellbeing session: ${activity.description}`
        });
        
        if (error) throw error;
        
        toast.success(`${activity.title} completed!`, {
          description: `+${(data as any).hp_restored} HP • +${(data as any).xp_gained} XP • +${(data as any).tokens_earned} Tokens`
        });
        
        await refreshData();
        onActivityCompleted?.();
        return;
      }
      
      // Handle other activities (match, social, practice, daily_login, achievement) with instant logging
      console.log('Logging non-session activity:', {
        ...activity.activityData,
        title: activity.title,
        description: activity.description
      });
      
      const result = await logActivity({
        ...activity.activityData,
        title: activity.title,
        description: activity.description
      });
      
      console.log('Activity logged successfully:', result);
      
      // Show comprehensive success message
      const rewards = [];
      if (activity.rewards.hp.net !== 0) {
        rewards.push(`${activity.rewards.hp.net > 0 ? '+' : ''}${activity.rewards.hp.net} HP`);
      }
      if (activity.rewards.xp > 0) {
        rewards.push(`+${activity.rewards.xp} XP`);
      }
      if (activity.rewards.tokens > 0) {
        rewards.push(`+${activity.rewards.tokens} Tokens`);
      }
      
      toast.success(`${activity.title} completed!`, {
        description: rewards.join(' • ')
      });
      
      await refreshData();
      onActivityCompleted?.();
      
    } catch (error) {
      console.error('Error handling unified activity:', error);
      toast.error('Failed to process activity. Please try again.');
    } finally {
      setLoadingActivity(null);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Log Tennis Activities
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Each activity automatically affects your HP, XP, and tokens
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {unifiedActivities.map((activity) => {
            const Icon = activity.icon;
            const isLoading = loadingActivity === activity.id;
            
            return (
              <Button
                key={activity.id}
                onClick={() => handleActivityLog(activity)}
                disabled={loadingActivity !== null}
                className={`h-auto p-4 flex flex-col items-start gap-3 text-left text-white ${activity.color}`}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{activity.title}</span>
                  {isLoading && (
                    <div className="ml-auto h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                </div>
                
                <p className="text-sm opacity-90 text-left">
                  {activity.description}
                </p>
                
                <div className="flex flex-wrap gap-1 w-full">
                  {activity.rewards.hp.net !== 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      {activity.rewards.hp.net > 0 ? '+' : ''}{activity.rewards.hp.net} HP
                    </Badge>
                  )}
                  {activity.rewards.xp > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      +{activity.rewards.xp} XP
                    </Badge>
                  )}
                  {activity.rewards.tokens > 0 && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      +{activity.rewards.tokens} 🪙
                    </Badge>
                  )}
                </div>
                
                {activity.estimatedDuration > 0 && (
                  <div className="text-xs opacity-75">
                    ~{activity.estimatedDuration} min • {activity.intensity} intensity
                  </div>
                )}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Tip:</strong> Activities now realistically affect multiple systems - more intense activities cost HP initially but may restore some afterwards, while all activities provide XP and token rewards!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
