import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Settings, Plus } from 'lucide-react';

interface EmptyCourtStateProps {
  isOwner: boolean;
  onNavigateToSettings: () => void;
}

export function EmptyCourtState({ isOwner, onNavigateToSettings }: EmptyCourtStateProps) {
  return (
    <Card className="border-dashed border-2 border-tennis-green-bg">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Target className="h-16 w-16 text-tennis-green-medium mb-4" />
        
        <h3 className="text-lg font-semibold text-tennis-green-dark mb-2">
          No Courts Configured
        </h3>
        
        <p className="text-tennis-green-medium mb-6 max-w-md">
          {isOwner 
            ? "Get started by adding courts to your club. Members will be able to book courts once they're configured."
            : "This club hasn't configured any courts yet. Court booking will be available once courts are added."
          }
        </p>
        
        {isOwner && (
          <Button 
            onClick={onNavigateToSettings}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Courts
          </Button>
        )}
        
        {!isOwner && (
          <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
            <Settings className="h-4 w-4" />
            Contact club administrators to set up courts
          </div>
        )}
      </CardContent>
    </Card>
  );
}