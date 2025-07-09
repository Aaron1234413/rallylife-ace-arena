import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { SessionAction } from '@/hooks/useEnhancedSessionActions';

interface SessionActionButtonProps {
  action: SessionAction;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function SessionActionButton({ 
  action, 
  onClick, 
  loading = false, 
  disabled = false 
}: SessionActionButtonProps) {
  return (
    <Button
      variant={action.variant}
      size="sm"
      onClick={onClick}
      disabled={disabled || loading}
      className="min-w-[100px] gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {action.loadingText}
        </>
      ) : (
        <>
          <span>{action.icon}</span>
          {action.label}
        </>
      )}
    </Button>
  );
}