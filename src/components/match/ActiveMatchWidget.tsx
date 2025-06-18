
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Users, MessageCircle, Square, Save, Plus } from 'lucide-react';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { MidMatchCheckInModal } from './MidMatchCheckInModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const ActiveMatchWidget = () => {
  const { 
    sessionData, 
    logSetScore, 
    startNextSet, 
    isSessionActive, 
    getCurrentSetDisplay, 
    getOpponentSetDisplay 
  } = useMatchSession();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchDuration, setMatchDuration] = useState(0);
  const [playerSetScore, setPlayerSetScore] = useState('');
  const [opponentSetScore, setOpponentSetScore] = useState('');
  const [showNextSetPrompt, setShowNextSetPrompt] = useState(false);
  const navigate = useNavigate();

  // Update match duration every minute
  useEffect(() => {
    if (!isSessionActive || !sessionData) return;

    const updateDuration = () => {
      const duration = Math.floor((new Date().getTime() - sessionData.startTime.getTime()) / (1000 * 60));
      setMatchDuration(duration);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60000);
    return () => clearInterval(interval);
  }, [isSessionActive, sessionData]);

  // Check if current set is completed and show prompt
  useEffect(() => {
    if (sessionData && sessionData.sets) {
      const currentSet = sessionData.sets[sessionData.currentSet];
      if (currentSet && currentSet.completed) {
        setShowNextSetPrompt(true);
        setPlayerSetScore('');
        setOpponentSetScore('');
      }
    }
  }, [sessionData]);

  if (!isSessionActive || !sessionData) {
    return null;
  }

  const handleLogSetScore = () => {
    if (!playerSetScore.trim() || !opponentSetScore.trim()) {
      toast.error('Please enter both set scores');
      return;
    }

    logSetScore(playerSetScore.trim(), opponentSetScore.trim());
    toast.success(`Set ${sessionData.currentSet + 1} logged!`);
  };

  const handleStartNextSet = () => {
    startNextSet();
    setShowNextSetPrompt(false);
    toast.success('Starting next set');
  };

  const handleEndMatch = () => {
    navigate('/end-match');
  };

  const playerName = 'You';
  const opponentName = sessionData.opponentName;
  const currentSet = sessionData.sets[sessionData.currentSet];
  const completedSets = sessionData.sets.filter(set => set.completed);
  const playerCompleteScore = getCurrentSetDisplay();
  const opponentCompleteScore = getOpponentSetDisplay();

  return (
    <>
      <Card className="border-tennis-green-light bg-gradient-to-r from-tennis-green-light/5 to-tennis-green-dark/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-tennis-green-dark" />
              <span className="text-lg">Active Match</span>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {matchDuration}m
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Score Display */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="font-semibold text-tennis-green-dark mb-2">{playerName}</div>
                <div className="text-2xl font-bold">
                  {playerCompleteScore || '0'}
                </div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">{opponentName}</div>
                <div className="text-2xl font-bold">
                  {opponentCompleteScore || '0'}
                </div>
              </div>
            </div>
            
            {completedSets.length > 0 && (
              <div className="mt-3 pt-3 border-t text-center text-sm text-gray-600">
                Sets completed: {completedSets.length}
              </div>
            )}
          </div>

          {/* Next Set Prompt */}
          {showNextSetPrompt && (
            <div className="bg-tennis-green-light/10 rounded-lg p-4 text-center space-y-3">
              <p className="font-medium text-tennis-green-dark">
                Set {sessionData.currentSet + 1} completed! Are you playing another set?
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleStartNextSet}
                  className="flex-1 bg-tennis-green-dark hover:bg-tennis-green text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yes, Next Set
                </Button>
                <Button
                  onClick={handleEndMatch}
                  variant="outline"
                  className="flex-1"
                >
                  <Square className="h-4 w-4 mr-2" />
                  End Match
                </Button>
              </div>
            </div>
          )}

          {/* Current Set Score Input */}
          {!currentSet?.completed && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h4 className="font-medium text-gray-900">
                Set {sessionData.currentSet + 1} Score
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="player-set-score" className="text-sm font-medium">
                    {playerName}
                  </Label>
                  <Input
                    id="player-set-score"
                    value={playerSetScore}
                    onChange={(e) => setPlayerSetScore(e.target.value)}
                    placeholder="e.g., 6"
                    className="text-center"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opponent-set-score" className="text-sm font-medium">
                    {opponentName}
                  </Label>
                  <Input
                    id="opponent-set-score"
                    value={opponentSetScore}
                    onChange={(e) => setOpponentSetScore(e.target.value)}
                    placeholder="e.g., 4"
                    className="text-center"
                  />
                </div>
              </div>
              <Button
                onClick={handleLogSetScore}
                className="w-full bg-tennis-green-dark hover:bg-tennis-green text-white"
                size="sm"
                disabled={!playerSetScore.trim() || !opponentSetScore.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Log Set Score
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Check-In
            </Button>
            <Button
              onClick={handleEndMatch}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <Square className="h-4 w-4 mr-2" />
              End Match
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Mid-Match Check-In Modal */}
      <MidMatchCheckInModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
