
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { AcademyDashboard } from '@/components/academy/AcademyDashboard';
import { QuizInterface } from '@/components/academy/QuizInterface';
import { AcademyOnboarding } from '@/components/academy/AcademyOnboarding';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import ErrorBoundary from '@/components/ErrorBoundary';

export type AcademyView = 'dashboard' | 'quiz' | 'onboarding';

const Academy = () => {
  const { user } = useAuth();
  const { tokenData } = usePlayerTokens();
  const { academyData, loading, initializeAcademy } = useAcademyProgress();
  const [currentView, setCurrentView] = useState<AcademyView>('dashboard');

  useEffect(() => {
    if (user && !academyData && !loading) {
      // Check if user needs onboarding
      setCurrentView('onboarding');
    }
  }, [user, academyData, loading]);

  const handleOnboardingComplete = () => {
    setCurrentView('dashboard');
    initializeAcademy();
  };

  const handleStartQuiz = (category?: string) => {
    setCurrentView('quiz');
  };

  const handleQuizComplete = () => {
    setCurrentView('dashboard');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-tennis-green-dark mb-4">RAKO Academy</h2>
          <p className="text-gray-700 mb-4">Please log in to access the Academy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg">
      <ErrorBoundary fallbackTitle="Academy Error">
        {currentView === 'onboarding' && (
          <AcademyOnboarding onComplete={handleOnboardingComplete} />
        )}
        
        {currentView === 'dashboard' && (
          <AcademyDashboard
            academyData={academyData}
            tokenData={tokenData}
            onStartQuiz={handleStartQuiz}
          />
        )}
        
        {currentView === 'quiz' && (
          <QuizInterface
            onComplete={handleQuizComplete}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </ErrorBoundary>
    </div>
  );
};

export default Academy;
