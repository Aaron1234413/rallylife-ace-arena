import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  HelpCircle,
  ArrowRight,
  Trophy,
  Target
} from 'lucide-react';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizInterfaceProps {
  question: QuizQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  isComplete: boolean;
  score: number;
  tokensEarned: number;
  quizType: 'daily' | 'practice' | 'category' | 'drill';
  category?: string;
  onAnswerSelect: (answerIndex: number) => void;
  onNextQuestion: () => void;
  onComplete: () => void;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isComplete,
  score,
  tokensEarned,
  quizType,
  category,
  onAnswerSelect,
  onNextQuestion,
  onComplete
}) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft] = useState(null); // Timer disabled for Phase 1

  if (!question) {
    return <div>Loading...</div>;
  }

  const handleAnswerSelect = (answerIndex: number) => {
    onAnswerSelect(answerIndex);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    onNextQuestion();
  };

  const progressPercentage = ((questionIndex + 1) / totalQuestions) * 100;
  const isCorrect = selectedAnswer === question.correctAnswer;

  // Results Screen
  if (isComplete) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const grade = percentage >= 80 ? 'A' : percentage >= 60 ? 'B' : percentage >= 40 ? 'C' : 'D';
    const gradeColor = percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-blue-600' : percentage >= 40 ? 'text-yellow-600' : 'text-red-600';

    return (
      <div className="min-h-screen bg-tennis-green-bg p-4 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-tennis-green-primary rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-tennis-green-dark">Quiz Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-6xl font-bold ${gradeColor} mb-2`}>{grade}</div>
                <p className="text-tennis-green-medium">
                  {score} out of {totalQuestions} correct ({percentage}%)
                </p>
              </div>
              
              <div className="bg-tennis-green-bg/50 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🪙</span>
                  <span className="text-xl font-bold text-tennis-green-dark">+{tokensEarned}</span>
                </div>
                <p className="text-sm text-tennis-green-medium">Tokens earned!</p>
              </div>

              {percentage >= 80 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 font-medium">🎉 Excellent work!</p>
                  <p className="text-green-600 text-sm">You've mastered this topic!</p>
                </div>
              )}
            </div>

            <Button 
              onClick={onComplete}
              className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark"
            >
              Back to Academy
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary" className="bg-tennis-green-primary text-white">
            {quizType === 'daily' ? '🎯 Daily Drill' : 
             quizType === 'practice' ? '🧠 Practice Quiz' :
             quizType === 'category' ? `📚 ${category || 'Category'} Quiz` :
             '⚡ Drill Session'}
          </Badge>
          <Badge variant="outline">
            {question.category}
          </Badge>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-tennis-green-dark">
            <span>Question {questionIndex + 1} of {totalQuestions}</span>
            {timeLeft && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{timeLeft}s</span>
              </div>
            )}
          </div>
          <Progress value={progressPercentage} className="h-2" />
          
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-3">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < questionIndex 
                    ? 'bg-tennis-green-primary' 
                    : i === questionIndex 
                    ? 'bg-tennis-green-medium' 
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-tennis-green-dark leading-relaxed">
            {question.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Answer Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrectOption = index === question.correctAnswer;
              const showCorrect = showFeedback && isCorrectOption;
              const showIncorrect = showFeedback && isSelected && !isCorrectOption;
              
              return (
                <button
                  key={index}
                  onClick={() => !showFeedback && handleAnswerSelect(index)}
                  disabled={showFeedback}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showCorrect
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : showIncorrect
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : isSelected
                      ? 'border-tennis-green-primary bg-tennis-green-bg text-tennis-green-dark'
                      : 'border-gray-200 hover:border-tennis-green-light hover:bg-tennis-green-bg/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                      showCorrect
                        ? 'border-green-500 bg-green-500 text-white'
                        : showIncorrect
                        ? 'border-red-500 bg-red-500 text-white'
                        : isSelected
                        ? 'border-tennis-green-primary bg-tennis-green-primary text-white'
                        : 'border-gray-400'
                    }`}>
                      {showCorrect ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : showIncorrect ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`p-4 rounded-lg border ${
              isCorrect 
                ? 'border-green-200 bg-green-50' 
                : 'border-red-200 bg-red-50'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </p>
                  <p className={`text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={true} // Hint disabled for Phase 1
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Hint (Coming Soon)
            </Button>
            
            {showFeedback && (
              <Button
                onClick={handleNext}
                className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark"
              >
                {questionIndex + 1 < totalQuestions ? (
                  <>
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  'Complete Quiz'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};