
import React from 'react';
import { Brain } from 'lucide-react';
import { ActionButton } from '@/components/dashboard/player/ActionButton';

interface RecoveryQuickActionProps {
  onOpenRecoveryCenter: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function RecoveryQuickAction({ 
  onOpenRecoveryCenter, 
  disabled = false, 
  loading = false 
}: RecoveryQuickActionProps) {
  const recoveryAction = {
    id: 'recovery-center',
    title: 'Meditation & Recovery',
    description: 'Restore your energy with mindful meditation and stretching',
    icon: Brain,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    rewards: { hp: 8, xp: 10, tokens: 10 },
    recommended: true,
    estimatedDuration: 10,
    difficulty: 'low' as const,
    onClick: onOpenRecoveryCenter
  };

  return (
    <ActionButton
      action={recoveryAction}
      onClick={onOpenRecoveryCenter}
      disabled={disabled}
      loading={loading}
    />
  );
}
