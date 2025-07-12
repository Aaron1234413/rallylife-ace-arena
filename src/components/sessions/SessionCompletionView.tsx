import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Trophy, 
  Medal, 
  Coins, 
  Heart, 
  Zap, 
  Clock, 
  Users, 
  ArrowLeft, 
  Share2,
  Download,
  Star,
  TrendingUp,
  Award,
  Target,
  Calendar
} from 'lucide-react';
import { UnifiedSession, SessionParticipant } from '@/hooks/useUnifiedSessions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SessionCompletionViewProps {
  session: UnifiedSession;
  participants: SessionParticipant[];
  completionData: {
    winner_data?: {
      winner_id: string;
      winner_name: string;
      winning_method?: string;
    };
    duration_seconds: number;
    ended_at: string;
    rewards_distributed?: {
      [participantId: string]: {
        tokens_earned: number;
        xp_earned: number;
        hp_change: number;
      };
    };
    session_stats?: {
      total_stakes: number;
      platform_fee: number;
      winner_payout: number;
    };
  };
  onReturnToSessions: () => void;
}

export function SessionCompletionView({
  session,
  participants,
  completionData,
  onReturnToSessions
}: SessionCompletionViewProps) {
  const winner = participants.find(p => p.user_id === completionData.winner_data?.winner_id);
  const duration = completionData.duration_seconds;
  const rewards = completionData.rewards_distributed || {};
  const stats = completionData.session_stats;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getParticipantInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${session.session_type} Session Completed!`,
      text: `Just finished a ${session.session_type} session! Winner: ${completionData.winner_data?.winner_name || 'TBD'}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast.success('Session details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share session details');
    }
  };

  const handleDownloadSummary = () => {
    const summaryData = {
      session: {
        type: session.session_type,
        location: session.location,
        duration: formatDuration(duration),
        completed_at: completionData.ended_at
      },
      winner: completionData.winner_data,
      participants: participants.map(p => ({
        name: p.user?.full_name,
        rewards: rewards[p.user_id] || { tokens_earned: 0, xp_earned: 0, hp_change: 0 }
      })),
      stats
    };

    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-summary-${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Session summary downloaded!');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Winner Announcement */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-50 via-yellow-100 to-orange-50" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-yellow-800">Session Complete!</CardTitle>
                <p className="text-yellow-700 font-medium">
                  {session.session_type} • {session.location}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-yellow-700">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold text-lg">{formatDuration(duration)}</span>
              </div>
              <p className="text-sm text-yellow-600">Duration</p>
            </div>
          </div>
        </CardHeader>
        
        {winner && (
          <CardContent className="relative pt-0">
            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-yellow-200">
              <Avatar className="h-12 w-12 ring-4 ring-yellow-400">
                <AvatarImage src={winner.user?.avatar_url} />
                <AvatarFallback className="bg-yellow-100 text-yellow-800 font-bold">
                  {getParticipantInitials(winner.user?.full_name || 'Winner')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-yellow-600" />
                  <span className="text-lg font-bold text-yellow-800">
                    {winner.user?.full_name || 'Unknown Player'}
                  </span>
                  <Badge className="bg-yellow-500 text-white">Winner</Badge>
                </div>
                <p className="text-sm text-yellow-700">
                  {completionData.winner_data?.winning_method || 'Victory achieved!'}
                </p>
              </div>
              {stats?.winner_payout && (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-800">
                    <Coins className="h-4 w-4" />
                    <span className="font-bold">{stats.winner_payout}</span>
                  </div>
                  <p className="text-xs text-yellow-600">Tokens Won</p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Participants Rewards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Participant Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {participants.map((participant) => {
              const participantRewards = rewards[participant.user_id] || {
                tokens_earned: 0,
                xp_earned: 0,
                hp_change: 0
              };
              const isWinner = participant.user_id === completionData.winner_data?.winner_id;

              return (
                <div
                  key={participant.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-all",
                    isWinner 
                      ? "border-yellow-200 bg-yellow-50/50" 
                      : "border-muted bg-background"
                  )}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant.user?.avatar_url} />
                      <AvatarFallback>
                        {getParticipantInitials(participant.user?.full_name || 'Player')}
                      </AvatarFallback>
                    </Avatar>
                    {isWinner && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                        <Trophy className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {participant.user?.full_name || 'Unknown Player'}
                      </span>
                      {isWinner && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          Winner
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Coins className="h-3 w-3 text-yellow-600" />
                        <span className={cn(
                          participantRewards.tokens_earned > 0 ? "text-green-600 font-medium" : "text-muted-foreground"
                        )}>
                          +{participantRewards.tokens_earned}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Zap className="h-3 w-3 text-blue-600" />
                        <span className={cn(
                          participantRewards.xp_earned > 0 ? "text-blue-600 font-medium" : "text-muted-foreground"
                        )}>
                          +{participantRewards.xp_earned}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Heart className="h-3 w-3 text-red-500" />
                        <span className={cn(
                          participantRewards.hp_change > 0 ? "text-green-600 font-medium" :
                          participantRewards.hp_change < 0 ? "text-red-600 font-medium" : "text-muted-foreground"
                        )}>
                          {participantRewards.hp_change > 0 ? '+' : ''}{participantRewards.hp_change}
                        </span>
                      </div>
                    </div>
                  </div>

                  <StatusBadge
                    status={isWinner ? "Winner" : "Participant"}
                    variant={isWinner ? "success" : "info"}
                    icon={isWinner ? Trophy : Target}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Session Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <Users className="h-5 w-5 text-blue-600" />
                {participants.length}
              </div>
              <p className="text-sm text-muted-foreground">Participants</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <Clock className="h-5 w-5 text-green-600" />
                {formatDuration(duration)}
              </div>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>

            {stats?.total_stakes && (
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-center gap-1 text-lg font-bold">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  {stats.total_stakes}
                </div>
                <p className="text-sm text-muted-foreground">Total Stakes</p>
              </div>
            )}

            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-center gap-1 text-lg font-bold">
                <Calendar className="h-5 w-5 text-purple-600" />
                {new Date(completionData.ended_at).toLocaleDateString()}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>

          {stats && (
            <div className="mt-6 p-4 rounded-lg border border-muted bg-muted/20">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Reward Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Prize Pool:</span>
                  <span className="font-medium">{stats.total_stakes} tokens</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (10%):</span>
                  <span className="font-medium">{stats.platform_fee} tokens</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Winner Payout:</span>
                  <span className="font-bold text-green-600">{stats.winner_payout} tokens</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onReturnToSessions} variant="outline" className="flex-1 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Return to Sessions
        </Button>
        
        <Button onClick={handleShare} variant="outline" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share Results
        </Button>
        
        <Button onClick={handleDownloadSummary} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Summary
        </Button>
      </div>

      {/* Celebratory Footer */}
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Star className="h-4 w-4" />
          <span className="text-sm">Great session! Ready for the next challenge?</span>
          <Star className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}