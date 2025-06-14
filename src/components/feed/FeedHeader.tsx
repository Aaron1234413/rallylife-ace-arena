
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';

interface FeedHeaderProps {
  filter: string;
  onFilterChange: (filter: string) => void;
  onCreatePost?: () => void;
}

export function FeedHeader({ filter, onFilterChange, onCreatePost }: FeedHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Feed</h1>
        {onCreatePost && (
          <Button onClick={onCreatePost} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Share Activity
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter posts..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="achievements">Achievements</SelectItem>
              <SelectItem value="matches">Match Results</SelectItem>
              <SelectItem value="level_ups">Level Ups</SelectItem>
              <SelectItem value="following">Following</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
