
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { Play, Users, User } from 'lucide-react';

const StartMatch = () => {
  const navigate = useNavigate();
  const { updateSessionData } = useMatchSession();
  
  const [opponentName, setOpponentName] = useState('');
  const [isDoubles, setIsDoubles] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [opponent1Name, setOpponent1Name] = useState('');
  const [opponent2Name, setOpponent2Name] = useState('');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));

  // Rotating AI motivational messages
  const motivationalMessages = [
    "🎾 May the best player win!",
    "Let the match begin!",
    "Time to bring your A-game!",
    "🔥 Ready to dominate the court?",
    "Show them what you're made of!",
    "🏆 Champions are made in moments like this!"
  ];

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const handleStartMatch = () => {
    if (!opponentName.trim()) {
      return; // Add validation feedback later
    }

    // Save session data
    updateSessionData({
      opponentName: opponentName.trim(),
      isDoubles,
      partnerName: isDoubles ? partnerName.trim() : undefined,
      opponent1Name: isDoubles ? opponent1Name.trim() : undefined,
      opponent2Name: isDoubles ? opponent2Name.trim() : undefined,
      matchType: isDoubles ? 'doubles' : 'singles',
      startTime: new Date(startTime)
    });

    // Navigate to dashboard or waiting screen
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header with motivational message */}
        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Play className="h-6 w-6 text-tennis-green-dark" />
              Start Tennis Match
            </CardTitle>
            <p className="text-lg font-medium text-tennis-green-dark mt-2">
              {randomMessage}
            </p>
          </CardHeader>
        </Card>

        {/* Match Setup Form */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* Match Type Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {isDoubles ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                <span className="font-medium">
                  {isDoubles ? 'Doubles Match' : 'Singles Match'}
                </span>
              </div>
              <Switch
                checked={isDoubles}
                onCheckedChange={setIsDoubles}
              />
            </div>

            {/* Singles Fields */}
            {!isDoubles && (
              <div className="space-y-2">
                <Label htmlFor="opponent">Opponent Name *</Label>
                <Input
                  id="opponent"
                  placeholder="Enter opponent's name"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  className="text-base"
                />
              </div>
            )}

            {/* Doubles Fields */}
            {isDoubles && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="partner">Your Partner *</Label>
                  <Input
                    id="partner"
                    placeholder="Enter partner's name"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="opponent1">Opponent 1 *</Label>
                  <Input
                    id="opponent1"
                    placeholder="Enter first opponent's name"
                    value={opponent1Name}
                    onChange={(e) => setOpponent1Name(e.target.value)}
                    className="text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="opponent2">Opponent 2</Label>
                  <Input
                    id="opponent2"
                    placeholder="Enter second opponent's name"
                    value={opponent2Name}
                    onChange={(e) => setOpponent2Name(e.target.value)}
                    className="text-base"
                  />
                </div>
              </div>
            )}

            {/* Start Time Override */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-base"
              />
              <p className="text-sm text-gray-600">
                Auto-captured (modify if logging a past match)
              </p>
            </div>

            {/* Start Match Button */}
            <Button
              onClick={handleStartMatch}
              disabled={!opponentName.trim() || (isDoubles && !partnerName.trim()) || (isDoubles && !opponent1Name.trim())}
              className="w-full h-12 text-lg bg-tennis-green-dark hover:bg-tennis-green text-white"
            >
              <Play className="h-5 w-5 mr-2" />
              Start Match
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StartMatch;
