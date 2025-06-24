
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User, X, Check } from 'lucide-react';
import { useUserSearch } from '@/hooks/useUserSearch';
import { cn } from '@/lib/utils';

export interface SelectedOpponent {
  id?: string;
  name: string;
  isManual: boolean;
  skillLevel?: string;
  currentLevel?: number;
  avatarUrl?: string;
}

interface OpponentSearchSelectorProps {
  label: string;
  placeholder: string;
  value: SelectedOpponent | null;
  onChange: (opponent: SelectedOpponent | null) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export const OpponentSearchSelector: React.FC<OpponentSearchSelectorProps> = ({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  error
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const { users, isLoading } = useUserSearch(searchQuery);

  const handleUserSelect = useCallback((user: any) => {
    const selectedOpponent: SelectedOpponent = {
      id: user.id,
      name: user.full_name,
      isManual: false,
      skillLevel: user.skill_level,
      currentLevel: user.current_level,
      avatarUrl: user.avatar_url
    };
    onChange(selectedOpponent);
    setSearchQuery('');
    setShowResults(false);
  }, [onChange]);

  const handleManualAdd = useCallback(() => {
    if (manualEntry.trim()) {
      const manualOpponent: SelectedOpponent = {
        name: manualEntry.trim(),
        isManual: true
      };
      onChange(manualOpponent);
      setManualEntry('');
      setShowManualInput(false);
    }
  }, [manualEntry, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setSearchQuery('');
    setManualEntry('');
    setShowResults(false);
    setShowManualInput(false);
  }, [onChange]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(query.length >= 2);
  }, []);

  // If opponent is already selected, show selection
  if (value) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</Label>
        <Card className="border-green-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={value.avatarUrl} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">{value.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {value.isManual ? (
                      <Badge variant="outline" className="text-xs">External Player</Badge>
                    ) : (
                      <>
                        {value.currentLevel && (
                          <Badge variant="secondary" className="text-xs">Level {value.currentLevel}</Badge>
                        )}
                        {value.skillLevel && (
                          <Badge variant="outline" className="text-xs capitalize">{value.skillLevel}</Badge>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={disabled}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label} {required && <span className="text-red-500">*</span>}</Label>
      
      {/* Search Input */}
      {!showManualInput && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={disabled}
              className={cn(
                "pl-10",
                error && "border-red-500"
              )}
            />
          </div>
          
          {/* Search Results */}
          {showResults && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto">
              <CardContent className="p-2">
                {isLoading ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    Searching players...
                  </div>
                ) : users.length > 0 ? (
                  <div className="space-y-1">
                    {users.map((user) => (
                      <Button
                        key={user.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-2"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">{user.full_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {user.current_level && (
                                <Badge variant="secondary" className="text-xs">Level {user.current_level}</Badge>
                              )}
                              {user.skill_level && (
                                <Badge variant="outline" className="text-xs capitalize">{user.skill_level}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center">
                    <p className="text-sm text-gray-500 mb-2">No players found</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowManualInput(true);
                        setManualEntry(searchQuery);
                        setShowResults(false);
                      }}
                      className="text-xs"
                    >
                      Add "{searchQuery}" as external player
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Manual Entry */}
      {showManualInput && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter external player name"
              value={manualEntry}
              onChange={(e) => setManualEntry(e.target.value)}
              disabled={disabled}
              className={cn(error && "border-red-500")}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualAdd}
              disabled={!manualEntry.trim() || disabled}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowManualInput(false);
                setManualEntry('');
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Adding external player (not in our database)
          </p>
        </div>
      )}

      {/* Manual Entry Toggle */}
      {!showManualInput && !showResults && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowManualInput(true)}
          disabled={disabled}
          className="w-full text-xs h-8"
        >
          Can't find player? Add external player manually
        </Button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
