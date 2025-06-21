
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Trophy, Clock, Users, Star, Gift, Heart, Zap, Coins, Share2 } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { useSocialPlayFeed } from '@/hooks/useSocialPlayFeed';
import { formatDistanceToNow } from 'date-fns';

interface EndSocialPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EndSocialPlayModal({ isOpen, onClose }: EndSocialPlayModalProps) {
  const { activeSession, participants, completeSession, loading } = useSocialPlaySession();
  const { createSocialPlayPost, isCreatingPost } = useSocialPlayFeed();

  const [sessionNotes, setSessionNotes] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [myScore, setMyScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [shareToFeed, setShareToFeed] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!activeSession) return null;

  const moodOptions = [
    { emoji: '😄', label: 'Great', value: 'great' },
    { emoji: '😊', label: 'Good', value: 'good' },
    { emoji: '😌', label: 'Relaxed', value: 'relaxed' },
    { emoji: '💪', label: 'Strong', value: 'strong' },
    { emoji: '🔥', label: 'Energized', value: 'energized' },
    { emoji: '😓', label: 'Exhausted', value: 'exhausted' },
    { emoji: '🤔', label: 'Focused', value: 'focused' },
    { emoji: '😤', label: 'Determined', value: 'determined' }
  ];

  const joinedParticipants = participants.filter(p => p.status === 'joined' || p.status === 'accepted');
  const sessionDuration = activeSession.start_time 
    ? Math.floor((new Date().getTime() - new Date(activeSession.start_time).getTime()) / (1000 * 60))
    : 0;

  const isCompetitive = activeSession.competitive_level === 'high';
  const showScoreInput = isCompetitive;

  // Calculate estimated rewards (this will be calculated server-side)
  const calculateEstimatedRewards = () => {
    const baseHP = Math.max(10, Math.floor(sessionDuration / 5));
    const baseXP = Math.max(15, Math.floor(sessionDuration / 3));
    const baseTokens = Math.max(5, Math.floor(sessionDuration / 10));

    const socialBonus = joinedParticipants.length > 0 ? 1.5 : 1;
    
    const levelMultiplier = {
      'low': 1.0,
      'medium': 1.2,
      'high': 1.5
    }[activeSession.competitive_level] || 1.0;

    const moodMultiplier = ['great', 'strong', 'energized'].includes(selectedMood) ? 1.1 : 1.0;

    return {
      hp: Math.floor(baseHP * socialBonus * moodMultiplier),
      xp: Math.floor(baseXP * socialBonus * levelMultiplier * moodMultiplier),
      tokens: Math.floor(baseTokens * socialBonus * levelMultiplier)
    };
  };

  const estimatedRewards = calculateEstimatedRewards();

  const handleEndSession = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    try {
      // Prepare final score if provided
      let finalScore = null;
      if (showScoreInput && (myScore || opponentScore)) {
        finalScore = `${myScore || '0'}-${opponentScore || '0'}`;
      }

      // Complete session using the new RPC function
      const result = await completeSession(finalScore, sessionNotes.trim() || undefined, selectedMood);

      // Create feed post if sharing is enabled
      if (shareToFeed && result) {
        const participantNames = joinedParticipants
          .map(p => p.user?.full_name || 'Unknown')
          .filter(name => name !== 'Unknown');

        createSocialPlayPost({
          sessionId: activeSession.id,
          sessionType: activeSession.session_type,
          competitiveLevel: activeSession.competitive_level,
          duration: result.duration_minutes,
          participantCount: result.participant_count,
          participantNames,
          location: activeSession.location || undefined,
          finalScore: result.final_score || undefined,
          mood: selectedMood,
          notes: sessionNotes.trim() || undefined
        });
      }

      onClose();
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCompetitiveLevelText = (level: string) => {
    switch (level) {
      case 'low': return 'Chill';
      case 'medium': return 'Fun';
      case 'high': return 'Competitive';
      default: return level;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-purple-600" />
            Session Complete!
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Great session! Let's wrap up and calculate your rewards.
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Session Summary */}
          <div className="bg-purple-50 p-4 rounded-lg space-y-3">
            <h3 className="font-medium text-purple-900">Session Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span>{sessionDuration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span>{joinedParticipants.length + 1} players</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span>{getCompetitiveLevelText(activeSession.competitive_level)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-purple-600" />
                <span>{activeSession.session_type}</span>
              </div>
            </div>
          </div>

          {/* Score Input (Competitive Only) */}
          {showScoreInput && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Final Score (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Your score"
                  value={myScore}
                  onChange={(e) => setMyScore(e.target.value)}
                  className="text-center"
                  type="number"
                  min="0"
                />
                <span className="text-gray-500 font-medium">-</span>
                <Input
                  placeholder="Opponent"
                  value={opponentScore}
                  onChange={(e) => setOpponentScore(e.target.value)}
                  className="text-center"
                  type="number"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Mood Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">How are you feeling? *</Label>
            <div className="grid grid-cols-4 gap-2">
              {moodOptions.map((mood) => (
                <Button
                  key={mood.value}
                  variant={selectedMood === mood.value ? 'default' : 'outline'}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`h-16 flex-col gap-1 text-xs ${
                    selectedMood === mood.value 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  disabled={isSubmitting}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span>{mood.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Session Notes */}
          <div className="space-y-2">
            <Label htmlFor="session-notes" className="text-sm font-medium">
              Session Notes (Optional)
            </Label>
            <Textarea
              id="session-notes"
              placeholder="How was the session? Any highlights or thoughts to share?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="text-sm min-h-20 resize-none"
              disabled={isSubmitting}
              maxLength={300}
            />
            <div className="text-xs text-gray-500 text-right">
              {sessionNotes.length}/300
            </div>
          </div>

          {/* Share to Feed Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="share-to-feed"
              checked={shareToFeed}
              onCheckedChange={(checked) => setShareToFeed(!!checked)}
              disabled={isSubmitting}
            />
            <Label 
              htmlFor="share-to-feed" 
              className="text-sm font-medium cursor-pointer flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share session to your feed
            </Label>
          </div>

          <Separator />

          {/* Rewards Preview */}
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-green-600" />
              <h3 className="font-medium text-green-900">Estimated Rewards</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-red-600">
                  <Heart className="h-4 w-4" />
                  <span className="font-bold">+{estimatedRewards.hp}</span>
                </div>
                <div className="text-xs text-gray-600">HP</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600">
                  <Zap className="h-4 w-4" />
                  <span className="font-bold">+{estimatedRewards.xp}</span>
                </div>
                <div className="text-xs text-gray-600">XP</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-yellow-600">
                  <Coins className="h-4 w-4" />
                  <span className="font-bold">+{estimatedRewards.tokens}</span>
                </div>
                <div className="text-xs text-gray-600">Tokens</div>
              </div>
            </div>
            {joinedParticipants.length > 0 && (
              <div className="text-xs text-center text-green-700 bg-green-100 p-2 rounded">
                🎉 Social Bonus Applied! (+50% rewards for playing with friends)
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <AnimatedButton
              onClick={handleEndSession}
              disabled={!selectedMood || isSubmitting}
              loading={isSubmitting || isCreatingPost}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Trophy className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Completing...' : 'Complete Session'}
            </AnimatedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
