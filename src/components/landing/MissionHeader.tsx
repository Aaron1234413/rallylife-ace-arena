
import React from 'react';

export function MissionHeader() {
  return (
    <header className="relative z-20 border-b border-tennis-green-primary/30 bg-tennis-green-bg/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Mission Control Logo */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 border-2 border-tennis-green-primary bg-tennis-green-primary/10 rounded-full flex items-center justify-center">
              <span className="text-tennis-green-primary text-xl">🎾</span>
            </div>
            <div>
              <h1 className="text-2xl font-orbitron font-bold text-tennis-green-primary tracking-wider">
                RAKO MISSION CONTROL
              </h1>
              <p className="text-tennis-green-dark/70 text-sm font-orbitron tracking-widest">
                TENNIS COMMAND CENTER
              </p>
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-tennis-green-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(155,255,155,0.8)]"></div>
              <span className="text-tennis-green-dark font-orbitron text-sm tracking-wider">SYSTEM ONLINE</span>
            </div>
            <div className="text-tennis-green-dark/70 font-orbitron text-sm tracking-wider">
              STARDATE: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(155, 255, 155, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(155, 255, 155, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
      </div>
    </header>
  );
}
