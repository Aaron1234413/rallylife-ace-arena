
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { Play, RefreshCw, AlertCircle } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { CardWithAnimation } from '@/components/ui/card-with-animation';
import { FormField } from '@/components/ui/form-field';
import { MatchTypeToggle } from '@/components/ui/match-type-toggle';
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const randomMessage = getRandomMessage('startMatch');

  // Check for existing session on mount
  useEffect(() => {
    if (!loading && isSessionActive && sessionData) {
      setShowRecoveryPrompt(true);
    }
  }, [loading, isSessionActive, sessionData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!opponentName.trim()) {
      if (isDoubles) {
        errors.opponent1Name = 'First opponent name is required';
      } else {
        errors.opponentName = 'Opponent name is required';
      }
    }
    
    if (isDoubles) {
      if (!partnerName.trim()) {
        errors.partnerName = 'Partner name is required';
      }
      if (!opponent1Name.trim()) {
        errors.opponent1Name = 'First opponent name is required';
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleStartMatch = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsStarting(true);

    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Save session data
      await updateSessionData({
        opponentName: isDoubles ? opponent1Name.trim() : opponentName.trim(),
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
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header with motivational message */}
        <CardWithAnimation delay={0}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
              <Play className="h-6 w-6 text-tennis-green-dark" />
              Start Tennis Match
            </CardTitle>
            <p className="text-base sm:text-lg font-medium text-tennis-green-dark mt-3 leading-relaxed">
              {randomMessage}
            </p>
          </CardHeader>
        </CardWithAnimation>

        {/* Match Setup Form */}
        <CardWithAnimation delay={100}>
          <CardContent className="space-y-6 pt-6">
            {/* Match Type Toggle */}
            <MatchTypeToggle
              isDoubles={isDoubles}
              onToggle={setIsDoubles}
              disabled={isStarting}
            />

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Singles Fields */}
              {!isDoubles && (
                <div className="animate-fade-in">
                  <FormField
                    id="opponent"
                    label="Opponent Name"
                    placeholder="Enter opponent's name"
                    value={opponentName}
                    onChange={(e) => {
                      setOpponentName(e.target.value);
                      clearFieldError('opponentName');
                    }}
                    disabled={isStarting}
                    required
                    error={validationErrors.opponentName}
                  />
                </div>
              )}

              {/* Doubles Fields */}
              {isDoubles && (
                <div className="space-y-5 animate-fade-in">
                  <FormField
                    id="partner"
                    label="Your Partner"
                    placeholder="Enter partner's name"
                    value={partnerName}
                    onChange={(e) => {
                      setPartnerName(e.target.value);
                      clearFieldError('partnerName');
                    }}
                    disabled={isStarting}
                    required
                    error={validationErrors.partnerName}
                  />
                  
                  <FormField
                    id="opponent1"
                    label="Opponent 1"
                    placeholder="Enter first opponent's name"
                    value={opponent1Name}
                    onChange={(e) => {
                      setOpponent1Name(e.target.value);
                      clearFieldError('opponent1Name');
                    }}
                    disabled={isStarting}
                    required
                    error={validationErrors.opponent1Name}
                  />
                  
                  <FormField
                    id="opponent2"
                    label="Opponent 2"
                    placeholder="Enter second opponent's name (optional)"
                    value={opponent2Name}
                    onChange={(e) => setOpponent2Name(e.target.value)}
                    disabled={isStarting}
                  />
                </div>
              )}

              {/* Start Time Override */}
              <FormField
                id="startTime"
                label="Start Time"
                type="datetime-local"
                placeholder=""
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isStarting}
                helpText="Auto-captured (modify if logging a past match)"
              />
            </div>

            {/* Start Match Button */}
            <div className="pt-4">
              <AnimatedButton
                onClick={handleStartMatch}
                loading={isStarting}
                disabled={isStarting}
                className="w-full h-14 text-lg bg-tennis-green-dark hover:bg-tennis-green text-white font-semibold"
              >
                <Play className="h-5 w-5 mr-2" />
                {isStarting ? 'Starting Match...' : 'Start Match'}
              </AnimatedButton>
            </div>
          </CardContent>
        </CardWithAnimation>
      </div>
    </div>
  );
};

export default StartMatch;
