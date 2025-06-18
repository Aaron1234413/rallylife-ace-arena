
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { Clock, Heart, Save } from 'lucide-react';
import { toast } from 'sonner';

interface MidMatchCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchDuration: number;
}

export const MidMatchCheckInModal: React.FC<MidMatchCheckInModalProps> = ({
  isOpen,
  onClose,
  matchDuration
}) => {
  const { sessionData, updateSessionData } = useMatchSession();
  const [midMatchMood, setMidMatchMood] = useState(sessionData?.midMatchMood || '');
  const [midMatchNotes, setMidMatchNotes] = useState(sessionData?.midMatchNotes || '');

  // AI motivational check-in messages
  const checkInMessages = [
    "🔥 How's the match going? Log your current vibe!",
    "⚡ Quick check-in - how are you feeling right now?",
    "🎾 Mid-match moment - capture your thoughts!",
    "💪 Time for a quick mental note - what's happening?",
    "🎯 Pause and reflect - how's your energy?"
  ];

  const randomMessage = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];

  // Mood emojis for quick selection
  const moodEmojis = ['🔥', '💪', '😤', '🎯', '😅', '😐', '🤔', '😩'];

  const handleSave = () => {
    // Update session data with mid-match check-in
    updateSessionData({
      midMatchMood,
      midMatchNotes
    });

    toast.success('Check-in saved!', {
      description: 'Your mid-match thoughts have been recorded.'
    });

    onClose();
  };

  if (!sessionData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Mid-Match Check-In
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Message */}
          <div className="text-center">
            <p className="text-lg font-medium text-tennis-green-dark">
              {randomMessage}
            </p>
          </div>

          {/* Match Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                vs {sessionData.opponentName}
              </span>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-4 w-4" />
                {matchDuration} minutes
              </div>
            </div>
          </div>

          {/* Mood Selector */}
          <div className="space-y-2">
            <Label>How are you feeling right now?</Label>
            <div className="flex flex-wrap gap-2">
              {moodEmojis.map((emoji) => (
                <Button
                  key={emoji}
                  variant={midMatchMood === emoji ? 'default' : 'outline'}
                  onClick={() => setMidMatchMood(emoji)}
                  className="text-xl p-3"
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="midNotes">Quick Notes (Optional)</Label>
            <Textarea
              id="midNotes"
              placeholder="How's the match going? Any key moments or thoughts..."
              value={midMatchNotes}
              onChange={(e) => setMidMatchNotes(e.target.value)}
              className="text-base min-h-16"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-tennis-green-dark hover:bg-tennis-green text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Check-In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
