
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Trophy, Star, TrendingUp, Activity } from 'lucide-react';

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
    { value: 'social_play', label: 'Social Play', icon: Users }
  ];

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity Feed</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.reload()}
          className="text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
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
              className={`cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => onFilterChange(option.value)}
            >
              <Icon className="w-3 h-3 mr-1" />
              {option.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
