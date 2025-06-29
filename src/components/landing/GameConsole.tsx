
import React, { useState, useEffect, useRef } from 'react';

interface GameConsoleProps {
  onPowerToggle?: (isOn: boolean) => void;
}

export function GameConsole({ onPowerToggle }: GameConsoleProps) {
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isBooting, setIsBooting] = useState(false);
  
  // Serve Game State
  const [isCharging, setIsCharging] = useState(false);
  const [power, setPower] = useState(0);
  const [isServing, setIsServing] = useState(false);
  const [serveComplete, setServeComplete] = useState(false);
  const [maxPowerAchieved, setMaxPowerAchieved] = useState(0);
  
  const chargingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const serveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePowerToggle = () => {
    if (isPoweredOn) {
      setIsPoweredOn(false);
      onPowerToggle?.(false);
      // Reset game state
      setIsCharging(false);
      setPower(0);
      setIsServing(false);
      setServeComplete(false);
    } else {
      setIsPoweredOn(true);
      setIsBooting(true);
      onPowerToggle?.(true);
      
      setTimeout(() => {
        setIsBooting(false);
      }, 2000);
    }
  };

  const startCharging = () => {
    if (!isPoweredOn || isServing) return;
    
    setIsCharging(true);
    setServeComplete(false);
    setPower(0);
    
    chargingIntervalRef.current = setInterval(() => {
      setPower(prev => {
        const newPower = Math.min(prev + 1, 100);
        return newPower;
      });
    }, 50);
  };

  const stopCharging = () => {
    if (!isCharging || !isPoweredOn) return;
    
    setIsCharging(false);
    if (chargingIntervalRef.current) {
      clearInterval(chargingIntervalRef.current);
    }
    
    if (power > 0) {
      setIsServing(true);
      setMaxPowerAchieved(power);
      
      // Serve animation duration based on power
      const serveDuration = 1000 + (power * 10); // 1-2 seconds
      
      serveTimeoutRef.current = setTimeout(() => {
        setIsServing(false);
        setServeComplete(true);
        
        // Reset after showing result
        setTimeout(() => {
          setServeComplete(false);
          setPower(0);
          setMaxPowerAchieved(0);
        }, 2000);
      }, serveDuration);
    }
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (chargingIntervalRef.current) {
        clearInterval(chargingIntervalRef.current);
      }
      if (serveTimeoutRef.current) {
        clearTimeout(serveTimeoutRef.current);
      }
    };
  }, []);

  const getPowerColor = () => {
    if (power < 30) return 'bg-tennis-green-primary';
    if (power < 70) return 'bg-tennis-yellow';
    return 'bg-red-500';
  };

  const getServeSpeed = () => {
    if (maxPowerAchieved < 30) return 'Gentle';
    if (maxPowerAchieved < 50) return 'Medium';
    if (maxPowerAchieved < 70) return 'Fast';
    if (maxPowerAchieved < 90) return 'Powerful';
    return 'ACE!';
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-700 to-gray-900 rounded-xl p-6 border-4 border-gray-600 shadow-2xl">
      {/* Console Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-tennis-green-primary font-orbitron text-sm tracking-wider uppercase">
          TENNIS SERVE TRAINER v2.0
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

      {/* Game Display */}
      <div className="bg-black rounded border border-tennis-green-primary/30 p-4 mb-4 h-48 flex flex-col justify-center items-center relative overflow-hidden">
        {isBooting ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin w-6 h-6 border-2 border-tennis-green-primary rounded-full border-t-transparent"></div>
            <span className="text-tennis-green-primary font-orbitron text-sm">LOADING SERVE TRAINER...</span>
          </div>
        ) : !isPoweredOn ? (
          <span className="text-gray-600 font-orbitron">SYSTEM OFFLINE</span>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            {/* Tennis Court Background */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full border-2 border-tennis-green-primary/30 relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-tennis-green-primary/30 transform -translate-y-1/2"></div>
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-tennis-green-primary/30 transform -translate-x-1/2"></div>
              </div>
            </div>

            {/* Player Animation */}
            <div className="relative z-10 mb-4">
              {isServing ? (
                <div className="text-4xl animate-bounce">
                  {maxPowerAchieved > 80 ? '🎾💨' : '🎾'}
                </div>
              ) : (
                <div className="text-3xl">
                  {isCharging ? '🏃‍♂️' : '🧍‍♂️'}
                </div>
              )}
            </div>

            {/* Power Meter */}
            <div className="w-32 h-3 bg-gray-800 rounded-full mb-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${getPowerColor()} ${isCharging ? 'animate-pulse' : ''}`}
                style={{ width: `${power}%` }}
              />
            </div>

            {/* Power Display */}
            <div className="text-tennis-green-primary font-orbitron text-sm mb-2">
              {isServing ? `SERVING: ${maxPowerAchieved}% POWER` : 
               serveComplete ? `${getServeSpeed()} - ${maxPowerAchieved}% POWER!` :
               `POWER: ${power}%`}
            </div>

            {/* Ball Animation */}
            {isServing && (
              <div className="absolute right-4 top-4">
                <div className="text-2xl animate-[bounce_0.5s_ease-in-out_infinite]">
                  🎾
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Serve Control */}
      <div className="flex justify-center">
        <button
          onMouseDown={startCharging}
          onMouseUp={stopCharging}
          onMouseLeave={stopCharging}
          onTouchStart={startCharging}
          onTouchEnd={stopCharging}
          disabled={!isPoweredOn || isServing}
          className={`
            w-24 h-24 rounded-full font-orbitron font-bold text-lg
            transition-all duration-150 transform border-4
            ${isPoweredOn && !isServing
              ? `border-tennis-green-primary bg-tennis-green-primary/10 text-tennis-green-primary
                 hover:bg-tennis-green-primary/20 hover:shadow-[0_0_20px_rgba(155,255,155,0.5)]
                 active:scale-95 active:bg-tennis-green-primary/30 select-none` 
              : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
            }
            ${isCharging ? 'scale-95 bg-tennis-green-primary/40 shadow-[0_0_25px_rgba(155,255,155,0.7)]' : ''}
          `}
        >
          {isServing ? 'SERVING!' : 'HOLD TO SERVE'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-center">
        <div className="text-xs text-tennis-green-light/70 font-orbitron tracking-wider">
          {isPoweredOn ? 'HOLD BUTTON TO CHARGE POWER' : 'TURN ON CONSOLE TO PLAY'}
        </div>
      </div>
    </div>
  );
}
