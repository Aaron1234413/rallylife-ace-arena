
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Star, Clock, Zap } from 'lucide-react';

interface ActionButtonProps {
  action: {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    color: string;
    textColor: string;
    bgColor: string;
    rewards: { hp: number; xp: number; tokens: number };
    recommended: boolean;
    estimatedDuration: number;
    difficulty: 'low' | 'medium' | 'high';
  };
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ActionButton({ action, onClick, disabled = false, loading = false }: ActionButtonProps) {
  const Icon = action.icon;
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-l-4 ${action.bgColor} hover:scale-[1.02] ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${loading ? 'animate-pulse' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`p-3 rounded-xl ${action.color} transition-transform duration-200 hover:scale-110`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-900 text-lg">{action.title}</h3>
              {action.recommended && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  ⭐ Recommended
                </Badge>
              )}
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              {action.description}
            </p>
            
            {/* Activity Details */}
            <div className="flex items-center gap-3 mb-3 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-gray-500">{action.estimatedDuration} min</span>
              </div>
              
              <Badge variant="secondary" className={`text-xs ${getDifficultyColor(action.difficulty)}`}>
                {action.difficulty} intensity
              </Badge>
            </div>
            
            {/* Rewards Preview */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {action.rewards.hp !== 0 && (
                <div className="flex items-center gap-1 p-2 bg-red-50 rounded-lg">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span className={`text-xs font-bold ${action.rewards.hp > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {action.rewards.hp > 0 ? '+' : ''}{action.rewards.hp}
                  </span>
                </div>
              )}
              
              {action.rewards.xp > 0 && (
                <div className="flex items-center gap-1 p-2 bg-yellow-50 rounded-lg">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-600">+{action.rewards.xp}</span>
                </div>
              )}
              
              {action.rewards.tokens > 0 && (
                <div className="flex items-center gap-1 p-2 bg-blue-50 rounded-lg">
                  <Zap className="h-3 w-3 text-blue-500" />
                  <span className="text-xs font-bold text-blue-600">+{action.rewards.tokens}</span>
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <Button 
              className={`w-full ${action.color.replace('bg-', 'bg-')} hover:opacity-90 text-white font-semibold`}
              disabled={disabled || loading}
            >
              {loading ? 'Logging...' : `Start ${action.title}`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
