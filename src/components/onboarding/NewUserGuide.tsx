import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Play, 
  Target, 
  HelpCircle,
  X,
  Gamepad2
} from 'lucide-react';
import { AppTour } from './AppTour';
import { TutorialSystem } from './TutorialSystem';
import { ContextualHelp } from './ContextualHelp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NewUserGuideProps {
  userRole?: 'player' | 'coach';
  userLevel?: number;
  currentRoute?: string;
  onClose?: () => void;
}

interface UserProgress {
  hasCompletedTour: boolean;
  completedTutorials: string[];
  dismissedTips: string[];
  lastActiveDate: string;
}

export const NewUserGuide: React.FC<NewUserGuideProps> = ({
  userRole: propUserRole,
  userLevel = 1,
  currentRoute = '/',
  onClose
}) => {
  const [showTour, setShowTour] = useState(false);
  const [showTutorials, setShowTutorials] = useState(false);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [userRole, setUserRole] = useState<'player' | 'coach' | null>(propUserRole || null);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    hasCompletedTour: false,
    completedTutorials: [],
    dismissedTips: [],
    lastActiveDate: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user progress on mount
  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('preferences, role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        setIsLoading(false);
        return;
      }

      if (profile) {
        // Set user role if not provided as prop
        if (!propUserRole && profile.role) {
          setUserRole(profile.role);
        }

        // Load preferences - if null or empty, user hasn't completed tour
        if (profile.preferences) {
          const prefs = profile.preferences as any;
          setUserProgress({
            hasCompletedTour: prefs?.app_tour_completed === true,
            completedTutorials: prefs?.completed_tutorials || [],
            dismissedTips: prefs?.dismissed_tips || [],
            lastActiveDate: prefs?.last_active_date || new Date().toISOString()
          });
        } else {
          // No preferences means new user - initialize defaults
          setUserProgress({
            hasCompletedTour: false,
            completedTutorials: [],
            dismissedTips: [],
            lastActiveDate: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProgress = async (updates: Partial<UserProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newProgress = { ...userProgress, ...updates };
      
      // Update local state first for immediate UI feedback
      setUserProgress(newProgress);

      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            app_tour_completed: newProgress.hasCompletedTour,
            completed_tutorials: newProgress.completedTutorials,
            dismissed_tips: newProgress.dismissedTips,
            last_active_date: new Date().toISOString()
          }
        })
        .eq('id', user.id);

      if (error) {
        console.error('Database update error:', error);
        // Revert local state if database update failed
        setUserProgress(userProgress);
        toast.error('Failed to save progress. Please try again.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating user progress:', error);
      // Revert local state if there was an error
      setUserProgress(userProgress);
      toast.error('Failed to save progress');
      return false;
    }
  };

  const handleTourComplete = async () => {
    const success = await updateUserProgress({ hasCompletedTour: true });
    if (success) {
      setShowTour(false);
      toast.success('Tour completed! You\'re ready to explore Rako.');
    }
  };

  const handleTourSkip = async () => {
    const success = await updateUserProgress({ hasCompletedTour: true });
    if (success) {
      setShowTour(false);
      toast.info('Tour skipped. You can access tutorials anytime from the help menu.');
    }
  };

  const handleTutorialComplete = async (tutorialId: string) => {
    const updatedTutorials = [...userProgress.completedTutorials, tutorialId];
    const success = await updateUserProgress({ completedTutorials: updatedTutorials });
    if (success) {
      toast.success('Tutorial completed! Well done.');
    }
  };

  // Auto-start tour for new users - only if they haven't completed it
  useEffect(() => {
    if (!isLoading && !userProgress.hasCompletedTour && userRole) {
      // Only auto-start if we're on the dashboard (main page)
      const isDashboard = currentRoute === '/dashboard' || currentRoute === '/coach-dashboard';
      
      if (isDashboard) {
        const timer = setTimeout(() => {
          setShowTour(true);
        }, 2000); // Show tour after 2 seconds
        
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading, userProgress.hasCompletedTour, userRole, currentRoute]);

  if (isLoading || !userRole) return null;

  return (
    <div className="pointer-events-none">
      {/* Floating Help Button */}
      {userProgress.hasCompletedTour && (
        <div className="fixed bottom-6 left-6 z-40 pointer-events-auto">
          <Button
            onClick={() => setShowQuickHelp(!showQuickHelp)}
            className="w-12 h-12 rounded-full bg-tennis-green-primary hover:bg-tennis-green-dark shadow-lg"
            size="sm"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {showQuickHelp && (
            <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-xl border border-tennis-green-light p-4 w-64">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-tennis-green-dark flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Quick Help
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuickHelp(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTour(true);
                    setShowQuickHelp(false);
                  }}
                  className="w-full justify-start"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Retake App Tour
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowTutorials(true);
                    setShowQuickHelp(false);
                  }}
                  className="w-full justify-start"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Interactive Tutorials
                </Button>

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    Progress: {userProgress.completedTutorials.length} tutorials completed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Welcome Banner for New Users */}
      {!userProgress.hasCompletedTour && !showTour && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4 pointer-events-auto">
          <div className="bg-white border-2 border-tennis-yellow rounded-xl shadow-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-tennis-yellow/20 rounded-full flex items-center justify-center">
                  <Target className="h-4 w-4 text-tennis-yellow" />
                </div>
                <h3 className="font-orbitron font-bold text-tennis-green-dark">
                  Welcome to RAKO!
                </h3>
              </div>
              <Badge className="bg-tennis-yellow text-tennis-green-dark text-xs">
                NEW
              </Badge>
            </div>
            
            <p className="text-sm text-tennis-green-medium mb-3">
              Ready to start your tennis gaming journey? Take a quick tour to learn the basics.
            </p>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => setShowTour(true)}
                className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark"
              >
                Start Tour
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTourSkip}
                className="px-3"
              >
                Skip
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* App Tour - Full Screen Overlay */}
      {showTour && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          <AppTour
            onComplete={handleTourComplete}
            onSkip={handleTourSkip}
            userRole={userRole}
          />
        </div>
      )}

      {/* Tutorial System */}
      {showTutorials && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          <TutorialSystem
            isOpen={showTutorials}
            onClose={() => setShowTutorials(false)}
            userRole={userRole}
            userLevel={userLevel}
            completedTutorials={userProgress.completedTutorials}
            onTutorialComplete={handleTutorialComplete}
          />
        </div>
      )}

      {/* Contextual Help */}
      <ContextualHelp
        currentRoute={currentRoute}
        userRole={userRole}
        userLevel={userLevel}
        hasCompletedTour={userProgress.hasCompletedTour}
      />
    </div>
  );
};