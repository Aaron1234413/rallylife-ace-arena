import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target,
  BookOpen,
  Lightbulb,
  CheckCircle,
  Coins
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'technique' | 'strategy' | 'equipment' | 'knowledge';
  content: string;
  actionText: string;
  tokensReward: number;
  isCompleted: boolean;
}

// Daily challenge rotation based on day of week
const getDailyChallenge = (): DailyChallenge => {
  const dayOfWeek = new Date().getDay();
  const challenges: DailyChallenge[] = [
    {
      id: 'sunday',
      title: 'Court Positioning Awareness',
      description: 'Learn optimal court positioning for different shot scenarios',
      type: 'strategy',
      content: 'Position yourself 2-3 feet behind the baseline for groundstrokes. Move forward when your opponent hits short balls. Practice the "split step" before your opponent makes contact with the ball.',
      actionText: 'Practice Split Step',
      tokensReward: 3,
      isCompleted: false
    },
    {
      id: 'monday',
      title: 'Proper Grip Technique',
      description: 'Master the fundamentals of tennis grips',
      type: 'technique',
      content: 'Eastern forehand grip: Place your hand flat against the strings, then slide down to the handle. Your knuckle should align with the 3rd bevel. Practice switching between forehand and backhand grips.',
      actionText: 'Practice Grip Change',
      tokensReward: 3,
      isCompleted: false
    },
    {
      id: 'tuesday',
      title: 'Equipment Knowledge',
      description: 'Understanding tennis ball types and their characteristics',
      type: 'equipment',
      content: 'Regular duty balls: Best for hard courts and indoor play. Extra duty balls: Designed for outdoor hard courts with thicker felt. Clay court balls: Have less felt and bounce differently.',
      actionText: 'Identify Ball Type',
      tokensReward: 3,
      isCompleted: false
    },
    {
      id: 'wednesday',
      title: 'Mental Game Strategy',
      description: 'Develop focus and concentration techniques',
      type: 'strategy',
      content: 'Use the "reset routine" between points: Take deep breaths, visualize your next shot, and use positive self-talk. Stay present and focus on one point at a time.',
      actionText: 'Practice Reset Routine',
      tokensReward: 3,
      isCompleted: false
    },
    {
      id: 'thursday',
      title: 'Footwork Fundamentals',
      description: 'Master basic tennis footwork patterns',
      type: 'technique',
      content: 'Side shuffle: Keep feet parallel, step to the side without crossing legs. Cross-over step: For longer distances, cross your outside leg over. Always recover to center court after each shot.',
      actionText: 'Practice Footwork',
      tokensReward: 3,
      isCompleted: false
    },
    {
      id: 'friday',
      title: 'Match Strategy Basics',
      description: 'Learn to read your opponent and adapt your game',
      type: 'strategy',
      content: 'Observe your opponent\'s weaknesses in the first few games. Hit to their backhand if it\'s weaker. Use variety - mix up pace, spin, and placement to keep them guessing.',
      actionText: 'Study Strategy',
      tokensReward: 3,
      isCompleted: false
    },
    {
      id: 'saturday',
      title: 'Tennis History Insight',
      description: 'Learn about tennis legends and their techniques',
      type: 'knowledge',
      content: 'Steffi Graf\'s forehand was legendary due to her perfect timing and follow-through. She used topspin to create sharp angles and hit winners from defensive positions. Study how pros generate topspin.',
      actionText: 'Learn About Legends',
      tokensReward: 3,
      isCompleted: false
    }
  ];
  
  return challenges[dayOfWeek];
};

const getTypeIcon = (type: DailyChallenge['type']) => {
  switch (type) {
    case 'technique': return Target;
    case 'strategy': return Lightbulb;
    case 'equipment': return BookOpen;
    case 'knowledge': return BookOpen;
    default: return Target;
  }
};

const getTypeColor = (type: DailyChallenge['type']) => {
  switch (type) {
    case 'technique': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'strategy': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'equipment': return 'bg-green-100 text-green-800 border-green-300';
    case 'knowledge': return 'bg-orange-100 text-orange-800 border-orange-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

interface ChallengeOfTheDayProps {
  className?: string;
}

export const ChallengeOfTheDay: React.FC<ChallengeOfTheDayProps> = ({ className = '' }) => {
  const [challenge, setChallenge] = useState(getDailyChallenge());
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  const IconComponent = getTypeIcon(challenge.type);

  const handleCompleteChallenge = async () => {
    setIsCompleting(true);
    
    // Simulate API call
    setTimeout(() => {
      setChallenge(prev => ({ ...prev, isCompleted: true }));
      setIsCompleting(false);
      
      toast({
        title: "🏆 Challenge Complete!",
        description: `+${challenge.tokensReward} tokens earned`,
      });
    }, 1000);
  };

  return (
    <Card className={`bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover-scale transition-all duration-300 animate-fade-in ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <IconComponent className="h-5 w-5 text-purple-600" />
            Challenge of the Day
          </CardTitle>
          <Badge className={getTypeColor(challenge.type)}>
            {challenge.type.charAt(0).toUpperCase() + challenge.type.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Challenge Title */}
        <div>
          <h3 className="font-semibold text-tennis-green-dark mb-1">{challenge.title}</h3>
          <p className="text-sm text-tennis-green-medium">{challenge.description}</p>
        </div>

        {/* Challenge Content */}
        <div className="bg-white/80 rounded-lg p-3 border border-purple-100">
          <p className="text-sm text-tennis-green-dark leading-relaxed">
            {challenge.content}
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
            <Coins className="h-4 w-4" />
            +{challenge.tokensReward} tokens
          </div>
          
          <Button
            onClick={handleCompleteChallenge}
            disabled={challenge.isCompleted || isCompleting}
            size="sm"
            className={`transition-all duration-300 ${
              challenge.isCompleted 
                ? 'bg-green-600 hover:bg-green-600 animate-scale-in' 
                : 'bg-purple-600 hover:bg-purple-700 hover-scale'
            } text-white`}
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                Completing...
              </>
            ) : challenge.isCompleted ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 animate-scale-in" />
                Completed!
              </>
            ) : (
              challenge.actionText
            )}
          </Button>
        </div>

        {/* Progress Tip */}
        <div className="text-center text-xs text-tennis-green-medium bg-purple-50 rounded-lg p-2">
          💡 Daily challenges help you learn tennis fundamentals step by step!
        </div>
      </CardContent>
    </Card>
  );
};