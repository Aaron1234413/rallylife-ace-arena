
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
    small: 'p-4 rounded-lg',
    medium: 'p-6 rounded-xl',
    large: 'p-8 rounded-2xl'
  };

  return (
    <div className="relative">
      {/* CRT Bezel - Updated with tennis green colors */}
      <div className={`
        relative bg-gradient-to-b from-tennis-green-medium via-tennis-green-dark to-tennis-green-bg
        border-4 border-tennis-green-primary/60 ${sizeClasses[size]}
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),_0_0_20px_rgba(155,255,155,0.4)]
        before:absolute before:inset-2 before:rounded-lg
        before:bg-gradient-to-b before:from-transparent before:via-transparent before:to-tennis-green-bg/20
        before:pointer-events-none
      `}>
        {/* Screen Title */}
        {title && (
          <div className="absolute -top-8 left-4 bg-tennis-green-dark px-3 py-1 rounded-t border-x-2 border-t-2 border-tennis-green-primary/60">
            <span className={`text-xs font-orbitron text-tennis-green-primary tracking-widest uppercase`}>
              {title}
            </span>
          </div>
        )}
        
        {/* Inner Screen - Dark with light content area */}
        <div className="relative bg-tennis-green-bg/10 backdrop-blur-sm rounded border border-tennis-green-primary/30 overflow-hidden">
          {/* Screen Content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Screen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
        
        {/* Power LED */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full bg-tennis-green-primary shadow-[0_0_8px_currentColor] animate-pulse`} />
          <span className="text-xs text-tennis-green-light font-orbitron">PWR</span>
        </div>
      </div>
    </div>
  );
}
