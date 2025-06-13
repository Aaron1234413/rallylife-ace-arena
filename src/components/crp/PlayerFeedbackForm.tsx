
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MessageSquare } from 'lucide-react';
import { useCoachCRP } from '@/hooks/useCoachCRP';
import { toast } from 'sonner';

interface PlayerFeedbackFormProps {
  coachId: string;
  coachName?: string;
  onSubmitted?: () => void;
}

export function PlayerFeedbackForm({ coachId, coachName, onSubmitted }: PlayerFeedbackFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [sessionType, setSessionType] = useState('lesson');
  
  const { submitFeedback, isSubmittingFeedback } = useCoachCRP();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      await submitFeedback({
        coachId,
        rating,
        feedbackText: feedbackText.trim() || undefined,
        sessionType
      });
      
      toast.success('Feedback submitted successfully!');
      
      // Reset form
      setRating(0);
      setFeedbackText('');
      setSessionType('lesson');
      
      onSubmitted?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback');
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-1 transition-colors"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-tennis-green-light">
      <CardHeader className="bg-tennis-green-light text-white p-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Rate Your Session
        </CardTitle>
        <CardDescription className="text-tennis-green-bg text-sm">
          {coachName ? `Share your experience with ${coachName}` : 'Share your coaching experience'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-tennis-green-dark mb-2">
            Session Type
          </label>
          <Select value={sessionType} onValueChange={setSessionType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lesson">Private Lesson</SelectItem>
              <SelectItem value="group_lesson">Group Lesson</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="match_coaching">Match Coaching</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-tennis-green-dark mb-2">
            Rating
          </label>
          {renderStars()}
          <p className="text-xs text-tennis-green-medium mt-1">
            {rating === 0 && 'Select a rating'}
            {rating === 1 && 'Poor experience'}
            {rating === 2 && 'Below average'}
            {rating === 3 && 'Average'}
            {rating === 4 && 'Good experience'}
            {rating === 5 && 'Excellent experience'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-tennis-green-dark mb-2">
            Comments (Optional)
          </label>
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Share specific feedback about your session..."
            rows={3}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmittingFeedback}
          className="w-full bg-tennis-green-medium hover:bg-tennis-green-dark"
        >
          {isSubmittingFeedback ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}
