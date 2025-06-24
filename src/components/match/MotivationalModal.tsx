
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Target, TrendingUp } from 'lucide-react';
import { MotivationalPrompt } from '@/services/aiPromptGenerator';
import { TennisAnalysis } from '@/services/tennisScoreAnalyzer';

interface MotivationalModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: MotivationalPrompt;
  tennisAnalysis?: TennisAnalysis;
  onContinue: () => void;
}

export const MotivationalModal: React.FC<MotivationalModalProps> = ({
  isOpen,
  onClose,
  prompt,
  tennisAnalysis,
  onContinue
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };
  
  const getToneIcon = (tone: string) => {
    switch (tone) {
      case 'motivating': return <Zap className="h-5 w-5" />;
      case 'encouraging': return <TrendingUp className="h-5 w-5" />;
      case 'celebratory': return <Target className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getActiveBonuses = (analysis?: TennisAnalysis) => {
    if (!analysis) return [];
    
    const bonuses = [];
    if (analysis.doubleBreakBonus) bonuses.push({ name: 'Double Break', bonus: '+50%' });
    if (analysis.comebackBonus) bonuses.push({ name: 'Comeback', bonus: '+30%' });
    if (analysis.clutchBonus) bonuses.push({ name: 'Clutch', bonus: '2x' });
    
    return bonuses;
  };

  const activeBonuses = getActiveBonuses(tennisAnalysis);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {getToneIcon(prompt.tone)}
            <span>{prompt.title}</span>
            <span className="text-2xl">{prompt.emoji}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Urgency Badge */}
          <div className="flex justify-center">
            <Badge variant="outline" className={getUrgencyColor(prompt.urgency)}>
              {prompt.urgency.toUpperCase()} STAKES
            </Badge>
          </div>
          
          {/* Main Message */}
          <div className="bg-gradient-to-r from-tennis-green-light/10 to-tennis-green-dark/10 rounded-lg p-4 text-center">
            <p className="text-base font-medium text-gray-900 leading-relaxed">
              {prompt.message}
            </p>
          </div>
          
          {/* Active Bonuses */}
          {activeBonuses.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 text-center">Active Bonuses:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                {activeBonuses.map((bonus, index) => (
                  <Badge 
                    key={index}
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-green-200"
                  >
                    {bonus.name} {bonus.bonus}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Tennis Analysis Description */}
          {tennisAnalysis?.description && tennisAnalysis.description !== 'Standard Match' && (
            <div className="text-center">
              <Badge variant="outline" className="bg-tennis-green-light/20 text-tennis-green-dark">
                {tennisAnalysis.description}
              </Badge>
            </div>
          )}
          
          {/* Continue Button */}
          <Button
            onClick={() => {
              onContinue();
              onClose();
            }}
            className="w-full h-12 text-lg bg-tennis-green-dark hover:bg-tennis-green text-white font-semibold"
          >
            Let's Go! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
