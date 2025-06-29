import React from 'react';
import { StarField } from '@/components/landing/StarField';
import { MissionHeader } from '@/components/landing/MissionHeader';
import { CRTMonitor } from '@/components/landing/CRTMonitor';
import { ScanLines } from '@/components/landing/ScanLines';
import { PixelTennis } from '@/components/landing/PixelTennis';
import { InsertCoin } from '@/components/landing/InsertCoin';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { GameConsole } from '@/components/landing/GameConsole';
import { ParticleField } from '@/components/landing/ParticleField';
import { InteractiveTerminal } from '@/components/landing/InteractiveTerminal';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Star Background */}
      <StarField />
      
      {/* Particle Effects Layer */}
      <div className="absolute inset-0 z-5">
        <ParticleField intensity="medium" />
      </div>
      
      {/* Scan Lines Overlay */}
      <ScanLines intensity="light" speed="slow" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <MissionHeader />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Main Title in CRT Monitor */}
            <CRTMonitor title="MAIN TERMINAL" size="large">
              <div className="text-center py-8 px-4">
                <h1 className="text-5xl md:text-7xl font-orbitron font-bold text-tennis-green-primary mb-6 tracking-wider">
                  TENNIS
                  <br />
                  <span className="text-tennis-yellow animate-pulse">PROTOCOL</span>
                </h1>
                
                <p className="text-lg md:text-xl text-tennis-green-light font-poppins max-w-2xl mx-auto leading-relaxed mb-8">
                  Mission Control for the ultimate tennis gaming experience. 
                  Track performance, compete globally, level up your game.
                </p>

                {/* Insert Coin Animation */}
                <InsertCoin />
              </div>
            </CRTMonitor>
            
            {/* Interactive Console and Terminal Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CRTMonitor title="GAME CONSOLE" size="medium">
                <div className="p-4">
                  <GameConsole />
                </div>
              </CRTMonitor>
              
              <CRTMonitor title="COMMAND INTERFACE" size="medium">
                <div className="p-4">
                  <InteractiveTerminal />
                </div>
              </CRTMonitor>
            </div>
            
            {/* Stats Grid in Multiple Monitors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <CRTMonitor title="ACTIVITY MONITOR" size="medium">
                <div className="p-4 text-center">
                  <div className="text-2xl font-orbitron text-tennis-green-primary mb-2 font-mono">2,847</div>
                  <div className="text-tennis-green-light text-sm uppercase tracking-wider">Matches Today</div>
                  <div className="mt-2 flex justify-center">
                    <div className="w-8 h-1 bg-tennis-green-primary animate-pulse rounded" />
                  </div>
                </div>
              </CRTMonitor>
              
              <CRTMonitor title="PLAYER COUNT" size="medium">
                <div className="p-4 text-center">
                  <div className="text-2xl font-orbitron text-tennis-green-primary mb-2 font-mono">15,293</div>
                  <div className="text-tennis-green-light text-sm uppercase tracking-wider">Active Players</div>
                  <div className="mt-2 flex justify-center space-x-1">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className={`w-1 h-4 bg-tennis-green-primary rounded ${i < 4 ? 'animate-pulse' : 'opacity-30'}`} />
                    ))}
                  </div>
                </div>
              </CRTMonitor>
              
              <CRTMonitor title="XP TRACKER" size="medium">
                <div className="p-4 text-center">
                  <div className="text-2xl font-orbitron text-tennis-green-primary mb-2 font-mono">98,456</div>
                  <div className="text-tennis-green-light text-sm uppercase tracking-wider">XP Earned</div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-tennis-green-primary h-1 rounded-full w-3/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              </CRTMonitor>
            </div>

            {/* Game Demo Monitor */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <CRTMonitor title="GAME PREVIEW" size="medium">
                  <div className="p-4">
                    <PixelTennis />
                    <div className="mt-4 text-center">
                      <div className="text-xs text-tennis-green-light font-orbitron tracking-wider uppercase">
                        Live Tennis Simulation
                      </div>
                    </div>
                  </div>
                </CRTMonitor>
              </div>
            </div>
            
            {/* Main CTA in Gaming Style */}
            <CRTMonitor title="LAUNCH PROTOCOL" size="large">
              <div className="text-center py-8 px-4">
                <div className="space-y-6">
                  <Link to="/auth">
                    <Button 
                      size="lg" 
                      className="bg-tennis-green-primary hover:bg-tennis-green-accent text-black font-orbitron text-xl px-12 py-6 rounded-none border-4 border-tennis-green-primary shadow-[0_0_20px_rgba(155,255,155,0.5)] hover:shadow-[0_0_30px_rgba(155,255,155,0.8)] transition-all duration-300 uppercase tracking-widest hover:scale-105 transform"
                    >
                      ▶ INITIATE TENNIS PROTOCOL
                    </Button>
                  </Link>
                  
                  <div className="flex flex-col items-center space-y-2">
                    <p className="text-tennis-green-light/70 text-sm font-orbitron tracking-wider">
                      [ STATUS: READY FOR LAUNCH ]
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse" />
                      <span className="text-xs text-tennis-green-light font-orbitron tracking-widest">
                        SYSTEM ONLINE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CRTMonitor>
          </div>
        </div>
      </div>
    </div>
  );
}
