import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { Trophy, Clock, Target, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EndMatch = () => {
  const navigate = useNavigate();
  const { sessionData, clearSession } = useMatchSession();
  
  const [finalScore, setFinalScore] = useState('');
  const [duration, setDuration] = useState('');
  const [endMood, setEndMood] = useState('');
  const [matchNotes, setMatchNotes] = useState('');
  const [result, setResult] = useState<'win' | 'loss'>('win');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rotating celebratory messages
  const celebratoryMessages = [
    "🏁 Match complete! Log the win, lessons, and grind.",
    "🎾 Great match! Time to capture the highlights.",
    "🔥 Another one in the books! How did it go?",
    "🏆 Match finished! Let's get those details logged.",
    "⚡ Game, set, match! Time to reflect and record."
  ];

  const randomMessage = celebratoryMessages[Math.floor(Math.random() * celebratoryMessages.length)];

  // Mood emojis
  const moodEmojis = ['😄', '😊', '😐', '😤', '😩', '🤔', '💪', '🎯'];

  const handleSubmit = async () => {
    if (!sessionData) {
      console.error('No session data found');
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate duration if not provided
      const calculatedDuration = duration ? parseInt(duration) : 
        Math.floor((new Date().getTime() - sessionData.startTime.getTime()) / (1000 * 60));

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

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

      // Prepare mood information
      let moodInfo = '';
      if (sessionData.midMatchMood) {
        moodInfo += `Mid-match mood: ${sessionData.midMatchMood}`;
      }
      if (endMood) {
        if (moodInfo) moodInfo += ', ';
        moodInfo += `End mood: ${endMood}`;
      }

      // Call the comprehensive activity logging RPC
      const { data, error } = await supabase.rpc('log_comprehensive_activity', {
        user_id: user.id,
        activity_type: 'match',
        activity_category: 'on_court',
        title: activityTitle,
        description: description,
        duration_minutes: calculatedDuration,
        intensity_level: 'high', // Matches are typically high intensity
        opponent_name: opponentDisplayName,
        score: finalScore || null,
        result: result,
        notes: combinedNotes || null,
        is_competitive: true, // Matches are competitive
        is_official: false, // Default to false, could be made configurable
        logged_at: sessionData.startTime.toISOString(),
        metadata: {
          match_type: sessionData.matchType,
          is_doubles: sessionData.isDoubles,
          partner_name: sessionData.partnerName || null,
          opponent_1_name: sessionData.opponent1Name || null,
          opponent_2_name: sessionData.opponent2Name || null,
          mid_match_mood: sessionData.midMatchMood || null,
          end_mood: endMood || null,
          start_time: sessionData.startTime.toISOString()
        }
      });

      if (error) {
        console.error('Error logging match activity:', error);
        toast.error('Failed to save match data');
        return;
      }

      console.log('Match activity logged successfully:', data);
      
      // Show success message with rewards
      if (data) {
        toast.success(`Match logged successfully!`, {
          description: `XP: +${data.xp_earned}, HP: ${data.hp_change >= 0 ? '+' : ''}${data.hp_change}`
        });
      }

      // Clear session and redirect
      clearSession();
      navigate('/feed');

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4 flex items-center justify-center">
        <Card>
          <CardContent className="text-center p-6">
            <p>No active match session found.</p>
            <Button onClick={() => navigate('/start-match')} className="mt-4">
              Start New Match
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header with celebratory message */}
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Match Complete
            </CardTitle>
            <p className="text-lg font-medium text-tennis-green-dark mt-2">
              {randomMessage}
            </p>
          </CardHeader>
        </Card>

        {/* Match Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">
                {sessionData.matchType === 'doubles' ? 'Doubles Match' : 'Singles Match'}
              </h3>
              <p className="text-gray-600">
                vs {sessionData.opponentName}
                {sessionData.isDoubles && sessionData.opponent1Name && ` & ${sessionData.opponent1Name}`}
              </p>
              <p className="text-sm text-gray-500">
                Started: {sessionData.startTime.toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mid-Match Check-in Summary (if exists) */}
        {(sessionData.midMatchMood || sessionData.midMatchNotes) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageCircle className="h-4 w-4" />
                Mid-Match Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessionData.midMatchMood && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Mood:</span>
                  <span className="text-lg">{sessionData.midMatchMood}</span>
                </div>
              )}
              {sessionData.midMatchNotes && (
                <div>
                  <span className="text-sm text-gray-600">Notes:</span>
                  <p className="text-sm mt-1 bg-gray-50 p-2 rounded">
                    {sessionData.midMatchNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Match Details Form */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* Final Score */}
            <div className="space-y-2">
              <Label htmlFor="score">Final Score</Label>
              <Input
                id="score"
                placeholder="e.g., 6-4, 4-6, 10-8"
                value={finalScore}
                onChange={(e) => setFinalScore(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Duration Override */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                placeholder="Auto-calculated"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="text-base"
              />
            </div>

            {/* Result Toggle */}
            <div className="space-y-2">
              <Label>Match Result</Label>
              <div className="flex gap-2">
                <Button
                  variant={result === 'win' ? 'default' : 'outline'}
                  onClick={() => setResult('win')}
                  className="flex-1"
                >
                  🏆 Win
                </Button>
                <Button
                  variant={result === 'loss' ? 'default' : 'outline'}
                  onClick={() => setResult('loss')}
                  className="flex-1"
                >
                  💪 Loss
                </Button>
              </div>
            </div>

            {/* Mood Selector */}
            <div className="space-y-2">
              <Label>How are you feeling?</Label>
              <div className="flex flex-wrap gap-2">
                {moodEmojis.map((emoji) => (
                  <Button
                    key={emoji}
                    variant={endMood === emoji ? 'default' : 'outline'}
                    onClick={() => setEndMood(emoji)}
                    className="text-xl p-3"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </div>

            {/* Match Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Match Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="How did the match go? What did you learn?"
                value={matchNotes}
                onChange={(e) => setMatchNotes(e.target.value)}
                className="text-base min-h-20"
              />
            </div>

            {/* HP/XP Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Rewards Preview:</h4>
              <div className="flex justify-between text-sm">
                <span>🎮 XP: +{result === 'win' ? '60' : '50'}</span>
                <span>❤️ HP: {result === 'win' ? '+5' : '-10'}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-12 text-lg bg-tennis-green-dark hover:bg-tennis-green text-white"
            >
              <Target className="h-5 w-5 mr-2" />
              {isSubmitting ? 'Saving Match...' : 'Submit Match Log'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EndMatch;
