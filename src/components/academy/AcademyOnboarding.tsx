
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Target, Trophy, ArrowRight } from 'lucide-react';

interface AcademyOnboardingProps {
  onComplete: () => void;
}

export const AcademyOnboarding: React.FC<AcademyOnboardingProps> = ({
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | number>('welcome');
  const [placementAnswers, setPlacementAnswers] = useState<string[]>([]);

  const placementQuestions = [
    {
      question: "How many sets are typically played in a men's professional tennis match?",
      options: ["2 sets", "3 sets", "5 sets", "It varies"],
      correct: "5 sets"
    },
    {
      question: "What is the term for a score of 40-40 in tennis?",
      options: ["Match point", "Deuce", "Advantage", "Break point"],
      correct: "Deuce"
    },
    {
      question: "Which Grand Slam tournament is played on clay courts?",
      options: ["Wimbledon", "US Open", "French Open", "Australian Open"],
      correct: "French Open"
    }
  ];

  const handlePlacementAnswer = (answer: string) => {
    const newAnswers = [...placementAnswers, answer];
    setPlacementAnswers(newAnswers);
    
    if (newAnswers.length === placementQuestions.length) {
      // Calculate placement level
      const correctAnswers = newAnswers.filter((answer, index) => 
        answer === placementQuestions[index].correct
      ).length;
      
      // Move to results step
      setCurrentStep(2);
    } else {
      // Continue with next question
      setCurrentStep((prev) => typeof prev === 'number' ? prev + 1 : 1);
    }
  };

  const calculateStartingLevel = () => {
    const correctAnswers = placementAnswers.filter((answer, index) => 
      answer === placementQuestions[index].correct
    ).length;
    
    if (correctAnswers === 3) return 3; // Baseline Scholar
    if (correctAnswers === 2) return 2; // Court Cadet
    return 1; // Rookie
  };

  const getStartingLevelName = () => {
    const level = calculateStartingLevel();
    const names = {
      1: 'Rookie',
      2: 'Court Cadet',
      3: 'Baseline Scholar'
    };
    return names[level as keyof typeof names];
  };

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-tennis-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-3xl text-tennis-green-dark">
              Welcome to RAKO Academy! 🎾
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-gray-700">
              Ready to serve up some knowledge? Let's find your perfect starting point!
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-tennis-green-bg p-4 rounded-lg">
                <Target className="h-8 w-8 text-tennis-green-dark mx-auto mb-2" />
                <h3 className="font-semibold text-tennis-green-dark">Learn</h3>
                <p className="text-sm text-gray-600">
                  Master tennis rules, history, and strategy
                </p>
              </div>
              <div className="bg-tennis-yellow-light p-4 rounded-lg">
                <Trophy className="h-8 w-8 text-tennis-green-dark mx-auto mb-2" />
                <h3 className="font-semibold text-tennis-green-dark">Earn</h3>
                <p className="text-sm text-gray-600">
                  Collect tokens and unlock achievements
                </p>
              </div>
              <div className="bg-tennis-green-bg p-4 rounded-lg">
                <GraduationCap className="h-8 w-8 text-tennis-green-dark mx-auto mb-2" />
                <h3 className="font-semibold text-tennis-green-dark">Progress</h3>
                <p className="text-sm text-gray-600">
                  Advance through 7 academy levels
                </p>
              </div>
            </div>

            <div className="bg-tennis-green-light p-4 rounded-lg">
              <h3 className="font-semibold text-tennis-green-dark mb-2">
                How It Works
              </h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div>• Answer 3 placement questions to find your level</div>
                <div>• Complete daily drills and quizzes to earn tokens</div>
                <div>• Progress through academy levels to unlock new content</div>
                <div>• Build your tennis knowledge step by step</div>
              </div>
            </div>

            <Button 
              onClick={() => setCurrentStep(1)}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
              size="lg"
            >
              Start Academy Enrollment
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (typeof currentStep === 'number' && currentStep >= 1 && currentStep <= placementQuestions.length) {
    const questionIndex = currentStep - 1;
    const question = placementQuestions[questionIndex];
    
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge className="bg-tennis-green-light text-tennis-green-dark">
                Placement Quiz
              </Badge>
              <Badge variant="outline">
                Question {questionIndex + 1} of {placementQuestions.length}
              </Badge>
            </div>
            <CardTitle className="text-xl text-tennis-green-dark">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4 hover:bg-tennis-green-light"
                  onClick={() => handlePlacementAnswer(option)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-semibold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    {option}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 2) {
    const startingLevel = calculateStartingLevel();
    const levelName = getStartingLevelName();
    
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-tennis-green-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-yellow-300" />
            </div>
            <CardTitle className="text-2xl text-tennis-green-dark">
              Academy Placement Complete! 🎓
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-tennis-green-light p-6 rounded-lg">
              <h3 className="text-xl font-bold text-tennis-green-dark mb-2">
                You've been placed in:
              </h3>
              <div className="text-3xl font-bold text-tennis-green-dark">
                {levelName}
              </div>
              <div className="text-tennis-green-medium mt-1">
                Level {startingLevel} of 7
              </div>
            </div>

            <div className="text-left bg-tennis-green-bg p-4 rounded-lg">
              <h4 className="font-semibold text-tennis-green-dark mb-2">
                What's Next?
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div>✨ Earn up to 10 tokens daily through quizzes and drills</div>
                <div>📚 Complete your daily drill for 5 tokens</div>
                <div>🎯 Take quick quizzes for 1-3 tokens each</div>
                <div>🏆 Level up to unlock new content and features</div>
              </div>
            </div>

            <Button 
              onClick={onComplete}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
              size="lg"
            >
              Enter the Academy
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default to welcome screen
  return null;
};
