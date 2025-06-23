
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Sparkles, Brain, Flower2 } from 'lucide-react';
import { RecoveryCenter } from './RecoveryCenter';

interface RecoveryQuickActionProps {
  children?: React.ReactNode;
  className?: string;
}

export function RecoveryQuickAction({ children, className }: RecoveryQuickActionProps) {
  const [open, setOpen] = useState(false);

  const trigger = children || (
    <Button 
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 ${className}`}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Recovery Center
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <RecoveryCenter onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Alternative compact version for mobile
export function RecoveryQuickActionCompact({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={`flex items-center gap-2 ${className}`}>
          <div className="flex items-center -space-x-1">
            <Brain className="h-4 w-4 text-purple-500" />
            <Flower2 className="h-4 w-4 text-green-500" />
          </div>
          <span className="hidden sm:inline">Recovery</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <RecoveryCenter onClose={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
