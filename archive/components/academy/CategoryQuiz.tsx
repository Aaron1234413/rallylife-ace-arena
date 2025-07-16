import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Star,
  Clock,
  Trophy,
  Target,
  BookOpen,
  Zap,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { QuizInterface, QuizQuestion } from './QuizInterface';
import { useQuizEngine } from '@/hooks/useQuizEngine';

interface CategoryQuizProps {
  category: string;
  onBack: () => void;
}

const CATEGORY_INFO = {
  'Rules': {
    icon: Target,
    color: 'blue',
    description: 'Master the official rules and regulations of tennis',
    difficulty: 'Easy to Medium'
  },
  'Court Basics': {
    icon: Target,
    color: 'green',
    description: 'Learn court dimensions, surfaces, and basic knowledge',
    difficulty: 'Easy'
  },
  'Scoring': {
    icon: Trophy,
    color: 'yellow',
    description: 'Understand all tennis scoring systems and formats',
    difficulty: 'Easy to Medium'
  },
  'Equipment': {
    icon: BookOpen,
    color: 'purple',
    description: 'Explore rackets, balls, strings, and tennis gear',
    difficulty: 'Medium'
  },
  'Strategy': {
    icon: Zap,
    color: 'red',
    description: 'Advanced tactics, positioning, and game strategy',
    difficulty: 'Medium to Hard'
  },
  'History': {
    icon: Clock,
    color: 'indigo',
    description: 'Tennis heritage, champions, and tournament history',
    difficulty: 'Medium'
  }
};

const QUIZ_MODES = [
  {
    id: 'practice',
    name: 'Practice Mode',
    description: '10 random questions from this category',
    reward: '+2 Tokens',
    icon: BookOpen,
    questions: 10
  },
  {
    id: 'challenge',
    name: 'Category Challenge',
    description: '20 questions, increasing difficulty',
    reward: '+5 Tokens',
    icon: Trophy,
    questions: 20
  },
  {
    id: 'mastery',
    name: 'Mastery Test',
    description: '30 comprehensive questions',
    reward: '+10 Tokens',
    icon: Star,
    questions: 30
  }
];

export const CategoryQuiz: React.FC<CategoryQuizProps> = ({
  category,
  onBack
}) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const {
    currentQuestion,
    currentQuestionIndex,
    quizQuestions,
    selectedAnswer,
    isQuizComplete,
    score,
    tokensEarned,
    handleAnswerSelect,
    handleNextQuestion,
    startCategoryQuiz,
    resetQuiz
  } = useQuizEngine();

  const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
  const Icon = categoryInfo?.icon || BookOpen;

  const handleStartQuiz = (mode: string) => {
    const modeInfo = QUIZ_MODES.find(m => m.id === mode);
    if (modeInfo) {
      startCategoryQuiz(category, mode, modeInfo.questions);
      setQuizStarted(true);
    }
  };

  const handleQuizComplete = () => {
    setQuizStarted(false);
    setSelectedMode(null);
    resetQuiz();
  };

  // If quiz is active, show quiz interface
  if (quizStarted && currentQuestion) {
    return (
      <QuizInterface
        question={currentQuestion}
        questionIndex={currentQuestionIndex}
        totalQuestions={quizQuestions.length}
        selectedAnswer={selectedAnswer}
        isComplete={isQuizComplete}
        score={score}
        tokensEarned={tokensEarned}
        quizType="category"
        category={category}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={handleNextQuestion}
        onComplete={handleQuizComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-tennis-green-dark hover:text-tennis-green-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campus
        </Button>

        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 bg-${categoryInfo?.color}-100 rounded-full flex items-center justify-center`}>
                <Icon className={`h-10 w-10 text-${categoryInfo?.color}-600`} />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-tennis-green-dark mb-2">{category}</h1>
                <p className="text-tennis-green-medium mb-3">{categoryInfo?.description}</p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{categoryInfo?.difficulty}</Badge>
                  <Badge className={`bg-${categoryInfo?.color}-100 text-${categoryInfo?.color}-700`}>
                    Tennis Knowledge
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Mode Selection */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-tennis-green-dark mb-2">Choose Your Challenge</h2>
          <p className="text-tennis-green-medium">Select a quiz mode to test your {category.toLowerCase()} knowledge</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {QUIZ_MODES.map((mode) => {
            const ModeIcon = mode.icon;
            const isSelected = selectedMode === mode.id;

            return (
              <Card
                key={mode.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-tennis-green-primary bg-tennis-green-bg/50' : 'bg-white/90'
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <ModeIcon className={`h-8 w-8 text-${categoryInfo?.color}-600`} />
                    <Badge variant="outline">{mode.reward}</Badge>
                  </div>
                  <CardTitle className="text-xl text-tennis-green-dark">{mode.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-tennis-green-medium text-sm">{mode.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tennis-green-medium">Questions:</span>
                      <span className="font-medium text-tennis-green-dark">{mode.questions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tennis-green-medium">Time Limit:</span>
                      <span className="font-medium text-tennis-green-dark">None</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tennis-green-medium">Difficulty:</span>
                      <span className="font-medium text-tennis-green-dark">
                        {mode.id === 'practice' ? 'Mixed' : mode.id === 'challenge' ? 'Progressive' : 'Advanced'}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Button
                      onClick={() => handleStartQuiz(mode.id)}
                      className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark mt-4"
                    >
                      Start {mode.name}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Category Stats */}
        <Card className="bg-white/90 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Trophy className="h-5 w-5" />
              Your {category} Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-tennis-green-dark">85%</div>
                <div className="text-sm text-tennis-green-medium">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-tennis-green-medium">Quizzes Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">156</div>
                <div className="text-sm text-tennis-green-medium">Tokens Earned</div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-tennis-green-medium">Category Mastery</span>
                <span className="font-medium text-tennis-green-dark">75%</span>
              </div>
              <Progress value={75} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};