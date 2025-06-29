
import React, { useState, useEffect } from 'react';

export function InsertCoin() {
  const [isBlinking, setIsBlinking] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(prev => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center space-x-4 py-4">
      {/* Coin Slot */}
      <div className="relative">
        <div className="w-16 h-8 bg-gradient-to-b from-gray-600 to-gray-800 rounded-lg border-2 border-gray-500 shadow-inner">
          <div className="absolute inset-x-2 top-1 h-6 bg-black rounded border border-gray-700" />
        </div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gray-700 rounded-b" />
      </div>

      {/* Insert Coin Text */}
      <div className={`font-orbitron text-tennis-yellow tracking-widest transition-opacity duration-300 ${
        isBlinking ? 'opacity-100' : 'opacity-30'
      }`}>
        <div className="text-sm uppercase">INSERT COIN</div>
        <div className="text-xs text-tennis-green-light text-center mt-1">TO CONTINUE</div>
      </div>

      {/* Animated Coin */}
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-tennis-yellow rounded-full border-2 border-yellow-300 shadow-[0_0_10px_rgba(255,255,0,0.5)] animate-bounce">
          <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full" />
          <div className="absolute inset-2 bg-tennis-yellow rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-black">¢</span>
          </div>
        </div>
      </div>
    </div>
  );
}
