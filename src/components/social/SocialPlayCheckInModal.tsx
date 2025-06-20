
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

interface SocialPlayCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moodEmoji: string, notes?: string) => Promise<void>;
}

const MOOD_OPTIONS = [
  { emoji: '😄', label: 'Great!' },
  { emoji: '😊', label: 'Good' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😅', label: 'Tired' },
  { emoji: '😤', label: 'Intense' },
  { emoji: '🔥', label: 'On Fire!' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '😓', label: 'Sweaty' },
];

export function SocialPlayCheckInModal({ isOpen, onClose, onSubmit }: SocialPlayCheckInModalProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setSubmitting(true);
    try {
      await onSubmit(selectedMood, notes.trim() || undefined);
      // Reset form
      setSelectedMood('');
      setNotes('');
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedMood('');
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>How are you feeling?</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Share your current mood with other players!
            </p>
          </div>

          {/* Mood Selection */}
          <div className="space-y-2">
            <Label>Select your mood</Label>
            <div className="grid grid-cols-4 gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.emoji}
                  type="button"
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    selectedMood === mood.emoji
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs text-muted-foreground">{mood.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Quick notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How's the game going? Any thoughts to share..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/200
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!selectedMood || submitting}
            >
              {submitting ? 'Sharing...' : 'Share Check-in'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
