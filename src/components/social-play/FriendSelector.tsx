
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, X } from 'lucide-react';
import { useSearchUsers, SearchResult } from '@/hooks/useSearchUsers';
import { useAuth } from '@/hooks/useAuth';

interface Player {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface FriendSelectorProps {
  selectedFriends: Player[];
  onFriendSelect: (player: Player) => void;
  onFriendRemove: (playerId: string) => void;
  maxSelection?: number;
}

// Helper function to convert SearchResult to Player
const searchResultToPlayer = (result: SearchResult): Player => ({
  id: result.id,
  full_name: result.full_name,
  avatar_url: result.avatar_url
});

export const FriendSelector: React.FC<FriendSelectorProps> = ({
  selectedFriends,
  onFriendSelect,
  onFriendRemove,
  maxSelection = 3
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

  const filteredPlayers = (searchResults || []).filter(result => 
    result.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedFriends.some(selected => selected.id === result.id) &&
    result.id !== user?.id // Exclude the current user (session creator)
  );

  const canAddMore = selectedFriends.length < maxSelection;

  const handlePlayerSelect = (result: SearchResult) => {
    if (!canAddMore) return;
    const player = searchResultToPlayer(result);
    onFriendSelect(player);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Select Players to Invite
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Players */}
        {selectedFriends.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Selected ({selectedFriends.length}/{maxSelection})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedFriends.map((player) => (
                <Badge
                  key={player.id}
                  variant="secondary"
                  className="flex items-center gap-2 pr-1"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={player.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {player.full_name?.charAt(0) || 'P'}
                    </AvatarFallback>
                  </Avatar>
                  {player.full_name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onFriendRemove(player.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Players */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Available Players</h4>
          
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading players...
            </div>
          ) : filteredPlayers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery ? 'No players found matching your search' : 'Start typing to search for players'}
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
                      <AvatarFallback className="text-sm">
                        {result.full_name?.charAt(0) || 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{result.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Player on RallyLife
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handlePlayerSelect(result)}
                    disabled={!canAddMore}
                    className="h-8"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {!canAddMore && (
          <p className="text-xs text-muted-foreground text-center">
            Maximum {maxSelection} players can be invited to a session
          </p>
        )}
      </CardContent>
    </Card>
  );
};
