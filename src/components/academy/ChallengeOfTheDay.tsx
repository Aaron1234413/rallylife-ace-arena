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
import { useDailyChallenge } from '@/hooks/useDailyChallenge';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'technique': return Target;
    case 'strategy': return Lightbulb;
    case 'equipment': return BookOpen;
    case 'knowledge': return BookOpen;
    default: return Target;
  }
};

const getTypeColor = (type: string) => {
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
  const { challenge, isLoading, error, completeChallenge } = useDailyChallenge();
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  const handleCompleteChallenge = async () => {
    if (!challenge || challenge.is_completed) return;
    
    setIsCompleting(true);
    
    try {
      const result = await completeChallenge(challenge.id);
      
      if (result.success) {
        toast({
          title: "🏆 Challenge Complete!",
          description: `+${result.tokens_earned} tokens earned`,
        });
      } else {
        toast({
          title: "Challenge Error",
          description: result.error || "Unable to complete challenge",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error completing challenge:', error);
      toast({
        title: "Error",
        description: "Failed to complete challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={`bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 animate-fade-in ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-tennis-green-medium">Loading today's challenge...</p>
        </CardContent>
      </Card>
    );
  }

  if (!challenge) {
    return (
      <Card className={`bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-tennis-green-medium">No challenge available today</p>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = getTypeIcon(challenge.type);

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
            +{challenge.tokens_reward} tokens
          </div>
          
          <Button
            onClick={handleCompleteChallenge}
            disabled={challenge.is_completed || isCompleting}
            size="sm"
            className={`transition-all duration-300 ${
              challenge.is_completed 
                ? 'bg-green-600 hover:bg-green-600 animate-scale-in' 
                : 'bg-purple-600 hover:bg-purple-700 hover-scale'
            } text-white`}
          >
            {isCompleting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                Completing...
              </>
            ) : challenge.is_completed ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2 animate-scale-in" />
                Completed!
              </>
            ) : (
              challenge.action_text
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