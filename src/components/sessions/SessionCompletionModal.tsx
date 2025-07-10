import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  Coins, 
  Zap,
  Target,
  Award,
  TrendingUp
} from 'lucide-react';
import { SessionData } from '@/hooks/useSessionManager';

interface SessionCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionData;
  participants: Array<{
    id: string;
    user_id: string;
    user?: {
      full_name?: string;
      avatar_url?: string;
    };
  }>;
  durationMinutes: number;
  onComplete: (completionData: SessionCompletionData) => Promise<void>;
  isLoading?: boolean;
}

export interface SessionCompletionData {
  winnerId?: string;
  winningTeam?: string;
  score?: string;
  playerScore?: number;
  opponentScore?: number;
  rating: number;
  notes: string;
  completionType: 'normal' | 'forfeit' | 'cancelled';
  durationMinutes: number;
}

export const SessionCompletionModal: React.FC<SessionCompletionModalProps> = ({
  open,
  onOpenChange,
  session,
  participants,
  durationMinutes,
  onComplete,
  isLoading = false
}) => {
  const [winnerId, setWinnerId] = useState<string>('');
  const [winningTeam, setWinningTeam] = useState<string>('');
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [completionType, setCompletionType] = useState<'normal' | 'forfeit' | 'cancelled'>('normal');

  // Determine session characteristics
  const isCompetitive = session.session_type === 'match';
  const isSocial = session.session_type === 'social_play';
  const isTraining = session.session_type === 'training';
  const isChallenge = session.session_type === 'challenge';
  const hasStakes = session.stakes_amount && session.stakes_amount > 0;
  const isDoubles = session.format === 'doubles';

  // Calculate HP reduction and rewards
  const expectedImpact = useMemo(() => {
    // HP reduction calculation based on session type and duration
    let hpReduction = 0;
    if (isChallenge) {
      // Challenge sessions: 5 HP base + 1 HP per 10 minutes
      hpReduction = 5 + Math.floor(durationMinutes / 10);
    }
    // Social play and training sessions have 0 HP reduction
    
    // Base rewards (will be handled by the database function)
    const baseXP = Math.floor(durationMinutes * 0.5);
    const baseTokens = Math.floor(durationMinutes * 0.2);

    // Competitive multipliers
    const competitiveMultiplier = isCompetitive ? 1.5 : 1;
    
    return {
      hpReduction,
      xp: Math.floor(baseXP * competitiveMultiplier),
      tokens: Math.floor(baseTokens * competitiveMultiplier),
      stakesPool: session.stakes_amount || 0,
      platformFee: (session as any).platform_fee_percentage || 10
    };
  }, [durationMinutes, isCompetitive, isChallenge, session.stakes_amount]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const handleComplete = async () => {
    const completionData: SessionCompletionData = {
      rating,
      notes,
      completionType,
      durationMinutes,
      ...(isCompetitive && { 
        winnerId,
        winningTeam: isDoubles ? winningTeam : undefined,
        playerScore,
        opponentScore,
        score: `${playerScore}-${opponentScore}`
      })
    };

    await onComplete(completionData);
  };

  const getSessionTypeLabel = () => {
    switch (session.session_type) {
      case 'match': return 'Competitive Match';
      case 'social_play': return 'Social Play';
      case 'training': return 'Training Session';
      default: return 'Session';
    }
  };

  const getCompletionIcon = () => {
    switch (session.session_type) {
      case 'match': return <Trophy className="h-5 w-5 text-yellow-600" />;
      case 'social_play': return <Users className="h-5 w-5 text-blue-600" />;
      case 'training': return <Target className="h-5 w-5 text-green-600" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getCompletionIcon()}
            Complete {getSessionTypeLabel()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Session Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Duration: {formatDuration(durationMinutes)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{participants.length} participants</span>
              </div>
              
              {session.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{session.location}</span>
                </div>
              )}

              {hasStakes && (
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {session.stakes_amount} tokens at stake
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Competitive Session Fields */}
          {isCompetitive && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Match Result</Label>
                <div className="mt-2 space-y-3">
                  <Select value={completionType} onValueChange={(value: any) => setCompletionType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select completion type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal Completion</SelectItem>
                      <SelectItem value="forfeit">Forfeit</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  {completionType === 'normal' && (
                    <>
                      {isDoubles ? (
                        <div>
                          <Label className="text-sm text-muted-foreground">Winning Team</Label>
                          <Select value={winningTeam} onValueChange={setWinningTeam}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select winning team" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="team_1">Team 1</SelectItem>
                              <SelectItem value="team_2">Team 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div>
                          <Label className="text-sm text-muted-foreground">Winner</Label>
                          <Select value={winnerId} onValueChange={setWinnerId}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select winner" />
                            </SelectTrigger>
                            <SelectContent>
                              {participants.map((participant) => (
                                <SelectItem key={participant.user_id} value={participant.user_id}>
                                  {participant.user?.full_name || `Player ${participant.user_id.slice(0, 8)}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm text-muted-foreground">Your Score</Label>
                          <Input
                            type="number"
                            min="0"
                            value={playerScore}
                            onChange={(e) => setPlayerScore(Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Opponent Score</Label>
                          <Input
                            type="number"
                            min="0"
                            value={opponentScore}
                            onChange={(e) => setOpponentScore(Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Session Rating */}
          <div>
            <Label className="text-sm font-medium">Session Rating</Label>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {rating === 5 ? 'Excellent!' : rating === 4 ? 'Great!' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
              </span>
            </div>
          </div>

          {/* Session Notes */}
          <div>
            <Label className="text-sm font-medium">Session Notes (Optional)</Label>
            <Textarea
              placeholder={`How was the ${session.session_type.replace('_', ' ')}? Any highlights or thoughts to remember?`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <Separator />

          {/* HP & Rewards Impact */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-800">Session Impact</h4>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 font-medium">
                  <Zap className="h-4 w-4" />
                  +{expectedImpact.xp}
                </div>
                <div className="text-muted-foreground">XP</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-600 font-medium">
                  <span className="h-4 w-4 rounded-full bg-red-600 flex items-center justify-center text-white text-xs">♥</span>
                  {expectedImpact.hpReduction > 0 ? `-${expectedImpact.hpReduction}` : '0'}
                </div>
                <div className="text-muted-foreground">HP</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-600 font-medium">
                  <Coins className="h-4 w-4" />
                  +{expectedImpact.tokens}
                </div>
                <div className="text-muted-foreground">Tokens</div>
              </div>
            </div>

            {expectedImpact.hpReduction > 0 && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <div className="text-center">
                  <div className="text-orange-700 font-medium text-sm">
                    ⚠️ Challenge Session - HP will be reduced
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {expectedImpact.hpReduction} HP will be consumed from all participants
                  </div>
                </div>
              </div>
            )}

            {hasStakes && (
              <div className="mt-3 pt-3 border-t border-green-200">
                <div className="text-center">
                  <div className="text-yellow-700 font-medium">
                    Stakes Pool: {expectedImpact.stakesPool} tokens
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isCompetitive 
                      ? `Winner takes 90% (${expectedImpact.platformFee}% platform fee)` 
                      : 'Tokens distributed among participants'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={isLoading || (isCompetitive && completionType === 'normal' && (!winnerId && !winningTeam))}
              className="flex-1"
            >
              {isLoading ? 'Completing...' : 'Complete Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};