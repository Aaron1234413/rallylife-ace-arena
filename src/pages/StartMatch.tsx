
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { Play, Users, User, RefreshCw, AlertCircle } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { CardWithAnimation } from '@/components/ui/card-with-animation';
import { getRandomMessage } from '@/utils/motivationalMessages';
import { toast } from 'sonner';

const StartMatch = () => {
  const navigate = useNavigate();
  const { sessionData, updateSessionData, isSessionActive, loading } = useMatchSession();
  
  const [opponentName, setOpponentName] = useState('');
  const [isDoubles, setIsDoubles] = useState(false);
  const [partnerName, setPartnerName] = useState('');
  const [opponent1Name, setOpponent1Name] = useState('');
  const [opponent2Name, setOpponent2Name] = useState('');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [isStarting, setIsStarting] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);

  const randomMessage = getRandomMessage('startMatch');

  // Check for existing session on mount
  useEffect(() => {
    if (!loading && isSessionActive && sessionData) {
      setShowRecoveryPrompt(true);
    }
  }, [loading, isSessionActive, sessionData]);

  const validateForm = () => {
    if (!opponentName.trim()) {
      toast.error('Please enter opponent name');
      return false;
    }
    
    if (isDoubles) {
      if (!partnerName.trim()) {
        toast.error('Please enter your partner name');
        return false;
      }
      if (!opponent1Name.trim()) {
        toast.error('Please enter first opponent name');
        return false;
      }
    }
    
    return true;
  };

  const handleStartMatch = async () => {
    if (!validateForm()) return;

    setIsStarting(true);

    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Save session data
      await updateSessionData({
        opponentName: opponentName.trim(),
        isDoubles,
        partnerName: isDoubles ? partnerName.trim() : undefined,
        opponent1Name: isDoubles ? opponent1Name.trim() : undefined,
        opponent2Name: isDoubles ? opponent2Name.trim() : undefined,
        matchType: isDoubles ? 'doubles' : 'singles',
        startTime: new Date(startTime)
      });

      toast.success('Match started! Good luck out there! 🎾');
      
      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      toast.error('Failed to start match. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleResumeMatch = () => {
    toast.success('Resuming your match!');
    navigate('/');
  };

  const handleStartNewMatch = () => {
    setShowRecoveryPrompt(false);
    toast.info('Starting a new match session');
  };

  // Show session recovery prompt
  if (showRecoveryPrompt && sessionData) {
    const matchDuration = Math.floor((new Date().getTime() - sessionData.startTime.getTime()) / (1000 * 60));
    
    return (
      <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
        <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
          <CardWithAnimation delay={0}>
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
                <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-tennis-green-dark" />
                Session Recovery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">Active Match Found</h3>
                  <p className="text-sm text-yellow-700">
                    You have an ongoing match session that was started {matchDuration} minutes ago.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 space-y-3">
                <h4 className="font-medium">Match Details:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{sessionData.matchType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Opponent:</span>
                    <span className="font-medium">{sessionData.opponentName}</span>
                  </div>
                  {sessionData.isDoubles && sessionData.partnerName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Partner:</span>
                      <span className="font-medium">{sessionData.partnerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Started:</span>
                    <span className="font-medium">{sessionData.startTime.toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sets Completed:</span>
                    <span className="font-medium">{sessionData.sets.filter(s => s.completed).length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatedButton
                  onClick={handleResumeMatch}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg bg-tennis-green-dark hover:bg-tennis-green text-white font-semibold"
                >
                  <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Resume Match
                </AnimatedButton>
                
                <Button
                  onClick={handleStartNewMatch}
                  variant="outline"
                  className="w-full h-12 sm:h-14 text-base sm:text-lg"
                >
                  Start New Match
                </Button>
              </div>
            </CardContent>
          </CardWithAnimation>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4 flex items-center justify-center">
        <CardWithAnimation>
          <CardContent className="text-center p-6">
            <div className="mb-4">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-tennis-green-dark" />
            </div>
            <p className="mb-4">Checking for active sessions...</p>
          </CardContent>
        </CardWithAnimation>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
      <div className="max-w-lg mx-auto space-y-4 sm:space-y-6">
        {/* Header with motivational message */}
        <CardWithAnimation delay={0}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Play className="h-5 w-5 sm:h-6 sm:w-6 text-tennis-green-dark" />
              Start Tennis Match
            </CardTitle>
            <p className="text-base sm:text-lg font-medium text-tennis-green-dark mt-2 leading-relaxed">
              {randomMessage}
            </p>
          </CardHeader>
        </CardWithAnimation>

        {/* Match Setup Form */}
        <CardWithAnimation delay={100}>
          <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
            {/* Match Type Toggle */}
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              <div className="flex items-center gap-2">
                {isDoubles ? <Users className="h-4 w-4 sm:h-5 sm:w-5" /> : <User className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="font-medium text-sm sm:text-base">
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
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="opponent" className="text-sm sm:text-base">Opponent Name *</Label>
                <Input
                  id="opponent"
                  placeholder="Enter opponent's name"
                  value={opponentName}
                  onChange={(e) => setOpponentName(e.target.value)}
                  className="text-sm sm:text-base h-11 sm:h-12"
                  disabled={isStarting}
                />
              </div>
            )}

            {/* Doubles Fields */}
            {isDoubles && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="partner" className="text-sm sm:text-base">Your Partner *</Label>
                  <Input
                    id="partner"
                    placeholder="Enter partner's name"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    className="text-sm sm:text-base h-11 sm:h-12"
                    disabled={isStarting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="opponent1" className="text-sm sm:text-base">Opponent 1 *</Label>
                  <Input
                    id="opponent1"
                    placeholder="Enter first opponent's name"
                    value={opponent1Name}
                    onChange={(e) => setOpponent1Name(e.target.value)}
                    className="text-sm sm:text-base h-11 sm:h-12"
                    disabled={isStarting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="opponent2" className="text-sm sm:text-base">Opponent 2</Label>
                  <Input
                    id="opponent2"
                    placeholder="Enter second opponent's name"
                    value={opponent2Name}
                    onChange={(e) => setOpponent2Name(e.target.value)}
                    className="text-sm sm:text-base h-11 sm:h-12"
                    disabled={isStarting}
                  />
                </div>
              </div>
            )}

            {/* Start Time Override */}
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm sm:text-base">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="text-sm sm:text-base h-11 sm:h-12"
                disabled={isStarting}
              />
              <p className="text-xs sm:text-sm text-gray-600">
                Auto-captured (modify if logging a past match)
              </p>
            </div>

            {/* Start Match Button */}
            <AnimatedButton
              onClick={handleStartMatch}
              loading={isStarting}
              disabled={!opponentName.trim() || (isDoubles && !partnerName.trim()) || (isDoubles && !opponent1Name.trim())}
              className="w-full h-12 sm:h-14 text-base sm:text-lg bg-tennis-green-dark hover:bg-tennis-green text-white font-semibold"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              {isStarting ? 'Starting Match...' : 'Start Match'}
            </AnimatedButton>
          </CardContent>
        </CardWithAnimation>
      </div>
    </div>
  );
};

export default StartMatch;
