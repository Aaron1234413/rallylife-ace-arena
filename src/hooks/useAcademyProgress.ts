import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface AcademyProgress {
  level: number;
  levelName: string;
  totalXP: number;
  dailyTokensEarned: number;
  dailyStreak: number;
  quizzesCompleted: number;
  lastActivity: string;
  onboardingCompleted: boolean;
}

const LEVEL_NAMES = [
  '', // 0 index placeholder
  'Rookie',
  'Court Cadet', 
  'Baseline Scholar',
  'Net Navigator',
  'Serve Specialist',
  'Rally Expert',
  'Tennis Master'
];

export function useAcademyProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<AcademyProgress>({
    level: 1,
    levelName: 'Rookie',
    totalXP: 0,
    dailyTokensEarned: 0,
    dailyStreak: 0,
    quizzesCompleted: 0,
    lastActivity: new Date().toISOString(),
    onboardingCompleted: false
  });

  const getStorageKey = (key: string) => `academy_${user?.id}_${key}`;

  // Load progress from localStorage
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(getStorageKey('progress'));
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        setProgress({
          ...parsed,
          levelName: LEVEL_NAMES[parsed.level] || 'Rookie'
        });
      }
    }
  }, [user]);

  // Save progress to localStorage
  const saveProgress = (newProgress: AcademyProgress) => {
    if (user) {
      localStorage.setItem(getStorageKey('progress'), JSON.stringify(newProgress));
      setProgress(newProgress);
    }
  };

  const completeOnboarding = (startingLevel: number) => {
    const newProgress = {
      ...progress,
      level: startingLevel,
      levelName: LEVEL_NAMES[startingLevel] || 'Rookie',
      totalXP: (startingLevel - 1) * 100,
      onboardingCompleted: true,
      lastActivity: new Date().toISOString()
    };
    saveProgress(newProgress);
  };

  const addXP = (amount: number) => {
    const newTotalXP = progress.totalXP + amount;
    const newLevel = Math.min(7, Math.floor(newTotalXP / 100) + 1);
    
    const newProgress = {
      ...progress,
      totalXP: newTotalXP,
      level: newLevel,
      levelName: LEVEL_NAMES[newLevel] || 'Tennis Master',
      lastActivity: new Date().toISOString()
    };
    saveProgress(newProgress);
  };

  const completeQuiz = (tokensEarned: number, xpEarned: number) => {
    const today = new Date().toDateString();
    const lastActivityDate = new Date(progress.lastActivity).toDateString();
    
    // Reset daily tokens if it's a new day
    let newDailyTokens = progress.dailyTokensEarned;
    let newStreak = progress.dailyStreak;
    
    if (today !== lastActivityDate) {
      newDailyTokens = 0;
      // Calculate streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = yesterday.toDateString() === lastActivityDate;
      newStreak = wasYesterday ? progress.dailyStreak + 1 : 1;
    }

    newDailyTokens = Math.min(10, newDailyTokens + tokensEarned);

    const newProgress = {
      ...progress,
      dailyTokensEarned: newDailyTokens,
      dailyStreak: newStreak,
      quizzesCompleted: progress.quizzesCompleted + 1,
      lastActivity: new Date().toISOString()
    };
    
    saveProgress(newProgress);
    addXP(xpEarned);
  };

  const resetDailyProgress = () => {
    const newProgress = {
      ...progress,
      dailyTokensEarned: 0
    };
    saveProgress(newProgress);
  };

  return {
    progress,
    isCompleted: progress.onboardingCompleted,
    completeOnboarding,
    addXP,
    completeQuiz,
    resetDailyProgress
  };
}