import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Clock, 
  Play, 
  MessageCircle, 
  TrendingUp,
  Settings,
  Calendar
} from 'lucide-react';
import { usePlayAvailability } from '@/hooks/usePlayAvailability';
import { formatDistanceToNow } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface PlayAvailabilityWidgetProps {
  clubId: string;
  onPlayerSelect?: (playerId: string) => void;
}

export function PlayAvailabilityWidget({ clubId, onPlayerSelect }: PlayAvailabilityWidgetProps) {
  const {
    availablePlayers,
    skillMatchedPlayers,
    userAvailability,
    loading,
    updating,
    toggleAvailability
  } = usePlayAvailability(clubId);

  const [showSettings, setShowSettings] = useState(false);
  const [preferredTimes, setPreferredTimes] = useState({
    morning: true,
    afternoon: true,
    evening: true
  });
  const [notes, setNotes] = useState('');

  const isUserAvailable = userAvailability?.is_available && 
    userAvailability?.expires_at && 
    new Date(userAvailability.expires_at) > new Date();

  const handleToggleAvailability = async () => {
    if (isUserAvailable) {
      // Turn off availability
      await toggleAvailability(false);
    } else {
      // Show settings dialog first
      setShowSettings(true);
    }
  };

  const handleConfirmAvailability = async () => {
    await toggleAvailability(true, preferredTimes, notes);
    setShowSettings(false);
    setNotes('');
  };

  const getTimePreferenceDisplay = (times: any) => {
    if (!times) return 'Anytime';
    const timeSlots = [];
    if (times.morning) timeSlots.push('Morning');
    if (times.afternoon) timeSlots.push('Afternoon');
    if (times.evening) timeSlots.push('Evening');
    return timeSlots.length > 0 ? timeSlots.join(', ') : 'Anytime';
  };

  const getRatingDisplay = (utr?: number, usta?: number) => {
    const ratings = [];
    if (utr) ratings.push(`UTR ${utr}`);
    if (usta) ratings.push(`USTA ${usta}`);
    return ratings.length > 0 ? ratings.join(' • ') : 'Unrated';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Availability Toggle */}
      <Card className="border-tennis-green-primary/20 bg-gradient-to-br from-tennis-green-bg/50 to-transparent">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Play className="h-5 w-5" />
            Looking to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isUserAvailable}
                  onCheckedChange={handleToggleAvailability}
                  disabled={updating}
                />
                <Label className="text-base font-medium">
                  {isUserAvailable ? "I'm looking to play!" : "Set as looking to play"}
                </Label>
              </div>
              {isUserAvailable && userAvailability && (
                <p className="text-sm text-tennis-green-medium">
                  Expires {formatDistanceToNow(new Date(userAvailability.expires_at), { addSuffix: true })}
                </p>
              )}
            </div>
            {updating && <LoadingSpinner size="sm" />}
          </div>

          {isUserAvailable && userAvailability && (
            <div className="p-3 bg-tennis-green-bg/50 rounded-lg border border-tennis-green-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-tennis-green-primary" />
                <span className="text-sm font-medium">Your preferences:</span>
              </div>
              <div className="text-sm text-tennis-green-medium space-y-1">
                <p>Times: {getTimePreferenceDisplay(userAvailability.preferred_times)}</p>
                {userAvailability.notes && (
                  <p>Notes: {userAvailability.notes}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skill-Matched Players */}
      {skillMatchedPlayers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
              <TrendingUp className="h-5 w-5" />
              Perfect Skill Match ({skillMatchedPlayers.length})
            </CardTitle>
            <p className="text-sm text-tennis-green-medium">
              Players with similar skill level looking to play
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skillMatchedPlayers.slice(0, 3).map((player) => (
                <div
                  key={player.player_id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-tennis-green-bg/30 transition-colors cursor-pointer"
                  onClick={() => onPlayerSelect?.(player.player_id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={player.avatar_url || undefined} />
                      <AvatarFallback className="bg-tennis-green-primary text-white">
                        {player.full_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-tennis-green-dark">{player.full_name}</p>
                      <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
                        <span>{getRatingDisplay(player.utr_rating, player.usta_rating)}</span>
                        <Badge variant="secondary" className="text-xs">
                          {getTimePreferenceDisplay(player.preferred_times)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">
                      Match Score: {player.skill_match_score.toFixed(1)}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Available Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Users className="h-5 w-5" />
            Looking to Play ({availablePlayers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availablePlayers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="font-medium mb-2 text-tennis-green-dark">No one is looking to play right now</h3>
              <p className="text-sm text-tennis-green-medium">
                Be the first to let others know you're available!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {availablePlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-tennis-green-bg/30 transition-colors cursor-pointer"
                  onClick={() => onPlayerSelect?.(player.player_id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={player.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-tennis-green-primary text-white">
                        {player.profiles?.full_name?.substring(0, 2).toUpperCase() || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-tennis-green-dark">
                        {player.profiles?.full_name || 'Unknown Player'}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
                        <Clock className="h-3 w-3" />
                        <span>{getTimePreferenceDisplay(player.preferred_times)}</span>
                        <span>•</span>
                        <span>
                          {getRatingDisplay(player.profiles?.utr_rating, player.profiles?.usta_rating)}
                        </span>
                      </div>
                      {player.notes && (
                        <p className="text-sm text-tennis-green-medium mt-1">"{player.notes}"</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {formatDistanceToNow(new Date(player.expires_at), { addSuffix: true })}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Your Play Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium mb-3 block">Preferred Times</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="morning"
                    checked={preferredTimes.morning}
                    onCheckedChange={(checked) =>
                      setPreferredTimes(prev => ({ ...prev, morning: checked as boolean }))
                    }
                  />
                  <Label htmlFor="morning">Morning (6AM - 12PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="afternoon"
                    checked={preferredTimes.afternoon}
                    onCheckedChange={(checked) =>
                      setPreferredTimes(prev => ({ ...prev, afternoon: checked as boolean }))
                    }
                  />
                  <Label htmlFor="afternoon">Afternoon (12PM - 6PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="evening"
                    checked={preferredTimes.evening}
                    onCheckedChange={(checked) =>
                      setPreferredTimes(prev => ({ ...prev, evening: checked as boolean }))
                    }
                  />
                  <Label htmlFor="evening">Evening (6PM - 10PM)</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="e.g., Looking for doubles partner, prefer competitive play..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAvailability} 
                disabled={updating || (!preferredTimes.morning && !preferredTimes.afternoon && !preferredTimes.evening)}
                className="flex-1"
              >
                {updating ? 'Setting...' : "I'm Looking to Play!"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}