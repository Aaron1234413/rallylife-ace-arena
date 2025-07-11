import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Heart, Info, Shield } from 'lucide-react';

interface HPReductionPreviewProps {
  sessionType: 'match' | 'social_play' | 'training';
  playerLevel: number;
  currentHP: number;
  maxHP: number;
  className?: string;
}

// Calculate HP reduction based on player level and session type
function calculateHPReduction(sessionType: string, playerLevel: number): number {
  if (sessionType === 'social_play' || sessionType === 'training') {
    return 0; // No HP loss for social/training sessions
  }
  
  // Match sessions: Base reduction decreases with level
  // Level 1-10: 15-10 HP reduction
  // Level 11-20: 8-5 HP reduction  
  // Level 21+: 5 HP reduction (minimum)
  if (playerLevel <= 10) {
    return Math.max(10, 15 - playerLevel);
  } else if (playerLevel <= 20) {
    return Math.max(5, 8 - Math.floor((playerLevel - 10) / 2));
  } else {
    return 5; // Minimum reduction for high-level players
  }
}

function getLevelBenefitText(playerLevel: number): string {
  if (playerLevel <= 5) {
    return "Level up to reduce HP loss from challenges!";
  } else if (playerLevel <= 10) {
    return "Good progress! Higher levels mean even less HP loss.";
  } else if (playerLevel <= 20) {
    return "Great level! You're taking minimal HP damage.";
  } else {
    return "Master level! Minimal HP impact from challenges.";
  }
}

export function HPReductionPreview({ 
  sessionType, 
  playerLevel, 
  currentHP, 
  maxHP,
  className 
}: HPReductionPreviewProps) {
  const hpReduction = calculateHPReduction(sessionType, playerLevel);
  const hpAfterSession = Math.max(20, currentHP - hpReduction); // Minimum 20 HP
  const hpProgress = (currentHP / maxHP) * 100;
  const hpAfterProgress = (hpAfterSession / maxHP) * 100;
  
  if (sessionType === 'social_play' || sessionType === 'training') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-tennis-green-primary" />
              <span className="font-medium text-tennis-green-dark">No HP Loss</span>
            </div>
            <Badge variant="secondary" className="bg-tennis-green-subtle text-tennis-green-dark">
              Safe Session
            </Badge>
          </div>
          <p className="text-sm text-tennis-green-medium mt-2">
            {sessionType === 'social_play' ? 'Social' : 'Training'} sessions don't reduce your HP. Play worry-free!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-hp-red" />
                <span className="font-medium text-foreground">HP Impact Preview</span>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Challenge sessions reduce HP based on your level. Higher levels = less HP loss!</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* HP Bars */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current HP</span>
                <span className="font-medium">{currentHP}/{maxHP}</span>
              </div>
              
              {/* Current HP Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-hp-red to-hp-red-dark h-2 rounded-full transition-all duration-300"
                  style={{ width: `${hpProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">After session</span>
                <span className="font-medium text-hp-red">
                  {hpAfterSession}/{maxHP} (-{hpReduction} HP)
                </span>
              </div>
              
              {/* After Session HP Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-hp-red/60 to-hp-red-dark/60 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${hpAfterProgress}%` }}
                />
              </div>
            </div>

            {/* Level Benefit Info */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="text-xs">
                  Level {playerLevel}
                </Badge>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">
                    {getLevelBenefitText(playerLevel)}
                  </p>
                  <p className="text-xs text-tennis-green-primary mt-1">
                    💡 Higher levels reduce HP loss from challenges
                  </p>
                </div>
              </div>
            </div>

            {/* Warning if HP is low */}
            {hpAfterSession <= 30 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-xs text-destructive font-medium">
                  ⚠️ Low HP Warning: Your HP will be critically low after this session
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}