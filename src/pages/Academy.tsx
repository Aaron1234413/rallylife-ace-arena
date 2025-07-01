import React, { useState, useEffect } from 'react';
import { AcademyDashboard } from '@/components/academy/AcademyDashboard';
import { AcademyOnboarding } from '@/components/academy/AcademyOnboarding';
import { QuizInterface } from '@/components/academy/QuizInterface';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { useQuizEngine } from '@/hooks/useQuizEngine';

const Academy = () => {
  const { progress, isCompleted: isOnboardingCompleted, completeOnboarding } = useAcademyProgress();
  const [activeView, setActiveView] = useState<'dashboard' | 'quiz' | 'onboarding'>('dashboard');
  const [quizType, setQuizType] = useState<'daily' | 'practice'>('daily');

  // Quiz engine
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
    startQuiz,
    resetQuiz
  } = useQuizEngine();

  useEffect(() => {
    // Show onboarding if user hasn't completed it
    if (!isOnboardingCompleted) {
      setActiveView('onboarding');
    }
  }, [isOnboardingCompleted]);

  const handleStartQuiz = (type: 'daily' | 'practice') => {
    setQuizType(type);
    startQuiz(type);
    setActiveView('quiz');
  };

  const handleQuizComplete = () => {
    setActiveView('dashboard');
    resetQuiz();
  };

  const handleOnboardingComplete = (startingLevel: number) => {
    completeOnboarding(startingLevel);
    setActiveView('dashboard');
  };

  if (activeView === 'onboarding') {
    return <AcademyOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (activeView === 'quiz') {
    return (
      <QuizInterface
        question={currentQuestion}
        questionIndex={currentQuestionIndex}
        totalQuestions={quizQuestions.length}
        selectedAnswer={selectedAnswer}
        isComplete={isQuizComplete}
        score={score}
        tokensEarned={tokensEarned}
        quizType={quizType}
        onAnswerSelect={handleAnswerSelect}
        onNextQuestion={handleNextQuestion}
        onComplete={handleQuizComplete}
      />
    );
  }

  return (
    <AcademyDashboard
      progress={progress}
      onStartQuiz={handleStartQuiz}
    />
  );
};

export default Academy;