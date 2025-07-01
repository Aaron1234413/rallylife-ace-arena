
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap, Heart, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePlayerXP } from '@/hooks/usePlayerXP';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useSessionRecovery } from '@/hooks/useSessionRecovery';
import { InvitationNotificationBadge } from './InvitationNotificationBadge';
import { useLiveNotifications } from '@/hooks/useLiveNotifications';
import { LiveSessionStatusUpdater } from '@/components/session/LiveSessionStatusUpdater';

interface WelcomeBannerProps {
  profile?: any;
  hpData?: any;
  xpData?: any;
  tokenData?: any;
  equippedItems?: any[];
  onSignOut?: () => Promise<void>;
}

export function WelcomeBanner({ 
  profile, 
  hpData, 
  xpData, 
  tokenData, 
  equippedItems, 
  onSignOut 
}: WelcomeBannerProps) {
  const { user } = useAuth();
  const { xpData: fetchedXpData } = usePlayerXP();
  const { hpData: fetchedHpData } = usePlayerHP();
  const { tokenData: fetchedTokenData } = usePlayerTokens();
  const sessionRecovery = useSessionRecovery();
  
  // Initialize live notifications
  useLiveNotifications();
  
  // Use provided data or fallback to fetched data
  const finalXpData = xpData || fetchedXpData;
  const finalHpData = hpData || fetchedHpData;
  const finalTokenData = tokenData || fetchedTokenData;
  
  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Player';
  const currentLevel = finalXpData?.current_level || 1;

  return (
    <div className="space-y-4">
      <LiveSessionStatusUpdater />
      {/* Session Recovery Alert */}
      {(sessionRecovery.hasActiveMatchSession || sessionRecovery.hasActiveSocialPlaySession) && (
        <Card className="border-hsl(var(--tennis-yellow)/20) bg-hsl(var(--tennis-yellow-light)/10)">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-hsl(var(--tennis-yellow)) mt-0.5" />
              <div>
                <h3 className="font-semibold text-hsl(var(--tennis-green-dark))">Active Session Detected</h3>
                <p className="text-sm text-hsl(var(--tennis-green-dark))/80 mt-1">
                  {sessionRecovery.hasActiveMatchSession && sessionRecovery.hasActiveSocialPlaySession
                    ? "You have both an active match and social play session. Check the widgets below to resume."
                    : sessionRecovery.hasActiveMatchSession
                    ? "You have an active match session. Use the match widget below to continue playing."
                    : "You have an active social play session. Check the social play widget below to rejoin."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Welcome Banner */}
      <Card className="bg-gradient-to-r from-hsl(var(--tennis-green-light)) via-hsl(var(--tennis-green-medium)) to-hsl(var(--tennis-green-dark)) text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold font-orbitron">
                  Welcome back, {userName}!
                </h1>
                <InvitationNotificationBadge />
              </div>
              <p className="text-hsl(var(--tennis-green-light)) mb-4">
                Ready to elevate your tennis game today?
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  <Trophy className="h-4 w-4 mr-1" />
                  Level {currentLevel}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  <Zap className="h-4 w-4 mr-1" />
                  {finalTokenData?.regular_tokens || 0} RLT
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  <Heart className="h-4 w-4 mr-1" />
                  {finalHpData?.current_hp || 0} HP
                </Badge>
              </div>
            </div>
            
            <div className="text-right hidden sm:block">
              <div className="text-sm text-hsl(var(--tennis-green-light)) mb-1">Today's Goal</div>
              <div className="text-lg font-semibold font-orbitron">Get Active!</div>
              <div className="flex items-center text-sm text-hsl(var(--tennis-green-light)) mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
