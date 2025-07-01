
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useQuizEngine } from '@/hooks/useQuizEngine';

interface QuizInterfaceProps {
  onComplete: () => void;
  onBack: () => void;
  category?: string;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({
  onComplete,
  onBack,
  category = 'random'
}) => {
  const { 
    currentQuestion, 
    questionIndex, 
    totalQuestions, 
    score, 
    isComplete, 
    answerQuestion, 
    nextQuestion,
    sessionSummary 
  } = useQuizEngine(category);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!showFeedback && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, showFeedback]);

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const isCorrect = answerQuestion(selectedAnswer);
    setShowFeedback(true);
    
    setTimeout(() => {
      if (questionIndex < totalQuestions - 1) {
        nextQuestion();
        setSelectedAnswer(null);
        setShowFeedback(false);
        setTimeLeft(30);
      }
    }, 2000);
  };

  const handleComplete = () => {
    onComplete();
  };

  if (isComplete && sessionSummary) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-tennis-green-dark">
              Quiz Complete! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-tennis-green-dark">
                    {sessionSummary.score}
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {sessionSummary.tokensEarned}
                  </div>
                  <div className="text-sm text-gray-600">Tokens Earned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {sessionSummary.accuracy}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
              </div>
              
              <div className="bg-tennis-green-bg p-4 rounded-lg">
                <h3 className="font-semibold text-tennis-green-dark mb-2">
                  Learning Tip
                </h3>
                <p className="text-sm text-gray-700">
                  {sessionSummary.learningTip}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleComplete}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
            >
              Back to Academy
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">Loading quiz...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge variant="secondary">
          Question {questionIndex + 1} of {totalQuestions}
        </Badge>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-center space-x-1">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < questionIndex 
                  ? 'bg-tennis-green-dark' 
                  : i === questionIndex 
                  ? 'bg-tennis-green-medium' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Quiz Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge className="bg-tennis-green-light text-tennis-green-dark">
              {currentQuestion.category}
            </Badge>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {timeLeft}s
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium text-tennis-green-dark">
            {currentQuestion.question}
          </div>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = selectedAnswer === option;
              const isCorrect = showFeedback && option === currentQuestion.correctAnswer;
              const isWrong = showFeedback && isSelected && option !== currentQuestion.correctAnswer;
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`w-full justify-start text-left h-auto p-4 ${
                    isSelected && !showFeedback ? 'border-tennis-green-dark bg-tennis-green-light' :
                    isCorrect ? 'border-green-500 bg-green-50 text-green-700' :
                    isWrong ? 'border-red-500 bg-red-50 text-red-700' :
                    'hover:bg-gray-50'
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showFeedback}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                      isSelected && !showFeedback ? 'border-tennis-green-dark bg-tennis-green-dark text-white' :
                      isCorrect ? 'border-green-500 bg-green-500 text-white' :
                      isWrong ? 'border-red-500 bg-red-500 text-white' :
                      'border-gray-300'
                    }`}>
                      {showFeedback && isCorrect && <CheckCircle className="h-4 w-4" />}
                      {showFeedback && isWrong && <XCircle className="h-4 w-4" />}
                      {!showFeedback && letter}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-lg ${
              selectedAnswer === currentQuestion.correctAnswer 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {selectedAnswer === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                {currentQuestion.explanation}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              disabled
            >
              <Lightbulb className="h-4 w-4" />
              Hint (1 token)
            </Button>
            
            {!showFeedback && (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="bg-tennis-green-dark hover:bg-tennis-green-medium"
              >
                Submit Answer
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
