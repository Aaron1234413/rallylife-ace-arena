
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LiveStats {
  matches_today: number;
  active_players: number;
  total_xp_distributed: number;
  achievements_unlocked_today: number;
}

interface RecentActivity {
  id: string;
  type: 'match' | 'achievement' | 'level_up' | 'training';
  player_name: string;
  description: string;
  timestamp: string;
  location?: string;
  xp_earned?: number;
}

interface LiveAchievement {
  id: string;
  player_name: string;
  achievement_name: string;
  achievement_description: string;
  timestamp: string;
  avatar_url?: string;
}

export function useLandingData() {
  const [stats, setStats] = useState<LiveStats>({
    matches_today: 0,
    active_players: 0,
    total_xp_distributed: 0,
    achievements_unlocked_today: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [liveAchievements, setLiveAchievements] = useState<LiveAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const generateLiveStats = (): LiveStats => ({
    matches_today: Math.floor(Math.random() * 30) + 15, // 15-45
    active_players: Math.floor(Math.random() * 200) + 100, // 100-300
    total_xp_distributed: Math.floor(Math.random() * 12000) + 8000, // 8,000-20,000
    achievements_unlocked_today: Math.floor(Math.random() * 23) + 12 // 12-35
  });

  const generateRecentActivity = (): RecentActivity[] => {
    const activities = [
      'completed an intense training session',
      'won a competitive match',
      'unlocked a new achievement',
      'reached a new level',
      'finished a coaching session'
    ];
    
    const players = [
      'Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Wilson', 'Mike Rodriguez',
      'Emma Thompson', 'James Lee', 'Lisa Anderson', 'Tom Brown', 'Anna Martinez'
    ];

    const locations = [
      'New York', 'London', 'Tokyo', 'Sydney', 'Paris', 'Los Angeles', 'Miami', 'Barcelona'
    ];

    return Array.from({ length: 8 }, (_, i) => ({
      id: `activity-${Date.now()}-${i}`,
      type: ['match', 'achievement', 'level_up', 'training'][Math.floor(Math.random() * 4)] as RecentActivity['type'],
      player_name: players[Math.floor(Math.random() * players.length)],
      description: activities[Math.floor(Math.random() * activities.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      location: locations[Math.floor(Math.random() * locations.length)],
      xp_earned: Math.floor(Math.random() * 100) + 25
    }));
  };

  const generateLiveAchievements = (): LiveAchievement[] => {
    const achievements = [
      { name: 'Ace Master', description: 'Hit 10 aces in a single match' },
      { name: 'Marathon Player', description: 'Play for 3 hours straight' },
      { name: 'Perfect Form', description: 'Maintain 90% accuracy for a full set' },
      { name: 'Speed Demon', description: 'Win a match in under 30 minutes' },
      { name: 'Comeback King', description: 'Win after being down 2 sets' }
    ];

    const players = [
      'Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Wilson', 'Mike Rodriguez'
    ];

    return Array.from({ length: 3 }, (_, i) => {
      const achievement = achievements[Math.floor(Math.random() * achievements.length)];
      return {
        id: `achievement-${Date.now()}-${i}`,
        player_name: players[Math.floor(Math.random() * players.length)],
        achievement_name: achievement.name,
        achievement_description: achievement.description,
        timestamp: new Date(Date.now() - Math.random() * 1800000).toISOString()
      };
    });
  };

  // Simulate real-time counter updates
  const simulateCounterUpdates = () => {
    setStats(prev => ({
      matches_today: prev.matches_today + (Math.random() > 0.8 ? 1 : 0), // Occasional match completion
      active_players: prev.active_players + Math.floor(Math.random() * 6) - 3, // Small fluctuations
      total_xp_distributed: prev.total_xp_distributed + Math.floor(Math.random() * 25), // Steady growth
      achievements_unlocked_today: prev.achievements_unlocked_today + (Math.random() > 0.9 ? 1 : 0) // Rare achievement unlocks
    }));
  };

  const refreshData = () => {
    setStats(generateLiveStats());
    setRecentActivity(generateRecentActivity());
    setLiveAchievements(generateLiveAchievements());
  };

  useEffect(() => {
    const loadInitialData = () => {
      console.log('Loading initial landing data...');
      setLoading(true);
      setStats(generateLiveStats());
      setRecentActivity(generateRecentActivity());
      setLiveAchievements(generateLiveAchievements());
      setLoading(false);
      console.log('Initial landing data loaded');
    };

    loadInitialData();

    // Set up real-time updates every 3 seconds
    intervalRef.current = setInterval(() => {
      simulateCounterUpdates();
      
      // Occasionally refresh activity and achievements
      if (Math.random() > 0.7) {
        setRecentActivity(generateRecentActivity());
      }
      if (Math.random() > 0.8) {
        setLiveAchievements(generateLiveAchievements());
      }
    }, 3000);

    return () => {
      console.log('🏁 [DATA FLOW] Component unmounting, cleaning up');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    stats,
    recentActivity,
    liveAchievements,
    loading,
    refreshData
  };
}
