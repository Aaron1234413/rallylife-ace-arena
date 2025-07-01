
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AcademyProgress {
  current_level: number;
  current_xp: number;
  xp_to_next: number;
  total_xp_earned: number;
  created_at: string;
  updated_at: string;
}

export function useAcademyProgress() {
  const { user } = useAuth();
  const [academyData, setAcademyData] = useState<AcademyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // For Phase 1, we'll use local storage
      // In later phases, this will connect to Supabase
      const savedData = localStorage.getItem(`academy_progress_${user.id}`);
      if (savedData) {
        setAcademyData(JSON.parse(savedData));
      }
      setLoading(false);
    }
  }, [user]);

  const initializeAcademy = () => {
    if (user) {
      const initialData: AcademyProgress = {
        current_level: 1,
        current_xp: 0,
        xp_to_next: 100,
        total_xp_earned: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem(`academy_progress_${user.id}`, JSON.stringify(initialData));
      setAcademyData(initialData);
    }
  };

  const addXP = (amount: number) => {
    if (user && academyData) {
      const newXP = academyData.current_xp + amount;
      const newTotalXP = academyData.total_xp_earned + amount;
      
      // Simple level calculation for Phase 1
      let newLevel = academyData.current_level;
      let xpToNext = academyData.xp_to_next - amount;
      
      if (xpToNext <= 0) {
        newLevel += 1;
        xpToNext = 100; // Reset for next level
      }
      
      const updatedData = {
        ...academyData,
        current_xp: newXP,
        current_level: newLevel,
        xp_to_next: xpToNext,
        total_xp_earned: newTotalXP,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem(`academy_progress_${user.id}`, JSON.stringify(updatedData));
      setAcademyData(updatedData);
    }
  };

  return {
    academyData,
    loading,
    initializeAcademy,
    addXP
  };
}
