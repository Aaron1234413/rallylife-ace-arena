import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, Target, Trophy, ArrowRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: (startingLevel: number) => void;
}

interface PlacementQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: '1',
    question: 'What is the standard height of a tennis net at the center?',
    options: ['3 feet (0.91m)', '3.5 feet (1.07m)', '4 feet (1.22m)', '2.5 feet (0.76m)'],
    correctAnswer: 0,
    points: 1
  },
  {
    id: '2',
    question: 'In tennis scoring, what comes after "30"?',
    options: ['35', '40', '45', 'Game'],
    correctAnswer: 1,
    points: 1
  },
  {
    id: '3',
    question: 'How many games must you win to take a set (minimum)?',
    options: ['4 games', '5 games', '6 games', '7 games'],
    correctAnswer: 2,
    points: 1
  }
];

export const AcademyOnboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'placement' | 'results'>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleStartPlacement = () => {
    setCurrentStep('placement');
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers, selectedAnswer];
      setAnswers(newAnswers);
      setSelectedAnswer(null);

      if (currentQuestion + 1 < PLACEMENT_QUESTIONS.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Calculate score and determine starting level
        const score = newAnswers.reduce((total, answer, index) => {
          return total + (answer === PLACEMENT_QUESTIONS[index].correctAnswer ? PLACEMENT_QUESTIONS[index].points : 0);
        }, 0);
        
        const startingLevel = Math.max(1, Math.min(3, score + 1));
        setCurrentStep('results');
        
        setTimeout(() => {
          onComplete(startingLevel);
        }, 3000);
      }
    }
  };

  const currentQ = PLACEMENT_QUESTIONS[currentQuestion];
  const score = answers.reduce((total, answer, index) => {
    return total + (answer === PLACEMENT_QUESTIONS[index].correctAnswer ? PLACEMENT_QUESTIONS[index].points : 0);
  }, 0);

  // Welcome Screen
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-tennis-green-primary rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-tennis-green-dark">Welcome to RAKO Academy!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <p className="text-tennis-green-medium">
                Master tennis knowledge and climb the ranks in our interactive learning platform.
              </p>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/50 rounded-lg">
                  <Target className="h-5 w-5 text-tennis-green-primary" />
                  <div className="text-left">
                    <p className="font-medium text-tennis-green-dark">Daily Challenges</p>
                    <p className="text-sm text-tennis-green-medium">Test your knowledge daily</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-tennis-green-bg/50 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <div className="text-left">
                    <p className="font-medium text-tennis-green-dark">Level System</p>
                    <p className="text-sm text-tennis-green-medium">Progress from Rookie to Master</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-tennis-green-medium">
                Let's start with a quick placement quiz to find your perfect starting level!
              </p>
              
              <Button 
                onClick={handleStartPlacement}
                className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark"
              >
                Begin Placement Quiz
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Placement Quiz
  if (currentStep === 'placement') {
    const progressPercentage = ((currentQuestion + 1) / PLACEMENT_QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-tennis-green-bg p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="bg-tennis-green-primary text-white">
                📋 Placement Quiz
              </Badge>
              <span className="text-sm text-tennis-green-dark">
                Question {currentQuestion + 1} of {PLACEMENT_QUESTIONS.length}
              </span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Question */}
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-tennis-green-dark">
                {currentQ.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAnswer === index
                        ? 'border-tennis-green-primary bg-tennis-green-bg text-tennis-green-dark'
                        : 'border-gray-200 hover:border-tennis-green-light hover:bg-tennis-green-bg/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index
                          ? 'border-tennis-green-primary bg-tennis-green-primary text-white'
                          : 'border-gray-400'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>

              <Button
                onClick={handleNextQuestion}
                disabled={selectedAnswer === null}
                className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark"
              >
                {currentQuestion + 1 < PLACEMENT_QUESTIONS.length ? 'Next Question' : 'Complete Quiz'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results Screen
  if (currentStep === 'results') {
    const startingLevel = Math.max(1, Math.min(3, score + 1));
    const levelNames = ['', 'Rookie', 'Court Cadet', 'Baseline Scholar'];
    const levelIcons = ['', '🎾', '⚡', '📚'];

    return (
      <div className="min-h-screen bg-tennis-green-bg p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-tennis-green-primary rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-tennis-green-dark">Assessment Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-tennis-green-medium mb-4">
                  You scored {score} out of {PLACEMENT_QUESTIONS.length}
                </p>
                
                <div className="bg-tennis-green-bg/50 rounded-lg p-6">
                  <div className="text-4xl mb-2">{levelIcons[startingLevel]}</div>
                  <div className="text-2xl font-bold text-tennis-green-dark mb-1">
                    Level {startingLevel}
                  </div>
                  <Badge className="bg-tennis-green-primary text-white">
                    {levelNames[startingLevel]}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">🎉 Welcome aboard!</p>
                <p className="text-blue-600 text-sm">
                  Your learning journey begins now. Complete daily quizzes and level up!
                </p>
              </div>
            </div>

            <div className="text-sm text-tennis-green-medium">
              Entering the Academy in 3 seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};