
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  CheckCircle,
  Dumbbell,
  Heart,
  Clock,
  Loader2
} from 'lucide-react';

interface StretchingTimerProps {
  routine: {
    id: string;
    name: string;
    description: string;
    duration: number; // in minutes
    hp: number;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  onComplete: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StretchingTimer({ routine, onComplete, onCancel, isLoading = false }: StretchingTimerProps) {
  const [timeLeft, setTimeLeft] = useState(routine.duration * 60); // Convert to seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const totalTime = routine.duration * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeft > 0 && !isLoading) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            setIsCompleted(true);
            setIsActive(false);
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsCompleted(true);
      setIsActive(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeft, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReset = () => {
    setTimeLeft(totalTime);
    setIsActive(false);
    setIsPaused(false);
    setIsCompleted(false);
  };

  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    onCancel();
  };

  const handleComplete = () => {
    onComplete();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto border-2 border-gradient-to-r from-green-200 to-blue-200">
      <CardContent className="p-6 text-center space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-gradient-to-r from-green-100 to-blue-100">
              <Dumbbell className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold">{routine.name}</h2>
            <p className="text-gray-600 text-sm">{routine.description}</p>
            <div className="flex justify-center gap-2 mt-2">
              <Badge className={getDifficultyColor(routine.difficulty)}>
                {routine.difficulty}
              </Badge>
            </div>
          </div>
        </div>

        {/* Timer Display */}
        <div className="space-y-4">
          <div className="text-5xl font-mono font-bold text-gray-900">
            {formatTime(timeLeft)}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-3" 
              indicatorClassName={isCompleted ? "bg-green-500" : "bg-blue-500"}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <span>{routine.duration} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4 text-red-500" />
            <span>+{routine.hp} HP</span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Completing session...</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isActive && !isCompleted && !isLoading && (
            <>
              <Button onClick={handleStart} className="bg-green-500 hover:bg-green-600">
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </>
          )}

          {isActive && !isCompleted && !isLoading && (
            <>
              <Button onClick={handlePause} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleStop} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            </>
          )}

          {isCompleted && !isLoading && (
            <>
              <Button onClick={handleComplete} className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Session
              </Button>
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Do Again
              </Button>
            </>
          )}

          {isLoading && (
            <Button disabled className="bg-gray-400">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          {!isActive && !isCompleted && !isLoading && (
            <p>Tap Start when you're ready to begin your stretching routine</p>
          )}
          {isActive && !isPaused && !isLoading && (
            <p>Follow along with your stretching routine. Take your time and listen to your body.</p>
          )}
          {isPaused && !isLoading && (
            <p>Session paused. Take a break and resume when ready.</p>
          )}
          {isCompleted && !isLoading && (
            <p>🎉 Great job! You've completed your stretching session.</p>
          )}
          {isLoading && (
            <p>Saving your progress and awarding HP...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
