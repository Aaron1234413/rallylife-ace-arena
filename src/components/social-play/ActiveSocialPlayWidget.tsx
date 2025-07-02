import React from 'react';

interface ActiveSocialPlayWidgetProps {
  onAddXP?: (amount: number, type: string, desc?: string) => Promise<void>;
  onRestoreHP?: (amount: number, type: string, desc?: string) => Promise<void>;
}

export const ActiveSocialPlayWidget: React.FC<ActiveSocialPlayWidgetProps> = () => {
  // Temporarily disabled - needs migration to unified sessions system
  return null;
};