
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HPRestoreActions } from '@/components/hp/HPRestoreActions';
import { XPEarnActions } from '@/components/xp/XPEarnActions';
import { TokenEarnActions } from '@/components/tokens/TokenEarnActions';
import { ChallengeCreationCard } from '@/components/challenges';
import { OpponentSearchSelector, SelectedOpponent } from '@/components/match/OpponentSearchSelector';
import { Zap, Trophy, Users } from 'lucide-react';

interface PlayerActionCardsProps {
  hpData: any;
  xpData: any;
  tokenData: any;
  onRestoreHP: (amount: number, activityType: string, description?: string) => Promise<void>;
  onAddXP: (amount: number, activityType: string, description?: string) => Promise<any>;
  onAddTokens: (amount: number, tokenType?: string, source?: string, description?: string) => Promise<void>;
}

export function PlayerActionCards({
  hpData,
  xpData,
  tokenData,
  onRestoreHP,
  onAddXP,
  onAddTokens
}: PlayerActionCardsProps) {
  const [matchChallengeOpen, setMatchChallengeOpen] = useState(false);
  const [socialChallengeOpen, setSocialChallengeOpen] = useState(false);
  const [selectedOpponent, setSelectedOpponent] = useState<SelectedOpponent | null>(null);

  const handleChallengeCreated = () => {
    setMatchChallengeOpen(false);
    setSocialChallengeOpen(false);
    setSelectedOpponent(null);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {hpData && (
        <HPRestoreActions
          onRestoreHP={onRestoreHP}
          currentHP={hpData.current_hp}
          maxHP={hpData.max_hp}
        />
      )}

      {xpData && (
        <XPEarnActions
          onEarnXP={onAddXP}
        />
      )}

      {tokenData && (
        <TokenEarnActions
          onEarnTokens={onAddTokens}
        />
      )}

      {/* Challenge Cards */}
      <Dialog open={matchChallengeOpen} onOpenChange={setMatchChallengeOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:border-tennis-green-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Trophy className="h-4 w-4 text-orange-500" />
                Tennis Challenge
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                <Zap className="h-3 w-3 mr-1" />
                Challenge Player
              </Button>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Tennis Match Challenge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <OpponentSearchSelector
              label="Select Opponent"
              placeholder="Search for opponent..."
              value={selectedOpponent}
              onChange={setSelectedOpponent}
              required
            />
            {selectedOpponent && (
              <ChallengeCreationCard
                challengeCategory="match"
                selectedOpponent={selectedOpponent}
                tokenData={tokenData}
                onChallengeCreated={handleChallengeCreated}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={socialChallengeOpen} onOpenChange={setSocialChallengeOpen}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:border-tennis-green-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-purple-500" />
                Social Play
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button size="sm" className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                <Users className="h-3 w-3 mr-1" />
                Invite to Play
              </Button>
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Social Play Invitation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <OpponentSearchSelector
              label="Select Player"
              placeholder="Search for player to invite..."
              value={selectedOpponent}
              onChange={setSelectedOpponent}
              required
            />
            {selectedOpponent && (
              <ChallengeCreationCard
                challengeCategory="social_play"
                selectedOpponent={selectedOpponent}
                tokenData={tokenData}
                onChallengeCreated={handleChallengeCreated}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
