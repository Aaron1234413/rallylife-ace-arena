
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Trophy, Clock, Zap, Heart, Users, MapPin } from 'lucide-react';
import { useSocialPlaySession } from '@/contexts/SocialPlaySessionContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface SimpleEndEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  durationMinutes: number;
  onConfirmEnd: () => Promise<void>;
  onAddXP?: (amount: number, type: string, desc?: string) => Promise<void>;
  onRestoreHP?: (amount: number, type: string, desc?: string) => Promise<void>;
}

export const SimpleEndEventModal: React.FC<SimpleEndEventModalProps> = ({
  open,
  onOpenChange,
  durationMinutes,
  onConfirmEnd,
  onAddXP,
  onRestoreHP
}) => {
  const { activeSession } = useSocialPlaySession();
  const { logActivity } = useActivityLogger();
  const navigate = useNavigate();
  const [isEnding, setIsEnding] = useState(false);
  const [notes, setNotes] = useState('');

  const handleEndSession = async () => {
    if (!activeSession || isEnding) return;
    
    setIsEnding(true);
    
    try {
      // Log the activity with rewards
      await logActivity({
        activity_type: 'social_play',
        activity_category: 'on_court',
        title: `${activeSession.sessionType === 'doubles' ? 'Doubles' : 'Singles'} Social Play`,
        description: notes || `Fun ${activeSession.sessionType} session with friends`,
        duration_minutes: durationMinutes,
        intensity_level: 'medium',
        location: activeSession.location || undefined,
        notes: notes || undefined,
        tags: ['social_play', activeSession.sessionType],
        is_competitive: false,
        enjoyment_rating: 5 // Default high enjoyment for social play
      });

      // End the session
      await onConfirmEnd();
      
      toast.success(`Social play session completed! Earned rewards for ${durationMinutes} minutes of play`);
      
      onOpenChange(false);
      navigate('/');
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session');
    } finally {
      setIsEnding(false);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  if (!activeSession) return null;

  const participantCount = activeSession.participants?.length || 0;
  const expectedXP = Math.floor(durationMinutes * 0.5);
  const expectedHP = Math.floor(durationMinutes * 0.3);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            End Social Play Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Session Summary */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>{activeSession.sessionType === 'doubles' ? 'Doubles' : 'Singles'} with {participantCount} players</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{durationMinutes} minutes played</span>
            </div>
            
            {activeSession.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{activeSession.location}</span>
              </div>
            )}
          </div>

          {/* Rewards Preview */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Session Rewards</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">XP: +{expectedXP}</span>
              </div>
              <div>
                <span className="text-green-600">HP: +{expectedHP}</span>
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Session Notes (Optional)
            </label>
            <Textarea
              placeholder="How was the session? Any highlights or thoughts to remember?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isEnding}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEndSession}
              disabled={isEnding}
              className="flex-1"
            >
              {isEnding ? 'Ending...' : 'End Session'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
