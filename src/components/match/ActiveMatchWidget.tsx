
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Users, MessageCircle, Square, Save } from 'lucide-react';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { MidMatchCheckInModal } from './MidMatchCheckInModal';
import { useNavigate } from 'react-router-dom';

export const ActiveMatchWidget = () => {
  const { sessionData, updateScore, isSessionActive } = useMatchSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchDuration, setMatchDuration] = useState(0);
  const [playerScore, setPlayerScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const navigate = useNavigate();

  // Update match duration every minute
  useEffect(() => {
    if (!isSessionActive || !sessionData) return;

    const updateDuration = () => {
      const duration = Math.floor((new Date().getTime() - sessionData.startTime.getTime()) / (1000 * 60));
      setMatchDuration(duration);
    };

    // Update immediately
    updateDuration();

    // Then update every minute
    const interval = setInterval(updateDuration, 60000);

    return () => clearInterval(interval);
  }, [isSessionActive, sessionData]);

  // Initialize score inputs with current session data
  useEffect(() => {
    if (sessionData) {
      setPlayerScore(sessionData.playerScore || '0');
      setOpponentScore(sessionData.opponentScore || '0');
    }
  }, [sessionData]);

  if (!isSessionActive || !sessionData) {
    return null;
  }

  const handleUpdateScore = () => {
    updateScore(playerScore, opponentScore);
  };

  const playerName = 'You';
  const opponentName = sessionData.opponentName;

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
                <div className="text-3xl font-bold">{sessionData.playerScore || '0'}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-700 mb-2">{opponentName}</div>
                <div className="text-3xl font-bold">{sessionData.opponentScore || '0'}</div>
              </div>
            </div>
          </div>

          {/* Score Update Inputs */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-gray-900">Update Score</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="player-score" className="text-sm font-medium">
                  {playerName}
                </Label>
                <Input
                  id="player-score"
                  value={playerScore}
                  onChange={(e) => setPlayerScore(e.target.value)}
                  placeholder="e.g., 6-4, 2-1"
                  className="text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="opponent-score" className="text-sm font-medium">
                  {opponentName}
                </Label>
                <Input
                  id="opponent-score"
                  value={opponentScore}
                  onChange={(e) => setOpponentScore(e.target.value)}
                  placeholder="e.g., 4-6, 1-2"
                  className="text-center"
                />
              </div>
            </div>
            <Button
              onClick={handleUpdateScore}
              className="w-full bg-tennis-green-dark hover:bg-tennis-green text-white"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              Update Score
            </Button>
          </div>

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
              onClick={() => navigate('/end-match')}
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
