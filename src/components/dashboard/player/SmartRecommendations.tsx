
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Star, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Moon,
  Sun,
  Activity,
  Target
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
    
    // Time-based recommendations
    if (timeOfDay.isEarlyMorning && hpPercentage > 60) {
      recommendations.push({
        id: 'training',
        title: 'Perfect Morning Training',
        description: 'Early morning is ideal for skill development and focus',
        icon: Sun,
        priority: 'high',
        reason: 'Optimal morning timing',
        urgency: 'Recommended',
        color: 'bg-orange-500',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        contextual: 'Morning energy peak detected'
      });
    }
    
    if (timeOfDay.isEvening && hpPercentage > 50) {
      recommendations.push({
        id: 'social',
        title: 'Evening Social Play',
        description: 'Perfect time to connect with friends and unwind',
        icon: Moon,
        priority: 'medium',
        reason: 'Evening social timing',
        urgency: 'Social Hour',
        color: 'bg-purple-500',
        textColor: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        contextual: 'Ideal social connection time'
      });
    }

    // HP-based contextual recommendations
    if (hpPercentage < 30) {
      recommendations.push({
        id: 'rest',
        title: 'Immediate Recovery Needed',
        description: `Your HP is at ${Math.round(hpPercentage)}% - prioritize recovery activities`,
        icon: Heart,
        priority: 'high',
        reason: 'Critical HP Level',
        urgency: 'Urgent',
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        contextual: 'Recovery essential for wellbeing'
      });
    } else if (hpPercentage < 50 && activity.hoursSinceLastActivity > 8) {
      recommendations.push({
        id: 'social',
        title: 'Light Social Activity',
        description: 'Low-impact activity perfect for your current energy level',
        icon: Activity,
        priority: 'medium',
        reason: 'Moderate HP + Recovery Time',
        urgency: 'Balanced',
        color: 'bg-blue-500',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        contextual: 'Gentle return to activity'
      });
    } else if (hpPercentage > 80 && recData.energy === 'high') {
      recommendations.push({
        id: 'match',
        title: 'High-Energy Challenge',
        description: 'Your energy is peak - perfect for competitive play!',
        icon: Zap,
        priority: 'high',
        reason: 'Peak Energy State',
        urgency: 'Optimal',
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        contextual: 'Maximum performance window'
      });
    }
    
    // XP and progression recommendations
    if (xpData && xpData.xp_to_next_level < 100) {
      recommendations.push({
        id: 'training',
        title: 'Level Up Opportunity',
        description: `Only ${xpData.xp_to_next_level} XP to level ${xpData.current_level + 1}!`,
        icon: Target,
        priority: 'high',
        reason: 'Near Level Up',
        urgency: 'Achievement Ready',
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        contextual: 'Progress milestone within reach'
      });
    }

    // Activity pattern recommendations
    if (activity.isActiveStreak && recData.motivation === 'high') {
      recommendations.push({
        id: 'match',
        title: 'Maintain Your Streak',
        description: `${activity.recentActivityCount} activities this week - keep it going!`,
        icon: TrendingUp,
        priority: 'medium',
        reason: 'Active Streak',
        urgency: 'Momentum',
        color: 'bg-indigo-500',
        textColor: 'text-indigo-700',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        contextual: 'Consistency breeds excellence'
      });
    } else if (activity.hoursSinceLastActivity > 48) {
      recommendations.push({
        id: 'social',
        title: 'Gentle Return to Activity',
        description: 'Its been a while - start with something enjoyable and social',
        icon: Heart,
        priority: 'medium',
        reason: 'Activity Gap',
        urgency: 'Comeback',
        color: 'bg-pink-500',
        textColor: 'text-pink-700',
        bgColor: 'bg-pink-50',
        borderColor: 'border-pink-200',
        contextual: 'Ease back into your routine'
      });
    }
    
    return recommendations.slice(0, 2); // Show max 2 contextual recommendations
  };

  const recommendations = getSmartRecommendations();

  if (recommendations.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <h3 className="font-semibold text-green-700">Perfect Balance!</h3>
              <p className="text-sm text-green-600">
                Your stats and timing look great. Choose any activity that inspires you!
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
        const urgencyIcon = rec.urgency === 'Urgent' ? AlertCircle : 
                           rec.urgency === 'Optimal' ? CheckCircle : 
                           rec.urgency === 'Achievement Ready' ? Star :
                           Clock;
        const UrgencyIcon = urgencyIcon;
        
        return (
          <Card 
            key={rec.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-l-4 ${rec.bgColor} ${rec.borderColor} group`}
            onClick={() => onRecommendationClick(rec.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${rec.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold ${rec.textColor} group-hover:text-gray-900 transition-colors`}>
                      {rec.title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${rec.bgColor} ${rec.textColor} border-0 group-hover:scale-105 transition-transform`}
                    >
                      <UrgencyIcon className="h-3 w-3 mr-1" />
                      {rec.urgency}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 group-hover:text-gray-700 transition-colors">
                    {rec.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Based on: {rec.reason}</span>
                    <span className={`font-medium ${rec.textColor} opacity-75`}>
                      {rec.contextual}
                    </span>
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
