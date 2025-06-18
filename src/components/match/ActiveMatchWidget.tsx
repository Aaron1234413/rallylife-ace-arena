
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Plus, Minus, MessageCircle, Square } from 'lucide-react';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { MidMatchCheckInModal } from './MidMatchCheckInModal';
import { useNavigate } from 'react-router-dom';

export const ActiveMatchWidget = () => {
  const { sessionData, updateScore, isSessionActive } = useMatchSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [matchDuration, setMatchDuration] = useState(0);
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

  if (!isSessionActive || !sessionData) {
    return null;
  }

  const formatPoints = (points: number, isDeuce: boolean, hasAdvantage: boolean) => {
    if (isDeuce) return 'DEUCE';
    if (hasAdvantage) return 'AD';
    if (points === 0) return '0';
    if (points === 15) return '15';
    if (points === 30) return '30';
    if (points === 40) return '40';
    return points.toString();
  };

  const score = sessionData.score;
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
          {/* Score Display */}
          <div className="bg-white rounded-lg p-4 border">
            <div className="grid grid-cols-4 gap-4 text-center">
              {/* Headers */}
              <div className="font-medium text-gray-600">Player</div>
              <div className="font-medium text-gray-600">Sets</div>
              <div className="font-medium text-gray-600">Games</div>
              <div className="font-medium text-gray-600">Points</div>

              {/* Player Row */}
              <div className="font-semibold text-tennis-green-dark">{playerName}</div>
              <div className="text-2xl font-bold">{score?.playerSets || 0}</div>
              <div className="text-2xl font-bold">{score?.playerGames || 0}</div>
              <div className="text-2xl font-bold">
                {formatPoints(
                  score?.playerPoints || 0,
                  score?.isDeuce || false,
                  score?.playerAdvantage || false
                )}
              </div>

              {/* Opponent Row */}
              <div className="font-semibold text-gray-700">{opponentName}</div>
              <div className="text-2xl font-bold">{score?.opponentSets || 0}</div>
              <div className="text-2xl font-bold">{score?.opponentGames || 0}</div>
              <div className="text-2xl font-bold">
                {formatPoints(
                  score?.opponentPoints || 0,
                  score?.isDeuce || false,
                  score?.opponentAdvantage || false
                )}
              </div>
            </div>
          </div>

          {/* Score Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">{playerName} Scored</p>
              <Button
                onClick={() => updateScore(true)}
                className="w-full bg-tennis-green-dark hover:bg-tennis-green text-white"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Point
              </Button>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-center">{opponentName} Scored</p>
              <Button
                onClick={() => updateScore(false)}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Point
              </Button>
            </div>
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
