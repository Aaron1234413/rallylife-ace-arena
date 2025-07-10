import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart, Info, Shield, Zap, Users } from 'lucide-react';

interface HPReductionPreviewProps {
  sessionType: 'challenge' | 'social' | 'training';
  userLevel: number;
  currentHP: number;
  estimatedDuration?: number;
  className?: string;
}

export function HPReductionPreview({
  sessionType,
  userLevel,
  currentHP,
  estimatedDuration = 60,
  className
}: HPReductionPreviewProps) {
  // Calculate HP reduction using the same formula as backend
  const calculateHPReduction = (level: number, duration: number, type: string) => {
    if (type === 'social' || type === 'training') return 0;
    
    const baseReduction = Math.floor(duration / 10);
    const levelModifier = (100 - level) / 100;
    return Math.max(1, Math.floor(baseReduction * levelModifier));
  };

  const hpReduction = calculateHPReduction(userLevel, estimatedDuration, sessionType);
  const hpAfter = Math.max(0, currentHP - hpReduction);
  const isLowHP = hpAfter < 20;
  const isInsufficient = currentHP < hpReduction;

  const getSessionTypeInfo = (type: string) => {
    switch (type) {
      case 'challenge':
        return {
          icon: Zap,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          title: 'Challenge Session',
          description: 'Competitive play with HP cost'
        };
      case 'social':
        return {
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Social Play',
          description: 'Casual play with no HP cost'
        };
      case 'training':
        return {
          icon: Shield,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Training Session',
          description: 'Practice with HP rewards'
        };
      default:
        return {
          icon: Heart,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Session',
          description: 'Tennis session'
        };
    }
  };

  const typeInfo = getSessionTypeInfo(sessionType);
  const TypeIcon = typeInfo.icon;

  if (sessionType === 'social' || sessionType === 'training') {
    return (
      <Card className={`${typeInfo.bgColor} ${typeInfo.borderColor} border ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
              <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${typeInfo.color}`}>{typeInfo.title}</h4>
              <p className="text-sm text-muted-foreground">{typeInfo.description}</p>
            </div>
            <Badge variant="outline" className={`${typeInfo.color} ${typeInfo.borderColor}`}>
              {sessionType === 'training' ? 'HP Reward' : 'No HP Cost'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={`${isInsufficient ? 'bg-red-50 border-red-200' : typeInfo.bgColor} border ${typeInfo.borderColor} ${className}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
                  <TypeIcon className={`h-5 w-5 ${typeInfo.color}`} />
                </div>
                <div>
                  <h4 className={`font-medium ${typeInfo.color}`}>{typeInfo.title}</h4>
                  <p className="text-sm text-muted-foreground">Estimated HP impact</p>
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">HP Reduction Formula:</p>
                    <p className="text-sm">Base: {Math.floor(estimatedDuration / 10)} HP (duration ÷ 10)</p>
                    <p className="text-sm">Level modifier: {((100 - userLevel) / 100 * 100).toFixed(0)}% (based on level {userLevel})</p>
                    <p className="text-sm text-muted-foreground">Higher levels reduce HP cost!</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* HP Impact Display */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Current HP</p>
                <div className="flex items-center justify-center gap-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="font-bold text-lg">{currentHP}</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">HP Cost</p>
                <div className="flex items-center justify-center gap-1">
                  <span className={`font-bold text-lg ${isInsufficient ? 'text-red-600' : 'text-orange-600'}`}>
                    -{hpReduction}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">After Session</p>
                <div className="flex items-center justify-center gap-1">
                  <Heart className={`h-4 w-4 ${isLowHP ? 'text-red-500' : 'text-green-500'}`} />
                  <span className={`font-bold text-lg ${isLowHP ? 'text-red-600' : 'text-green-600'}`}>
                    {hpAfter}
                  </span>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {isInsufficient && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">Insufficient HP</p>
                <p className="text-xs text-red-600">
                  You need at least {hpReduction} HP to join this challenge session.
                </p>
              </div>
            )}

            {isLowHP && !isInsufficient && (
              <div className="p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">Low HP Warning</p>
                <p className="text-xs text-yellow-600">
                  Your HP will be low after this session. Consider resting or using HP restoration items.
                </p>
              </div>
            )}

            {/* Level Benefits */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Level {userLevel} Benefits</p>
                  <p className="text-xs text-blue-600">
                    Level {userLevel + 1}: Reduce HP cost to {calculateHPReduction(userLevel + 1, estimatedDuration, sessionType)} HP
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Higher levels = lower HP costs for challenge sessions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}