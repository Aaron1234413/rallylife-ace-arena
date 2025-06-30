
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, User, X } from 'lucide-react';
import { useSearchUsers, SearchResult } from '@/hooks/useSearchUsers';
import { useAuth } from '@/hooks/useAuth';

interface SelectedPlayer {
  id: string;
  name: string;
  avatarUrl?: string;
  skillLevel?: string;
  currentLevel?: number;
}

interface SocialPlayParticipantSelectorProps {
  sessionType: 'singles' | 'doubles';
  selectedOpponent: SelectedPlayer | null;
  selectedPartner: SelectedPlayer | null;
  selectedOpponents: SelectedPlayer[];
  onOpponentSelect: (player: SelectedPlayer | null) => void;
  onPartnerSelect: (player: SelectedPlayer | null) => void;
  onOpponentsSelect: (players: SelectedPlayer[]) => void;
}

// Helper function to convert SearchResult to SelectedPlayer
const searchResultToPlayer = (result: SearchResult): SelectedPlayer => ({
  id: result.id,
  name: result.full_name,
  avatarUrl: result.avatar_url || undefined,
  skillLevel: result.skill_level,
  currentLevel: result.current_level
});

export const SocialPlayParticipantSelector: React.FC<SocialPlayParticipantSelectorProps> = ({
  sessionType,
  selectedOpponent,
  selectedPartner,
  selectedOpponents,
  onOpponentSelect,
  onPartnerSelect,
  onOpponentsSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  const { data: searchResults, isLoading } = useSearchUsers({
    query: searchQuery,
    userType: 'player',
    filters: {
      level: 'all',
      location: '',
      skillLevel: 'all',
      coachingFocus: 'all'
    }
  });

  const filteredPlayers = (searchResults || []).filter(result => {
    const isCurrentUser = result.id === user?.id;
    const isAlreadySelected = 
      selectedOpponent?.id === result.id ||
      selectedPartner?.id === result.id ||
      selectedOpponents.some(p => p.id === result.id);
    
    return !isCurrentUser && !isAlreadySelected && 
           result.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handlePlayerSelect = (result: SearchResult, role: string) => {
    const player = searchResultToPlayer(result);
    
    if (sessionType === 'singles' && role === 'opponent') {
      onOpponentSelect(player);
    } else if (sessionType === 'doubles') {
      if (role === 'partner') {
        onPartnerSelect(player);
      } else if (role === 'opponent') {
        if (selectedOpponents.length < 2) {
          onOpponentsSelect([...selectedOpponents, player]);
        }
      }
    }
    setSearchQuery('');
  };

  const removeOpponent = (playerId: string) => {
    onOpponentsSelect(selectedOpponents.filter(p => p.id !== playerId));
  };

  const PlayerCard = ({ player, onRemove }: { player: SelectedPlayer; onRemove?: () => void }) => (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={player.avatarUrl} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{player.name}</p>
          <div className="flex items-center gap-2 mt-1">
            {player.currentLevel && (
              <Badge variant="secondary" className="text-xs">Level {player.currentLevel}</Badge>
            )}
            {player.skillLevel && (
              <Badge variant="outline" className="text-xs capitalize">{player.skillLevel}</Badge>
            )}
          </div>
        </div>
      </div>
      {onRemove && (
        <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Select Players</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Players */}
        <div className="space-y-3">
          {sessionType === 'singles' && selectedOpponent && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Opponent</Label>
              <PlayerCard 
                player={selectedOpponent} 
                onRemove={() => onOpponentSelect(null)} 
              />
            </div>
          )}

          {sessionType === 'doubles' && (
            <>
              {selectedPartner && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Your Partner</Label>
                  <PlayerCard 
                    player={selectedPartner} 
                    onRemove={() => onPartnerSelect(null)} 
                  />
                </div>
              )}

              {selectedOpponents.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Opponents ({selectedOpponents.length}/2)</Label>
                  <div className="space-y-2">
                    {selectedOpponents.map((opponent, index) => (
                      <PlayerCard 
                        key={opponent.id} 
                        player={opponent} 
                        onRemove={() => removeOpponent(opponent.id)} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Available Players */}
        {searchQuery.length >= 2 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Available Players</Label>
            
            {isLoading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading players...
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No players found matching your search
              </div>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {filteredPlayers.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={result.avatar_url || ''} />
                        <AvatarFallback>
                          {result.full_name?.charAt(0) || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{result.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {result.current_level && (
                            <Badge variant="secondary" className="text-xs">Level {result.current_level}</Badge>
                          )}
                          {result.skill_level && (
                            <Badge variant="outline" className="text-xs capitalize">{result.skill_level}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {sessionType === 'singles' && !selectedOpponent && (
                        <Button
                          size="sm"
                          onClick={() => handlePlayerSelect(result, 'opponent')}
                          className="h-8"
                        >
                          Select as Opponent
                        </Button>
                      )}
                      
                      {sessionType === 'doubles' && (
                        <>
                          {!selectedPartner && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePlayerSelect(result, 'partner')}
                              className="h-8"
                            >
                              Partner
                            </Button>
                          )}
                          {selectedOpponents.length < 2 && (
                            <Button
                              size="sm"
                              onClick={() => handlePlayerSelect(result, 'opponent')}
                              className="h-8"
                            >
                              Opponent
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground">
          {sessionType === 'singles' 
            ? "Select 1 opponent to play against"
            : "Select 1 partner and 2 opponents for doubles play"
          }
        </div>
      </CardContent>
    </Card>
  );
};
