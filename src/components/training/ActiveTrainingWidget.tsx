
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, MessageCircle, Square, Play, Pause, Users, Activity } from 'lucide-react';
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
      <Card className="bg-gradient-to-br from-tennis-green-bg/20 to-white border-tennis-green-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-tennis-green-primary to-tennis-green-medium rounded-full flex items-center justify-center shadow-md">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-tennis-green-dark">Active Training</span>
                <p className="text-sm text-tennis-green-dark/70">Session in progress</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-2 bg-white/50">
                <Clock className="h-3 w-3" />
                {formatDuration(sessionDuration)}
              </Badge>
              {isPaused && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 border-yellow-200">
                  Paused
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Session Info Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-tennis-green-bg/30 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <h4 className="font-bold text-tennis-green-dark text-lg">
                  {getSessionTypeLabel(sessionData.sessionType || 'general')}
                </h4>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`${getIntensityColor(sessionData.intensity || 'medium')} border-0 shadow-sm`}
                  >
                    {sessionData.intensity?.charAt(0).toUpperCase() + sessionData.intensity?.slice(1) || 'Medium'} Intensity
                  </Badge>
                  {sessionData.estimatedDuration && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Est. {sessionData.estimatedDuration} min
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {sessionData.coachName && (
              <div className="flex items-center gap-2 p-3 bg-tennis-green-bg/20 rounded-lg">
                <Users className="h-4 w-4 text-tennis-green-medium" />
                <span className="text-sm font-medium text-tennis-green-dark">
                  Coach: {sessionData.coachName}
                </span>
              </div>
            )}

            {sessionData.skillsFocus && sessionData.skillsFocus.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-tennis-green-dark">Skills Focus:</p>
                <div className="flex flex-wrap gap-2">
                  {sessionData.skillsFocus.map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-tennis-green-bg/30 text-tennis-green-dark border-tennis-green-bg text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handlePauseResume}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-12 border-tennis-green-bg/30 text-tennis-green-dark hover:bg-tennis-green-bg/10"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 h-12 border-tennis-green-bg/30 text-tennis-green-dark hover:bg-tennis-green-bg/10"
            >
              <MessageCircle className="h-4 w-4" />
              Check-In
            </Button>
            
            <Button
              onClick={handleEndSession}
              className="flex items-center gap-2 h-12 bg-gradient-to-r from-tennis-green-primary to-tennis-green-medium hover:from-tennis-green-medium hover:to-tennis-green-primary text-white shadow-md"
              size="sm"
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
