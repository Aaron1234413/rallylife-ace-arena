import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Zap, Users, Trophy, Target, Coins } from 'lucide-react';
import { useUnifiedInvitations } from '@/hooks/useUnifiedInvitations';
import { toast } from 'sonner';

interface ChallengeCreationCardProps {
  challengeCategory: 'match' | 'social_play';
  selectedOpponent?: {
    id?: string;
    name: string;
    email?: string;
  };
  tokenData?: any;
  onChallengeCreated?: () => void;
}

export function ChallengeCreationCard({ 
  challengeCategory, 
  selectedOpponent, 
  tokenData,
  onChallengeCreated 
}: ChallengeCreationCardProps) {
  const [challengeType, setChallengeType] = useState('');
  const [stakes, setStakes] = useState('');
  const [customStakes, setCustomStakes] = useState('');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const { createMatchInvitation, createSocialPlayInvitation } = useUnifiedInvitations();

  // Different challenge types based on category
  const challengeTypes = challengeCategory === 'match' 
    ? [
        { value: 'singles', label: '🎾 Singles Match', description: 'One-on-one tennis match' },
        { value: 'doubles', label: '🎾 Doubles Match', description: 'Team vs team tennis match' },
        { value: 'ranked_match', label: '🏆 Ranked Match', description: 'Competitive match with ranking impact' },
      ]
    : [
        { value: 'practice', label: '🏃 Practice Session', description: 'Collaborative training session' },
        { value: 'drill', label: '💪 Skill Drill', description: 'Focused skill improvement' },
        { value: 'fun_play', label: '🎉 Fun Play', description: 'Casual social tennis' },
      ];

  const stakesOptions = challengeCategory === 'match' 
    ? [
        { value: '0', label: 'No stakes - Just for fun!' },
        { value: '25', label: '25 Tokens' },
        { value: '50', label: '50 Tokens' },
        { value: '100', label: '100 Tokens' },
        { value: '200', label: '200 Tokens' },
        { value: 'custom', label: 'Custom amount' }
      ]
    : [
        { value: '0', label: 'No stakes - Collaborative play' },
        { value: '10', label: '10 Tokens (Entry fee)' },
        { value: '25', label: '25 Tokens (Premium session)' },
        { value: 'custom', label: 'Custom amount' }
      ];

  const handleCreateChallenge = async () => {
    if (!challengeType || creating || !selectedOpponent || !selectedOpponent.id) {
      toast.error('Please select a challenge type and opponent');
      return;
    }

    setCreating(true);
    try {
      const finalStakes = stakes === 'custom' ? parseInt(customStakes) || 0 : parseInt(stakes) || 0;
      
      // Validate token balance for stakes
      if (finalStakes > 0 && tokenData && finalStakes > tokenData.regular_tokens) {
        toast.error('Insufficient tokens for this challenge');
        setCreating(false);
        return;
      }

      if (challengeCategory === 'match') {
        // Create match invitation with stakes
        const params = {
          invitedUserName: selectedOpponent.name,
          invitedUserId: selectedOpponent.id,
          invitedUserEmail: selectedOpponent.email,
          matchType: challengeType as 'singles' | 'doubles',
          isDoubles: challengeType === 'doubles',
          startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
          message: message || `${challengeTypes.find(t => t.value === challengeType)?.label} challenge!`,
        };

        // Use the new function that handles stakes
        const invitationData = {
          invitee_user_id: selectedOpponent.id,
          invitee_user_name: selectedOpponent.name,
          invitee_user_email: selectedOpponent.email,
          invitation_type_param: challengeType,
          message_param: params.message,
          session_data_param: {
            matchType: challengeType,
            isDoubles: challengeType === 'doubles',
            startTime: params.startTime.toISOString(),
            challengeCategory: 'match'
          },
          stakes_tokens_param: finalStakes,
          stakes_premium_tokens_param: 0
        };

        await fetch('/rest/v1/rpc/create_match_invitation_with_stakes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await import('@/integrations/supabase/client')).supabase.auth.getSession().then(s => s.data.session?.access_token)}`,
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4cHptYmdzbGJxdXpkc3V0eGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NjI3NzcsImV4cCI6MjA2NTMzODc3N30.HG5Y-nyqnf_gDZ1vu1y5vFcJQEiNPSQxyBJE6yJiaOM'
          },
          body: JSON.stringify(invitationData)
        });

        toast.success(`Match challenge sent with ${finalStakes} token stakes!`);
      } else {
        // Create social play invitation
        const params = {
          invitedUserName: selectedOpponent.name,
          invitedUserId: selectedOpponent.id,
          invitedUserEmail: selectedOpponent.email,
          sessionType: challengeType as 'singles' | 'doubles',
          eventTitle: `${challengeTypes.find(t => t.value === challengeType)?.label}`,
          location: 'TBD',
          scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
          description: message || `Join me for a ${challengeTypes.find(t => t.value === challengeType)?.label}`,
          message: message
        };

        await createSocialPlayInvitation(params);
        toast.success('Social play challenge sent!');
      }

      // Reset form
      setChallengeType('');
      setStakes('');
      setCustomStakes('');
      setMessage('');

      onChallengeCreated?.();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast.error('Failed to send challenge. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const getCategoryIcon = () => {
    return challengeCategory === 'match' ? Trophy : Users;
  };

  const CategoryIcon = getCategoryIcon();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CategoryIcon className="h-5 w-5" />
          {challengeCategory === 'match' ? 'Tennis Match Challenge' : 'Social Play Challenge'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Opponent Display */}
        {selectedOpponent && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Challenging:</div>
            <div className="font-semibold">{selectedOpponent.name}</div>
          </div>
        )}

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
          <Label htmlFor="stakes">
            {challengeCategory === 'match' ? 'Stakes (Winner takes all)' : 'Entry Fee'}
          </Label>
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
          onClick={handleCreateChallenge}
          disabled={!challengeType || creating || !selectedOpponent}
          className="w-full bg-tennis-green-dark hover:bg-tennis-green-medium"
        >
          <Zap className="h-4 w-4 mr-2" />
          {creating ? 'Sending...' : 'Send Challenge'}
        </Button>

        {/* Quick Challenge Buttons */}
        {challengeCategory === 'match' && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChallengeType('singles');
                setStakes('0');
              }}
              className="text-xs"
              disabled={creating || !selectedOpponent}
            >
              🎾 Quick Singles
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChallengeType('singles');
                setStakes('50');
              }}
              className="text-xs"
              disabled={creating || !selectedOpponent}
            >
              🏆 Stakes (50T)
            </Button>
          </div>
        )}

        {challengeCategory === 'social_play' && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChallengeType('practice');
                setStakes('0');
              }}
              className="text-xs"
              disabled={creating || !selectedOpponent}
            >
              🏃 Quick Practice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setChallengeType('fun_play');
                setStakes('10');
              }}
              className="text-xs"
              disabled={creating || !selectedOpponent}
            >
              🎉 Fun Play (10T)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}