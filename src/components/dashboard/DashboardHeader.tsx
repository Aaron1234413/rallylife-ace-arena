
import React from 'react';

interface DashboardHeaderProps {
  profile?: any;
  hpData?: any;
  xpData?: any;
  tokenData?: any;
  equippedItems?: any[];
  onSignOut?: () => Promise<void>;
}

export function DashboardHeader({ 
  profile, 
  hpData, 
  xpData, 
  tokenData, 
  equippedItems, 
  onSignOut 
}: DashboardHeaderProps) {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-tennis-green-dark">
        Welcome back to RallyLife! 🎾
      </h1>
      <p className="text-muted-foreground">
        Track your progress, connect with players, and level up your game
      </p>
    </div>
  );
}
