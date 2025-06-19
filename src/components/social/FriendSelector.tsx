
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, UserPlus, Users, X } from 'lucide-react';
import { useUserConnections } from '@/hooks/useUserConnections';
import { useSearchUsers } from '@/hooks/useSearchUsers';

interface FriendSelectorProps {
  selectedFriends: string[];
  onFriendsChange: (friendIds: string[]) => void;
  maxSelections?: number;
  excludeUserIds?: string[];
}

export function FriendSelector({ 
  selectedFriends, 
  onFriendsChange, 
  maxSelections = 10,
  excludeUserIds = []
}: FriendSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { connections, loading: connectionsLoading } = useUserConnections();
  
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers({
    query: searchQuery,
    userType: 'player',
    filters: {
      level: 'all',
      location: '',
      skillLevel: 'all',
      coachingFocus: 'all'
    }
  });

  // Filter connections to exclude already selected and excluded users
  const availableConnections = connections.filter(conn => 
    conn.profile && 
    !selectedFriends.includes(conn.profile.id) &&
    !excludeUserIds.includes(conn.profile.id)
  );

  // Filter search results similarly
  const availableSearchResults = searchResults?.filter(user =>
    !selectedFriends.includes(user.id) &&
    !excludeUserIds.includes(user.id)
  ) || [];

  const handleToggleFriend = (userId: string) => {
    if (selectedFriends.includes(userId)) {
      onFriendsChange(selectedFriends.filter(id => id !== userId));
    } else if (selectedFriends.length < maxSelections) {
      onFriendsChange([...selectedFriends, userId]);
    }
  };

  const getSelectedFriendData = (friendId: string) => {
    // First check connections
    const connection = connections.find(conn => conn.profile?.id === friendId);
    if (connection?.profile) {
      return {
        id: connection.profile.id,
        name: connection.profile.full_name,
        avatar_url: connection.profile.avatar_url
      };
    }
    
    // Then check search results
    const searchResult = searchResults?.find(user => user.id === friendId);
    if (searchResult) {
      return {
        id: searchResult.id,
        name: searchResult.full_name,
        avatar_url: searchResult.avatar_url
      };
    }
    
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Selected Friends Display */}
      {selectedFriends.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Selected Players ({selectedFriends.length}/{maxSelections})</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onFriendsChange([])}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map(friendId => {
              const friendData = getSelectedFriendData(friendId);
              if (!friendData) return null;
              
              return (
                <Badge 
                  key={friendId} 
                  variant="secondary" 
                  className="flex items-center gap-2 pl-2 pr-1 py-1"
                >
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={friendData.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {friendData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{friendData.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleToggleFriend(friendId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search for players to invite..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ScrollArea className="h-64">
        <div className="space-y-4">
          {/* Your Connections */}
          {availableConnections.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Your Connections</span>
              </div>
              <div className="space-y-2">
                {availableConnections.map(connection => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={connection.profile?.avatar_url || ''} />
                        <AvatarFallback>
                          {connection.profile?.full_name.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {connection.profile?.full_name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">Connected player</p>
                      </div>
                    </div>
                    <Button
                      variant={selectedFriends.includes(connection.profile!.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleFriend(connection.profile!.id)}
                      disabled={!selectedFriends.includes(connection.profile!.id) && selectedFriends.length >= maxSelections}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {selectedFriends.includes(connection.profile!.id) ? 'Selected' : 'Invite'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <>
              {availableConnections.length > 0 && <Separator />}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Search Results</span>
                </div>
                {searchLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3 animate-pulse p-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-1" />
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : availableSearchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No players found matching your search
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableSearchResults.map(user => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback>
                              {user.full_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.full_name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                Level {user.current_level || 1}
                              </p>
                              {user.match_percentage && (
                                <Badge variant="outline" className="text-xs">
                                  {user.match_percentage}% match
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant={selectedFriends.includes(user.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleToggleFriend(user.id)}
                          disabled={!selectedFriends.includes(user.id) && selectedFriends.length >= maxSelections}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          {selectedFriends.includes(user.id) ? 'Selected' : 'Invite'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Empty State */}
          {!searchQuery && availableConnections.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground mb-2">No connections found</p>
              <p className="text-xs text-muted-foreground">
                Search for players to invite to your session
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
