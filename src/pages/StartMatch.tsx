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
import { OpponentSearchSelector, SelectedOpponent } from '@/components/match/OpponentSearchSelector';
import { StakesPreview } from '@/components/match/StakesPreview';
import { useMatchRewards } from '@/hooks/useMatchRewards';
import { getRandomMessage } from '@/utils/motivationalMessages';
import { toast } from 'sonner';
import { useMatchInvitations } from '@/hooks/useMatchInvitations';

// Helper function to format date for datetime-local input in EST
const formatDateForInput = (date: Date): string => {
  // Convert to EST (UTC-5) or EDT (UTC-4) depending on daylight saving time
  const estOffset = -5; // EST is UTC-5
  const edtOffset = -4; // EDT is UTC-4
  
  // Check if it's daylight saving time (rough approximation)
  const isDST = (date: Date): boolean => {
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) !== date.getTimezoneOffset();
  };
  
  const offset = isDST(date) ? edtOffset : estOffset;
  const estDate = new Date(date.getTime() + (offset * 60 * 60 * 1000));
  
  // Format as YYYY-MM-DDTHH:MM for datetime-local input
  const year = estDate.getUTCFullYear();
  const month = String(estDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(estDate.getUTCDate()).padStart(2, '0');
  const hours = String(estDate.getUTCHours()).padStart(2, '0');
  const minutes = String(estDate.getUTCMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper function to parse datetime-local input as EST and convert to UTC
const parseInputDateAsEST = (inputValue: string): Date => {
  if (!inputValue) return new Date();
  
  // Parse the input value as if it's in EST
  const localDate = new Date(inputValue);
  
  // Get the current timezone offset
  const now = new Date();
  const isDST = (date: Date): boolean => {
    const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
    const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(jan, jul) !== date.getTimezoneOffset();
  };
  
  // EST/EDT offset in minutes
  const estOffset = isDST(now) ? 4 * 60 : 5 * 60; // EDT is UTC-4, EST is UTC-5
  
  // Convert to UTC by adding the EST offset
  return new Date(localDate.getTime() + (estOffset * 60 * 1000));
};

const StartMatch = () => {
  const navigate = useNavigate();
  const { sessionData, updateSessionData, isSessionActive, loading } = useMatchSession();
  const { sendInvitation } = useMatchInvitations();
  
  // Updated state to use SelectedOpponent objects
  const [opponent, setOpponent] = useState<SelectedOpponent | null>(null);
  const [isDoubles, setIsDoubles] = useState(false);
  const [partner, setPartner] = useState<SelectedOpponent | null>(null);
  const [opponent1, setOpponent1] = useState<SelectedOpponent | null>(null);
  const [opponent2, setOpponent2] = useState<SelectedOpponent | null>(null);
  const [startTime, setStartTime] = useState(() => formatDateForInput(new Date()));
  const [isStarting, setIsStarting] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const randomMessage = getRandomMessage('startMatch');

  // Get match rewards calculation
  const { rewards, opponentAnalysis, doublesAnalysis, loading: rewardsLoading } = useMatchRewards({
    opponent,
    isDoubles,
    partner,
    opponent1,
    opponent2
  });

  // Check for existing session on mount
  useEffect(() => {
    if (!loading && isSessionActive && sessionData) {
      setShowRecoveryPrompt(true);
    }
  }, [loading, isSessionActive, sessionData]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!isDoubles) {
      if (!opponent) {
        errors.opponent = 'Opponent is required';
      }
    } else {
      if (!partner) {
        errors.partner = 'Partner is required';
      }
      if (!opponent1) {
        errors.opponent1 = 'First opponent is required';
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

      // Parse the start time as EST and convert to proper Date object
      const matchStartTime = parseInputDateAsEST(startTime);

      // Prepare session data with opponent IDs and names
      const sessionUpdate = {
        matchType: (isDoubles ? 'doubles' : 'singles') as 'singles' | 'doubles',
        isDoubles,
        startTime: matchStartTime
      };

      if (isDoubles) {
        // Doubles match data
        Object.assign(sessionUpdate, {
          partnerName: partner?.name,
          partnerId: partner?.id,
          opponentName: opponent1?.name || '', // Primary opponent name for backward compatibility
          opponent1Name: opponent1?.name,
          opponent1Id: opponent1?.id,
          opponent2Name: opponent2?.name,
          opponent2Id: opponent2?.id
        });
      } else {
        // Singles match data
        Object.assign(sessionUpdate, {
          opponentName: opponent?.name || '',
          opponentId: opponent?.id
        });
      }

      // Save session data and get the created session with ID
      const createdSession = await updateSessionData(sessionUpdate);
      
      // Send invitations to opponents if they have IDs and we have a session ID
      if (createdSession?.id) {
        if (!isDoubles && opponent?.id) {
          // Singles: invite the opponent
          await sendInvitation({
            sessionId: createdSession.id,
            inviteeId: opponent.id,
            inviteeName: opponent.name,
            message: `I'd like to play a tennis match with you!`
          });
        } else if (isDoubles) {
          // Doubles: invite partner and opponents
          if (partner?.id) {
            await sendInvitation({
              sessionId: createdSession.id,
              inviteeId: partner.id,
              inviteeName: partner.name,
              message: `Want to be my partner for a doubles match?`
            });
          }
          if (opponent1?.id) {
            await sendInvitation({
              sessionId: createdSession.id,
              inviteeId: opponent1.id,
              inviteeName: opponent1.name,
              message: `I'd like to play a doubles match against you!`
            });
          }
          if (opponent2?.id) {
            await sendInvitation({
              sessionId: createdSession.id,
              inviteeId: opponent2.id,
              inviteeName: opponent2.name,
              message: `I'd like to play a doubles match against you!`
            });
          }
        }
      }

      toast.success('Match started and invitations sent! 🎾');
      
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
                  <OpponentSearchSelector
                    label="Opponent"
                    placeholder="Search for your opponent..."
                    value={opponent}
                    onChange={(newOpponent) => {
                      setOpponent(newOpponent);
                      clearFieldError('opponent');
                    }}
                    disabled={isStarting}
                    required
                    error={validationErrors.opponent}
                  />
                </div>
              )}

              {/* Doubles Fields */}
              {isDoubles && (
                <div className="space-y-5 animate-fade-in">
                  <OpponentSearchSelector
                    label="Your Partner"
                    placeholder="Search for your partner..."
                    value={partner}
                    onChange={(newPartner) => {
                      setPartner(newPartner);
                      clearFieldError('partner');
                    }}
                    disabled={isStarting}
                    required
                    error={validationErrors.partner}
                  />
                  
                  <OpponentSearchSelector
                    label="Opponent 1"
                    placeholder="Search for first opponent..."
                    value={opponent1}
                    onChange={(newOpponent1) => {
                      setOpponent1(newOpponent1);
                      clearFieldError('opponent1');
                    }}
                    disabled={isStarting}
                    required
                    error={validationErrors.opponent1}
                  />
                  
                  <OpponentSearchSelector
                    label="Opponent 2"
                    placeholder="Search for second opponent (optional)..."
                    value={opponent2}
                    onChange={setOpponent2}
                    disabled={isStarting}
                  />
                </div>
              )}

              {/* Start Time Override */}
              <FormField
                id="startTime"
                label="Start Time (EST)"
                type="datetime-local"
                placeholder=""
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isStarting}
                helpText="Auto-captured in EST (modify if logging a past match)"
              />
            </div>

            {/* Stakes Preview */}
            <StakesPreview
              rewards={rewards}
              opponentAnalysis={opponentAnalysis}
              doublesAnalysis={doublesAnalysis}
              isDoubles={isDoubles}
              loading={rewardsLoading}
            />

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
