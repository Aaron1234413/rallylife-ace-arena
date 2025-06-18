
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock, Trophy, Heart, Plus, Minus } from 'lucide-react';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';
import { useActivityLogger } from '@/hooks/useActivityLogger';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { toast } from 'sonner';
import { EmojiPicker } from './EmojiPicker';

export function TrainingWrapUp() {
  const navigate = useNavigate();
  const { sessionData, clearSession } = useTrainingSession();
  const { logActivity } = useActivityLogger();
  const { hpData } = usePlayerHP();
  const { xpData } = usePlayerXP();

  const [sessionNotes, setSessionNotes] = useState('');
  const [mood, setMood] = useState('');
  const [adjustedDuration, setAdjustedDuration] = useState(sessionData.estimatedDuration || 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate actual session duration
  const actualDuration = sessionData.startTime 
    ? Math.round((new Date().getTime() - new Date(sessionData.startTime).getTime()) / (1000 * 60))
    : sessionData.estimatedDuration || 0;

  useEffect(() => {
    setAdjustedDuration(actualDuration);
  }, [actualDuration]);

  // Calculate HP and XP preview
  const calculateHPImpact = () => {
    if (!sessionData.intensity || !adjustedDuration) return 0;
    
    const baseImpact = {
      'light': -3,
      'medium': -5,
      'high': -8,
      'max': -15
    }[sessionData.intensity] || -5;
    
    return Math.round(baseImpact * (adjustedDuration / 60));
  };

  const calculateXPGain = () => {
    if (!sessionData.intensity || !adjustedDuration) return 0;
    
    const baseXP = {
      'light': 20,
      'medium': 30,
      'high': 35,
      'max': 40
    }[sessionData.intensity] || 30;
    
    return Math.round(baseXP * (adjustedDuration / 60));
  };

  const hpImpact = calculateHPImpact();
  const xpGain = calculateXPGain();

  const getCompletionMessage = () => {
    const messages = [
      "Great work out there! 🎾",
      "Another solid training session in the books! 💪",
      "You're getting stronger every day! ⭐",
      "Way to push through and finish strong! 🔥",
      "Training complete - you should be proud! 🏆"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const adjustDuration = (change: number) => {
    const newDuration = Math.max(5, adjustedDuration + change);
    setAdjustedDuration(newDuration);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare activity data
      const activityData = {
        activity_type: 'training',
        activity_category: 'on_court',
        title: `${sessionData.sessionType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Training'} Session`,
        description: sessionNotes || `${sessionData.intensity} intensity training session`,
        duration_minutes: adjustedDuration,
        intensity_level: sessionData.intensity || 'medium',
        coach_name: sessionData.coachName || undefined,
        skills_practiced: sessionData.skillsFocus || [],
        notes: sessionNotes,
        energy_after: mood ? parseInt(mood) : undefined,
        tags: [sessionData.sessionType || 'general'].filter(Boolean)
      };

      // Log the activity
      await logActivity(activityData);
      
      // Clear the session
      clearSession();
      
      toast.success('Training session completed successfully!');
      
      // Navigate back to dashboard
      navigate('/');
      
    } catch (error) {
      console.error('Error completing training session:', error);
      toast.error('Failed to save training session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Completion Message */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-xl text-green-600">
            {getCompletionMessage()}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Session Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Session Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Session Type</p>
              <Badge variant="secondary">
                {sessionData.sessionType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Intensity</p>
              <Badge variant="outline">
                {sessionData.intensity?.charAt(0).toUpperCase() + sessionData.intensity?.slice(1) || 'Medium'}
              </Badge>
            </div>
          </div>
          
          {sessionData.coachName && (
            <div>
              <p className="text-sm text-gray-600">Coach</p>
              <p className="font-medium">{sessionData.coachName}</p>
            </div>
          )}
          
          {sessionData.skillsFocus && sessionData.skillsFocus.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Skills Practiced</p>
              <div className="flex flex-wrap gap-1">
                {sessionData.skillsFocus.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duration Adjustment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Duration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estimated: {sessionData.estimatedDuration || 0} min</p>
              <p className="text-sm text-gray-600">Actual: {actualDuration} min</p>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium leading-none">Adjust Final Duration</label>
            <div className="flex items-center gap-3 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(-5)}
                disabled={adjustedDuration <= 5}
              >
                <Minus className="h-4 w-4" />
                5 min
              </Button>
              <div className="flex-1 text-center">
                <Input
                  type="number"
                  value={adjustedDuration}
                  onChange={(e) => setAdjustedDuration(Math.max(5, parseInt(e.target.value) || 5))}
                  className="text-center"
                  min="5"
                />
                <p className="text-xs text-gray-500 mt-1">minutes</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustDuration(5)}
              >
                <Plus className="h-4 w-4" />
                5 min
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HP/XP Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Heart className="h-6 w-6 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">HP Impact</p>
              <p className="text-lg font-bold text-red-600">{hpImpact}</p>
              <p className="text-xs text-gray-500">
                {hpData ? `${hpData.current_hp} → ${Math.max(20, hpData.current_hp + hpImpact)}` : ''}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">XP Gain</p>
              <p className="text-lg font-bold text-yellow-600">+{xpGain}</p>
              <p className="text-xs text-gray-500">
                {xpData ? `Level ${xpData.current_level}` : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mood & Notes */}
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium leading-none">Post-Training Mood</label>
            <EmojiPicker value={mood} onValueChange={setMood} />
          </div>
          
          <div>
            <label className="text-sm font-medium leading-none">Session Notes (Optional)</label>
            <Textarea
              placeholder="How did the session go? What did you work on? Any insights or goals for next time?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex-1"
        >
          Save as Draft
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Completing...' : 'Complete Session'}
        </Button>
      </div>
    </div>
  );
}
