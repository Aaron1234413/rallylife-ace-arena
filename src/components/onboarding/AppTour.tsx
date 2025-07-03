import React, { useState, useEffect, useRef } from 'react';
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
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { WelcomeAnimation } from './WelcomeAnimation';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const tourSteps = userRole === 'player' ? PLAYER_TOUR_STEPS : COACH_TOUR_STEPS;
  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Touch/swipe navigation for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0 && currentStep < tourSteps.length - 1) {
        // Swipe left - next step
        handleNextStep();
      } else if (distance < 0 && currentStep > 0) {
        // Swipe right - previous step
        handlePreviousStep();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation support (desktop only)
  useEffect(() => {
    if (isMobile) return;
    
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
  }, [currentStep, tourSteps.length, isMobile]);

  const handleNextStep = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      if (currentStep < tourSteps.length - 1) {
        setCompletedSteps(prev => [...prev, currentTourStep.id]);
        setCurrentStep(currentStep + 1);
      } else {
        handleCompleteTour();
      }
      setIsTransitioning(false);
    }, 150);
  };

  const handlePreviousStep = () => {
    if (isTransitioning || currentStep === 0) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsTransitioning(false);
    }, 150);
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
    <div 
      className={`min-h-screen relative overflow-hidden bg-background ${isMobile ? 'px-3 py-4' : 'p-4'} flex items-center justify-center`} 
      role="dialog" 
      aria-labelledby="tour-title" 
      aria-modal="true"
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {/* Floating Tennis Balls - Subtle */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: isMobile ? 2 : 4 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-6 h-6 rounded-full bg-gradient-to-br from-tennis-yellow/20 via-tennis-yellow/15 to-yellow-600/10 shadow-sm animate-pulse opacity-30"
            style={{
              left: `${15 + (i * 20)}%`,
              top: `${25 + (i * 15)}%`,
              animationDelay: `${i * 1}s`,
              animationDuration: `${4 + (i * 0.5)}s`,
            }}
          >
            {/* Tennis ball curve lines */}
            <div className="absolute inset-0 rounded-full">
              <div className="absolute top-1/2 left-0.5 right-0.5 h-0.5 bg-white/40 rounded-full transform -translate-y-1/2" />
              <div className="absolute top-1/2 left-0.5 right-0.5 h-0.5 bg-white/40 rounded-full transform -translate-y-1/2 rotate-180" />
            </div>
          </div>
        ))}
      </div>

      <div className={`w-full relative z-10 ${isMobile ? 'max-w-sm' : 'max-w-4xl'}`}>
        {/* Mobile Header */}
        {isMobile ? (
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-3 shadow-lg animate-pulse">
              <Target className="h-6 w-6 text-primary-foreground drop-shadow-sm" />
            </div>
            <h1 id="tour-title" className="text-xl font-orbitron font-bold text-foreground mb-1 drop-shadow-sm">
              Welcome to RAKO!
            </h1>
            <p className="text-sm text-muted-foreground mb-3 drop-shadow-sm">
              Let's explore your tennis gaming platform
            </p>
            <p className="text-xs text-muted-foreground/70 drop-shadow-sm">
              👈 Swipe to navigate or use buttons below
            </p>
            
            {/* Mobile Progress */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Step {currentStep + 1}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-1.5" />
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Header */
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full mb-4 shadow-xl animate-pulse">
              <Target className="h-8 w-8 text-primary-foreground drop-shadow-sm" />
            </div>
            <h1 id="tour-title" className="text-3xl font-orbitron font-bold text-foreground mb-2 drop-shadow-sm">
              Welcome to RAKO!
            </h1>
            <p className="text-muted-foreground drop-shadow-sm">
              Let's take a quick tour of your new tennis gaming platform
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 drop-shadow-sm">
              💡 Use arrow keys to navigate, Enter/Space to proceed, or Esc to skip
            </p>
            
            {/* Desktop Progress */}
            <div className="mt-4 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>Step {currentStep + 1} of {tourSteps.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        )}

        {/* Main Tour Card */}
        <Card className={`bg-card border-2 border-border shadow-2xl transition-all duration-300 ${
          isTransitioning ? 'scale-95 opacity-75' : 'scale-100 opacity-100'
        } ${isMobile ? 'mx-auto' : ''} relative overflow-hidden`}>
          {/* Card Background Pattern - Subtle */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 20px 20px, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <CardHeader className={`text-center relative z-10 ${isMobile ? 'pb-4' : ''}`}>
            <div className={`mx-auto mb-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center shadow-lg animate-bounce ${
              isMobile ? 'w-12 h-12' : 'w-16 h-16 mb-4'
            }`} style={{ animationDuration: '2s' }}>
              <currentTourStep.icon className={`text-primary drop-shadow-sm ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
            </div>
            <CardTitle className={`text-foreground drop-shadow-sm ${isMobile ? 'text-lg' : 'text-2xl'}`}>
              {currentTourStep.title}
            </CardTitle>
            <p className={`text-muted-foreground mt-2 drop-shadow-sm ${isMobile ? 'text-sm' : ''}`}>
              {currentTourStep.description}
            </p>
          </CardHeader>
          
          <CardContent className={`relative z-10 ${isMobile ? 'space-y-4 px-4 pb-4' : 'space-y-6'}`}>
            {/* Features List */}
            <div className={`bg-muted/50 rounded-lg border border-border/30 ${isMobile ? 'p-3' : 'p-4'} shadow-sm`}>
              <h3 className={`font-semibold text-foreground mb-2 flex items-center gap-2 ${isMobile ? 'text-sm' : 'mb-3'}`}>
                <span className="animate-bounce">🎾</span> Key Features:
              </h3>
              <div className={`grid ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
                {currentTourStep.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-2 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm animate-pulse ${
                      isMobile ? 'w-4 h-4' : 'w-5 h-5'
                    }`} style={{ animationDelay: `${index * 0.2}s` }}>
                      <Check className={`text-primary-foreground ${isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3'}`} />
                    </div>
                    <span className={`text-foreground leading-tight ${isMobile ? 'text-sm' : ''}`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaming Tip */}
            <div className={`bg-gradient-to-br from-accent/15 to-accent/5 border border-accent/40 rounded-lg ${isMobile ? 'p-3' : 'p-4'} shadow-sm relative overflow-hidden`}>
              {/* Tip Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: `linear-gradient(45deg, hsl(var(--accent)) 25%, transparent 25%, transparent 75%, hsl(var(--accent)) 75%)`,
                  backgroundSize: '8px 8px'
                }} />
              </div>
              
              <div className={`relative z-10 flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                <Zap className={`text-accent animate-pulse ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                <span className={`font-semibold text-foreground ${isMobile ? 'text-sm' : ''}`}>
                  Pro Tip:
                </span>
              </div>
              <p className={`text-muted-foreground relative z-10 ${isMobile ? 'text-xs leading-relaxed' : 'text-sm'}`}>
                {userRole === 'player' ? 
                  'Complete daily activities to earn tokens and XP. The more you engage, the more rewards you unlock!' :
                  'Focus on building your CRP (Coach Reputation Points) by providing excellent service to your players.'
                }
              </p>
            </div>

            {/* Mobile Navigation Buttons */}
            {isMobile ? (
              <div className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0 || isTransitioning}
                    className="flex-1 h-12 text-sm transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={handleNextStep}
                    disabled={isCompleting || isTransitioning}
                    className="flex-1 h-12 text-sm shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    {currentStep === tourSteps.length - 1 ? 
                      (isCompleting ? 'Completing...' : 'Complete') : 
                      'Next'
                    }
                    {currentStep < tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>

                {/* Mobile Skip Option */}
                <div className="text-center">
                  <button 
                    onClick={onSkip}
                    className="text-xs text-tennis-green-medium hover:text-tennis-green-dark transition-colors px-2 py-1"
                  >
                    Skip tour - I'll explore on my own
                  </button>
                </div>
              </div>
            ) : (
              /* Desktop Navigation */
              <>
                <div className="flex gap-3 pt-4">
                  {currentStep > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousStep}
                      disabled={isTransitioning}
                      className="flex-1"
                    >
                      ← Previous
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleNextStep}
                    disabled={isCompleting || isTransitioning}
                    className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark"
                  >
                    {currentStep === tourSteps.length - 1 ? 
                      (isCompleting ? 'Completing...' : currentTourStep.actionText) : 
                      currentTourStep.actionText
                    }
                    {currentStep < tourSteps.length - 1 && <ArrowRight className="h-4 w-4 ml-2" />}
                  </Button>
                </div>

                <div className="text-center pt-2">
                  <button 
                    onClick={onSkip}
                    className="text-sm text-tennis-green-medium hover:text-tennis-green-dark transition-colors"
                  >
                    Skip tour - I'll explore on my own
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Step Indicators */}
        <div className={`flex justify-center gap-1.5 ${isMobile ? 'mt-4' : 'mt-6'}`}>
          {tourSteps.map((step, index) => (
            <div
              key={step.id}
              className={`rounded-full transition-all duration-500 relative ${
                isMobile ? 'w-2 h-2' : 'w-3 h-3'
              } ${
                index === currentStep 
                  ? 'bg-primary scale-125 shadow-lg' 
                  : index < currentStep 
                    ? 'bg-primary/70 scale-110' 
                    : 'bg-muted border-2 border-border hover:border-primary transition-colors cursor-pointer'
              }`}
            >
              {index === currentStep && (
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};