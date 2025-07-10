import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Users, 
  GraduationCap, 
  MapPin, 
  Coins,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';
import { useSessionManager } from '@/hooks/useSessionManager';
import { toast } from 'sonner';

type SessionType = 'challenge' | 'social' | 'training';

interface SessionCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  clubId?: string;
}

interface SessionData {
  type: SessionType;
  location: string;
  playerCount: number;
  stakesAmount?: number;
  fixedCost?: number;
}

const SESSION_TYPES = [
  {
    id: 'challenge' as SessionType,
    title: 'Challenge',
    description: 'Competitive match with stakes',
    icon: Trophy,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    features: ['Winner takes all', 'Stakes required', 'HP reduction', '2-4 players']
  },
  {
    id: 'social' as SessionType,
    title: 'Social Play',
    description: 'Casual play, no HP reduction',
    icon: Users,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    features: ['No HP cost', 'Optional stakes', 'Relaxed play', '2-4 players']
  },
  {
    id: 'training' as SessionType,
    title: 'Training',
    description: 'Fixed cost, unlimited players',
    icon: GraduationCap,
    color: 'bg-green-100 text-green-800 border-green-200',
    features: ['Skill development', 'Fixed token cost', 'HP rewards', 'Unlimited players']
  }
];

export function SessionCreationDialog({
  open,
  onOpenChange,
  onSuccess,
  clubId
}: SessionCreationDialogProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionData, setSessionData] = useState<Partial<SessionData>>({});
  const [loading, setLoading] = useState(false);
  const { createSession } = useSessionManager({ clubId });

  const resetForm = () => {
    setCurrentStep(1);
    setSessionData({});
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleTypeSelect = (type: SessionType) => {
    setSessionData({ ...sessionData, type });
    setCurrentStep(2);
  };

  const handleDetailsSubmit = (location: string, playerCount: number) => {
    setSessionData({ ...sessionData, location, playerCount });
    setCurrentStep(3);
  };

  const handleTokensSubmit = async (tokenData: { stakesAmount?: number; fixedCost?: number }) => {
    const finalData = { ...sessionData, ...tokenData };
    
    setLoading(true);
    try {
      await createSession({
        session_type: finalData.type,
        location: finalData.location,
        max_participants: finalData.playerCount,
        stakes_amount: finalData.stakesAmount || finalData.fixedCost || 0,
        cost_tokens: finalData.fixedCost || 0,
        notes: `${finalData.type} session at ${finalData.location}`,
        club_id: clubId
      });

      toast.success('Session created successfully!');
      handleClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const selectedType = SESSION_TYPES.find(t => t.id === sessionData.type);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Session - Step {currentStep} of 3</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    step < currentStep 
                      ? 'bg-green-500 text-white' 
                      : step === currentStep 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step < currentStep ? <Check className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        {currentStep === 1 && (
          <Step1SessionType onSelect={handleTypeSelect} />
        )}

        {currentStep === 2 && selectedType && (
          <Step2BasicDetails 
            sessionType={selectedType}
            onSubmit={handleDetailsSubmit}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && selectedType && (
          <Step3TokenConfiguration
            sessionType={selectedType}
            sessionData={sessionData}
            onSubmit={handleTokensSubmit}
            onBack={() => setCurrentStep(2)}
            loading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Step 1: Session Type Selection
function Step1SessionType({ onSelect }: { onSelect: (type: SessionType) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium mb-2">Choose Session Type</h3>
        <p className="text-muted-foreground">Select the type of tennis session you want to create</p>
      </div>

      <div className="grid gap-4">
        {SESSION_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Card
              key={type.id}
              className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02]"
              onClick={() => onSelect(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${type.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-lg">{type.title}</h4>
                      <Badge variant="outline" className={type.color}>
                        {type.id}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{type.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {type.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-muted rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Step 2: Basic Details
function Step2BasicDetails({ 
  sessionType, 
  onSubmit, 
  onBack 
}: { 
  sessionType: typeof SESSION_TYPES[0];
  onSubmit: (location: string, playerCount: number) => void;
  onBack: () => void;
}) {
  const [location, setLocation] = useState('');
  const [playerCount, setPlayerCount] = useState(2);

  const maxPlayers = sessionType.id === 'training' ? 20 : 4;
  const minPlayers = 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      toast.error('Location is required');
      return;
    }
    onSubmit(location, playerCount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <sessionType.icon className="w-5 h-5" />
          <h3 className="text-lg font-medium">{sessionType.title} Details</h3>
        </div>
        <p className="text-muted-foreground">Set the basic details for your session</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="location" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Location *
          </Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Central Park Courts, Court 3"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="players" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Number of Players
          </Label>
          <div className="mt-1">
            <Input
              id="players"
              type="number"
              min={minPlayers}
              max={maxPlayers}
              value={playerCount}
              onChange={(e) => setPlayerCount(parseInt(e.target.value) || 2)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {sessionType.id === 'training' 
                ? 'Unlimited players for training sessions' 
                : `2-4 players for ${sessionType.title.toLowerCase()} sessions`}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit">
          Next: Configure Tokens
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}

// Step 3: Token Configuration
function Step3TokenConfiguration({
  sessionType,
  sessionData,
  onSubmit,
  onBack,
  loading
}: {
  sessionType: typeof SESSION_TYPES[0];
  sessionData: Partial<SessionData>;
  onSubmit: (data: { stakesAmount?: number; fixedCost?: number }) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}) {
  const [stakesAmount, setStakesAmount] = useState(10);
  const [fixedCost, setFixedCost] = useState(1);

  const isTraining = sessionType.id === 'training';
  const minAmount = isTraining ? 1 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isTraining) {
      onSubmit({ fixedCost });
    } else {
      onSubmit({ stakesAmount: stakesAmount > 0 ? stakesAmount : undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Coins className="w-5 h-5" />
          <h3 className="text-lg font-medium">Token Configuration</h3>
        </div>
        <p className="text-muted-foreground">
          {isTraining ? 'Set the fixed cost for training' : 'Configure stakes for your session'}
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <sessionType.icon className="w-6 h-6" />
              <h4 className="font-medium">{sessionType.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{sessionType.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Location:</span>
                <p className="font-medium">{sessionData.location}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Players:</span>
                <p className="font-medium">{sessionData.playerCount}</p>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {isTraining ? (
            <div>
              <Label htmlFor="fixedCost" className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Fixed Cost (tokens) *
              </Label>
              <Input
                id="fixedCost"
                type="number"
                min={1}
                value={fixedCost}
                onChange={(e) => setFixedCost(parseInt(e.target.value) || 1)}
                className="mt-1 w-32"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Minimum 1 token required for training sessions
              </p>
            </div>
          ) : (
            <div>
              <Label htmlFor="stakes" className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Stakes Amount (tokens)
              </Label>
              <Input
                id="stakes"
                type="number"
                min={0}
                value={stakesAmount}
                onChange={(e) => setStakesAmount(parseInt(e.target.value) || 0)}
                className="mt-1 w-32"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {sessionType.id === 'social' 
                  ? 'Optional stakes for social play (0 = no stakes)'
                  : 'Stakes required for challenge matches (winner takes all)'}
              </p>
              
              {stakesAmount > 0 && (
                <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">Token Distribution:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Total Stakes:</span>
                      <span>{stakesAmount * (sessionData.playerCount || 2)} tokens</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Platform Fee (10%):</span>
                      <span>-{Math.floor(stakesAmount * (sessionData.playerCount || 2) * 0.1)} tokens</span>
                    </div>
                    <div className="flex justify-between font-medium text-green-600">
                      <span>Winner Gets:</span>
                      <span>{stakesAmount * (sessionData.playerCount || 2) - Math.floor(stakesAmount * (sessionData.playerCount || 2) * 0.1)} tokens</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Session'}
          <Check className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </form>
  );
}