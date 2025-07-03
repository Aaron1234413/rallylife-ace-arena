
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Trophy, Star, TrendingUp, Activity, Clock } from 'lucide-react';

interface FeedHeaderProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

export function FeedHeader({ filter, onFilterChange }: FeedHeaderProps) {
  const filterOptions = [
    { value: 'all', label: 'All', icon: Activity },
    { value: 'achievements', label: 'Achievements', icon: Trophy },
    { value: 'matches', label: 'Matches', icon: Star },
    { value: 'level_ups', label: 'Level Ups', icon: TrendingUp },
    { value: 'social_play', label: 'Social Play', icon: Users },
    { value: 'sessions', label: 'Sessions', icon: Clock }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-tennis-green-medium hover:text-tennis-green-dark border-tennis-green-bg/30"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => {
          const Icon = option.icon;
          const isActive = filter === option.value;
          
          return (
            <Badge
              key={option.value}
              variant={isActive ? 'default' : 'outline'}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 px-3 py-2 text-sm ${
                isActive 
                  ? 'bg-tennis-green-primary text-white hover:bg-tennis-green-dark shadow-md' 
                  : 'border-tennis-green-bg/50 text-tennis-green-medium hover:bg-tennis-green-light/20 hover:border-tennis-green-medium'
              }`}
              onClick={() => onFilterChange(option.value)}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              {option.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
