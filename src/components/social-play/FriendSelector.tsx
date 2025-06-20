
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, X } from 'lucide-react';
import { useFriendConnections } from '@/hooks/useFriendConnections';

interface Friend {
  friend_id: string;
  friend_name: string;
  friend_avatar_url: string | null;
  connection_status: string;
  connected_since: string;
}

interface FriendSelectorProps {
  selectedFriends: Friend[];
  onFriendSelect: (friend: Friend) => void;
  onFriendRemove: (friendId: string) => void;
  maxSelection?: number;
}

export const FriendSelector: React.FC<FriendSelectorProps> = ({
  selectedFriends,
  onFriendSelect,
  onFriendRemove,
  maxSelection = 3
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { friends, isLoading } = useFriendConnections();

  const filteredFriends = friends.filter(friend => 
    friend.friend_name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedFriends.some(selected => selected.friend_id === friend.friend_id)
  );

  const canAddMore = selectedFriends.length < maxSelection;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Select Friends to Invite
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected Friends */}
        {selectedFriends.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">
              Selected ({selectedFriends.length}/{maxSelection})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedFriends.map((friend) => (
                <Badge
                  key={friend.friend_id}
                  variant="secondary"
                  className="flex items-center gap-2 pr-1"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={friend.friend_avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {friend.friend_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {friend.friend_name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onFriendRemove(friend.friend_id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Available Friends */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Available Friends</h4>
          
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading friends...
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchQuery ? 'No friends found matching your search' : 'No friends available'}
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredFriends.map((friend) => (
                <div
                  key={friend.friend_id}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.friend_avatar_url || ''} />
                      <AvatarFallback className="text-sm">
                        {friend.friend_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{friend.friend_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Connected since {new Date(friend.connected_since).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => onFriendSelect(friend)}
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
            Maximum {maxSelection} friends can be invited to a session
          </p>
        )}
      </CardContent>
    </Card>
  );
};
