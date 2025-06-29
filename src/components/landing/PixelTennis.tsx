
import React, { useEffect, useState } from 'react';

export function PixelTennis() {
  const [ballPosition, setBallPosition] = useState({ x: 10, y: 50 });
  const [direction, setDirection] = useState({ x: 1, y: 0.5 });

  useEffect(() => {
    const interval = setInterval(() => {
      setBallPosition(prev => {
        let newX = prev.x + direction.x * 2;
        let newY = prev.y + direction.y * 1;
        let newDirectionX = direction.x;
        let newDirectionY = direction.y;

        // Bounce off sides
        if (newX <= 0 || newX >= 90) {
          newDirectionX = -direction.x;
          newX = newX <= 0 ? 0 : 90;
        }

        // Bounce off top/bottom
        if (newY <= 10 || newY >= 80) {
          newDirectionY = -direction.y;
          newY = newY <= 10 ? 10 : 80;
        }

        setDirection({ x: newDirectionX, y: newDirectionY });
        return { x: newX, y: newY };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="relative w-full h-32 bg-black rounded border border-tennis-green-primary/30 overflow-hidden">
      {/* Court Lines */}
      <div className="absolute inset-0">
        {/* Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-tennis-green-primary/40 transform -translate-x-0.5" />
        {/* Court Boundaries */}
        <div className="absolute inset-2 border border-tennis-green-primary/40 rounded" />
      </div>

      {/* Paddles */}
      <div className="absolute left-2 top-1/2 w-1 h-8 bg-tennis-green-primary transform -translate-y-1/2 rounded animate-pulse" />
      <div className="absolute right-2 top-1/2 w-1 h-8 bg-tennis-green-primary transform -translate-y-1/2 rounded animate-pulse" />

      {/* Ball */}
      <div 
        className="absolute w-2 h-2 bg-tennis-yellow rounded-full shadow-[0_0_8px_currentColor] transition-all duration-50 ease-linear"
        style={{
          left: `${ballPosition.x}%`,
          top: `${ballPosition.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      />

      {/* Score Display */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
        <div className="text-tennis-green-primary text-xs font-orbitron tracking-wider bg-black/80 px-2 py-0.5 rounded border border-tennis-green-primary/30">
          DEMO MODE
        </div>
      </div>

      {/* Retro Pixels Effect */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(155,255,155,0.15) 1px, transparent 0),
            radial-gradient(circle at 3px 3px, rgba(155,255,155,0.1) 1px, transparent 0)
          `,
          backgroundSize: '4px 4px, 6px 6px'
        }}
      />
    </div>
  );
}
