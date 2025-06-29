
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  Star, 
  Sun,
  Moon,
  Activity,
  Target,
  CheckCircle,
  Sparkles
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
        description: 'Your energy is high - ideal time for skill development',
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
        description: `Low energy (${Math.round(hpPercentage)}% HP) - prioritize recovery first`,
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
        description: 'Peak energy state - perfect for competitive play',
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
        description: `Only ${xpData.xp_to_next_level} XP to level ${xpData.current_level + 1}`,
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
        description: 'Perfect time to connect with friends and unwind',
        icon: Moon,
        color: 'bg-purple-500',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700'
      });
    }
    
    return recommendations.slice(0, 2); // Show max 2 simple recommendations
  };

  const recommendations = getSmartRecommendations();

  // Get contextual status info
  const getContextualStatus = () => {
    const { recommendations: recData } = contextualData;
    const statuses = [];
    
    if (recData.energy) {
      statuses.push({
        label: `${recData.energy} energy`,
        color: recData.energy === 'high' ? 'bg-green-100 text-green-700' : 
               recData.energy === 'low' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
      });
    }
    
    if (recData.motivation) {
      statuses.push({
        label: `${recData.motivation} motivation`,
        color: recData.motivation === 'high' ? 'bg-blue-100 text-blue-700' : 
               recData.motivation === 'low' ? 'bg-gray-100 text-gray-700' : 'bg-purple-100 text-purple-700'
      });
    }
    
    return statuses;
  };

  const contextualStatuses = getContextualStatus();

  if (recommendations.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-green-500" />
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-green-700 text-sm">Perfect Balance!</h3>
              <p className="text-xs text-green-600">
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
      {/* Compact Header with Integrated Status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <h3 className="font-semibold text-gray-900 text-sm">AI Smart Recommendations</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Personalized insights based on your current state
          </p>
        </div>
        
        {/* Contextual Status Badges - Integrated with Header */}
        {contextualStatuses.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {contextualStatuses.map((status, index) => (
              <Badge 
                key={index}
                variant="secondary" 
                className={cn("text-xs px-2 py-1 border-0", status.color)}
              >
                {status.label}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Compact Recommendation Cards */}
      <div className="grid gap-2">
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
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {/* Compact Icon */}
                  <div className={cn("p-2 rounded-lg shrink-0", rec.color)}>
                    <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                  </div>
                  
                  {/* Content Area - Optimized Layout */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className={cn("font-semibold text-sm truncate", rec.textColor)}>
                        {rec.title}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs shrink-0", rec.bgColor, rec.textColor, "border-0")}
                      >
                        AI Insight
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {rec.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
