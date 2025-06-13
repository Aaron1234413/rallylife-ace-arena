
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Trophy, Coins } from 'lucide-react';

interface ChallengeCardProps {
  conversationId: string;
  playerStats: {
    hpData: any;
    xpData: any;
    tokenData: any;
  };
}

export function ChallengeCard({ conversationId, playerStats }: ChallengeCardProps) {
  const [challengeType, setChallengeType] = useState('');
  const [stakes, setStakes] = useState('');
  const [customStakes, setCustomStakes] = useState('');
  const [message, setMessage] = useState('');

  const challengeTypes = [
    { value: 'friendly_match', label: '🎾 Friendly Match', description: 'Casual game for fun' },
    { value: 'ranked_match', label: '🏆 Ranked Match', description: 'Competitive match with ranking points' },
    { value: 'training_challenge', label: '💪 Training Challenge', description: 'Practice-based competition' },
    { value: 'endurance_challenge', label: '⚡ Endurance Challenge', description: 'See who can last longer' }
  ];

  const stakesOptions = [
    { value: '0', label: 'No stakes - Just for fun!' },
    { value: '25', label: '25 Tokens' },
    { value: '50', label: '50 Tokens' },
    { value: '100', label: '100 Tokens' },
    { value: 'custom', label: 'Custom amount' }
  ];

  const handleSendChallenge = () => {
    if (!challengeType) return;

    const finalStakes = stakes === 'custom' ? customStakes : stakes;
    
    // TODO: Implement challenge sending logic
    console.log('Sending challenge:', {
      type: challengeType,
      stakes: finalStakes,
      message,
      conversationId
    });

    // Reset form
    setChallengeType('');
    setStakes('');
    setCustomStakes('');
    setMessage('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Send Challenge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player's current tokens display */}
        {playerStats.tokenData && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Your Tokens:</span>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{playerStats.tokenData.regular_tokens}</span>
            </div>
          </div>
        )}

        {/* Challenge Type */}
        <div className="space-y-2">
          <Label htmlFor="challenge-type">Challenge Type</Label>
          <Select value={challengeType} onValueChange={setChallengeType}>
            <SelectTrigger>
              <SelectValue placeholder="Select challenge type" />
            </SelectTrigger>
            <SelectContent>
              {challengeTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stakes */}
        <div className="space-y-2">
          <Label htmlFor="stakes">Stakes</Label>
          <Select value={stakes} onValueChange={setStakes}>
            <SelectTrigger>
              <SelectValue placeholder="Choose stakes" />
            </SelectTrigger>
            <SelectContent>
              {stakesOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {stakes === 'custom' && (
            <Input
              type="number"
              placeholder="Enter custom token amount"
              value={customStakes}
              onChange={(e) => setCustomStakes(e.target.value)}
              max={playerStats.tokenData?.regular_tokens || 0}
            />
          )}
        </div>

        {/* Optional Message */}
        <div className="space-y-2">
          <Label htmlFor="message">Challenge Message (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Add a personal message to your challenge..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
          />
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSendChallenge}
          disabled={!challengeType}
          className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
        >
          <Zap className="h-4 w-4 mr-2" />
          Send Challenge
        </Button>

        {/* Quick Challenge Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setChallengeType('friendly_match');
              setStakes('0');
            }}
            className="text-xs"
          >
            🎾 Quick Match
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setChallengeType('ranked_match');
              setStakes('50');
            }}
            className="text-xs"
          >
            🏆 Ranked (50T)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
