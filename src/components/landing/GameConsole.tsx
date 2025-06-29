
import React, { useState, useEffect, useRef } from 'react';

interface GameConsoleProps {
  onPowerToggle?: (isOn: boolean) => void;
}

export function GameConsole({ onPowerToggle }: GameConsoleProps) {
  const [isPoweredOn, setIsPoweredOn] = useState(true);
  const [isBooting, setIsBooting] = useState(false);
  
  // Serve Game State
  const [isActive, setIsActive] = useState(false);
  const [power, setPower] = useState(0);
  const [isServing, setIsServing] = useState(false);
  const [serveComplete, setServeComplete] = useState(false);
  const [capturedPower, setCapturedPower] = useState(0);
  const [powerDirection, setPowerDirection] = useState(1); // 1 for up, -1 for down
  
  const oscillationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const serveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handlePowerToggle = () => {
    if (isPoweredOn) {
      setIsPoweredOn(false);
      onPowerToggle?.(false);
      // Reset game state
      setIsActive(false);
      setPower(0);
      setIsServing(false);
      setServeComplete(false);
      setCapturedPower(0);
    } else {
      setIsPoweredOn(true);
      setIsBooting(true);
      onPowerToggle?.(true);
      
      setTimeout(() => {
        setIsBooting(false);
      }, 2000);
    }
  };

  // Oscillating power meter
  useEffect(() => {
    if (isActive && !isServing && isPoweredOn) {
      oscillationIntervalRef.current = setInterval(() => {
        setPower(prev => {
          const newPower = prev + (powerDirection * 3); // Fast oscillation speed
          
          // Change direction at boundaries
          if (newPower >= 100) {
            setPowerDirection(-1);
            return 100;
          } else if (newPower <= 0) {
            setPowerDirection(1);
            return 0;
          }
          
          return newPower;
        });
      }, 30); // Fast update interval for smooth oscillation
    } else {
      if (oscillationIntervalRef.current) {
        clearInterval(oscillationIntervalRef.current);
      }
    }

    return () => {
      if (oscillationIntervalRef.current) {
        clearInterval(oscillationIntervalRef.current);
      }
    };
  }, [isActive, isServing, isPoweredOn, powerDirection]);

  const startGame = () => {
    if (!isPoweredOn || isServing) return;
    
    setIsActive(true);
    setServeComplete(false);
    setCapturedPower(0);
    setPower(0);
    setPowerDirection(1);
  };

  const captureServe = () => {
    if (!isActive || !isPoweredOn || isServing) return;
    
    setIsActive(false);
    setCapturedPower(power);
    setIsServing(true);
    
    if (oscillationIntervalRef.current) {
      clearInterval(oscillationIntervalRef.current);
    }
    
    // Serve animation duration based on power
    const serveDuration = 1500 + (power * 5); // 1.5-2 seconds
    
    serveTimeoutRef.current = setTimeout(() => {
      setIsServing(false);
      setServeComplete(true);
      
      // Reset after showing result
      setTimeout(() => {
        setServeComplete(false);
        setPower(0);
        setCapturedPower(0);
      }, 3000);
    }, serveDuration);
  };

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (oscillationIntervalRef.current) {
        clearInterval(oscillationIntervalRef.current);
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
    if (capturedPower < 20) return 'Gentle';
    if (capturedPower < 40) return 'Medium';
    if (capturedPower < 60) return 'Fast';
    if (capturedPower < 80) return 'Powerful';
    if (capturedPower < 95) return 'ROCKET!';
    return 'ACE!';
  };

  const getAvatarDisplay = () => {
    if (isServing) {
      // Serving animation with different intensities
      if (capturedPower > 80) {
        return (
          <div className="text-4xl animate-bounce">
            <div className="relative">
              🎾💨
              <div className="absolute -top-1 -right-1 text-xs">⚡</div>
            </div>
          </div>
        );
      } else if (capturedPower > 50) {
        return <div className="text-4xl animate-bounce">🎾💨</div>;
      } else {
        return <div className="text-4xl animate-bounce">🎾</div>;
      }
    } else if (isActive) {
      // Ready to serve position
      return <div className="text-3xl">🏃‍♂️</div>;
    } else {
      // Idle position
      return <div className="text-3xl">🧍‍♂️</div>;
    }
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

            {/* Avatar Animation */}
            <div className="relative z-10 mb-4">
              {getAvatarDisplay()}
            </div>

            {/* Power Meter */}
            <div className="w-32 h-4 bg-gray-800 rounded-full mb-2 overflow-hidden border border-tennis-green-primary/50">
              <div 
                className={`h-full transition-all duration-75 ${getPowerColor()} ${isActive ? 'animate-pulse' : ''}`}
                style={{ width: `${power}%` }}
              />
            </div>

            {/* Power Display */}
            <div className="text-tennis-green-primary font-orbitron text-sm mb-2 text-center">
              {isServing ? (
                <div>
                  <div>SERVING: {capturedPower}% POWER</div>
                  <div className="text-xs text-tennis-yellow animate-pulse">
                    {getServeSpeed()}
                  </div>
                </div>
              ) : serveComplete ? (
                <div>
                  <div className="text-tennis-yellow font-bold">{getServeSpeed()}!</div>
                  <div className="text-xs">Power: {capturedPower}%</div>
                </div>
              ) : isActive ? (
                <div>
                  <div>POWER: {Math.round(power)}%</div>
                  <div className="text-xs text-tennis-yellow animate-pulse">
                    CLICK TO SERVE!
                  </div>
                </div>
              ) : (
                <div>READY TO SERVE</div>
              )}
            </div>

            {/* Ball Animation for serving */}
            {isServing && (
              <div className="absolute right-4 top-4">
                <div className={`text-2xl ${capturedPower > 80 ? 'animate-[bounce_0.3s_ease-in-out_infinite]' : 'animate-[bounce_0.5s_ease-in-out_infinite]'}`}>
                  {capturedPower > 90 ? '🎾💥' : '🎾'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Serve Control */}
      <div className="flex justify-center">
        <button
          onClick={isActive ? captureServe : startGame}
          disabled={!isPoweredOn || isServing}
          className={`
            w-24 h-24 rounded-full font-orbitron font-bold text-sm
            transition-all duration-150 transform border-4
            ${isPoweredOn && !isServing
              ? `border-tennis-green-primary bg-tennis-green-primary/10 text-tennis-green-primary
                 hover:bg-tennis-green-primary/20 hover:shadow-[0_0_20px_rgba(155,255,155,0.5)]
                 active:scale-95 active:bg-tennis-green-primary/30 select-none` 
              : 'border-gray-600 bg-gray-800 text-gray-500 cursor-not-allowed'
            }
            ${isActive ? 'scale-110 bg-tennis-green-primary/40 shadow-[0_0_25px_rgba(155,255,155,0.7)] animate-pulse' : ''}
          `}
        >
          {isServing ? 'SERVING!' : isActive ? 'SERVE NOW!' : 'START GAME'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-3 text-center">
        <div className="text-xs text-tennis-green-light/70 font-orbitron tracking-wider">
          {isPoweredOn ? (
            isActive ? 'TIME YOUR SERVE PERFECTLY!' : 'CLICK TO START ARCADE MODE'
          ) : (
            'TURN ON CONSOLE TO PLAY'
          )}
        </div>
      </div>
    </div>
  );
}
