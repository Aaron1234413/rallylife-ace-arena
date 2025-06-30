
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  Sun,
  Moon,
  Activity,
  Target,
  CheckCircle
} from 'lucide-react';

interface SmartRecommendationsProps {
  hpData: any;
  xpData: any;
  contextualData: any;
  onRecommendationClick: (actionId: string) => void;
}

export function SmartRecommendations({ 
  hpData, 
  xpData, 
  contextualData, 
  onRecommendationClick 
}: SmartRecommendationsProps) {
  const hpPercentage = hpData ? (hpData.current_hp / hpData.max_hp) * 100 : 0;
  
  const getSmartRecommendations = () => {
    const recommendations = [];
    const { timeOfDay, activity, playerState, recommendations: recData } = contextualData;
    
    // Simplified recommendations - max 2, clear and actionable
    if (timeOfDay.isEarlyMorning && hpPercentage > 60) {
      recommendations.push({
        id: 'training',
        title: 'Perfect Morning Training',
        description: 'High energy - ideal for skill development',
        icon: Sun,
        color: 'bg-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700'
      });
    }
    
    if (hpPercentage < 30) {
      recommendations.push({
        id: 'rest',
        title: 'Recovery Needed',
        description: `Low energy (${Math.round(hpPercentage)}%) - prioritize recovery`,
        icon: Heart,
        color: 'bg-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700'
      });
    } else if (hpPercentage > 80 && recData.energy === 'high') {
      recommendations.push({
        id: 'match',
        title: 'High-Energy Challenge',
        description: 'Peak state - perfect for competitive play',
        icon: Activity,
        color: 'bg-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-700'
      });
    }
    
    if (xpData && xpData.xp_to_next_level < 100) {
      recommendations.push({
        id: 'training',
        title: 'Level Up Opportunity',
        description: `${xpData.xp_to_next_level} XP to level ${xpData.current_level + 1}`,
        icon: Target,
        color: 'bg-blue-500',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700'
      });
    }
    
    if (timeOfDay.isEvening && hpPercentage > 40) {
      recommendations.push({
        id: 'social',
        title: 'Evening Social Play',
        description: 'Perfect time to connect and unwind',
        icon: Moon,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      });
    }
    
    return recommendations.slice(0, 2);
  };

  const recommendations = getSmartRecommendations();

  if (recommendations.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h4 className="font-semibold text-green-700">Perfect Balance!</h4>
              <p className="text-sm text-green-600">
                Your stats look great. Choose any activity that inspires you!
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
        
        return (
          <Card 
            key={rec.id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01]",
              "border-l-4", rec.bgColor, rec.borderColor
            )}
            onClick={() => onRecommendationClick(rec.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", rec.color)}>
                  <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                </div>
                
                <div className="flex-1">
                  <h4 className={cn("font-semibold mb-1", rec.textColor)}>
                    {rec.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {rec.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
