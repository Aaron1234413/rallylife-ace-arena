
import React, { useState, useEffect } from 'react';

interface GameConsoleProps {
  onPowerToggle?: (isOn: boolean) => void;
}

export function GameConsole({ onPowerToggle }: GameConsoleProps) {
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isBooting, setIsBooting] = useState(false);
  const [activeButtons, setActiveButtons] = useState<string[]>([]);

  const handlePowerToggle = () => {
    if (isPoweredOn) {
      setIsPoweredOn(false);
      onPowerToggle?.(false);
    } else {
      setIsPoweredOn(true);
      setIsBooting(true);
      onPowerToggle?.(true);
      
      setTimeout(() => {
        setIsBooting(false);
      }, 2000);
    }
  };

  const handleButtonPress = (buttonId: string) => {
    setActiveButtons(prev => [...prev, buttonId]);
    setTimeout(() => {
      setActiveButtons(prev => prev.filter(id => id !== buttonId));
    }, 150);
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-700 to-gray-900 rounded-xl p-6 border-4 border-gray-600 shadow-2xl">
      {/* Console Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-tennis-green-primary font-orbitron text-sm tracking-wider uppercase">
          RAKO CONSOLE v2.0
        </div>
        <button
          onClick={handlePowerToggle}
          className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${
            isPoweredOn 
              ? 'bg-tennis-green-primary border-tennis-green-accent shadow-[0_0_10px_rgba(155,255,155,0.8)]' 
              : 'bg-gray-800 border-gray-600'
          }`}
        >
          <div className={`w-3 h-3 rounded-full mx-auto transition-all duration-300 ${
            isPoweredOn ? 'bg-black animate-pulse' : 'bg-gray-600'
          }`} />
        </button>
      </div>

      {/* Status Display */}
      <div className="bg-black rounded border border-tennis-green-primary/30 p-3 mb-4">
        <div className="text-tennis-green-primary font-orbitron text-xs tracking-widest">
          {isBooting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin w-3 h-3 border border-tennis-green-primary rounded-full border-t-transparent"></div>
              <span>BOOTING SYSTEM...</span>
            </div>
          ) : isPoweredOn ? (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse"></div>
              <span>SYSTEM ONLINE</span>
            </div>
          ) : (
            <span className="text-gray-600">SYSTEM OFFLINE</span>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-4 gap-2">
        {['A', 'B', 'X', 'Y'].map((button) => (
          <button
            key={button}
            onClick={() => handleButtonPress(button)}
            disabled={!isPoweredOn}
            className={`
              w-12 h-12 rounded-full border-3 font-orbitron font-bold text-sm
              transition-all duration-150 transform
              ${isPoweredOn 
                ? `border-tennis-green-primary bg-tennis-green-primary/10 text-tennis-green-primary
                   hover:bg-tennis-green-primary/20 hover:shadow-[0_0_15px_rgba(155,255,155,0.5)]
                   active:scale-95 active:bg-tennis-green-primary/30` 
                : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
              }
              ${activeButtons.includes(button) ? 'scale-95 bg-tennis-green-primary/40' : ''}
            `}
          >
            {button}
          </button>
        ))}
      </div>

      {/* D-Pad */}
      <div className="mt-4 flex justify-center">
        <div className="relative w-20 h-20">
          {/* Horizontal bar */}
          <div className="absolute top-1/2 left-0 right-0 h-6 bg-gray-600 transform -translate-y-1/2 rounded"></div>
          {/* Vertical bar */}
          <div className="absolute left-1/2 top-0 bottom-0 w-6 bg-gray-600 transform -translate-x-1/2 rounded"></div>
          
          {/* Direction buttons */}
          {[
            { dir: 'up', classes: 'top-0 left-1/2 -translate-x-1/2' },
            { dir: 'down', classes: 'bottom-0 left-1/2 -translate-x-1/2' },
            { dir: 'left', classes: 'left-0 top-1/2 -translate-y-1/2' },
            { dir: 'right', classes: 'right-0 top-1/2 -translate-y-1/2' }
          ].map(({ dir, classes }) => (
            <button
              key={dir}
              onClick={() => handleButtonPress(dir)}
              disabled={!isPoweredOn}
              className={`
                absolute w-5 h-5 rounded-sm transform ${classes}
                ${isPoweredOn 
                  ? 'bg-tennis-green-primary/20 border border-tennis-green-primary/50 hover:bg-tennis-green-primary/30' 
                  : 'bg-gray-700 border border-gray-600'
                }
                ${activeButtons.includes(dir) ? 'bg-tennis-green-primary/50' : ''}
                transition-all duration-150
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
