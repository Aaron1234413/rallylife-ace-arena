
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';
import { getRandomMessage } from '@/utils/motivationalMessages';
import { EmojiPicker } from './EmojiPicker';

interface MidSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MidSessionModal({ isOpen, onClose }: MidSessionModalProps) {
  const { sessionData, updateSessionData } = useTrainingSession();
  const [mood, setMood] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen && sessionData.midSessionCheckIn) {
      setMood(sessionData.midSessionCheckIn.mood || '');
      setNotes(sessionData.midSessionCheckIn.notes || '');
    }
  }, [isOpen, sessionData.midSessionCheckIn]);

  const handleSave = () => {
    updateSessionData({
      midSessionCheckIn: {
        mood,
        notes,
        timestamp: new Date().toISOString(),
      }
    });
    onClose();
  };

  const message = getRandomMessage('midMatchCheckIn');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mid-Session Check-In</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg text-gray-600 mb-4">{message}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">How are you feeling?</label>
            <EmojiPicker value={mood} onValueChange={setMood} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Quick Notes (Optional)</label>
            <Textarea
              placeholder="How's your energy? Any adjustments needed?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Skip
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Save Check-In
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
