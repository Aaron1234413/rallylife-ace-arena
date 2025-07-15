import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  CalendarIcon, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign, 
  Star,
  Trophy,
  Target,
  Zap,
  Play,
  ChevronRight,
  Check,
  UserPlus,
  Coins
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SessionCreationFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSession: (sessionData: any) => void;
}

export function SessionCreationFlow({ open, onOpenChange, onCreateSession }: SessionCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionData, setSessionData] = useState({
    type: "",
    title: "",
    description: "",
    date: undefined as Date | undefined,
    startTime: "",
    duration: "",
    maxPlayers: "",
    skillLevel: "",
    location: "",
    courtType: "",
    isPrivate: false,
    entryFee: "",
    prizePool: "",
    tokenWager: ""
  });

  const sessionTypes = [
    {
      id: "competitive",
      title: "Competitive Match",
      description: "Ranked singles or doubles match",
      icon: Trophy,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      id: "casual",
      title: "Casual Play",
      description: "Friendly games and practice",
      icon: Play,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      id: "training",
      title: "Training Session",
      description: "Skill development and drills",
      icon: Target,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      id: "tournament",
      title: "Mini Tournament",
      description: "Bracket-style competition",
      icon: Star,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  const skillLevels = [
    { value: "beginner", label: "Beginner (1.0-2.5)", description: "New to tennis" },
    { value: "intermediate", label: "Intermediate (3.0-4.0)", description: "Regular player" },
    { value: "advanced", label: "Advanced (4.5-5.5)", description: "Competitive player" },
    { value: "open", label: "Open Level", description: "All skill levels welcome" }
  ];

  const courts = [
    { id: "hard", name: "Hard Court", available: 3 },
    { id: "clay", name: "Clay Court", available: 1 },
    { id: "grass", name: "Grass Court", available: 0 },
    { id: "indoor", name: "Indoor Court", available: 2 }
  ];

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onCreateSession(sessionData);
      onOpenChange(false);
      setCurrentStep(1);
      setSessionData({
        type: "",
        title: "",
        description: "",
        date: undefined,
        startTime: "",
        duration: "",
        maxPlayers: "",
        skillLevel: "",
        location: "",
        courtType: "",
        isPrivate: false,
        entryFee: "",
        prizePool: "",
        tokenWager: ""
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return sessionData.type !== "";
      case 2:
        return sessionData.title && sessionData.date && sessionData.startTime && sessionData.duration;
      case 3:
        return sessionData.maxPlayers && sessionData.skillLevel && sessionData.courtType;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= step
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {currentStep > step ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div
              className={cn(
                "w-8 h-0.5 mx-2",
                currentStep > step ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Choose Session Type</h3>
        <p className="text-muted-foreground">What kind of tennis session would you like to create?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessionTypes.map((type) => (
          <Card
            key={type.id}
            className={cn(
              "cursor-pointer transition-all hover-scale",
              sessionData.type === type.id
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            )}
            onClick={() => setSessionData({ ...sessionData, type: type.id })}
          >
            <CardContent className="p-6 text-center">
              <div className={cn("w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center", type.bgColor)}>
                <type.icon className={cn("w-6 h-6", type.color)} />
              </div>
              <h4 className="font-semibold mb-2">{type.title}</h4>
              <p className="text-sm text-muted-foreground">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Session Details</h3>
        <p className="text-muted-foreground">Set up your session information</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Session Title</Label>
          <Input
            id="title"
            placeholder="e.g. Singles Match at Central Park"
            value={sessionData.title}
            onChange={(e) => setSessionData({ ...sessionData, title: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add details about your session..."
            value={sessionData.description}
            onChange={(e) => setSessionData({ ...sessionData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sessionData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sessionData.date ? format(sessionData.date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sessionData.date}
                  onSelect={(date) => setSessionData({ ...sessionData, date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={sessionData.startTime}
              onChange={(e) => setSessionData({ ...sessionData, startTime: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="duration">Duration</Label>
          <Select value={sessionData.duration} onValueChange={(value) => setSessionData({ ...sessionData, duration: value })}>
            <SelectTrigger>
              <SelectValue placeholder="How long will the session last?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
              <SelectItem value="180">3 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Players & Court</h3>
        <p className="text-muted-foreground">Configure player requirements and court preferences</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxPlayers">Maximum Players</Label>
            <Select value={sessionData.maxPlayers} onValueChange={(value) => setSessionData({ ...sessionData, maxPlayers: value })}>
              <SelectTrigger>
                <SelectValue placeholder="How many players?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 players (Singles)</SelectItem>
                <SelectItem value="4">4 players (Doubles)</SelectItem>
                <SelectItem value="6">6 players (Round Robin)</SelectItem>
                <SelectItem value="8">8 players (Tournament)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="skillLevel">Skill Level</Label>
            <Select value={sessionData.skillLevel} onValueChange={(value) => setSessionData({ ...sessionData, skillLevel: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Required skill level" />
              </SelectTrigger>
              <SelectContent>
                {skillLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div>
                      <div>{level.label}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Court Type</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
            {courts.map((court) => (
              <Card
                key={court.id}
                className={cn(
                  "cursor-pointer transition-all",
                  sessionData.courtType === court.id
                    ? "border-primary bg-primary/5"
                    : court.available > 0 
                      ? "hover:border-primary/50" 
                      : "opacity-50 cursor-not-allowed"
                )}
                onClick={() => court.available > 0 && setSessionData({ ...sessionData, courtType: court.id })}
              >
                <CardContent className="p-3 text-center">
                  <div className="font-medium text-sm">{court.name}</div>
                  <div className={cn(
                    "text-xs",
                    court.available > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {court.available > 0 ? `${court.available} available` : "No courts available"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="location">Location/Club</Label>
          <Select value={sessionData.location} onValueChange={(value) => setSessionData({ ...sessionData, location: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="central-park">Central Park Tennis Center</SelectItem>
              <SelectItem value="riverside-club">Riverside Tennis Club</SelectItem>
              <SelectItem value="downtown-courts">Downtown Public Courts</SelectItem>
              <SelectItem value="elite-academy">Elite Tennis Academy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">Final Settings</h3>
        <p className="text-muted-foreground">Review and add optional settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium capitalize">{sessionData.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Title:</span>
            <span className="font-medium">{sessionData.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date & Time:</span>
            <span className="font-medium">
              {sessionData.date && format(sessionData.date, "MMM d")} at {sessionData.startTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Players:</span>
            <span className="font-medium">{sessionData.maxPlayers} max</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Court:</span>
            <span className="font-medium capitalize">{sessionData.courtType?.replace('-', ' ')}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="entryFee">Entry Fee (Optional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="entryFee"
                type="number"
                placeholder="0.00"
                className="pl-10"
                value={sessionData.entryFee}
                onChange={(e) => setSessionData({ ...sessionData, entryFee: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="prizePool">Prize Pool (Optional)</Label>
            <div className="relative">
              <Trophy className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="prizePool"
                type="number"
                placeholder="0.00"
                className="pl-10"
                value={sessionData.prizePool}
                onChange={(e) => setSessionData({ ...sessionData, prizePool: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tokenWager">Token Wager (Optional)</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="tokenWager"
                type="number"
                placeholder="0"
                className="pl-10"
                value={sessionData.tokenWager}
                onChange={(e) => setSessionData({ ...sessionData, tokenWager: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <div className="font-medium">Private Session</div>
            <div className="text-sm text-muted-foreground">Only invited players can join</div>
          </div>
          <Button
            variant={sessionData.isPrivate ? "default" : "outline"}
            size="sm"
            onClick={() => setSessionData({ ...sessionData, isPrivate: !sessionData.isPrivate })}
          >
            {sessionData.isPrivate ? "Private" : "Public"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="min-h-[400px]">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid(currentStep)}
            className="min-w-[100px]"
          >
            {currentStep === 4 ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Create Session
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}