
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
      {/* CRT Bezel */}
      <div className={`
        relative bg-gradient-to-b from-gray-800 via-gray-900 to-black
        border-4 border-gray-700 ${sizeClasses[size]}
        shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),_0_0_20px_rgba(155,255,155,0.3)]
        before:absolute before:inset-2 before:rounded-lg
        before:bg-gradient-to-b before:from-transparent before:via-transparent before:to-black/20
        before:pointer-events-none
      `}>
        {/* Screen Title */}
        {title && (
          <div className="absolute -top-8 left-4 bg-gray-800 px-3 py-1 rounded-t border-x-2 border-t-2 border-gray-700">
            <span className={`text-xs font-orbitron text-${glowColor} tracking-widest uppercase`}>
              {title}
            </span>
          </div>
        )}
        
        {/* Inner Screen */}
        <div className="relative bg-black/90 backdrop-blur-sm rounded border border-gray-600/50 overflow-hidden">
          {/* Screen Content */}
          <div className="relative z-10">
            {children}
          </div>
          
          {/* Screen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
        </div>
        
        {/* Power LED */}
        <div className="absolute bottom-2 right-2 flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full bg-${glowColor} shadow-[0_0_8px_currentColor] animate-pulse`} />
          <span className="text-xs text-gray-500 font-orbitron">PWR</span>
        </div>
      </div>
    </div>
  );
}
