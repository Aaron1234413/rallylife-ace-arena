
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ChallengeCardProps {
  conversationId: string;
  otherUserId?: string;
  tokenData?: any;
}

export function ChallengeCard({ conversationId, otherUserId, tokenData }: ChallengeCardProps) {
  const [challengeType, setChallengeType] = useState('');
  const [stakes, setStakes] = useState('');
  const [customStakes, setCustomStakes] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const queryClient = useQueryClient();

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

  const handleSendChallenge = async () => {
    if (!challengeType || sending || !otherUserId) return;

    setSending(true);
    try {
      const finalStakes = stakes === 'custom' ? parseInt(customStakes) || 0 : parseInt(stakes) || 0;
      
      const { data, error } = await supabase.rpc('send_challenge', {
        challenged_user_id: otherUserId,
        challenge_type: challengeType,
        stakes_tokens: finalStakes,
        stakes_premium_tokens: 0,
        message: message || `${challengeTypes.find(t => t.value === challengeType)?.label} challenge!`,
        metadata: { conversation_id: conversationId }
      });

      if (error) throw error;

      // Reset form
      setChallengeType('');
      setStakes('');
      setCustomStakes('');
      setMessage('');

      // Refresh messages
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      toast.success('Challenge sent successfully!');
    } catch (error) {
      console.error('Error sending challenge:', error);
      toast.error('Failed to send challenge. Please try again.');
    } finally {
      setSending(false);
    }
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
        {tokenData && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Your Tokens:</span>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{tokenData.regular_tokens}</span>
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
              max={tokenData?.regular_tokens || 0}
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
          disabled={!challengeType || sending || !otherUserId}
          className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
        >
          <Zap className="h-4 w-4 mr-2" />
          {sending ? 'Sending...' : 'Send Challenge'}
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
            disabled={sending || !otherUserId}
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
            disabled={sending || !otherUserId}
          >
            🏆 Ranked (50T)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
