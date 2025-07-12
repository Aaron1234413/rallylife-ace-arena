import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';

interface RealTimeStatusProps {
  isConnected: boolean;
  connectionStatus: {
    isFullyConnected: boolean;
    isPartiallyConnected: boolean;
    hasErrors: boolean;
    totalSubscriptions: number;
    connectedSubscriptions: number;
    errorSubscriptions: number;
  };
  isHealthy: boolean;
  className?: string;
}

export function RealTimeStatus({ 
  isConnected, 
  connectionStatus, 
  isHealthy, 
  className = "" 
}: RealTimeStatusProps) {
  const getStatusIcon = () => {
    if (!isConnected || connectionStatus.hasErrors) {
      return <WifiOff className="h-3 w-3" />;
    }
    if (connectionStatus.isPartiallyConnected) {
      return <AlertTriangle className="h-3 w-3" />;
    }
    if (connectionStatus.isFullyConnected) {
      return <CheckCircle className="h-3 w-3" />;
    }
    return <Wifi className="h-3 w-3" />;
  };

  const getStatusVariant = () => {
    if (!isConnected || connectionStatus.hasErrors) {
      return "destructive" as const;
    }
    if (connectionStatus.isPartiallyConnected) {
      return "secondary" as const;
    }
    if (connectionStatus.isFullyConnected) {
      return "default" as const;
    }
    return "outline" as const;
  };

  const getStatusText = () => {
    if (!isConnected) {
      return "Disconnected";
    }
    if (connectionStatus.hasErrors) {
      return "Connection Error";
    }
    if (connectionStatus.isPartiallyConnected) {
      return "Partially Connected";
    }
    if (connectionStatus.isFullyConnected) {
      return "Live Updates";
    }
    return "Connecting...";
  };

  const getTooltipContent = () => {
    const { totalSubscriptions, connectedSubscriptions, errorSubscriptions } = connectionStatus;
    
    return (
      <div className="space-y-1 text-xs">
        <div className="font-medium">Real-time Connection Status</div>
        <div>Active: {connectedSubscriptions}/{totalSubscriptions}</div>
        {errorSubscriptions > 0 && (
          <div className="text-destructive">Errors: {errorSubscriptions}</div>
        )}
        <div className="text-muted-foreground">
          {isHealthy ? "All systems operational" : "Some services may be delayed"}
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={getStatusVariant()} 
            className={`text-xs flex items-center gap-1 ${className}`}
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}