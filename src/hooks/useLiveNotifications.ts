
import { useState, useEffect, useRef } from 'react';

interface LiveNotification {
  id: string;
  type: 'achievement' | 'level_up' | 'match_win' | 'milestone';
  player_name: string;
  message: string;
  timestamp: string;
  avatar_url?: string;
  details?: {
    level?: number;
    achievement_name?: string;
    xp_earned?: number;
    match_score?: string;
  };
}

export function useLiveNotifications() {
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<LiveNotification | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const generateNotification = (): LiveNotification => {
    const types: LiveNotification['type'][] = ['achievement', 'level_up', 'match_win', 'milestone'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const playerNames = [
      'Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Wilson', 'Mike Rodriguez',
      'Emma Thompson', 'James Lee', 'Lisa Anderson', 'Tom Brown', 'Anna Martinez'
    ];
    
    const playerName = playerNames[Math.floor(Math.random() * playerNames.length)];
    
    const messages = {
      achievement: [
        'unlocked "Ace Master" achievement!',
        'earned "Perfect Form" badge!',
        'achieved "Speed Demon" status!',
        'unlocked "Consistency King" achievement!'
      ],
      level_up: [
        'reached Level 15!',
        'leveled up to Level 22!',
        'advanced to Level 8!',
        'achieved Level 30!'
      ],
      match_win: [
        'won an epic 3-set match!',
        'dominated 6-2, 6-1!',
        'clinched victory 7-5, 6-3!',
        'crushed opponent 6-0, 6-1!'
      ],
      milestone: [
        'played their 100th match!',
        'earned 10,000 XP total!',
        'completed 50 training sessions!',
        'reached 1,000 hours played!'
      ]
    };

    const message = messages[type][Math.floor(Math.random() * messages[type].length)];

    return {
      id: `notification-${Date.now()}-${Math.random()}`,
      type,
      player_name: playerName,
      message,
      timestamp: new Date().toISOString(),
      details: type === 'level_up' ? {
        level: Math.floor(Math.random() * 30) + 1,
        xp_earned: Math.floor(Math.random() * 500) + 100
      } : type === 'achievement' ? {
        achievement_name: message.split('"')[1]
      } : undefined
    };
  };

  const showNextNotification = () => {
    if (notifications.length > 0) {
      const [next, ...rest] = notifications;
      setCurrentNotification(next);
      setNotifications(rest);

      // Hide notification after 4 seconds
      notificationTimeoutRef.current = setTimeout(() => {
        setCurrentNotification(null);
      }, 4000);
    }
  };

  useEffect(() => {
    // Generate initial notifications
    const initialNotifications = Array.from({ length: 5 }, generateNotification);
    setNotifications(initialNotifications);

    // Add new notifications every 6-10 seconds
    intervalRef.current = setInterval(() => {
      const newNotification = generateNotification();
      setNotifications(prev => [...prev, newNotification]);
    }, Math.random() * 4000 + 6000); // 6-10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Show notification if one is available and none is currently showing
    if (!currentNotification && notifications.length > 0) {
      const timer = setTimeout(showNextNotification, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentNotification, notifications]);

  return {
    currentNotification,
    pendingCount: notifications.length
  };
}
