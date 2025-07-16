import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  HelpCircle, 
  Zap, 
  Eye, 
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useToast } from '@/hooks/use-toast';

interface Hint {
  id: string;
  content: string;
  type: 'elimination' | 'explanation' | 'strategy' | 'fact';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface HintSystemProps {
  questionId: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
  isRevealed?: boolean;
  className?: string;
}

// Mock hint generation based on question
const generateHints = (questionText: string, options: string[], correctAnswer: number): Hint[] => {
  const hints: Hint[] = [];
  
  // Elimination hint - eliminates 1-2 wrong answers
  const wrongOptions = options
    .map((option, index) => ({ option, index }))
    .filter(({ index }) => index !== correctAnswer);
  
  if (wrongOptions.length >= 2) {
    const toEliminate = wrongOptions.slice(0, 2);
    hints.push({
      id: 'elimination',
      content: `You can eliminate these options: "${toEliminate[0].option}" and "${toEliminate[1].option}" as they are clearly incorrect.`,
      type: 'elimination',
      difficulty: 'easy'
    });
  }
  
  // Explanation hint - provides context
  hints.push({
    id: 'explanation',
    content: `Think about the fundamental concepts behind this question. Consider what you know about tennis rules and regulations.`,
    type: 'explanation',
    difficulty: 'medium'
  });
  
  // Strategy hint - gives strategic thinking
  hints.push({
    id: 'strategy',
    content: `When approaching this type of question, focus on the specific terminology and official standards mentioned.`,
    type: 'strategy',
    difficulty: 'medium'
  });
  
  // Fact hint - provides related fact
  hints.push({
    id: 'fact',
    content: `Remember that tennis specifications are standardized by the International Tennis Federation (ITF).`,
    type: 'fact',
    difficulty: 'hard'
  });
  
  return hints;
};

const getHintIcon = (type: Hint['type']) => {
  switch (type) {
    case 'elimination':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'explanation':
      return <Lightbulb className="h-4 w-4 text-yellow-500" />;
    case 'strategy':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    case 'fact':
      return <Eye className="h-4 w-4 text-purple-500" />;
  }
};

const getHintTypeColor = (type: Hint['type']) => {
  switch (type) {
    case 'elimination':
      return 'bg-red-50 border-red-200 text-red-700';
    case 'explanation':
      return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    case 'strategy':
      return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'fact':
      return 'bg-purple-50 border-purple-200 text-purple-700';
  }
};

const HintDialog: React.FC<{ 
  hint: Hint; 
  onReveal: (hint: Hint) => void; 
  isRevealed: boolean;
  tokenCost: number;
}> = ({ hint, onReveal, isRevealed, tokenCost }) => {
  const { regularTokens } = usePlayerTokens();
  const canAfford = regularTokens >= tokenCost;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          disabled={isRevealed || !canAfford}
        >
          {getHintIcon(hint.type)}
          <span className="capitalize">{hint.type}</span>
          {!isRevealed && (
            <Badge variant="secondary" className="ml-1">
              {tokenCost} 🪙
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {isRevealed ? 'Hint Revealed' : 'Purchase Hint'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isRevealed ? (
            <Card className={`border-2 ${getHintTypeColor(hint.type)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getHintIcon(hint.type)}
                  <div>
                    <h4 className="font-medium capitalize mb-2">{hint.type} Hint</h4>
                    <p className="text-sm">{hint.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  {getHintIcon(hint.type)}
                </div>
                <h3 className="text-lg font-semibold text-tennis-green-dark capitalize">
                  {hint.type} Hint
                </h3>
                <p className="text-sm text-tennis-green-medium">
                  Get a helpful {hint.type} tip for this question
                </p>
              </div>
              
              <div className="bg-tennis-green-bg/20 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-tennis-green-dark">Cost:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-tennis-green-dark">{tokenCost}</span>
                    <span className="text-lg">🪙</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tennis-green-medium">Your balance:</span>
                  <span className={`font-medium ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                    {regularTokens} 🪙
                  </span>
                </div>
              </div>
              
              {!canAfford && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                  <p className="text-sm text-red-700">
                    Insufficient tokens. You need {tokenCost - regularTokens} more tokens to purchase this hint.
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => onReveal(hint)}
                  className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark"
                  disabled={!canAfford}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Purchase Hint
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const HintSystem: React.FC<HintSystemProps> = ({
  questionId,
  questionText,
  options,
  correctAnswer,
  isRevealed = false,
  className
}) => {
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const hints = generateHints(questionText, options, correctAnswer);
  const tokenCost = 1; // 1 token per hint

  const handleRevealHint = async (hint: Hint) => {
    try {
      // Here you would integrate with the actual token spending system
      // await spendTokens(tokenCost, 'hint', `Hint for question ${questionId}`);
      
      setRevealedHints(prev => new Set([...prev, hint.id]));
      
      toast({
        title: "Hint Revealed!",
        description: `You've unlocked a ${hint.type} hint for 1 token`,
      });
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Unable to purchase hint. Please try again.",
        variant: "destructive",
      });
    }
  };

  const revealedCount = revealedHints.size;
  const totalCost = revealedCount * tokenCost;

  return (
    <Card className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${className}`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium text-tennis-green-dark">Need a hint?</h3>
            </div>
            {revealedCount > 0 && (
              <Badge variant="outline">
                {revealedCount} hint{revealedCount > 1 ? 's' : ''} used ({totalCost} 🪙)
              </Badge>
            )}
          </div>
          
          {/* Hint Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {hints.map((hint) => (
              <HintDialog
                key={hint.id}
                hint={hint}
                onReveal={handleRevealHint}
                isRevealed={revealedHints.has(hint.id)}
                tokenCost={tokenCost}
              />
            ))}
          </div>
          
          {/* Revealed Hints */}
          {revealedCount > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-tennis-green-dark">Your Hints:</h4>
              {hints
                .filter(hint => revealedHints.has(hint.id))
                .map((hint) => (
                  <Card key={hint.id} className={`border ${getHintTypeColor(hint.type)}`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        {getHintIcon(hint.type)}
                        <div className="flex-1">
                          <h5 className="text-sm font-medium capitalize mb-1">{hint.type}</h5>
                          <p className="text-sm">{hint.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
          
          {/* Usage Info */}
          <div className="bg-white/50 p-3 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
              <div className="text-xs text-tennis-green-medium">
                <p className="font-medium text-tennis-green-dark mb-1">Hint System</p>
                <p>Each hint costs 1 token and provides different types of help. Use them wisely to improve your learning!</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};