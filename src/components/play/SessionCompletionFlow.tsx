import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Trophy, Star, Clock, Users, MessageSquare, TrendingUp } from "lucide-react";

interface SessionCompletionFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: any;
  onComplete: () => void;
}

export function SessionCompletionFlow({ open, onOpenChange, sessionData, onComplete }: SessionCompletionFlowProps) {
  const [step, setStep] = useState<"summary" | "rating" | "notes" | "rewards">("summary");
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [opponentRating, setOpponentRating] = useState(0);

  // Return early if sessionData is null to prevent errors
  if (!sessionData) {
    return null;
  }

  const handleNextStep = () => {
    switch (step) {
      case "summary":
        setStep("rating");
        break;
      case "rating":
        setStep("notes");
        break;
      case "notes":
        setStep("rewards");
        break;
      case "rewards":
        onComplete();
        onOpenChange(false);
        break;
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const calculateRewards = () => {
    const baseXP = 50;
    const durationBonus = Math.floor(sessionData.duration / 60) * 5;
    const resultBonus = sessionData.winner === "player1" ? 30 : 15;
    const ratingBonus = rating >= 4 ? 20 : 10;
    
    return {
      xp: baseXP + durationBonus + resultBonus + ratingBonus,
      tokens: Math.floor((baseXP + durationBonus + resultBonus + ratingBonus) / 10),
      ratingChange: sessionData.winner === "player1" ? 0.1 : -0.05
    };
  };

  const rewards = calculateRewards();

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-6xl mb-4">
          {sessionData.winner === "player1" ? "🏆" : "🎾"}
        </div>
        <h3 className="text-xl font-bold mb-2">
          {sessionData.winner === "player1" ? "Congratulations!" : "Great Match!"}
        </h3>
        <p className="text-muted-foreground">
          {sessionData.winner === "player1" ? "You won this session!" : "You gave it your best shot!"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">You</div>
              <div className="text-sm text-muted-foreground">Player 1</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Alex Johnson</div>
              <div className="text-sm text-muted-foreground">Player 2</div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">
                {sessionData.score?.[0]?.player1 || 6}
              </div>
              <div className="text-sm text-muted-foreground">Set 1</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {sessionData.score?.[0]?.player2 || 4}
              </div>
              <div className="text-sm text-muted-foreground">Set 1</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration
              </span>
              <span className="font-medium">{formatDuration(sessionData.duration)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Type
              </span>
              <Badge variant="secondary">{sessionData.type}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Location</span>
              <span className="font-medium">{sessionData.location}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderRatingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Rate Your Experience</h3>
        <p className="text-muted-foreground">How would you rate this session?</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="mb-4">Overall Session Quality</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition-colors"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          <Separator />

          <div className="text-center">
            <p className="mb-4">Rate Your Opponent</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setOpponentRating(star)}
                  className="transition-colors"
                >
                  <Star 
                    className={`w-8 h-8 ${star <= opponentRating ? 'fill-blue-400 text-blue-400' : 'text-gray-300'}`}
                  />
                </button>
              ))}
            </div>
            {opponentRating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Sportsmanship & Skill Level
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-bold mb-2">Session Notes</h3>
        <p className="text-muted-foreground">Share your thoughts about this session</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="How did you feel about your performance? Any highlights or areas for improvement?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground mt-2">
            These notes will be saved to your session history for future reference.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderRewardsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-bold mb-2">Session Rewards</h3>
        <p className="text-muted-foreground">You've earned rewards for completing this session!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">+{rewards.xp}</div>
            <div className="text-sm text-muted-foreground">XP Earned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">+{rewards.tokens}</div>
            <div className="text-sm text-muted-foreground">Tokens</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${rewards.ratingChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {rewards.ratingChange > 0 ? '+' : ''}{rewards.ratingChange}
            </div>
            <div className="text-sm text-muted-foreground">Rating Change</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Base XP</span>
            <span>+50</span>
          </div>
          <div className="flex justify-between">
            <span>Duration Bonus</span>
            <span>+{Math.floor(sessionData.duration / 60) * 5}</span>
          </div>
          <div className="flex justify-between">
            <span>Result Bonus</span>
            <span>+{sessionData.winner === "player1" ? 30 : 15}</span>
          </div>
          <div className="flex justify-between">
            <span>Rating Bonus</span>
            <span>+{rating >= 4 ? 20 : 10}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold">
            <span>Total XP</span>
            <span>+{rewards.xp}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Session Complete</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === "summary" && renderSummaryStep()}
          {step === "rating" && renderRatingStep()}
          {step === "notes" && renderNotesStep()}
          {step === "rewards" && renderRewardsStep()}

          <div className="flex gap-2">
            {step !== "summary" && (
              <Button 
                onClick={() => {
                  const steps = ["summary", "rating", "notes", "rewards"];
                  const currentIndex = steps.indexOf(step);
                  setStep(steps[currentIndex - 1] as any);
                }}
                variant="outline" 
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button 
              onClick={handleNextStep}
              className="flex-1"
              disabled={step === "rating" && (rating === 0 || opponentRating === 0)}
            >
              {step === "rewards" ? "Complete" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}