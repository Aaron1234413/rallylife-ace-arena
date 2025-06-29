
import React from 'react';

interface CRTMonitorProps {
  children: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large';
  glowColor?: string;
}

export function CRTMonitor({ 
  children, 
  title, 
  size = 'medium',
  glowColor = 'tennis-green-primary' 
}: CRTMonitorProps) {
  const sizeClasses = {
    small: 'p-2 md:p-4 rounded-lg',
    medium: 'p-3 md:p-6 rounded-xl',
    large: 'p-4 md:p-8 rounded-2xl'
  };

  return (
    <div className="relative w-full">
      {/* CRT Bezel - Enhanced with better contrast and mobile optimization */}
      <div className={`
        relative bg-gradient-to-b from-tennis-green-dark via-tennis-green-medium to-tennis-green-dark
        border-2 md:border-4 border-tennis-green-primary/80 ${sizeClasses[size]}
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),_0_0_30px_rgba(155,255,155,0.6)]
        before:absolute before:inset-1 md:before:inset-2 before:rounded-lg
        before:bg-gradient-to-b before:from-white/10 before:via-transparent before:to-black/20
        before:pointer-events-none
        w-full max-w-full
      `}>
        {/* Screen Title - Mobile responsive */}
        {title && (
          <div className="absolute -top-6 md:-top-8 left-2 md:left-4 bg-tennis-green-dark px-2 md:px-4 py-1 md:py-2 rounded-t border-x-2 border-t-2 border-tennis-green-primary/80 shadow-lg">
            <span className={`text-xs font-orbitron text-tennis-green-primary tracking-widest uppercase font-bold`}>
              {title}
            </span>
          </div>
        )}
        
        {/* Inner Screen - High contrast content area with mobile optimization */}
        <div className="relative bg-tennis-green-subtle/20 backdrop-blur-sm rounded border-2 border-tennis-green-primary/40 overflow-hidden shadow-inner w-full">
          {/* Screen Content */}
          <div className="relative z-10 w-full">
            {children}
          </div>
          
          {/* Screen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
        </div>
        
        {/* Power LED - Mobile responsive */}
        <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 flex items-center space-x-1 md:space-x-2">
          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full bg-tennis-green-primary shadow-[0_0_12px_currentColor] animate-pulse`} />
          <span className="text-xs text-tennis-green-primary font-orbitron font-bold">PWR</span>
        </div>
      </div>
    </div>
  );
}
