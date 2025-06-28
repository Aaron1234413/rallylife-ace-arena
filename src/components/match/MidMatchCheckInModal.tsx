
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { MessageCircle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedButton } from '@/components/ui/animated-button';
import { getRandomMessage } from '@/utils/motivationalMessages';

interface MidMatchCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MidMatchCheckInModal({ isOpen, onClose }: MidMatchCheckInModalProps) {
  const { sessionData, updateSessionData } = useMatchSession();
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const moodEmojis = ['😄', '😊', '😐', '😤', '😩', '🤔', '💪', '🎯'];
  const randomMessage = getRandomMessage('midMatchCheckIn');

  const handleSave = async () => {
    setIsSaving(true);
    
    // Small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Update session data with mid-match check-in
    updateSessionData({
      mid_match_mood: mood,
      mid_match_notes: notes
    });

    toast.success('Check-in saved! Keep it up! 💪');
    setIsSaving(false);
    onClose();
  };

  const handleSkip = () => {
    toast.info('Skipped check-in. Focus on your game! 🎾');
    onClose();
  };

  if (!sessionData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-tennis-green-dark" />
            Mid-Match Check-In
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            {randomMessage}
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Current Match Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-medium">
              Playing vs {sessionData.opponent_name}
              {sessionData.is_doubles && sessionData.opponent_1_name && ` & ${sessionData.opponent_1_name}`}
            </p>
            <p className="text-xs text-gray-500">
              Started: {sessionData.start_time.toLocaleTimeString()}
            </p>
          </div>

          {/* Mood Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">How are you feeling?</Label>
            <div className="flex flex-wrap gap-2">
              {moodEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant={mood === emoji ? 'default' : 'outline'}
                  onClick={() => setMood(emoji)}
                  className="text-xl p-3 transition-all transform hover:scale-110"
                  disabled={isSaving}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="mid-notes" className="text-sm font-medium">
              Quick Notes (Optional)
            </Label>
            <Textarea
              id="mid-notes"
              placeholder="How's the match going? Any observations?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm min-h-16"
              disabled={isSaving}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 transition-all transform hover:scale-105"
              disabled={isSaving}
            >
              Skip
            </Button>
            <AnimatedButton
              onClick={handleSave}
              loading={isSaving}
              className="flex-1 bg-tennis-green-dark hover:bg-tennis-green text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Check-In'}
            </AnimatedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
