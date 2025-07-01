import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Target,
  Clock,
  Zap,
  CheckCircle,
  Trophy,
  Star,
  Brain
} from 'lucide-react';
import { QuizInterface, QuizQuestion } from './QuizInterface';
import { useQuizEngine } from '@/hooks/useQuizEngine';

interface DailyDrillProps {
  onBack: () => void;
}

const DRILL_TOPICS = [
  {
    id: 'serve-rules',
    name: 'Serving Rules',
    description: 'Master the rules and techniques of serving',
    questions: 5,
    difficulty: 'Easy',
    focus: 'Rules & Technique',
    icon: Target,
    color: 'blue'
  },
  {
    id: 'court-positioning',
    name: 'Court Positioning',
    description: 'Learn optimal positioning for different shots',
    questions: 5,
    difficulty: 'Medium',
    focus: 'Strategy & Tactics',
    icon: Brain,
    color: 'green'
  },
  {
    id: 'scoring-scenarios',
    name: 'Scoring Scenarios',
    description: 'Practice complex scoring situations',
    questions: 5,
    difficulty: 'Medium',
    focus: 'Scoring & Rules',
    icon: Trophy,
    color: 'yellow'
  },
  {
    id: 'equipment-basics',
    name: 'Equipment Essentials',
    description: 'Key knowledge about tennis equipment',
    questions: 5,
    difficulty: 'Easy',
    focus: 'Equipment & Gear',
    icon: Star,
    color: 'purple'
  }
];

export const DailyDrill: React.FC<DailyDrillProps> = ({ onBack }) => {
  const [selectedDrill, setSelectedDrill] = useState<string | null>(null);
  const [drillStarted, setDrillStarted] = useState(false);

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
    startDrill,
    resetQuiz
  } = useQuizEngine();

  const handleStartDrill = (drillId: string) => {
    const drill = DRILL_TOPICS.find(d => d.id === drillId);
    if (drill) {
      startDrill(drillId, drill.questions);
      setDrillStarted(true);
    }
  };

  const handleDrillComplete = () => {
    setDrillStarted(false);
    setSelectedDrill(null);
    resetQuiz();
  };

  // If drill is active, show quiz interface
  if (drillStarted && currentQuestion) {
    return (
      <QuizInterface
        question={currentQuestion}
        questionIndex={currentQuestionIndex}
        totalQuestions={quizQuestions.length}
        selectedAnswer={selectedAnswer}
        isComplete={isQuizComplete}
        score={score}
        tokensEarned={tokensEarned}
        quizType="drill"
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={handleNextQuestion}
        onComplete={handleDrillComplete}
      />
    );
  }

  const todaysDrill = DRILL_TOPICS[new Date().getDate() % DRILL_TOPICS.length];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 p-4">
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

        <Card className="bg-white/90 backdrop-blur-sm border-yellow-200">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Zap className="h-10 w-10 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-tennis-green-dark">Daily Drill</h1>
                  <Badge className="bg-yellow-100 text-yellow-700">+5 Tokens</Badge>
                </div>
                <p className="text-tennis-green-medium mb-3">
                  Focused 5-question sessions designed to reinforce key tennis concepts
                </p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">5 Questions</Badge>
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    ~3 minutes
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Featured Drill */}
      <div className="max-w-4xl mx-auto mb-8">
        <h2 className="text-2xl font-bold text-tennis-green-dark mb-4 text-center">
          Today's Featured Drill
        </h2>
        
        <Card className="bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-300">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 bg-${todaysDrill.color}-100 rounded-full flex items-center justify-center`}>
                  <todaysDrill.icon className={`h-8 w-8 text-${todaysDrill.color}-600`} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-tennis-green-dark mb-2">{todaysDrill.name}</h3>
                  <p className="text-tennis-green-medium mb-2">{todaysDrill.description}</p>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{todaysDrill.difficulty}</Badge>
                    <Badge className={`bg-${todaysDrill.color}-100 text-${todaysDrill.color}-700`}>
                      {todaysDrill.focus}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleStartDrill(todaysDrill.id)}
                size="lg"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Start Today's Drill
                <Zap className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Available Drills */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold text-tennis-green-dark mb-6 text-center">
          More Practice Drills
        </h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {DRILL_TOPICS.filter(drill => drill.id !== todaysDrill.id).map((drill) => {
            const DrillIcon = drill.icon;
            const isSelected = selectedDrill === drill.id;

            return (
              <Card
                key={drill.id}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-tennis-green-primary' : ''
                } bg-white/90`}
                onClick={() => setSelectedDrill(drill.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <DrillIcon className={`h-6 w-6 text-${drill.color}-600`} />
                    <Badge variant="outline">+3 Tokens</Badge>
                  </div>
                  <CardTitle className="text-lg text-tennis-green-dark">{drill.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-tennis-green-medium text-sm">{drill.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tennis-green-medium">Questions:</span>
                      <span className="font-medium text-tennis-green-dark">{drill.questions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tennis-green-medium">Focus:</span>
                      <span className="font-medium text-tennis-green-dark">{drill.focus}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-tennis-green-medium">Difficulty:</span>
                      <Badge variant="outline" className="text-xs">{drill.difficulty}</Badge>
                    </div>
                  </div>

                  {isSelected && (
                    <Button
                      onClick={() => handleStartDrill(drill.id)}
                      className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark mt-4"
                    >
                      Start Drill
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Daily Progress */}
        <Card className="mt-8 bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <Target className="h-5 w-5" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-tennis-green-dark">3</div>
                <div className="text-sm text-tennis-green-medium">Drills Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">15</div>
                <div className="text-sm text-tennis-green-medium">Tokens Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">90%</div>
                <div className="text-sm text-tennis-green-medium">Accuracy</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-tennis-green-medium">Daily Goal Progress</span>
                <span className="font-medium text-tennis-green-dark">3/5 Drills</span>
              </div>
              <Progress value={60} className="h-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};