
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMatchSession } from '@/contexts/MatchSessionContext';
import { useMatchInvitations } from '@/hooks/useMatchInvitations';
import { Play, RefreshCw, AlertCircle, Send } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';
import { CardWithAnimation } from '@/components/ui/card-with-animation';
import { FormField } from '@/components/ui/form-field';
import { MatchTypeToggle } from '@/components/ui/match-type-toggle';
import { OpponentSearchSelector, SelectedOpponent } from '@/components/match/OpponentSearchSelector';
import { StakesPreview } from '@/components/match/StakesPreview';
import { useMatchRewards } from '@/hooks/useMatchRewards';
import { getRandomMessage } from '@/utils/motivationalMessages';
import { toast } from 'sonner';

const StartMatch = () => {
  const navigate = useNavigate();
  const { sessionData, updateSessionData, isSessionActive, loading } = useMatchSession();
  const { createInvitation } = useMatchInvitations();
  
  // Updated state to use SelectedOpponent objects
  const [opponent, setOpponent] = useState<SelectedOpponent | null>(null);
  const [isDoubles, setIsDoubles] = useState(false);
  const [partner, setPartner] = useState<SelectedOpponent | null>(null);
  const [opponent1, setOpponent1] = useState<SelectedOpponent | null>(null);
  const [opponent2, setOpponent2] = useState<SelectedOpponent | null>(null);
  
  // Fix timezone issue by using local timezone
  const getLocalDateTimeString = () => {
    const now = new Date();
    // Get local timezone offset and adjust
    const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localDateTime.toISOString().slice(0, 16);
  };
  
  const [startTime, setStartTime] = useState(getLocalDateTimeString());
  const [message, setMessage] = useState('');
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
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

  const handleCreateInvitation = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreatingInvitation(true);

    try {
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 800));

      // Convert local datetime string to proper Date object
      const startDateTime = new Date(startTime);

      if (isDoubles) {
        // For doubles, create invitation to first opponent
        if (opponent1) {
          await createInvitation({
            invitedUserName: opponent1.name,
            invitedUserId: opponent1.id,
            invitedUserEmail: opponent1.email || undefined,
            matchType: 'doubles',
            isDoubles: true,
            startTime: startDateTime,
            partnerName: partner?.name,
            partnerId: partner?.id,
            opponent1Name: opponent1.name,
            opponent1Id: opponent1.id,
            opponent2Name: opponent2?.name,
            opponent2Id: opponent2?.id,
            message: message.trim() || undefined
          });
        }
      } else {
        // For singles, create invitation to opponent
        if (opponent) {
          await createInvitation({
            invitedUserName: opponent.name,
            invitedUserId: opponent.id,
            invitedUserEmail: opponent.email || undefined,
            matchType: 'singles',
            isDoubles: false,
            startTime: startDateTime,
            opponentName: opponent.name,
            opponentId: opponent.id,
            message: message.trim() || undefined
          });
        }
      }

      toast.success('Match invitation sent! 🎾');
      
      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setIsCreatingInvitation(false);
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
              <Send className="h-6 w-6 text-tennis-green-dark" />
              Invite to Tennis Match
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
              disabled={isCreatingInvitation}
            />

            {/* Form Fields */}
            <div className="space-y-5">
              {/* Singles Fields */}
              {!isDoubles && (
                <div className="animate-fade-in">
                  <OpponentSearchSelector
                    label="Invite Opponent"
                    placeholder="Search for your opponent..."
                    value={opponent}
                    onChange={(newOpponent) => {
                      setOpponent(newOpponent);
                      clearFieldError('opponent');
                    }}
                    disabled={isCreatingInvitation}
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
                    disabled={isCreatingInvitation}
                    required
                    error={validationErrors.partner}
                  />
                  
                  <OpponentSearchSelector
                    label="Invite Opponent 1"
                    placeholder="Search for first opponent..."
                    value={opponent1}
                    onChange={(newOpponent1) => {
                      setOpponent1(newOpponent1);
                      clearFieldError('opponent1');
                    }}
                    disabled={isCreatingInvitation}
                    required
                    error={validationErrors.opponent1}
                  />
                  
                  <OpponentSearchSelector
                    label="Opponent 2 (Optional)"
                    placeholder="Search for second opponent (optional)..."
                    value={opponent2}
                    onChange={setOpponent2}
                    disabled={isCreatingInvitation}
                  />
                </div>
              )}

              {/* Start Time Override */}
              <FormField
                id="startTime"
                label="Proposed Start Time"
                type="datetime-local"
                placeholder=""
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isCreatingInvitation}
                helpText="Suggested match start time (they can accept or propose a different time)"
              />

              {/* Message */}
              <FormField
                id="message"
                label="Message (Optional)"
                type="textarea"
                placeholder="Add a personal message to your invitation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isCreatingInvitation}
                helpText="Make your invitation more personal with a message"
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

            {/* Send Invitation Button */}
            <div className="pt-4">
              <AnimatedButton
                onClick={handleCreateInvitation}
                loading={isCreatingInvitation}
                disabled={isCreatingInvitation}
                className="w-full h-14 text-lg bg-tennis-green-dark hover:bg-tennis-green text-white font-semibold"
              >
                <Send className="h-5 w-5 mr-2" />
                {isCreatingInvitation ? 'Sending Invitation...' : 'Send Match Invitation'}
              </AnimatedButton>
            </div>
          </CardContent>
        </CardWithAnimation>
      </div>
    </div>
  );
};

export default StartMatch;
