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
import { useSearchUsers } from '@/hooks/useSearchUsers';
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
  const [coachId, setCoachId] = useState<string | null>(null);

  // Search for coach to get their ID if coach name is provided
  const { data: coaches } = useSearchUsers({
    query: sessionData.coachName || '',
    userType: 'coach',
    filters: {
      level: 'all',
      location: '',
      skillLevel: 'all',
      coachingFocus: 'all'
    }
  });

  // Set coach ID when coaches are found
  useEffect(() => {
    if (sessionData.coachName && coaches && coaches.length > 0) {
      // Find exact match or closest match
      const exactMatch = coaches.find(coach => 
        coach.full_name.toLowerCase() === sessionData.coachName?.toLowerCase()
      );
      if (exactMatch) {
        setCoachId(exactMatch.id);
      } else if (coaches.length === 1) {
        // If only one coach found, use that one
        setCoachId(coaches[0].id);
      }
    }
  }, [sessionData.coachName, coaches]);

  // Calculate actual session duration
  const actualDuration = sessionData.startTime 
    ? Math.round((new Date().getTime() - new Date(sessionData.startTime).getTime()) / (1000 * 60))
    : sessionData.estimatedDuration || 0;

  useEffect(() => {
    setAdjustedDuration(actualDuration);
  }, [actualDuration]);

  // Calculate HP and XP preview - different for lessons vs regular training
  const calculateHPImpact = () => {
    if (!sessionData.intensity || !adjustedDuration) return 0;
    
    // If this is a lesson with a coach, HP will be restored
    if (sessionData.sessionType === 'lesson' && sessionData.coachName) {
      // Base HP restoration for lessons (will be enhanced by coach level in backend)
      return Math.round(5 * (adjustedDuration / 60)); // Positive HP for preview
    }
    
    // Regular training sessions cost HP
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
    
    // Lessons get higher base XP
    if (sessionData.sessionType === 'lesson' && sessionData.coachName) {
      return Math.round(60 * (adjustedDuration / 60)); // Higher XP for lessons
    }
    
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
      // Determine activity type based on session type and coach presence
      const isLesson = sessionData.sessionType === 'lesson' || sessionData.coachName;
      
      // Prepare activity data
      const activityData = {
        activity_type: isLesson ? 'lesson' : 'training',
        activity_category: 'on_court',
        title: `${sessionData.sessionType?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Training'} Session`,
        description: sessionNotes || `${sessionData.intensity} intensity ${isLesson ? 'lesson' : 'training'} session`,
        duration_minutes: adjustedDuration,
        intensity_level: sessionData.intensity || 'medium',
        coach_name: sessionData.coachName || undefined,
        coach_id: isLesson && coachId ? coachId : undefined, // Pass coach_id for lessons
        skills_practiced: sessionData.skillsFocus || [],
        notes: sessionNotes,
        energy_after: mood ? parseInt(mood) : undefined,
        tags: [sessionData.sessionType || 'general'].filter(Boolean)
      };

      console.log('Logging activity with data:', activityData);

      // Log the activity
      await logActivity(activityData);
      
      // Clear the session
      clearSession();
      
      toast.success(`${isLesson ? 'Lesson' : 'Training session'} completed successfully!`);
      
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
              {coachId && (
                <p className="text-xs text-green-600">✓ Coach identified for enhanced benefits</p>
              )}
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
            <div className={`text-center p-4 rounded-lg ${hpImpact > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <Heart className={`h-6 w-6 mx-auto mb-2 ${hpImpact > 0 ? 'text-green-500' : 'text-red-500'}`} />
              <p className="text-sm text-gray-600">HP Impact</p>
              <p className={`text-lg font-bold ${hpImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {hpImpact > 0 ? '+' : ''}{hpImpact}
              </p>
              <p className="text-xs text-gray-500">
                {hpData ? `${hpData.current_hp} → ${Math.max(0, Math.min(hpData.max_hp, hpData.current_hp + hpImpact))}` : ''}
              </p>
              {sessionData.coachName && hpImpact > 0 && (
                <p className="text-xs text-green-600 mt-1">Coach lesson bonus!</p>
              )}
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
