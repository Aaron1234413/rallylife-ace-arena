
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart, Zap, Coffee } from 'lucide-react';
import { useSocialPlayCheckins } from '@/hooks/useSocialPlayCheckins';
import { AnimatedButton } from '@/components/ui/animated-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface SocialPlayCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function SocialPlayCheckInModal({ isOpen, onClose, sessionId }: SocialPlayCheckInModalProps) {
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  
  const { checkins, createCheckin, isCreatingCheckin } = useSocialPlayCheckins(sessionId);

  const moodOptions = [
    { emoji: '😄', label: 'Great', color: 'bg-green-100 text-green-800' },
    { emoji: '😊', label: 'Good', color: 'bg-blue-100 text-blue-800' },
    { emoji: '😌', label: 'Relaxed', color: 'bg-purple-100 text-purple-800' },
    { emoji: '💪', label: 'Strong', color: 'bg-orange-100 text-orange-800' },
    { emoji: '🔥', label: 'On Fire', color: 'bg-red-100 text-red-800' },
    { emoji: '😓', label: 'Tired', color: 'bg-gray-100 text-gray-800' },
    { emoji: '🤔', label: 'Focused', color: 'bg-indigo-100 text-indigo-800' },
    { emoji: '😤', label: 'Pumped', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const handleSubmit = async () => {
    if (!selectedMood) return;

    createCheckin({
      session_id: sessionId,
      mood_emoji: selectedMood,
      notes: notes.trim() || undefined
    });

    // Reset form and close
    setSelectedMood('');
    setNotes('');
    onClose();
  };

  const handleSkip = () => {
    setSelectedMood('');
    setNotes('');
    onClose();
  };

  const getMoodOption = (emoji: string) => {
    return moodOptions.find(option => option.emoji === emoji);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            Session Check-In
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            Share how you're feeling with your playing partners!
          </p>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Mood Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">How are you feeling?</Label>
            <div className="grid grid-cols-4 gap-2">
              {moodOptions.map((mood) => (
                <Button
                  key={mood.emoji}
                  variant={selectedMood === mood.emoji ? 'default' : 'outline'}
                  onClick={() => setSelectedMood(mood.emoji)}
                  className={`h-12 flex-col gap-1 text-xs ${
                    selectedMood === mood.emoji 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'hover:bg-gray-50'
                  }`}
                  disabled={isCreatingCheckin}
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="check-in-notes" className="text-sm font-medium">
              Quick Notes (Optional)
            </Label>
            <Textarea
              id="check-in-notes"
              placeholder="How's the session going? Any thoughts to share?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-sm min-h-16 resize-none"
              disabled={isCreatingCheckin}
              maxLength={200}
            />
            <div className="text-xs text-gray-500 text-right">
              {notes.length}/200
            </div>
          </div>

          {/* Recent Check-ins */}
          {checkins.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Recent Check-ins</Label>
              <ScrollArea className="h-24 w-full rounded border p-2">
                <div className="space-y-2">
                  {checkins.slice(0, 3).map((checkin) => {
                    const mood = getMoodOption(checkin.mood_emoji);
                    return (
                      <div key={checkin.id} className="flex items-center gap-2 text-xs">
                        <span className="text-base">{checkin.mood_emoji}</span>
                        <span className="font-medium">{checkin.user?.full_name || 'Unknown'}</span>
                        <Badge variant="outline" className={`text-xs px-1 py-0 ${mood?.color || ''}`}>
                          {mood?.label || 'Unknown'}
                        </Badge>
                        <span className="text-gray-500 ml-auto">
                          {formatDistanceToNow(new Date(checkin.checked_in_at), { addSuffix: true })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
              disabled={isCreatingCheckin}
            >
              Skip
            </Button>
            <AnimatedButton
              onClick={handleSubmit}
              disabled={!selectedMood || isCreatingCheckin}
              loading={isCreatingCheckin}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Heart className="h-4 w-4 mr-2" />
              {isCreatingCheckin ? 'Sharing...' : 'Share Mood'}
            </AnimatedButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
