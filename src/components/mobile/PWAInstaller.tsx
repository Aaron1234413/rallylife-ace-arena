import React from 'react';
import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PWAInstaller() {
  const { isInstallable, isInstalled, isOnline, installApp } = usePWA();

  // Don't show installer if:
  // 1. App is already installed
  // 2. App is not installable
  // 3. Already running in standalone mode (PWA)
  // 4. Running on desktop (screen width > 1024px)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true;
  const isDesktop = window.innerWidth > 1024;
  
  if (isInstalled || !isInstallable || isStandalone || isDesktop) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 border-tennis-yellow bg-gradient-to-r from-tennis-green-dark to-tennis-green-primary text-white shadow-xl md:left-auto md:right-4 md:w-80">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-tennis-yellow/20 rounded-lg">
            <Smartphone className="h-5 w-5 text-tennis-yellow" />
          </div>
          <div className="flex-1">
            <h3 className="font-orbitron font-bold text-sm">Install RAKO</h3>
            <p className="text-xs text-tennis-green-bg/80">Add to your home screen for the best experience</p>
          </div>
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-tennis-green-bg/60" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 bg-tennis-yellow text-tennis-green-dark border-tennis-yellow hover:bg-tennis-yellow/90"
            onClick={installApp}
          >
            <Download className="h-4 w-4 mr-1" />
            Install
          </Button>
        </div>
        
        {!isOnline && (
          <Badge variant="destructive" className="w-full mt-2 justify-center">
            <WifiOff className="h-3 w-3 mr-1" />
            Offline mode
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}