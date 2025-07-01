import React, { useState, useEffect } from 'react';
import { AcademyDashboard } from '@/components/academy/AcademyDashboard';
import { AcademyOnboarding } from '@/components/academy/AcademyOnboarding';
import { CampusView } from '@/components/academy/CampusView';
import { CategoryQuiz } from '@/components/academy/CategoryQuiz';
import { DailyDrill } from '@/components/academy/DailyDrill';
import { SocialHub } from '@/components/academy/SocialHub';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';

const Academy = () => {
  const { progress, isCompleted: isOnboardingCompleted, completeOnboarding } = useAcademyProgress();
  const [activeView, setActiveView] = useState<'dashboard' | 'campus' | 'category' | 'drill' | 'social' | 'onboarding'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    // Show onboarding if user hasn't completed it
    if (!isOnboardingCompleted) {
      setActiveView('onboarding');
    }
  }, [isOnboardingCompleted]);

  const handleStartQuiz = (type: 'daily' | 'practice') => {
    if (type === 'daily') {
      setActiveView('drill');
    } else {
      setActiveView('campus');
    }
  };

  const handleBuildingSelect = (category: string) => {
    setSelectedCategory(category);
    setActiveView('category');
  };

  const handleDailyDrill = () => {
    setActiveView('drill');
  };

  const handleOnboardingComplete = (startingLevel: number) => {
    completeOnboarding(startingLevel);
    setActiveView('dashboard');
  };

  const handleBackToCampus = () => {
    setActiveView('campus');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  const handleViewSocial = () => {
    setActiveView('social');
  };

  if (activeView === 'onboarding') {
    return <AcademyOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (activeView === 'social') {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-4">
        <SocialHub className="max-w-4xl mx-auto" />
      </div>
    );
  }

  if (activeView === 'campus') {
    return (
      <CampusView
        progress={progress}
        onBuildingSelect={handleBuildingSelect}
        onDailyDrill={handleDailyDrill}
      />
    );
  }

  if (activeView === 'category' && selectedCategory) {
    return (
      <CategoryQuiz
        category={selectedCategory}
        onBack={handleBackToCampus}
      />
    );
  }

  if (activeView === 'drill') {
    return (
      <DailyDrill
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <AcademyDashboard
      progress={progress}
      onStartQuiz={handleStartQuiz}
      onViewCampus={() => setActiveView('campus')}
      onViewSocial={handleViewSocial}
    />
  );
};

export default Academy;