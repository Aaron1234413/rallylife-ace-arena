
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users } from 'lucide-react';
import { CreateEventForm } from './CreateEventForm';
import { useSocialPlayEvents } from '@/hooks/useSocialPlayEvents';

interface CreateSocialPlayDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEventCreated?: () => void;
}

export const CreateSocialPlayDialog: React.FC<CreateSocialPlayDialogProps> = ({
  children,
  open,
  onOpenChange,
  onEventCreated,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const { createEvent, isCreatingEvent } = useSocialPlayEvents();

  // Use controlled state if provided, otherwise use internal state
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  const handleEventCreate = async (eventData: {
    title: string;
    session_type: 'singles' | 'doubles';
    location: string;
    scheduled_time: Date;
    description?: string;
    invited_users: string[];
  }) => {
    try {
      await createEvent(eventData);
      handleOpenChange(false);
      onEventCreated?.();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // If we're controlling the dialog externally and no children are provided,
  // render the dialog without a trigger
  if (open !== undefined && !children) {
    return (
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create Social Tennis Event
            </DialogTitle>
          </DialogHeader>
          
          <CreateEventForm
            onEventCreate={handleEventCreate}
            isCreating={isCreatingEvent}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Standard implementation with trigger
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Create Social Tennis Event
          </DialogTitle>
        </DialogHeader>
        
        <CreateEventForm
          onEventCreate={handleEventCreate}
          isCreating={isCreatingEvent}
        />
      </DialogContent>
    </Dialog>
  );
};
