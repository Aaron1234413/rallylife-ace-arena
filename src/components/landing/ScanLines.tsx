
import React from 'react';

interface ScanLinesProps {
  intensity?: 'light' | 'medium' | 'heavy';
  speed?: 'slow' | 'medium' | 'fast';
}

export function ScanLines({ intensity = 'medium', speed = 'medium' }: ScanLinesProps) {
  const intensityOpacity = {
    light: 'opacity-20',
    medium: 'opacity-30',
    heavy: 'opacity-40'
  };

  const speedDuration = {
    slow: 'animate-[scan_4s_linear_infinite]',
    medium: 'animate-[scan_2s_linear_infinite]',
    fast: 'animate-[scan_1s_linear_infinite]'
  };

  return (
    <>
      {/* Horizontal Scan Lines */}
      <div 
        className={`absolute inset-0 pointer-events-none ${intensityOpacity[intensity]} z-20`}
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(155, 255, 155, 0.3) 2px,
            rgba(155, 255, 155, 0.3) 4px
          )`
        }}
      />
      
      {/* Moving Scan Line */}
      <div className={`absolute inset-0 pointer-events-none z-30 ${speedDuration[speed]}`}>
        <div 
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-tennis-green-primary to-transparent opacity-60 shadow-[0_0_10px_currentColor]"
          style={{
            top: '0%',
            animation: `scan-line ${speed === 'fast' ? '1s' : speed === 'medium' ? '2s' : '4s'} linear infinite`
          }}
        />
      </div>

      <style jsx>{`
        @keyframes scan-line {
          0% { top: -2px; }
          100% { top: 100%; }
        }
      `}</style>
    </>
  );
}
