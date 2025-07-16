import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Trophy, Target, Users, RefreshCw } from 'lucide-react';
import { usePlayerDiscovery } from '@/hooks/usePlayerDiscovery';
import { ChallengeModal } from './ChallengeModal';

interface PlayerMatch {
  id: string;
  full_name: string;
  avatar_url?: string;
  skill_level: string;
  location?: string;
  utr_rating?: number;
  usta_rating?: number;
  availability?: any;
  stake_preference?: string;
  match_score: number;
  compatibility_factors: {
    skill_compatibility: number;
    location_match: boolean;
    stake_compatible: boolean;
  };
}

export function PlayerSuggestions() {
  const { suggestions, loading, refreshSuggestions } = usePlayerDiscovery();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerMatch | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  const handleChallenge = (player: PlayerMatch) => {
    setSelectedPlayer(player);
    setShowChallengeModal(true);
  };

  const getSkillLevelDisplay = (skillLevel: string) => {
    return skillLevel.replace('level_', 'Level ');
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Player Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Finding players...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Player Suggestions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSuggestions}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No player suggestions available</p>
              <p className="text-sm">Try updating your profile or preferences</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((player) => (
                <Card key={player.id} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={player.avatar_url} />
                        <AvatarFallback>
                          {player.full_name?.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {player.full_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getSkillLevelDisplay(player.skill_level)}
                          </Badge>
                          <span className={`text-xs font-medium ${getMatchScoreColor(player.match_score)}`}>
                            {player.match_score}% match
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      {player.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{player.location}</span>
                          {player.compatibility_factors.location_match && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              Same area
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {player.utr_rating && (
                        <div className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          <span>UTR: {player.utr_rating}</span>
                        </div>
                      )}

                      {player.stake_preference && (
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          <span>Stakes: {player.stake_preference}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => handleChallenge(player)}
                    >
                      Send Challenge
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlayer && (
        <ChallengeModal
          open={showChallengeModal}
          onOpenChange={setShowChallengeModal}
          opponent={selectedPlayer}
        />
      )}
    </>
  );
}