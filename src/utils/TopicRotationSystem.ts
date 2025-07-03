// Topic Rotation System for Daily Quizzes

export interface DailyTopic {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const DAILY_TOPICS: DailyTopic[] = [
  {
    id: 'rules',
    name: 'Court Rules & Regulations',
    description: 'Learn the official rules of tennis',
    icon: '⚖️',
    color: 'blue'
  },
  {
    id: 'serving',
    name: 'Serving Techniques',
    description: 'Master your serve fundamentals',
    icon: '🎾',
    color: 'green'
  },
  {
    id: 'history',
    name: 'Tennis History & Champions',
    description: 'Discover tennis legends and milestones',
    icon: '🏆',
    color: 'yellow'
  },
  {
    id: 'equipment',
    name: 'Equipment & Gear',
    description: 'Everything about rackets, balls, and gear',
    icon: '🏸',
    color: 'purple'
  },
  {
    id: 'strategy',
    name: 'Strategy & Tactics',
    description: 'Outsmart your opponents with tactics',
    icon: '🧠',
    color: 'red'
  },
  {
    id: 'mixed',
    name: 'Mixed Topics',
    description: 'A variety of tennis knowledge',
    icon: '🎲',
    color: 'indigo'
  },
  {
    id: 'trivia',
    name: 'Fun Facts & Trivia',
    description: 'Surprising and entertaining tennis facts',
    icon: '✨',
    color: 'pink'
  }
];

/**
 * Get today's topic based on the day of the week
 */
export function getTodaysTopic(): DailyTopic {
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Map days to topics (Monday = 1, Sunday = 0)
  const topicMap = {
    1: 'rules',      // Monday
    2: 'serving',    // Tuesday
    3: 'history',    // Wednesday
    4: 'equipment',  // Thursday
    5: 'strategy',   // Friday
    6: 'mixed',      // Saturday
    0: 'trivia'      // Sunday
  };
  
  const topicId = topicMap[dayOfWeek as keyof typeof topicMap];
  return DAILY_TOPICS.find(topic => topic.id === topicId) || DAILY_TOPICS[0];
}

/**
 * Get topic by ID
 */
export function getTopicById(topicId: string): DailyTopic | undefined {
  return DAILY_TOPICS.find(topic => topic.id === topicId);
}

/**
 * Get the next few days' topics
 */
export function getUpcomingTopics(days: number = 7): { day: string; topic: DailyTopic }[] {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    const dayOfWeek = date.getDay();
    const topicMap = {
      1: 'rules', 2: 'serving', 3: 'history', 4: 'equipment',
      5: 'strategy', 6: 'mixed', 0: 'trivia'
    };
    
    const topicId = topicMap[dayOfWeek as keyof typeof topicMap];
    const topic = DAILY_TOPICS.find(t => t.id === topicId) || DAILY_TOPICS[0];
    
    result.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      topic
    });
  }
  
  return result;
}