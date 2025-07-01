import React, { useState, useEffect } from 'react';
import { AcademyDashboard } from '@/components/academy/AcademyDashboard';
import { AcademyOnboarding } from '@/components/academy/AcademyOnboarding';
import { CampusView } from '@/components/academy/CampusView';
import { CategoryQuiz } from '@/components/academy/CategoryQuiz';
import { DailyDrill } from '@/components/academy/DailyDrill';
import { SocialHub } from '@/components/academy/SocialHub';
import { TokenMarketplace } from '@/components/academy/TokenMarketplace';
import { PremiumQuizCategories } from '@/components/academy/PremiumQuizCategories';
import { CampusCustomization } from '@/components/academy/CampusCustomization';
import { useAcademyProgressDB } from '@/hooks/useAcademyProgressDB';

const Academy = () => {
  const { progress, isCompleted: isOnboardingCompleted, isLoading, completeOnboarding } = useAcademyProgressDB();
  const [activeView, setActiveView] = useState<'dashboard' | 'campus' | 'category' | 'drill' | 'social' | 'marketplace' | 'premium' | 'customize' | 'onboarding'>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    // Only show onboarding if we're not loading and onboarding is not completed
    if (!isLoading && !isOnboardingCompleted) {
      setActiveView('onboarding');
    } else if (!isLoading && isOnboardingCompleted && activeView === 'onboarding') {
      // If onboarding was completed but we're still on onboarding view, go to dashboard
      setActiveView('dashboard');
    }
  }, [isOnboardingCompleted, isLoading, activeView]);

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

  if (activeView === 'social') {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-4">
        <SocialHub className="max-w-4xl mx-auto" />
      </div>
    );
  }

  if (activeView === 'marketplace') {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-4">
        <TokenMarketplace className="max-w-6xl mx-auto" />
      </div>
    );
  }

  if (activeView === 'premium') {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-4">
        <PremiumQuizCategories className="max-w-6xl mx-auto" />
      </div>
    );
  }

  if (activeView === 'customize') {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-4">
        <CampusCustomization className="max-w-4xl mx-auto" />
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
      onViewCampus={() => setActiveView('campus')}
      onViewSocial={handleViewSocial}
    />
  );
};

export default Academy;