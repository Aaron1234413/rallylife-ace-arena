import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  Star, 
  Target,
  ArrowRight,
  X,
  BookOpen,
  Trophy,
  Zap,
  Users,
  MapPin
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  duration: string;
  reward?: string;
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  category: 'getting_started' | 'gameplay' | 'social' | 'advanced';
  steps: TutorialStep[];
  prerequisite?: string;
  unlockLevel?: number;
}

interface TutorialSystemProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: 'player' | 'coach';
  userLevel?: number;
  completedTutorials?: string[];
  onTutorialComplete?: (tutorialId: string) => void;
}

const PLAYER_TUTORIALS: Tutorial[] = [
  {
    id: 'first_training_session',
    title: 'Log Your First Training Session',
    description: 'Learn how to log training sessions to earn XP and track your progress.',
    icon: Target,
    difficulty: 'beginner',
    estimatedTime: '3 min',
    category: 'getting_started',
    steps: [
      {
        id: 'navigate_training',
        title: 'Start a Training Session',
        description: 'Click the "Start Training" button on your dashboard',
        action: 'Click the green "Start Training" button',
        duration: '30 sec'
      },
      {
        id: 'select_details',
        title: 'Add Session Details',
        description: 'Fill in your training type, duration, and intensity',
        action: 'Select training type and set duration',
        duration: '1 min'
      },
      {
        id: 'complete_session',
        title: 'Complete Session',
        description: 'Finish your session to earn XP and tokens',
        action: 'End the session and rate your performance',
        duration: '1 min',
        reward: '25 XP + 10 Tokens'
      }
    ]
  },
  {
    id: 'academy_basics',
    title: 'Master the Academy',
    description: 'Learn how to earn tokens through tennis knowledge quizzes.',
    icon: BookOpen,
    difficulty: 'beginner',
    estimatedTime: '5 min',
    category: 'gameplay',
    steps: [
      {
        id: 'visit_academy',
        title: 'Visit the Academy',
        description: 'Navigate to the Academy section',
        action: 'Click on "Academy" in the navigation',
        duration: '30 sec'
      },
      {
        id: 'daily_quiz',
        title: 'Take Daily Quiz',
        description: 'Complete your first daily tennis trivia quiz',
        action: 'Answer 5 tennis questions correctly',
        duration: '3 min',
        reward: '15 Tokens'
      },
      {
        id: 'check_in',
        title: 'Daily Check-in',
        description: 'Learn about streak bonuses and daily rewards',
        action: 'Complete your daily check-in',
        duration: '1 min',
        reward: 'Streak bonus tokens'
      }
    ]
  },
  {
    id: 'social_connections',
    title: 'Connect with Players',
    description: 'Find practice partners and join tennis communities.',
    icon: Users,
    difficulty: 'intermediate',
    estimatedTime: '7 min',
    category: 'social',
    prerequisite: 'first_training_session',
    unlockLevel: 3,
    steps: [
      {
        id: 'explore_maps',
        title: 'Explore Courts',
        description: 'Use the Maps feature to find nearby courts',
        action: 'Navigate to Maps and explore your area',
        duration: '2 min'
      },
      {
        id: 'search_players',
        title: 'Search for Players',
        description: 'Find players with similar skill levels',
        action: 'Use the Search feature to find practice partners',
        duration: '3 min'
      },
      {
        id: 'join_club',
        title: 'Join a Club',
        description: 'Connect with local tennis communities',
        action: 'Browse and join your first tennis club',
        duration: '2 min',
        reward: 'Club member benefits'
      }
    ]
  },
  {
    id: 'achievement_mastery',
    title: 'Achievement Hunter',
    description: 'Learn how to unlock and claim achievements for maximum rewards.',
    icon: Trophy,
    difficulty: 'intermediate',
    estimatedTime: '4 min',
    category: 'gameplay',
    unlockLevel: 5,
    steps: [
      {
        id: 'view_achievements',
        title: 'View Your Achievements',
        description: 'Check your current achievement progress',
        action: 'Navigate to your profile and view achievements',
        duration: '1 min'
      },
      {
        id: 'claim_rewards',
        title: 'Claim Achievement Rewards',
        description: 'Collect rewards from completed achievements',
        action: 'Claim any available achievement rewards',
        duration: '2 min'
      },
      {
        id: 'plan_strategy',
        title: 'Plan Your Strategy',
        description: 'Learn which achievements give the best rewards',
        action: 'Review upcoming achievements and plan your activities',
        duration: '1 min'
      }
    ]
  }
];

const COACH_TUTORIALS: Tutorial[] = [
  {
    id: 'coach_setup',
    title: 'Complete Coach Profile',
    description: 'Set up your coaching profile to attract more clients.',
    icon: Target,
    difficulty: 'beginner',
    estimatedTime: '5 min',
    category: 'getting_started',
    steps: [
      {
        id: 'profile_details',
        title: 'Add Profile Information',
        description: 'Complete your coaching experience and specialties',
        action: 'Fill out your coaching profile completely',
        duration: '3 min'
      },
      {
        id: 'set_rates',
        title: 'Set Your Rates',
        description: 'Define your coaching rates and availability',
        action: 'Set competitive rates for your services',
        duration: '2 min',
        reward: 'Increased visibility to players'
      }
    ]
  },
  {
    id: 'client_management',
    title: 'Managing Your Clients',
    description: 'Learn effective client management and earning CXP.',
    icon: Users,
    difficulty: 'intermediate',
    estimatedTime: '6 min',
    category: 'gameplay',
    prerequisite: 'coach_setup',
    steps: [
      {
        id: 'find_clients',
        title: 'Find Your First Client',
        description: 'Use the search feature to find potential clients',
        action: 'Browse available players and send coaching invitations',
        duration: '3 min'
      },
      {
        id: 'schedule_session',
        title: 'Schedule Coaching Session',
        description: 'Set up your first coaching appointment',
        action: 'Book a session with a client',
        duration: '2 min'
      },
      {
        id: 'earn_cxp',
        title: 'Complete Session',
        description: 'Learn how to earn CXP through successful coaching',
        action: 'Complete the session and request feedback',
        duration: '1 min',
        reward: 'CXP + Reputation boost'
      }
    ]
  }
];

export const TutorialSystem: React.FC<TutorialSystemProps> = ({
  isOpen,
  onClose,
  userRole,
  userLevel = 1,
  completedTutorials = [],
  onTutorialComplete
}) => {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const tutorials = userRole === 'player' ? PLAYER_TUTORIALS : COACH_TUTORIALS;

  const availableTutorials = tutorials.filter(tutorial => {
    // Check level requirement
    if (tutorial.unlockLevel && userLevel < tutorial.unlockLevel) return false;
    
    // Check prerequisite
    if (tutorial.prerequisite && !completedTutorials.includes(tutorial.prerequisite)) return false;
    
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'getting_started': return Target;
      case 'gameplay': return Zap;
      case 'social': return Users;
      case 'advanced': return Star;
      default: return BookOpen;
    }
  };

  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (!selectedTutorial) return;
    
    if (currentStep < selectedTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const completeTutorial = () => {
    if (selectedTutorial && onTutorialComplete) {
      onTutorialComplete(selectedTutorial.id);
    }
    setIsActive(false);
    setSelectedTutorial(null);
    setCurrentStep(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {!isActive ? (
          // Tutorial Selection Screen
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-orbitron font-bold text-tennis-green-dark">
                  🎾 Interactive Tutorials
                </h2>
                <p className="text-tennis-green-medium">
                  Master Rako features with step-by-step guides
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {availableTutorials.map((tutorial) => {
                const isCompleted = completedTutorials.includes(tutorial.id);
                const CategoryIcon = getCategoryIcon(tutorial.category);
                
                return (
                  <Card key={tutorial.id} className={`cursor-pointer transition-all hover:shadow-lg ${
                    isCompleted ? 'bg-green-50 border-green-200' : 'hover:border-tennis-green-light'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isCompleted ? 'bg-green-100' : 'bg-tennis-green-bg'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          ) : (
                            <tutorial.icon className="h-6 w-6 text-tennis-green-primary" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                            {isCompleted && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Completed
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CategoryIcon className="h-4 w-4" />
                            <span className="capitalize">{tutorial.category.replace('_', ' ')}</span>
                            <span>•</span>
                            <Clock className="h-4 w-4" />
                            <span>{tutorial.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-tennis-green-medium text-sm mb-3">
                        {tutorial.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs ${getDifficultyColor(tutorial.difficulty)}`}>
                          {tutorial.difficulty}
                        </Badge>
                        
                        <Button
                          size="sm"
                          disabled={isCompleted}
                          onClick={() => startTutorial(tutorial)}
                          className="bg-tennis-green-primary hover:bg-tennis-green-dark"
                        >
                          {isCompleted ? 'Completed' : 'Start Tutorial'}
                          {!isCompleted && <PlayCircle className="h-4 w-4 ml-1" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          // Active Tutorial Screen
          selectedTutorial && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-tennis-green-dark">
                    {selectedTutorial.title}
                  </h2>
                  <p className="text-sm text-tennis-green-medium">
                    Step {currentStep + 1} of {selectedTutorial.steps.length}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsActive(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <Progress 
                value={((currentStep + 1) / selectedTutorial.steps.length) * 100} 
                className="mb-6"
              />

              <Card className="border-2 border-tennis-green-light">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-tennis-green-primary" />
                    {selectedTutorial.steps[currentStep].title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-tennis-green-medium mb-4">
                    {selectedTutorial.steps[currentStep].description}
                  </p>
                  
                  <div className="bg-tennis-green-bg/30 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-tennis-green-dark mb-2">
                      What to do:
                    </h4>
                    <p className="text-tennis-green-dark">
                      {selectedTutorial.steps[currentStep].action}
                    </p>
                  </div>

                  {selectedTutorial.steps[currentStep].reward && (
                    <div className="bg-tennis-yellow/10 border border-tennis-yellow/30 p-3 rounded-lg mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-tennis-yellow" />
                        <span className="font-semibold text-tennis-green-dark">Reward:</span>
                        <span className="text-tennis-green-dark">
                          {selectedTutorial.steps[currentStep].reward}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      disabled={currentStep === 0}
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Previous
                    </Button>
                    
                    <Button
                      onClick={nextStep}
                      className="bg-tennis-green-primary hover:bg-tennis-green-dark"
                    >
                      {currentStep === selectedTutorial.steps.length - 1 ? 
                        'Complete Tutorial' : 'Next Step'
                      }
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}
      </div>
    </div>
  );
};