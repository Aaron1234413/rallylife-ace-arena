
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';
import { HPDisplay } from '@/components/hp/HPDisplay';
import { XPDisplay, LevelBadge } from '@/components/xp/XPDisplay';
import { TokenDisplay } from '@/components/tokens/TokenDisplay';

interface DashboardHeaderProps {
  profile: any;
  hpData: any;
  xpData: any;
  tokenData: any;
  equippedItems: any[];
  onSignOut: () => void;
}

export function DashboardHeader({
  profile,
  hpData,
  xpData,
  tokenData,
  equippedItems,
  onSignOut
}: DashboardHeaderProps) {
  const isPlayer = profile?.role === 'player';

  return (
    <div className="sticky top-0 z-50 bg-tennis-green-bg border-b border-tennis-green-light p-3 sm:p-4">
      <div className="flex items-center justify-between">
        {/* Left side - Avatar and Name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <AvatarDisplay 
            avatarUrl={profile?.avatar_url}
            equippedItems={equippedItems}
            size="medium"
            showBorder={true}
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-tennis-green-dark truncate">
                {profile?.full_name || 'User'}
              </h1>
              {isPlayer && xpData && (
                <LevelBadge level={xpData.current_level} size="small" />
              )}
            </div>
            {/* Mobile Stats Bar */}
            {isPlayer && (hpData || xpData || tokenData) && (
              <div className="mt-1 space-y-1">
                {hpData && (
                  <HPDisplay 
                    currentHP={hpData.current_hp} 
                    maxHP={hpData.max_hp} 
                    size="small"
                    showText={false}
                  />
                )}
                {xpData && (
                  <XPDisplay
                    currentLevel={xpData.current_level}
                    currentXP={xpData.current_xp}
                    xpToNextLevel={xpData.xp_to_next_level}
                    size="small"
                    showLevel={false}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Menu */}
        <div className="flex items-center gap-2">
          {tokenData && (
            <TokenDisplay
              regularTokens={tokenData.regular_tokens}
              premiumTokens={tokenData.premium_tokens}
              size="small"
              showPremium={false}
              className="hidden sm:flex"
            />
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="border-tennis-green-dark">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="space-y-4 pt-6">
                {isPlayer && (
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
                      onClick={() => window.location.href = '/achievements'}
                    >
                      🏆 Achievements
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
                      onClick={() => window.location.href = '/activities'}
                    >
                      📋 Activities
                    </Button>
                  </div>
                )}
                
                {tokenData && (
                  <div className="p-3 bg-white rounded-lg space-y-2">
                    <TokenDisplay
                      regularTokens={tokenData.regular_tokens}
                      premiumTokens={tokenData.premium_tokens}
                      size="small"
                      showPremium={true}
                    />
                  </div>
                )}

                <Button 
                  onClick={onSignOut} 
                  variant="outline" 
                  className="w-full justify-start flex items-center gap-2 border-tennis-green-dark text-tennis-green-dark hover:bg-tennis-green-dark hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
