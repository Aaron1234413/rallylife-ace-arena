
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, X, Users } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
  skill_level?: string;
  location?: string;
}

interface UserSearchSelectorProps {
  selectedUsers: User[];
  onUserSelect: (user: User) => void;
  onUserRemove: (userId: string) => void;
  maxSelection: number;
  sessionType: 'singles' | 'doubles';
}

export const UserSearchSelector: React.FC<UserSearchSelectorProps> = ({
  selectedUsers,
  onUserSelect,
  onUserRemove,
  maxSelection,
  sessionType,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { users, isLoading, error } = useUserSearch(searchQuery);

  const handleUserSelect = (user: User) => {
    if (selectedUsers.length >= maxSelection) return;
    if (selectedUsers.some(u => u.id === user.id)) return;
    
    onUserSelect(user);
    setSearchQuery(''); // Clear search after selection
  };

  const availableUsers = users.filter(user => 
    !selectedUsers.some(selected => selected.id === user.id)
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium flex items-center gap-2">
          <Users className="h-4 w-4" />
          Invite Players
          <Badge variant="secondary" className="ml-2">
            {selectedUsers.length}/{maxSelection} selected
          </Badge>
        </h3>
        
        <p className="text-sm text-muted-foreground">
          Search and select players to invite to your {sessionType} session
        </p>
      </div>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Players:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5"
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="text-xs">
                    {user.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user.full_name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-red-100"
                  onClick={() => onUserRemove(user.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Search */}
      {selectedUsers.length < maxSelection && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search players by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="max-h-60 overflow-y-auto border rounded-lg bg-white">
              {isLoading && (
                <div className="p-4 text-center text-muted-foreground">
                  Searching players...
                </div>
              )}
              
              {error && (
                <div className="p-4 text-center text-red-600">
                  Error searching players. Please try again.
                </div>
              )}
              
              {!isLoading && !error && availableUsers.length === 0 && searchQuery && (
                <div className="p-4 text-center text-muted-foreground">
                  No players found matching "{searchQuery}"
                </div>
              )}
              
              {!isLoading && !error && availableUsers.length > 0 && (
                <div className="divide-y">
                  {availableUsers.slice(0, 8).map((user) => (
                    <div
                      key={user.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                      onClick={() => handleUserSelect(user)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url || ''} />
                        <AvatarFallback>
                          {user.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {user.skill_level && (
                            <Badge variant="outline" className="text-xs">
                              {user.skill_level}
                            </Badge>
                          )}
                          {user.location && (
                            <span>{user.location}</span>
                          )}
                        </div>
                      </div>
                      
                      <Button size="sm" variant="outline">
                        Invite
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {selectedUsers.length >= maxSelection && (
        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
          Maximum {maxSelection} players selected for {sessionType} session
        </p>
      )}
    </div>
  );
};
