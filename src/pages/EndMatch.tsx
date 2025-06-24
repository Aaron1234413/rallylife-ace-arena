
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { Trophy, Clock, Target, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedButton } from '@/components/ui/animated-button';
import { CardWithAnimation } from '@/components/ui/card-with-animation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getRandomMessage } from '@/utils/motivationalMessages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const EndMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sessionData, clearSession } = useMatchSession();
  
  const [finalScore, setFinalScore] = useState('');
  const [duration, setDuration] = useState('');
  const [endMood, setEndMood] = useState('');
  const [matchNotes, setMatchNotes] = useState('');
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const randomMessage = getRandomMessage('endMatch');

  // Mood emojis
  const moodEmojis = ['😄', '😊', '😐', '😤', '😩', '🤔', '💪', '🎯'];

  const handleSubmit = async () => {
    if (!sessionData || !user) {
      console.error('No session data or user found');
      toast.error('No match session found');
      return;
    }

    if (isSubmitted) {
      toast.info('Match already submitted!');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate duration if not provided
      const calculatedDuration = duration ? parseInt(duration) : 
        Math.floor((new Date().getTime() - sessionData.startTime.getTime()) / (1000 * 60));

      // Prepare opponent name for display
      const opponentDisplayName = sessionData.isDoubles 
        ? `${sessionData.opponent1Name}${sessionData.opponent2Name ? ` & ${sessionData.opponent2Name}` : ''}`
        : sessionData.opponentName;

      // Prepare activity title
      const activityTitle = sessionData.isDoubles 
        ? `Doubles Match vs ${opponentDisplayName}`
        : `Singles Match vs ${opponentDisplayName}`;

      // Prepare activity description
      let description = `${sessionData.matchType} match`;
      if (sessionData.isDoubles && sessionData.partnerName) {
        description += ` with partner ${sessionData.partnerName}`;
      }
      description += ` vs ${opponentDisplayName}`;

      // Prepare notes combining match notes and mid-match notes
      let combinedNotes = '';
      if (sessionData.midMatchNotes) {
        combinedNotes += `Mid-match notes: ${sessionData.midMatchNotes}`;
      }
      if (matchNotes) {
        if (combinedNotes) combinedNotes += '\n\n';
        combinedNotes += `Final notes: ${matchNotes}`;
      }

      // Calculate rewards based on match result
      const xpReward = result === 'win' ? 60 : 50;
      const hpChange = result === 'win' ? 5 : -10;
      const tokenReward = result === 'win' ? 30 : 20;

      // Insert activity log directly into the database
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .insert({
          player_id: user.id,
          activity_type: 'match',
          activity_category: 'on_court',
          title: activityTitle,
          description: description,
          duration_minutes: calculatedDuration,
          intensity_level: 'high',
          opponent_name: opponentDisplayName,
          score: finalScore || null,
          result: result,
          notes: combinedNotes || null,
          hp_impact: hpChange,
          xp_earned: xpReward,
          is_competitive: true,
          is_official: false,
          logged_at: sessionData.startTime.toISOString(),
          metadata: {
            match_type: sessionData.matchType,
            is_doubles: sessionData.isDoubles,
            partner_name: sessionData.partnerName || null,
            opponent_1_name: sessionData.opponent1Name || null,
            opponent_2_name: sessionData.opponent2Name || null,
            mid_match_mood: sessionData.midMatchMood || null,
            end_match_mood: endMood || null,
            start_time: sessionData.startTime.toISOString(),
            expected_rewards: {
              xp: xpReward,
              hp: hpChange,
              tokens: tokenReward
            }
          }
        })
        .select()
        .single();

      if (activityError) {
        console.error('Error logging match activity:', activityError);
        throw activityError;
      }

      // Award XP using the existing function
      const { data: xpData, error: xpError } = await supabase.rpc('add_xp', {
        user_id: user.id,
        xp_amount: xpReward,
        activity_type: 'match',
        description: `Match completion reward: ${activityTitle}`
      });

      if (xpError) {
        console.error('Error awarding XP:', xpError);
        // Don't throw here, continue with other rewards
      }

      // Handle HP change using the existing function
      if (hpChange > 0) {
        const { error: hpError } = await supabase.rpc('restore_hp', {
          user_id: user.id,
          restoration_amount: hpChange,
          activity_type: 'match',
          description: `HP bonus from winning match: ${activityTitle}`
        });

        if (hpError) {
          console.error('Error restoring HP:', hpError);
        }
      } else {
        // For HP loss, we need to get current HP first, then update it
        const { data: currentHpData } = await supabase
          .from('player_hp')
          .select('current_hp')
          .eq('player_id', user.id)
          .single();

        const currentHp = currentHpData?.current_hp || 100;
        const newHp = Math.max(20, currentHp + hpChange);

        // Update HP directly
        const { error: hpError } = await supabase
          .from('player_hp')
          .update({ 
            current_hp: newHp,
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('player_id', user.id);

        if (hpError) {
          console.error('Error updating HP:', hpError);
        } else {
          // Log HP activity with required fields
          const { error: hpLogError } = await supabase
            .from('hp_activities')
            .insert({
              player_id: user.id,
              activity_type: 'match',
              hp_change: hpChange,
              hp_before: currentHp,
              hp_after: newHp,
              description: `HP cost from match: ${activityTitle}`
            });

          if (hpLogError) {
            console.error('Error logging HP activity:', hpLogError);
          }
        }
      }

      // Award tokens using the existing function
      const { error: tokenError } = await supabase.rpc('add_tokens', {
        user_id: user.id,
        amount: tokenReward,
        token_type: 'regular',
        source: 'match',
        description: `Match completion reward: ${activityTitle}`
      });

      if (tokenError) {
        console.error('Error awarding tokens:', tokenError);
      }

      console.log('Match activity logged successfully:', activityData);
      
      setIsSubmitted(true);
      
      // Show success message with rewards
      const successMessage = getRandomMessage('successSubmission');
      toast.success(successMessage, {
        description: `XP: +${xpReward}, HP: ${hpChange >= 0 ? '+' : ''}${hpChange}, Tokens: +${tokenReward}`,
        duration: 3000
      });

      // Clear session and redirect to feed
      clearSession();
      
      // Delay to ensure toast is visible and animation completes
      setTimeout(() => {
        navigate('/feed', { replace: true });
      }, 1500);

    } catch (error) {
      console.error('Error submitting match:', error);
      toast.error('Failed to save match. Please try again.');
      setIsSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4 flex items-center justify-center">
        <CardWithAnimation>
          <CardContent className="text-center p-6">
            <div className="mb-4">
              <LoadingSpinner size="lg" className="mx-auto" />
            </div>
            <p className="mb-4">No active match session found.</p>
            <AnimatedButton onClick={() => navigate('/start-match')}>
              Start New Match
            </AnimatedButton>
          </CardContent>
        </CardWithAnimation>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
      <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
        {/* Header with celebratory message */}
        <CardWithAnimation delay={0}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
              Match Complete
            </CardTitle>
            <p className="text-base sm:text-lg font-medium text-tennis-green-dark mt-2 leading-relaxed">
              {randomMessage}
            </p>
          </CardHeader>
        </CardWithAnimation>

        {/* Match Summary */}
        <CardWithAnimation delay={100}>
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-base sm:text-lg">
                {sessionData.matchType === 'doubles' ? 'Doubles Match' : 'Singles Match'}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                vs {sessionData.opponentName}
                {sessionData.isDoubles && sessionData.opponent1Name && ` & ${sessionData.opponent1Name}`}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Started: {sessionData.startTime.toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </CardWithAnimation>

        {/* Mid-Match Check-in Summary (if exists) */}
        {(sessionData.midMatchMood || sessionData.midMatchNotes) && (
          <CardWithAnimation delay={200}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <MessageCircle className="h-4 w-4" />
                Mid-Match Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessionData.midMatchMood && (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600">Mood:</span>
                  <span className="text-lg">{sessionData.midMatchMood}</span>
                </div>
              )}
              {sessionData.midMatchNotes && (
                <div>
                  <span className="text-xs sm:text-sm text-gray-600">Notes:</span>
                  <p className="text-xs sm:text-sm mt-1 bg-gray-50 p-2 rounded">
                    {sessionData.midMatchNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </CardWithAnimation>
        )}

        {/* Match Details Form */}
        <CardWithAnimation delay={300}>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
            {/* Final Score */}
            <div className="space-y-2">
              <Label htmlFor="score" className="text-sm sm:text-base">Final Score</Label>
              <Input
                id="score"
                placeholder="e.g., 6-4, 4-6, 10-8"
                value={finalScore}
                onChange={(e) => setFinalScore(e.target.value)}
                className="text-sm sm:text-base h-11 sm:h-12"
                disabled={isSubmitting || isSubmitted}
              />
            </div>

            {/* Duration Override */}
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm sm:text-base">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Auto-calculated"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="text-sm sm:text-base h-11 sm:h-12"
                disabled={isSubmitting || isSubmitted}
              />
            </div>

            {/* Result Toggle */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Match Result</Label>
              <div className="flex gap-2">
                <Button
                  variant={result === 'win' ? 'default' : 'outline'}
                  onClick={() => setResult('win')}
                  className="flex-1 h-11 sm:h-12 text-sm sm:text-base transition-all transform hover:scale-105"
                  disabled={isSubmitting || isSubmitted}
                >
                  🏆 Win
                </Button>
                <Button
                  variant={result === 'loss' ? 'default' : 'outline'}
                  onClick={() => setResult('loss')}
                  className="flex-1 h-11 sm:h-12 text-sm sm:text-base transition-all transform hover:scale-105"
                  disabled={isSubmitting || isSubmitted}
                >
                  💪 Loss
                </Button>
              </div>
            </div>

            {/* Mood Selector */}
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">How are you feeling?</Label>
              <div className="flex flex-wrap gap-2">
                {moodEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant={endMood === emoji ? 'default' : 'outline'}
                    onClick={() => setEndMood(emoji)}
                    className="text-lg sm:text-xl p-2 sm:p-3 transition-all transform hover:scale-110"
                    disabled={isSubmitting || isSubmitted}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Match Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm sm:text-base">Match Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="How did the match go? What did you learn?"
                value={matchNotes}
                onChange={(e) => setMatchNotes(e.target.value)}
                className="text-sm sm:text-base min-h-20"
                disabled={isSubmitting || isSubmitted}
              />
            </div>

            {/* HP/XP Preview */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-sm sm:text-base">Rewards Preview:</h4>
              <div className="flex justify-between text-xs sm:text-sm">
                <span>🎮 XP: +{result === 'win' ? '60' : '50'}</span>
                <span>❤️ HP: {result === 'win' ? '+5' : '-10'}</span>
                <span>🪙 Tokens: +{result === 'win' ? '30' : '20'}</span>
              </div>
            </div>

            {/* Submit Button */}
            <AnimatedButton
              onClick={handleSubmit}
              loading={isSubmitting}
              successState={isSubmitted}
              disabled={isSubmitted}
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-tennis-green-dark hover:bg-tennis-green text-white font-semibold"
            >
              <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {isSubmitted ? 'Match Submitted!' : isSubmitting ? 'Saving Match...' : 'Submit Match Log'}
            </AnimatedButton>
          </CardContent>
        </CardWithAnimation>
      </div>
    </div>
  );
};

export default EndMatch;
