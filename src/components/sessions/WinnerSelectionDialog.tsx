import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users } from 'lucide-react';
import { UnifiedSession, SessionParticipant } from '@/hooks/useUnifiedSessions';

interface WinnerSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  session: UnifiedSession;
  participants: SessionParticipant[];
  onConfirm: (winnerId?: string, winningTeam?: string) => Promise<void>;
  isCompleting: boolean;
}

export function WinnerSelectionDialog({
  isOpen,
  onClose,
  session,
  participants,
  onConfirm,
  isCompleting
}: WinnerSelectionDialogProps) {
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const isDoubles = session.format === 'doubles';
  const isChallenge = session.session_type === 'challenge';

  // Calculate token distribution preview
  const totalStakes = session.stakes_amount || 0;
  const platformFee = Math.floor(totalStakes * 0.1); // 10% platform fee
  const winnerPayout = totalStakes - platformFee;

  const handleConfirm = () => {
    if (isDoubles && selectedTeam) {
      onConfirm(undefined, selectedTeam);
    } else if (selectedWinner) {
      onConfirm(selectedWinner);
    }
  };

  const canConfirm = isDoubles ? !!selectedTeam : !!selectedWinner;

  // For doubles, create team options
  const teamOptions = isDoubles ? [
    { id: 'team1', name: 'Team 1', players: participants.slice(0, 2) },
    { id: 'team2', name: 'Team 2', players: participants.slice(2, 4) }
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Select Winner
          </DialogTitle>
          <DialogDescription>
            Choose the winner to complete the session and distribute rewards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Token Distribution Preview */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Token Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Stakes:</span>
                  <span className="font-medium">{totalStakes} tokens</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee (10%):</span>
                  <span>-{platformFee} tokens</span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Winner Payout:</span>
                  <span className="text-green-600">{winnerPayout} tokens</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Winner Selection */}
          {isDoubles ? (
            <div>
              <Label className="text-base font-medium mb-3 block">
                Select Winning Team
              </Label>
              <RadioGroup value={selectedTeam} onValueChange={setSelectedTeam}>
                {teamOptions.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={team.id} id={team.id} />
                    <Label htmlFor={team.id} className="flex-1">
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{team.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                {team.players.map((player, index) => (
                                  <div key={player.id} className="flex items-center gap-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={player.user?.avatar_url} />
                                      <AvatarFallback className="text-xs">
                                        {player.user?.full_name?.charAt(0) || 'P'}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm text-muted-foreground">
                                      {player.user?.full_name || 'Player'}
                                    </span>
                                    {index < team.players.length - 1 && (
                                      <span className="text-muted-foreground">+</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : (
            <div>
              <Label className="text-base font-medium mb-3 block">
                Select Winner
              </Label>
              <RadioGroup value={selectedWinner} onValueChange={setSelectedWinner}>
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={participant.user_id} id={participant.user_id} />
                    <Label htmlFor={participant.user_id} className="flex-1">
                      <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={participant.user?.avatar_url} />
                              <AvatarFallback>
                                {participant.user?.full_name?.charAt(0) || 'P'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {participant.user?.full_name || 'Player'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {participant.role}
                                </Badge>
                                {participant.stakes_contributed && (
                                  <Badge variant="secondary" className="text-xs">
                                    {participant.stakes_contributed} tokens
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCompleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!canConfirm || isCompleting}
          >
            {isCompleting ? 'Completing...' : 'Complete Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}