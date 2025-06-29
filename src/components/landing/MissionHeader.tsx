
import React from 'react';

export function MissionHeader() {
  return (
    <header className="relative z-20 border-b border-tennis-green-primary/60 bg-tennis-green-dark/90 backdrop-blur-sm">
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="flex items-center justify-between">
          {/* Rako Tennis Protocol Logo */}
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 border-2 border-tennis-green-primary bg-tennis-green-primary/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(155,255,155,0.4)]">
              <span className="text-tennis-green-primary text-lg md:text-xl">🎾</span>
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-orbitron font-bold text-tennis-green-primary tracking-wider">
                RAKO
              </h1>
              <p className="text-tennis-green-light text-xs md:text-sm font-orbitron tracking-widest">
                TENNIS PROTOCOL
              </p>
            </div>
          </div>
          
          {/* Status Indicators - Hidden on small mobile */}
          <div className="hidden sm:flex items-center space-x-4 md:space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-tennis-green-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(155,255,155,0.8)]"></div>
              <span className="text-tennis-green-primary font-orbitron text-xs md:text-sm tracking-wider font-bold">SYSTEM ONLINE</span>
            </div>
            <div className="text-tennis-green-light font-orbitron text-xs md:text-sm tracking-wider hidden md:block">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(155, 255, 155, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(155, 255, 155, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </header>
  );
}
