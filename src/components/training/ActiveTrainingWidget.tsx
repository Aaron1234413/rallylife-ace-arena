
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, MessageCircle, Square, Play, Pause, Users } from 'lucide-react';
import { useTrainingSession } from '@/contexts/TrainingSessionContext';
import { useNavigate } from 'react-router-dom';
import { MidSessionModal } from './MidSessionModal';

export const ActiveTrainingWidget = () => {
  const { sessionData, isSessionActive, updateSessionData } = useTrainingSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState(0);
  const navigate = useNavigate();

  // Update session duration every second
  useEffect(() => {
    if (!isSessionActive || !sessionData.startTime || isPaused) return;

    const updateDuration = () => {
      const elapsed = Math.floor((new Date().getTime() - new Date(sessionData.startTime!).getTime()) / 1000);
      setSessionDuration(elapsed - pausedTime);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive, sessionData.startTime, isPaused, pausedTime]);

  if (!isSessionActive || !sessionData) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (isPaused) {
      // Resume: add paused duration to total paused time
      const pauseDuration = Math.floor((new Date().getTime() - new Date(sessionData.pausedAt!).getTime()) / 1000);
      setPausedTime(prev => prev + pauseDuration);
      updateSessionData({ pausedAt: undefined });
    } else {
      // Pause: record pause time
      updateSessionData({ pausedAt: new Date().toISOString() });
    }
    setIsPaused(!isPaused);
  };

  const handleEndSession = () => {
    navigate('/end-training');
  };

  const getSessionTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      'technique': 'Technique Practice',
      'fitness': 'Fitness Training',
      'match_prep': 'Match Preparation',
      'drills': 'Skill Drills',
      'serve_practice': 'Serve Practice',
      'general': 'General Training'
    };
    return typeLabels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getIntensityColor = (intensity: string) => {
    const colors: Record<string, string> = {
      'light': 'bg-green-100 text-green-700',
      'medium': 'bg-yellow-100 text-yellow-700',
      'high': 'bg-orange-100 text-orange-700',
      'max': 'bg-red-100 text-red-700'
    };
    return colors[intensity] || 'bg-gray-100 text-gray-700';
  };

  return (
    <>
      <Card className="border-green-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              <span className="text-lg">Active Training</span>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(sessionDuration)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Session Info */}
          <div className="bg-white rounded-lg border border-green-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">
                  {getSessionTypeLabel(sessionData.sessionType || 'general')}
                </h4>
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant="outline" className={getIntensityColor(sessionData.intensity || 'medium')}>
                    {sessionData.intensity?.charAt(0).toUpperCase() + sessionData.intensity?.slice(1) || 'Medium'} Intensity
                  </Badge>
                  {sessionData.estimatedDuration && (
                    <span className="text-sm text-gray-600">
                      Est. {sessionData.estimatedDuration} min
                    </span>
                  )}
                </div>
              </div>
              {isPaused && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  Paused
                </Badge>
              )}
            </div>

            {sessionData.coachName && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Coach: {sessionData.coachName}</span>
              </div>
            )}

            {sessionData.skillsFocus && sessionData.skillsFocus.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Skills Focus:</p>
                <div className="flex flex-wrap gap-1">
                  {sessionData.skillsFocus.map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handlePauseResume}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Check-In
            </Button>
            
            <Button
              onClick={handleEndSession}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mid-Session Check-In Modal */}
      <MidSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
