
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeditationTimerProps {
  duration: number; // in minutes
  onComplete: () => void;
  onCancel: () => void;
}

export function MeditationTimer({ duration, onComplete, onCancel }: MeditationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const totalSeconds = duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // HP reward based on duration
  const hpReward = duration <= 5 ? 5 : duration <= 10 ? 8 : 12;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onComplete]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(totalSeconds);
    onCancel();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <span>🧘‍♀️</span>
          Meditation Timer
        </CardTitle>
        <Badge variant="secondary" className="w-fit mx-auto">
          <Heart className="h-3 w-3 mr-1 text-green-500" />
          +{hpReward} HP
        </Badge>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Breathing Animation Circle */}
        <div className="relative flex items-center justify-center">
          <div 
            className={cn(
              "w-48 h-48 rounded-full border-4 border-blue-200 relative overflow-hidden",
              "transition-all duration-1000 ease-in-out"
            )}
          >
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                className="text-gray-200"
              />
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 44} ${2 * Math.PI * 44}`}
                strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
                className="text-blue-500 transition-all duration-300"
              />
            </svg>
            
            {/* Breathing animation */}
            <div 
              className={cn(
                "absolute inset-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100",
                "flex items-center justify-center transition-all duration-4000 ease-in-out",
                isRunning && "animate-pulse"
              )}
              style={{
                transform: isRunning ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-gray-800">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {isRunning ? 'Breathe deeply...' : isPaused ? 'Paused' : 'Ready to start'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breathing Guide */}
        {isRunning && (
          <div className="text-center space-y-2">
            <div className="text-lg font-medium text-gray-700">
              Focus on your breath
            </div>
            <div className="text-sm text-gray-500">
              Inhale slowly through your nose, exhale through your mouth
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning && !isPaused && (
            <Button onClick={handleStart} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Start Meditation
            </Button>
          )}
          
          {isRunning && (
            <Button onClick={handlePause} variant="outline" className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              Pause
            </Button>
          )}
          
          {isPaused && (
            <Button onClick={handleStart} className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Resume
            </Button>
          )}
          
          {(isRunning || isPaused) && (
            <Button onClick={handleStop} variant="destructive" className="flex items-center gap-2">
              <Square className="h-4 w-4" />
              Stop
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
