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

// Color schemes for different post types using design system tokens
export const postTypeColors: Record<string, string> = {
  match: 'bg-blue-100 text-blue-800',
  match_result: 'bg-blue-100 text-blue-800', 
  training: 'bg-tennis-green-subtle text-tennis-green-dark',
  lesson: 'bg-purple-100 text-purple-800',
  social_play: 'bg-pink-100 text-pink-800',
  level_up: 'bg-tennis-yellow-light text-tennis-yellow-dark',
  achievement: 'bg-orange-100 text-orange-800',
  activity: 'bg-tennis-neutral-100 text-tennis-neutral-700'
};

// Badge colors for competitive levels using design system
export const competitiveLevelColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-tennis-green-subtle text-tennis-green-dark', 
  high: 'bg-red-100 text-red-800'
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