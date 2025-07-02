import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  GraduationCap, 
  Heart, 
  Lock, 
  Unlock, 
  Coins, 
  Calculator,
  Copy,
  Check,
  MapPin,
  StickyNote,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const CreateSession = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tokenData } = usePlayerTokens();

  // Form state
  const [sessionType, setSessionType] = useState(searchParams.get('type') || 'match');
  const [format, setFormat] = useState<'singles' | 'doubles'>('singles');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [stakesAmount, setStakesAmount] = useState(0);
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Set initial max players based on session type and format
  useEffect(() => {
    if (sessionType === 'match') {
      setMaxPlayers(format === 'singles' ? 2 : 4);
    }
  }, [sessionType, format]);

  // Generate invitation code for private sessions
  const generateInvitationCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setInvitationCode(code);
  };

  useEffect(() => {
    if (isPrivate && !invitationCode) {
      generateInvitationCode();
    }
  }, [isPrivate]);

  const sessionTypes = [
    { 
      value: 'match', 
      label: 'Tennis Match', 
      icon: Trophy, 
      description: 'Competitive tennis match with scoring',
      color: 'text-blue-600'
    },
    { 
      value: 'social_play', 
      label: 'Social Play', 
      icon: Users, 
      description: 'Casual tennis session with friends',
      color: 'text-purple-600'
    },
    { 
      value: 'training', 
      label: 'Training Session', 
      icon: GraduationCap, 
      description: 'Practice drills and skill development',
      color: 'text-green-600'
    },
    { 
      value: 'wellbeing', 
      label: 'Wellbeing Session', 
      icon: Heart, 
      description: 'Recovery and mental wellness activities',
      color: 'text-pink-600'
    }
  ];

  const stakesOptions = sessionType === 'match' 
    ? [0, 25, 50, 100, 200, 500]
    : [0, 10, 25, 50];

  // Stakes calculator
  const calculateStakesBreakdown = () => {
    if (stakesAmount === 0) return null;

    const totalPool = stakesAmount * maxPlayers;
    
    if (sessionType === 'match') {
      return {
        type: 'Winner Takes All',
        totalPool,
        distribution: `Winner receives ${totalPool} tokens`,
        details: `Each player contributes ${stakesAmount} tokens`
      };
    } else {
      const organizerShare = Math.round(totalPool * 0.6);
      const participantShare = Math.round((totalPool - organizerShare) / maxPlayers);
      
      return {
        type: '60/40 Split',
        totalPool,
        distribution: `Organizer: ${organizerShare} tokens, Participants: ${participantShare} tokens each`,
        details: `Each player contributes ${stakesAmount} tokens`
      };
    }
  };

  const stakesBreakdown = calculateStakesBreakdown();

  const handleCreateSession = async () => {
    if (!user) {
      toast.error('You must be logged in to create a session');
      return;
    }

    if (!location.trim()) {
      toast.error('Please enter a location for your session');
      return;
    }

    // Check if user has enough tokens for stakes
    if (stakesAmount > 0 && tokenData && stakesAmount > tokenData.regular_tokens) {
      toast.error('Insufficient tokens for this stakes amount');
      return;
    }

    setCreating(true);

    try {
      // Create session
      const sessionData = {
        creator_id: user.id,
        session_type: sessionType,
        format: sessionType === 'match' ? format : null,
        max_players: maxPlayers,
        stakes_amount: stakesAmount,
        location: location.trim(),
        notes: notes.trim() || null,
        is_private: isPrivate,
        invitation_code: isPrivate ? invitationCode : null
      };

      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Automatically join the session as creator
      const { data: joinResult, error: joinError } = await supabase
        .rpc('join_session', {
          session_id_param: session.id,
          user_id_param: user.id
        });

      if (joinError) throw joinError;

      const result = joinResult as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || 'Failed to join session');
      }

      toast.success('Session created successfully!');
      
      // Navigate to sessions page
      navigate('/sessions');
      
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyInvitationLink = () => {
    if (invitationCode) {
      const inviteLink = `${window.location.origin}/sessions/join/${invitationCode}`;
      navigator.clipboard.writeText(inviteLink);
      setCopiedCode(true);
      toast.success('Invitation link copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const selectedSessionType = sessionTypes.find(type => type.value === sessionType);
  const SessionIcon = selectedSessionType?.icon || Plus;

  return (
    <div className="min-h-screen bg-tennis-green-bg p-3 sm:p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/sessions')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-tennis-green-dark">
              Create Session
            </h1>
            <p className="text-gray-600 mt-1">
              Set up a new tennis session for others to join
            </p>
          </div>
        </div>

        {/* Session Creation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <SessionIcon className={`h-6 w-6 ${selectedSessionType?.color}`} />
              <div>
                <span>Session Details</span>
                <p className="text-sm font-normal text-gray-600 mt-1">
                  {selectedSessionType?.description}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Session Type */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Session Type</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sessionTypes.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <div
                      key={type.value}
                      onClick={() => setSessionType(type.value)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        sessionType === type.value
                          ? 'border-tennis-green-medium bg-tennis-green-bg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TypeIcon className={`h-5 w-5 ${type.color}`} />
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Format (for matches only) */}
            {sessionType === 'match' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Match Format</Label>
                <Select value={format} onValueChange={(value: 'singles' | 'doubles') => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="singles">Singles (1 vs 1)</SelectItem>
                    <SelectItem value="doubles">Doubles (2 vs 2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Max Players (customizable for non-match sessions) */}
            {sessionType !== 'match' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">Maximum Players</Label>
                <Input
                  type="number"
                  min="2"
                  max="20"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 2)}
                />
              </div>
            )}

            {/* Stakes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-500" />
                Stakes (Optional)
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {stakesOptions.map((amount) => (
                  <Button
                    key={amount}
                    variant={stakesAmount === amount ? "default" : "outline"}
                    onClick={() => setStakesAmount(amount)}
                    className="text-sm"
                  >
                    {amount === 0 ? 'Free' : `${amount}T`}
                  </Button>
                ))}
              </div>
              
              {/* Custom stakes input */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Custom amount"
                  min="0"
                  max={tokenData?.regular_tokens || 0}
                  value={stakesAmount || ''}
                  onChange={(e) => setStakesAmount(parseInt(e.target.value) || 0)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon">
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>

              {/* Stakes breakdown */}
              {stakesBreakdown && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Stakes Breakdown</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div><strong>Type:</strong> {stakesBreakdown.type}</div>
                    <div><strong>Total Pool:</strong> {stakesBreakdown.totalPool} tokens</div>
                    <div><strong>Distribution:</strong> {stakesBreakdown.distribution}</div>
                    <div className="text-yellow-700 text-xs mt-2">{stakesBreakdown.details}</div>
                  </div>
                </div>
              )}

              {/* Token balance warning */}
              {tokenData && stakesAmount > tokenData.regular_tokens && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">
                    Insufficient tokens. You have {tokenData.regular_tokens} tokens, but need {stakesAmount}.
                  </p>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                Location *
              </Label>
              <Input
                placeholder="e.g., Central Park Tennis Courts, NYC"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-gray-500" />
                Notes (Optional)
              </Label>
              <Textarea
                placeholder="Add any additional details about your session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Privacy Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold flex items-center gap-2">
                  {isPrivate ? (
                    <Lock className="h-4 w-4 text-red-500" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-500" />
                  )}
                  Private Session
                </Label>
                <Switch
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
              </div>
              
              <p className="text-sm text-gray-600">
                {isPrivate 
                  ? 'Only people with the invitation link can join'
                  : 'Anyone can see and join this session'
                }
              </p>

              {/* Invitation code for private sessions */}
              {isPrivate && invitationCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-800">Invitation Code</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateInvitationCode}
                    >
                      Regenerate
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input 
                      value={invitationCode} 
                      readOnly 
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={copyInvitationLink}
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-blue-700 mt-2">
                    Share this link: {window.location.origin}/sessions/join/{invitationCode}
                  </p>
                </div>
              )}
            </div>

            {/* Create Session Button */}
            <div className="pt-4">
              <Button
                onClick={handleCreateSession}
                disabled={creating || !location.trim()}
                className="w-full h-12 text-lg bg-tennis-green-dark hover:bg-tennis-green text-white"
              >
                {creating ? 'Creating Session...' : 'Create Session'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateSession;