import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Crown, 
  Lock, 
  Star, 
  Trophy,
  Target,
  Brain,
  Zap,
  CheckCircle,
  Clock
} from 'lucide-react';

interface PremiumQuizCategory {
  id: string;
  title: string;
  description: string;
  difficulty: 'advanced' | 'professional' | 'expert';
  questionCount: number;
  unlockCost: number;
  isUnlocked: boolean;
  completionRate: number;
  topics: string[];
  rewards: {
    tokens: number;
    xp: number;
    badge?: string;
  };
  estimatedTime: string;
}

interface PremiumQuizCategoriesProps {
  className?: string;
}

// Mock premium quiz categories
const PREMIUM_CATEGORIES: PremiumQuizCategory[] = [
  {
    id: '1',
    title: 'Advanced Strategy & Tactics',
    description: 'Master complex game strategies used by professional players',
    difficulty: 'advanced',
    questionCount: 75,
    unlockCost: 100,
    isUnlocked: true,
    completionRate: 65,
    topics: ['Court positioning', 'Shot selection', 'Mental game', 'Pattern play'],
    rewards: { tokens: 150, xp: 500, badge: 'Strategy Master' },
    estimatedTime: '2-3 hours'
  },
  {
    id: '2',
    title: 'Professional Coaching Insights',
    description: 'Learn decision-making and coaching techniques from the pros',
    difficulty: 'professional',
    questionCount: 50,
    unlockCost: 150,
    isUnlocked: false,
    completionRate: 0,
    topics: ['Player development', 'Training methods', 'Match analysis', 'Psychology'],
    rewards: { tokens: 200, xp: 750, badge: 'Pro Coach' },
    estimatedTime: '1.5-2 hours'
  },
  {
    id: '3',
    title: 'Tournament Knowledge Deep Dive',
    description: 'Master Grand Slam rules, formats, and tournament structures',
    difficulty: 'advanced',
    questionCount: 60,
    unlockCost: 125,
    isUnlocked: true,
    completionRate: 30,
    topics: ['Grand Slams', 'ATP/WTA Tours', 'Ranking systems', 'Tournament formats'],
    rewards: { tokens: 175, xp: 600, badge: 'Tournament Expert' },
    estimatedTime: '2 hours'
  },
  {
    id: '4',
    title: 'Match Analysis & Statistics',
    description: 'Advanced statistical analysis and match breakdown techniques',
    difficulty: 'expert',
    questionCount: 40,
    unlockCost: 200,
    isUnlocked: false,
    completionRate: 0,
    topics: ['Performance metrics', 'Statistical analysis', 'Video breakdown', 'Trend analysis'],
    rewards: { tokens: 250, xp: 1000, badge: 'Analytics Master' },
    estimatedTime: '1-2 hours'
  },
  {
    id: '5',
    title: 'Sports Science & Conditioning',
    description: 'Physical and mental conditioning used by elite players',
    difficulty: 'professional',
    questionCount: 45,
    unlockCost: 175,
    isUnlocked: false,
    completionRate: 0,
    topics: ['Biomechanics', 'Nutrition', 'Recovery', 'Mental training'],
    rewards: { tokens: 225, xp: 850, badge: 'Science Expert' },
    estimatedTime: '1.5 hours'
  },
  {
    id: '6',
    title: 'Historical Champions & Legends',
    description: 'Deep dive into tennis history and legendary players',
    difficulty: 'advanced',
    questionCount: 80,
    unlockCost: 75,
    isUnlocked: true,
    completionRate: 90,
    topics: ['Tennis legends', 'Historic matches', 'Evolution of the game', 'Records'],
    rewards: { tokens: 125, xp: 400, badge: 'History Scholar' },
    estimatedTime: '2.5 hours'
  }
];

const getDifficultyColor = (difficulty: PremiumQuizCategory['difficulty']) => {
  switch (difficulty) {
    case 'advanced':
      return 'text-blue-600 bg-blue-100';
    case 'professional':
      return 'text-purple-600 bg-purple-100';
    case 'expert':
      return 'text-red-600 bg-red-100';
  }
};

const getDifficultyIcon = (difficulty: PremiumQuizCategory['difficulty']) => {
  switch (difficulty) {
    case 'advanced':
      return <Target className="h-4 w-4" />;
    case 'professional':
      return <Crown className="h-4 w-4" />;
    case 'expert':
      return <Brain className="h-4 w-4" />;
  }
};

const UnlockDialog: React.FC<{ category: PremiumQuizCategory; onUnlock: (category: PremiumQuizCategory) => void }> = ({ 
  category, 
  onUnlock 
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button size="sm" className="w-full">
        <Lock className="h-4 w-4 mr-2" />
        Unlock for {category.unlockCost} 🪙
      </Button>
    </DialogTrigger>
    
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Unlock Premium Content
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-tennis-green-dark">{category.title}</h3>
          <p className="text-sm text-tennis-green-medium">{category.description}</p>
        </div>
        
        <div className="bg-tennis-green-bg/20 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tennis-green-medium">Questions:</span>
            <span className="font-medium text-tennis-green-dark">{category.questionCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-tennis-green-medium">Estimated Time:</span>
            <span className="font-medium text-tennis-green-dark">{category.estimatedTime}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-tennis-green-medium">Completion Reward:</span>
            <span className="font-medium text-tennis-green-dark">
              {category.rewards.tokens} 🪙 + {category.rewards.xp} XP
            </span>
          </div>
          {category.rewards.badge && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-tennis-green-medium">Special Badge:</span>
              <Badge className="bg-yellow-100 text-yellow-700">{category.rewards.badge}</Badge>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-tennis-green-dark">Topics Covered:</h4>
          <div className="flex flex-wrap gap-1">
            {category.topics.map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={() => onUnlock(category)}
            className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark"
          >
            Unlock Now
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const CategoryCard: React.FC<{ 
  category: PremiumQuizCategory; 
  onUnlock: (category: PremiumQuizCategory) => void;
  onStart: (category: PremiumQuizCategory) => void;
}> = ({ category, onUnlock, onStart }) => (
  <Card className={`relative transition-all hover:shadow-lg ${
    !category.isUnlocked ? 'opacity-75' : ''
  }`}>
    {!category.isUnlocked && (
      <div className="absolute top-2 right-2 bg-gray-100 p-1 rounded-full">
        <Lock className="h-4 w-4 text-gray-600" />
      </div>
    )}
    
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between mb-2">
        <Badge className={getDifficultyColor(category.difficulty)}>
          <div className="flex items-center gap-1">
            {getDifficultyIcon(category.difficulty)}
            <span className="capitalize">{category.difficulty}</span>
          </div>
        </Badge>
        {category.rewards.badge && (
          <Badge variant="outline" className="text-xs">
            <Trophy className="h-3 w-3 mr-1" />
            Badge
          </Badge>
        )}
      </div>
      
      <CardTitle className="text-lg font-semibold text-tennis-green-dark">
        {category.title}
      </CardTitle>
      <p className="text-sm text-tennis-green-medium">{category.description}</p>
    </CardHeader>
    
    <CardContent className="space-y-4">
      {/* Progress (if unlocked) */}
      {category.isUnlocked && category.completionRate > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-tennis-green-medium">Progress</span>
            <span className="font-medium text-tennis-green-dark">{category.completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-tennis-green-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${category.completionRate}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="font-semibold text-tennis-green-dark">{category.questionCount}</div>
          <div className="text-xs text-tennis-green-medium">Questions</div>
        </div>
        <div>
          <div className="font-semibold text-tennis-green-dark">{category.rewards.tokens}</div>
          <div className="text-xs text-tennis-green-medium">🪙 Reward</div>
        </div>
        <div>
          <div className="font-semibold text-tennis-green-dark">{category.rewards.xp}</div>
          <div className="text-xs text-tennis-green-medium">XP Reward</div>
        </div>
      </div>
      
      {/* Topics */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-tennis-green-dark">Key Topics:</h4>
        <div className="flex flex-wrap gap-1">
          {category.topics.slice(0, 3).map((topic, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {topic}
            </Badge>
          ))}
          {category.topics.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{category.topics.length - 3} more
            </Badge>
          )}
        </div>
      </div>
      
      {/* Action Button */}
      {category.isUnlocked ? (
        <Button 
          onClick={() => onStart(category)}
          className="w-full bg-tennis-green-primary hover:bg-tennis-green-dark"
        >
          {category.completionRate > 0 ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Continue Learning
            </>
          ) : (
            <>
              <Star className="h-4 w-4 mr-2" />
              Start Course
            </>
          )}
        </Button>
      ) : (
        <UnlockDialog category={category} onUnlock={onUnlock} />
      )}
      
      {/* Time Estimate */}
      <div className="flex items-center justify-center gap-1 text-xs text-tennis-green-medium">
        <Clock className="h-3 w-3" />
        <span>{category.estimatedTime}</span>
      </div>
    </CardContent>
  </Card>
);

export const PremiumQuizCategories: React.FC<PremiumQuizCategoriesProps> = ({ className }) => {
  const [categories, setCategories] = useState(PREMIUM_CATEGORIES);

  const handleUnlock = (category: PremiumQuizCategory) => {
    setCategories(prev => prev.map(c => 
      c.id === category.id ? { ...c, isUnlocked: true } : c
    ));
  };

  const handleStart = (category: PremiumQuizCategory) => {
    console.log('Starting premium quiz:', category.title);
    // Here you would navigate to the premium quiz interface
  };

  const unlockedCount = categories.filter(c => c.isUnlocked).length;
  const averageCompletion = Math.round(
    categories.filter(c => c.isUnlocked).reduce((sum, c) => sum + c.completionRate, 0) / 
    Math.max(unlockedCount, 1)
  );

  return (
    <Card className={`bg-white/95 backdrop-blur-sm border-tennis-green-light/20 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6" />
            Premium Quiz Categories
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">{unlockedCount}/{categories.length} unlocked</div>
            <div className="text-xs opacity-75">{averageCompletion}% avg completion</div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard 
              key={category.id} 
              category={category} 
              onUnlock={handleUnlock}
              onStart={handleStart}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};