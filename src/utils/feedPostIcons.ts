import { 
  Trophy, 
  Dumbbell, 
  Users, 
  Heart, 
  Star, 
  Target,
  Activity,
  GraduationCap,
  LucideIcon
} from 'lucide-react';

// Icon mapping for different post types
export const postTypeIcons: Record<string, LucideIcon> = {
  match: Trophy,
  match_result: Trophy,
  training: Dumbbell,
  lesson: GraduationCap,
  social_play: Users,
  level_up: Star,
  achievement: Trophy,
  activity: Activity,
  default: Activity
};

// Color schemes for different post types
export const postTypeColors: Record<string, string> = {
  match: 'bg-blue-100 text-blue-800 border-blue-300',
  match_result: 'bg-blue-100 text-blue-800 border-blue-300',
  training: 'bg-green-100 text-green-800 border-green-300',
  lesson: 'bg-purple-100 text-purple-800 border-purple-300',
  social_play: 'bg-pink-100 text-pink-800 border-pink-300',
  level_up: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  achievement: 'bg-orange-100 text-orange-800 border-orange-300',
  activity: 'bg-gray-100 text-gray-800 border-gray-300'
};

// Badge colors for competitive levels
export const competitiveLevelColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-green-100 text-green-800 border-green-200', 
  high: 'bg-red-100 text-red-800 border-red-200'
};

// Mood emoji mapping
export const moodEmojis: Record<string, string> = {
  'great': '😄',
  'good': '😊',
  'relaxed': '😌',
  'strong': '💪',
  'energized': '🔥',
  'exhausted': '😓',
  'focused': '🤔',
  'determined': '😤'
};

// Helper functions
export const getPostTypeIcon = (type: string): LucideIcon => {
  return postTypeIcons[type] || postTypeIcons.default;
};

export const getPostTypeColor = (type: string): string => {
  return postTypeColors[type] || postTypeColors.activity;
};

export const getCompetitiveLevelText = (level: string): string => {
  switch (level) {
    case 'low': return 'Chill';
    case 'medium': return 'Fun';
    case 'high': return 'Competitive';
    default: return level;
  }
};

export const getMoodEmoji = (mood: string): string => {
  return moodEmojis[mood] || '';
};