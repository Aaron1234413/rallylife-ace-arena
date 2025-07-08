import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SkillLevelSelectorProps {
  utrRating: number;
  ustaRating: number;
  onUtrChange: (value: number) => void;
  onUstaChange: (value: number) => void;
  onSkip: () => void;
  onContinue: () => void;
}

export function SkillLevelSelector({
  utrRating,
  ustaRating,
  onUtrChange,
  onUstaChange,
  onSkip,
  onContinue
}: SkillLevelSelectorProps) {
  const handleUtrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1.0 && value <= 16.5) {
      onUtrChange(value);
    }
  };

  const handleUstaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 1.0 && value <= 7.0) {
      onUstaChange(value);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-tennis-green-dark">
          What's Your Skill Level?
        </CardTitle>
        <CardDescription className="text-tennis-green-medium">
          Help us match you with players of similar skill level
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* UTR Rating */}
        <div className="space-y-2">
          <Label htmlFor="utr-rating" className="text-sm font-medium">
            UTR Rating (1.0 - 16.5)
          </Label>
          <Input
            id="utr-rating"
            type="number"
            min="1.0"
            max="16.5"
            step="0.1"
            value={utrRating}
            onChange={handleUtrChange}
            placeholder="4.0"
            className="text-center"
          />
          <p className="text-xs text-tennis-green-medium">
            Universal Tennis Rating - a global tennis rating system
          </p>
        </div>

        {/* USTA Rating */}
        <div className="space-y-2">
          <Label htmlFor="usta-rating" className="text-sm font-medium">
            USTA Rating (1.0 - 7.0)
          </Label>
          <Input
            id="usta-rating"
            type="number"
            min="1.0"
            max="7.0"
            step="0.5"
            value={ustaRating}
            onChange={handleUstaChange}
            placeholder="3.0"
            className="text-center"
          />
          <p className="text-xs text-tennis-green-medium">
            United States Tennis Association rating
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-tennis-green-bg/30 p-3 rounded-lg">
          <p className="text-xs text-tennis-green-medium text-center">
            Don't know your ratings? No problem! We'll start you at UTR 4.0 and USTA 3.0. 
            You can always update these later.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="flex-1"
          >
            Skip for Now
          </Button>
          <Button 
            onClick={onContinue}
            className="flex-1 bg-tennis-green-primary hover:bg-tennis-green-dark"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}