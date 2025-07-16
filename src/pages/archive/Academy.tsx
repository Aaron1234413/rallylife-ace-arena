import React, { useState, useEffect } from 'react';
import { AcademyDashboard } from '@/components/academy/AcademyDashboard';
import { AcademyOnboarding } from '@/components/academy/AcademyOnboarding';
import { DailyQuiz } from '@/components/academy/DailyQuiz';
import { useAcademyProgressDB } from '@/hooks/useAcademyProgressDB';

const Academy = () => {
  const { progress, isCompleted: isOnboardingCompleted, isLoading, completeOnboarding } = useAcademyProgressDB();
  const [activeView, setActiveView] = useState<'dashboard' | 'quiz' | 'onboarding'>('dashboard');

  useEffect(() => {
    // Only show onboarding if we're not loading and onboarding is not completed
    if (!isLoading && !isOnboardingCompleted) {
      setActiveView('onboarding');
    } else if (!isLoading && isOnboardingCompleted && activeView === 'onboarding') {
      // If onboarding was completed but we're still on onboarding view, go to dashboard
      setActiveView('dashboard');
    }
  }, [isOnboardingCompleted, isLoading, activeView]);

  const handleStartQuiz = () => {
    setActiveView('quiz');
  };

  const handleOnboardingComplete = (startingLevel: number) => {
    completeOnboarding(startingLevel);
    setActiveView('dashboard');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  // Show loading state while checking onboarding status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-tennis-green-primary rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-xl">🎾</span>
          </div>
          <p className="text-tennis-green-medium">Loading Academy...</p>
        </div>
      </div>
    );
  }

  if (activeView === 'onboarding') {
    return <AcademyOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (activeView === 'quiz') {
    return (
      <DailyQuiz
        onBack={handleBackToDashboard}
        playerLevel={progress?.level}
      />
    );
  }

  // Don't render if no progress data yet
  if (!progress) {
    return (
      <div className="min-h-screen bg-tennis-green-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-tennis-green-primary rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-white text-xl">🎾</span>
          </div>
          <p className="text-tennis-green-medium">Setting up your Academy...</p>
        </div>
      </div>
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