import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageCircle, Send } from 'lucide-react';

interface FeedbackWidgetProps {
  trigger?: React.ReactNode;
}

export function FeedbackWidget({ trigger }: FeedbackWidgetProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to submit feedback');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter your feedback message');
      return;
    }

    if (message.length > 2000) {
      toast.error('Message is too long (max 2000 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-feedback', {
        body: { message: message.trim() }
      });

      if (error) {
        console.error('Feedback submission error:', error);
        toast.error('Failed to submit feedback. Please try again.');
        return;
      }

      if (data?.success) {
        toast.success('Thank you! Your feedback has been submitted.');
        setMessage('');
        setIsOpen(false);
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 bg-white/95 backdrop-blur-sm border-tennis-green-light hover:bg-tennis-green-bg/20"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Feedback</span>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-tennis-green-dark">
            <MessageCircle className="h-5 w-5" />
            Player Voice Feedback
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-message" className="text-sm font-medium">
              Share your thoughts, suggestions, or report issues
            </Label>
            <Textarea
              id="feedback-message"
              placeholder="Tell us what you think... How can we improve your experience?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-tennis-green-medium">
              <span>Your feedback helps us improve the app</span>
              <span>{message.length}/2000</span>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!message.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}