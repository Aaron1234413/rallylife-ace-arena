
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel } from '@/components/ui/form';
import { useSearchUsers } from '@/hooks/useSearchUsers';

interface CoachSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
}

export function CoachSelector({ value, onValueChange }: CoachSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const { data: coaches, isLoading } = useSearchUsers({
    query: searchQuery,
    userType: 'coach',
    filters: {
      level: 'all',
      location: '',
      skillLevel: 'all',
      coachingFocus: 'all'
    }
  });

  const handleCoachSelect = (coachName: string) => {
    onValueChange(coachName);
    setSearchQuery(coachName);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    onValueChange(inputValue);
    setShowResults(inputValue.length > 0);
  };

  return (
    <FormItem>
      <FormLabel>Coach (Optional)</FormLabel>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for a coach or enter name manually"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setShowResults(searchQuery.length > 0)}
            className="pl-10"
          />
        </div>
        
        {showResults && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-gray-500">Searching...</div>
            ) : coaches && coaches.length > 0 ? (
              coaches.map((coach) => (
                <button
                  key={coach.id}
                  className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onClick={() => handleCoachSelect(coach.full_name)}
                >
                  <div className="font-medium">{coach.full_name}</div>
                  {coach.coaching_focus && (
                    <div className="text-sm text-gray-500">{coach.coaching_focus}</div>
                  )}
                </button>
              ))
            ) : searchQuery.length > 2 ? (
              <div className="p-3 text-gray-500">No coaches found</div>
            ) : null}
          </div>
        )}
      </div>
    </FormItem>
  );
}
