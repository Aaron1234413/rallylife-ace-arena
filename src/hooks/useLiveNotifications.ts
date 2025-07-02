
import { useState, useEffect, useRef } from 'react';

interface LiveNotification {
  id: string;
  type: 'achievement' | 'level_up' | 'match_win' | 'milestone' | 'challenge_sent' | 'challenge_accepted' | 'challenge_completed';
  player_name: string;
  message: string;
  timestamp: string;
  details?: {
    level?: number;
    xp_earned?: number;
    achievement_name?: string;
    stakes_tokens?: number;
    stakes_premium_tokens?: number;
    challenger_name?: string;
    challenged_name?: string;
    winner_name?: string;
  };
}

export function useLiveNotifications() {
  const [currentNotification, setCurrentNotification] = useState<LiveNotification | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationQueue = useRef<LiveNotification[]>([]);

  const generateNotification = (): LiveNotification => {
    const players = [
      'Alex Johnson', 'Maria Garcia', 'David Chen', 'Sarah Wilson', 'Mike Rodriguez',
      'Emma Thompson', 'James Lee', 'Lisa Anderson', 'Tom Brown', 'Anna Martinez'
    ];

    const notificationTypes = [
      {
        type: 'achievement' as const,
        messages: [
          'unlocked "Ace Master" achievement!',
          'earned "Marathon Player" badge!',
          'achieved "Perfect Form" status!',
          'unlocked "Speed Demon" achievement!'
        ]
      },
      {
        type: 'level_up' as const,
        messages: [
          'reached Level 15!',
          'advanced to Level 22!',
          'leveled up to 18!',
          'hit Level 25!'
        ]
      },
      {
        type: 'match_win' as const,
        messages: [
          'won an epic 3-set match!',
          'dominated in straight sets!',
          'came back from 2 sets down!',
          'won a nail-biting tiebreaker!'
        ]
      },
      {
        type: 'milestone' as const,
        messages: [
          'played their 100th match!',
          'reached 1000 total XP!',
          'completed 50 training sessions!',
          'achieved 10-match win streak!'
        ]
      },
      {
        type: 'challenge_sent' as const,
        messages: [
          'sent an epic challenge!',
          'threw down the gauntlet!',
          'issued a bold challenge!',
          'started a high-stakes duel!'
        ]
      },
      {
        type: 'challenge_accepted' as const,
        messages: [
          'accepted a fierce challenge!',
          'stepped up to the duel!',
          'took on the challenge!',
          'entered the arena!'
        ]
      },
      {
        type: 'challenge_completed' as const,
        messages: [
          'conquered a challenge!',
          'emerged victorious from battle!',
          'claimed victory in their duel!',
          'triumphed in epic combat!'
        ]
      }
    ];

    const selectedType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const player = players[Math.floor(Math.random() * players.length)];
    const message = selectedType.messages[Math.floor(Math.random() * selectedType.messages.length)];

    let details = {};
    if (selectedType.type === 'level_up') {
      details = {
        level: Math.floor(Math.random() * 30) + 15,
        xp_earned: Math.floor(Math.random() * 200) + 100
      };
    } else if (selectedType.type === 'achievement') {
      details = {
        xp_earned: Math.floor(Math.random() * 150) + 50,
        achievement_name: message.split('"')[1]
      };
    } else if (selectedType.type === 'challenge_sent' || selectedType.type === 'challenge_accepted') {
      const otherPlayer = players[Math.floor(Math.random() * players.length)];
      details = {
        challenger_name: player,
        challenged_name: otherPlayer,
        stakes_tokens: Math.floor(Math.random() * 100) + 10
      };
    } else if (selectedType.type === 'challenge_completed') {
      details = {
        winner_name: player,
        stakes_tokens: Math.floor(Math.random() * 200) + 50,
        stakes_premium_tokens: Math.floor(Math.random() * 10) + 1
      };
    }

    return {
      id: `notification-${Date.now()}-${Math.random()}`,
      type: selectedType.type,
      player_name: player,
      message,
      timestamp: new Date().toISOString(),
      details: Object.keys(details).length > 0 ? details : undefined
    };
  };

  const showNextNotification = () => {
    if (notificationQueue.current.length > 0) {
      const nextNotification = notificationQueue.current.shift()!;
      setCurrentNotification(nextNotification);
      setPendingCount(notificationQueue.current.length);

      // Hide notification after 4 seconds
      setTimeout(() => {
        setCurrentNotification(null);
        
        // Show next notification after a brief delay
        setTimeout(showNextNotification, 1000);
      }, 4000);
    }
  };

  const addNotification = (notification: LiveNotification) => {
    notificationQueue.current.push(notification);
    setPendingCount(notificationQueue.current.length);
    
    // If no notification is currently showing, show this one immediately
    if (!currentNotification) {
      showNextNotification();
    }
  };

  useEffect(() => {
    // Generate notifications every 8-15 seconds
    const generateNotifications = () => {
      const notification = generateNotification();
      addNotification(notification);
      
      // Schedule next notification
      const delay = Math.random() * 7000 + 8000; // 8-15 seconds
      intervalRef.current = setTimeout(generateNotifications, delay);
    };

    // Start generating notifications after initial delay
    intervalRef.current = setTimeout(generateNotifications, 3000);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [currentNotification]);

  return {
    currentNotification,
    pendingCount
  };
}
