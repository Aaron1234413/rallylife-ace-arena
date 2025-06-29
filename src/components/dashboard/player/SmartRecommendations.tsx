
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
  const { recommendations: recData } = contextualData;

  // Get contextual status for header
  const getEnergyStatus = () => {
    if (hpPercentage >= 80) return { label: 'High Energy', variant: 'success' };
    if (hpPercentage >= 60) return { label: 'Good Energy', variant: 'info' };
    if (hpPercentage >= 30) return { label: 'Moderate Energy', variant: 'warning' };
    return { label: 'Low Energy', variant: 'error' };
  };

  const getMotivationStatus = () => {
    const motivation = recData?.motivation || 'moderate';
    if (motivation === 'high') return { label: 'High Motivation', variant: 'success' };
    if (motivation === 'moderate') return { label: 'Moderate Motivation', variant: 'info' };
    return { label: 'Low Motivation', variant: 'warning' };
  };

  const energyStatus = getEnergyStatus();
  const motivationStatus = getMotivationStatus();

  if (recommendations.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          {/* Integrated Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-500">
              <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-700 text-lg">AI Smart Recommendations</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                  {energyStatus.label}
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs">
                  {motivationStatus.label}
                </Badge>
              </div>
            </div>
          </div>

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
    <div className="space-y-4">
      {/* Integrated Header with Context */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
          <Sparkles className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">AI Smart Recommendations</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs border-0",
                energyStatus.variant === 'success' && "bg-green-100 text-green-700",
                energyStatus.variant === 'info' && "bg-blue-100 text-blue-700",
                energyStatus.variant === 'warning' && "bg-yellow-100 text-yellow-700",
                energyStatus.variant === 'error' && "bg-red-100 text-red-700"
              )}
            >
              {energyStatus.label}
            </Badge>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs border-0",
                motivationStatus.variant === 'success' && "bg-green-100 text-green-700",
                motivationStatus.variant === 'info' && "bg-blue-100 text-blue-700",
                motivationStatus.variant === 'warning' && "bg-yellow-100 text-yellow-700"
              )}
            >
              {motivationStatus.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Based on your current state - here's what we suggest
          </p>
        </div>
      </div>

      {/* Recommendation Cards */}
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
    </div>
  );
}
