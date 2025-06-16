
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface SmartRecommendationsProps {
  hpData: any;
  xpData: any;
  onRecommendationClick: (actionId: string) => void;
}

export function SmartRecommendations({ hpData, xpData, onRecommendationClick }: SmartRecommendationsProps) {
  const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
  
  const getSmartRecommendations = () => {
    const recommendations = [];
    
    // HP-based recommendations
    if (hpPercentage < 30) {
      recommendations.push({
        id: 'rest',
        title: 'Rest & Recovery Needed',
        description: 'Your HP is critically low. Take time to recover.',
        icon: Heart,
        priority: 'high',
        reason: 'Low HP',
        urgency: 'Critical',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      });
    } else if (hpPercentage < 50) {
      recommendations.push({
        id: 'social',
        title: 'Light Activity Recommended',
        description: 'Perfect for social play or light training.',
        icon: Star,
        priority: 'medium',
        reason: 'Moderate HP',
        urgency: 'Suggested',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      });
    } else if (hpPercentage > 80) {
      recommendations.push({
        id: 'match',
        title: 'Ready for Intense Activity',
        description: 'Your HP is high - great time for a match!',
        icon: TrendingUp,
        priority: 'high',
        reason: 'High HP',
        urgency: 'Optimal',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      });
    }
    
    // XP-based recommendations
    if (xpData && xpData.xp_to_next_level < 100) {
      recommendations.push({
        id: 'training',
        title: 'Level Up Opportunity',
        description: `Only ${xpData.xp_to_next_level} XP to next level!`,
        icon: Star,
        priority: 'medium',
        reason: 'Near Level Up',
        urgency: 'Opportunity',
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200'
      });
    }
    
    return recommendations.slice(0, 2); // Show max 2 recommendations
  };

  const recommendations = getSmartRecommendations();

  if (recommendations.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-semibold text-green-700">All Good!</h3>
              <p className="text-sm text-green-600">
                Your stats look great. Choose any activity you enjoy!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const Icon = rec.icon;
        const urgencyIcon = rec.urgency === 'Critical' ? AlertCircle : 
                           rec.urgency === 'Optimal' ? CheckCircle : Clock;
        const UrgencyIcon = urgencyIcon;
        
        return (
          <Card 
            key={rec.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${rec.bgColor} ${rec.borderColor} hover:scale-[1.02]`}
            onClick={() => onRecommendationClick(rec.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${rec.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${rec.textColor}`}>{rec.title}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${rec.bgColor} ${rec.textColor} border-0`}
                    >
                      <UrgencyIcon className="h-3 w-3 mr-1" />
                      {rec.urgency}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Based on: {rec.reason}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
