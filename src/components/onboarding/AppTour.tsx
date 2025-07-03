import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Zap, 
  Users, 
  Calendar, 
  Search, 
  MessageSquare, 
  Store,
  Target,
  BookOpen,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WelcomeAnimation } from './WelcomeAnimation';

interface AppTourProps {
  onComplete: () => void;
  onSkip: () => void;
  userRole: 'player' | 'coach';
}

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  actionText: string;
}

const PLAYER_TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Your Command Center',
    description: 'This is your main dashboard where you can see all your stats, progress, and quick actions.',
    icon: Trophy,
    features: [
      'View your HP, XP, and tokens',
      'Quick training and match actions',
      'Achievement progress tracking',
      'Live activity feed'
    ],
    actionText: 'Next'
  },
  {
    id: 'sessions',
    title: 'Training & Match Sessions',
    description: 'Track your tennis activities and monitor your performance progress.',
    icon: Target,
    features: [
      'Start training sessions',
      'Log match results',
      'Track session history',
      'Set goals and targets'
    ],
    actionText: 'Next'
  },
  {
    id: 'pulse',
    title: 'Competitive Rankings',
    description: 'See how you stack up against other players and coaches in the community.',
    icon: Zap,
    features: [
      'Coach and player leaderboards',
      'Compare your rankings',
      'Track competitive progress',
      'See top performers'
    ],
    actionText: 'Next'
  },
  {
    id: 'academy',
    title: 'Rako Academy',
    description: 'Level up your tennis knowledge with interactive quizzes and challenges.',
    icon: BookOpen,
    features: [
      'Daily tennis trivia quizzes',
      'Earn tokens for correct answers',
      'Unlock achievements',
      'Track learning streaks'
    ],
    actionText: 'Next'
  },
  {
    id: 'messages',
    title: 'Player Communication',
    description: 'Stay connected with your tennis community and coaching network.',
    icon: MessageSquare,
    features: [
      'Connect with other players',
      'Chat with coaches and teammates',
      'Share achievements and progress',
      'Note: We are currently building this out'
    ],
    actionText: 'Next'
  },
  {
    id: 'feed',
    title: 'Community Activity',
    description: 'Stay updated with the latest happenings in your tennis community.',
    icon: Users,
    features: [
      'See community activity',
      'Share your achievements',
      'Follow other players',
      'Stay connected with tennis community'
    ],
    actionText: 'Next'
  },
  {
    id: 'store',
    title: 'Rako Store',
    description: 'Browse and purchase tennis gear, equipment, and performance boosters.',
    icon: Store,
    features: [
      'Browse exclusive Diadem and tennis products',
      'Second hand gear items',
      'Performance boosters',
      'Premium subscriptions'
    ],
    actionText: 'Next'
  },
  {
    id: 'profile',
    title: 'Account Management',
    description: 'Manage your account settings and access support resources.',
    icon: Users,
    features: [
      'Manage account settings',
      'Update personal information',
      'Access help and support resources',
      'View your tennis journey'
    ],
    actionText: 'Complete Tour'
  }
];

const COACH_TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard',
    title: 'Coach Command Center',
    description: 'Manage your coaching business with CXP, CRP tracking, and client tools.',
    icon: Trophy,
    features: [
      'View CXP and CRP stats',
      'Client management tools',
      'Revenue tracking',
      'Performance analytics'
    ],
    actionText: 'Next'
  },
  {
    id: 'sessions',
    title: 'Session Management',
    description: 'Track and manage your coaching sessions with detailed analytics.',
    icon: Target,
    features: [
      'Monitor coaching sessions',
      'Track player progress',
      'Session analytics and insights',
      'Performance metrics'
    ],
    actionText: 'Next'
  },
  {
    id: 'pulse',
    title: 'Coach Rankings',
    description: 'See how you rank among other coaches in the community.',
    icon: Zap,
    features: [
      'Coach and player leaderboards',
      'Compare your CRP and CXP',
      'Track coaching performance',
      'Build your reputation'
    ],
    actionText: 'Next'
  },
  {
    id: 'academy',
    title: 'Tennis Knowledge Hub',
    description: 'Access teaching resources and tennis knowledge base.',
    icon: BookOpen,
    features: [
      'Teaching methodologies',
      'Tennis technique guides',
      'Coaching best practices',
      'Player development resources'
    ],
    actionText: 'Next'
  },
  {
    id: 'messages',
    title: 'Client Communication',
    description: 'Stay connected with your players and manage coaching conversations.',
    icon: MessageSquare,
    features: [
      'Chat with your players',
      'Send coaching feedback',
      'Schedule reminders',
      'Note: We are currently building this out'
    ],
    actionText: 'Next'
  },
  {
    id: 'feed',
    title: 'Community Updates',
    description: 'Share your coaching expertise and connect with the tennis community.',
    icon: Users,
    features: [
      'Share coaching insights',
      'Follow player progress',
      'Connect with other coaches',
      'Stay updated with community'
    ],
    actionText: 'Next'
  },
  {
    id: 'store',
    title: 'Coach Resources',
    description: 'Access coaching tools, equipment, and professional development resources.',
    icon: Store,
    features: [
      'Coaching equipment and tools',
      'Professional development courses',
      'Exclusive coach products',
      'Business growth resources'
    ],
    actionText: 'Next'
  },
  {
    id: 'profile',
    title: 'Coach Profile',
    description: 'Manage your coaching profile and professional settings.',
    icon: Users,
    features: [
      'Manage coaching credentials',
      'Set rates and availability',
      'Access coaching analytics',
      'Professional profile management'
    ],
    actionText: 'Complete Tour'
  }
];

export const AppTour: React.FC<AppTourProps> = ({ onComplete, onSkip, userRole }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);

  const tourSteps = userRole === 'player' ? PLAYER_TOUR_STEPS : COACH_TOUR_STEPS;
  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onSkip();
      } else if (event.key === 'ArrowLeft' && currentStep > 0) {
        handlePreviousStep();
      } else if (event.key === 'ArrowRight') {
        handleNextStep();
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleNextStep();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, tourSteps.length]);

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCompletedSteps(prev => [...prev, currentTourStep.id]);
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteTour();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteTour = async () => {
    setIsCompleting(true);
    try {
      // Mark tour as completed in user preferences
      const { error } = await supabase
        .from('profiles')
        .update({ 
          preferences: { 
            app_tour_completed: true,
            tour_completed_at: new Date().toISOString()
          }
        })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      // Show welcome animation instead of completing immediately
      setShowWelcomeAnimation(true);
    } catch (error) {
      console.error('Error completing tour:', error);
      toast.error('Failed to save tour progress, but you can continue using the app.');
      onComplete();
    } finally {
      setIsCompleting(false);
    }
  };

  const handleAnimationComplete = () => {
    setShowWelcomeAnimation(false);
    onComplete();
  };


  // Show welcome animation if tour completed
  if (showWelcomeAnimation) {
    return <WelcomeAnimation onComplete={handleAnimationComplete} />;
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4 flex items-center justify-center" role="dialog" aria-labelledby="tour-title" aria-modal="true">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-tennis-green-primary rounded-full mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h1 id="tour-title" className="text-3xl font-orbitron font-bold text-tennis-green-dark mb-2">
            Welcome to RAKO!
          </h1>
          <p className="text-tennis-green-medium">
            Let's take a quick tour of your new tennis gaming platform
          </p>
          <p className="text-xs text-tennis-green-medium/70 mt-1">
            💡 Use arrow keys to navigate, Enter/Space to proceed, or Esc to skip
          </p>
          
          {/* Progress */}
          <div className="mt-4 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-tennis-green-medium mb-2">
              <span>Step {currentStep + 1} of {tourSteps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Main Tour Card */}
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-tennis-green-light">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-tennis-green-bg rounded-full flex items-center justify-center">
              <currentTourStep.icon className="h-8 w-8 text-tennis-green-primary" />
            </div>
            <CardTitle className="text-2xl text-tennis-green-dark">
              {currentTourStep.title}
            </CardTitle>
            <p className="text-tennis-green-medium mt-2">
              {currentTourStep.description}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Features List */}
            <div className="bg-tennis-green-bg/30 rounded-lg p-4">
              <h3 className="font-semibold text-tennis-green-dark mb-3">
                🎾 Key Features:
              </h3>
              <div className="grid gap-2">
                {currentTourStep.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-tennis-green-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-tennis-green-dark">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaming Tip */}
            <div className="bg-tennis-yellow/10 border border-tennis-yellow/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-tennis-yellow" />
                <span className="font-semibold text-tennis-green-dark">Pro Tip:</span>
              </div>
              <p className="text-tennis-green-medium text-sm">
                {userRole === 'player' ? 
                  'Complete daily activities to earn tokens and XP. The more you engage, the more rewards you unlock!' :
                  'Focus on building your CRP (Coach Reputation Points) by providing excellent service to your players.'
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handlePreviousStep}
                  className="flex-1"
                >
                  ← Previous
                </Button>
              )}
              
              <Button 
                onClick={handleNextStep}
                disabled={isCompleting}
                className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark"
              >
                {currentStep === tourSteps.length - 1 ? 
                  (isCompleting ? 'Completing...' : currentTourStep.actionText) : 
                  currentTourStep.actionText
                }
                {currentStep < tourSteps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>

            {/* Skip Tour Option */}
            <div className="text-center pt-2">
              <button 
                onClick={onSkip}
                className="text-sm text-tennis-green-medium hover:text-tennis-green-dark transition-colors"
              >
                Skip tour - I'll explore on my own
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {tourSteps.map((step, index) => (
            <div
              key={step.id}
              className={`w-3 h-3 rounded-full transition-colors ${
                index <= currentStep ? 'bg-tennis-green-primary' : 'bg-tennis-green-bg'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};