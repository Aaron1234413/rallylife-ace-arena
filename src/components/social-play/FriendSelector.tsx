
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, X } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
}

interface FriendSelectorProps {
  selectedFriends: User[];
  onFriendSelect: (friend: User) => void;
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
  const { data: allUsers, isLoading } = useProfiles();
  const { user } = useAuth();

  // Filter users based on search query and exclude selected friends and current user
  const filteredUsers = (allUsers || []).filter(profile => {
    // Exclude current user
    if (profile.id === user?.id) return false;
    
    // Exclude already selected friends
    if (selectedFriends.some(selected => selected.id === profile.id)) return false;
    
    // Filter by search query (full name)
    if (searchQuery.trim()) {
      return profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
    // If no search query, don't show any users (user needs to type to search)
    return false;
  });

  const canAddMore = selectedFriends.length < maxSelection;

  const handleUserSelect = (profile: any) => {
    const user: User = {
      id: profile.id,
      full_name: profile.full_name || 'Unknown User',
      avatar_url: profile.avatar_url,
      email: profile.email
    };
    onFriendSelect(user);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Search Users to Invite
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name..."
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
                  key={friend.id}
                  variant="secondary"
                  className="flex items-center gap-2 pr-1"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={friend.avatar_url || ''} />
                    <AvatarFallback className="text-xs">
                      {friend.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {friend.full_name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onFriendRemove(friend.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Search Results</h4>
          
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">
              Loading users...
            </div>
          ) : !searchQuery.trim() ? (
            <div className="text-center py-4 text-muted-foreground">
              Type a name to search for users
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No users found matching "{searchQuery}"
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {filteredUsers.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="text-sm">
                        {profile.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">
                        {profile.full_name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => handleUserSelect(profile)}
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
            Maximum {maxSelection} users can be invited to a session
          </p>
        )}
      </CardContent>
    </Card>
  );
};
