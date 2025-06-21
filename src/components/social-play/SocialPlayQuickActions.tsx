
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateSocialPlayDialog } from './CreateSocialPlayDialog';

export const SocialPlayQuickActions = () => {
  return (
    <div className="flex gap-2">
      <CreateSocialPlayDialog>
        <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </CreateSocialPlayDialog>
    </div>
  );
};
