
import React from 'react';
import { StarField } from '@/components/landing/StarField';
import { MissionHeader } from '@/components/landing/MissionHeader';
import { CRTMonitor } from '@/components/landing/CRTMonitor';
import { ScanLines } from '@/components/landing/ScanLines';
import { InsertCoin } from '@/components/landing/InsertCoin';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ParticleField } from '@/components/landing/ParticleField';
import { EnhancedLandingPage } from '@/components/landing/EnhancedLandingPage';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-medium via-tennis-green-bg to-tennis-green-dark text-white overflow-hidden relative">
      {/* Animated Star Background */}
      <StarField />
      
      {/* Particle Effects Layer */}
      <div className="absolute inset-0 z-5">
        <ParticleField intensity="medium" />
      </div>
      
      {/* Scan Lines Overlay - lighter for hybrid approach */}
      <ScanLines intensity="light" speed="slow" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <MissionHeader />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Main Title in CRT Monitor */}
            <CRTMonitor title="MAIN TERMINAL" size="large">
              <div className="text-center py-6 px-4 bg-white/95 backdrop-blur-sm rounded-lg">
                <h1 className="text-4xl md:text-6xl font-orbitron font-bold text-tennis-green-dark mb-4 tracking-wider">
                  TENNIS
                  <br />
                  <span className="text-tennis-yellow animate-pulse">PROTOCOL</span>
                </h1>
                
                <p className="text-base md:text-lg text-tennis-green-medium font-poppins max-w-2xl mx-auto leading-relaxed mb-6">
                  Mission Control for the ultimate tennis gaming experience. 
                  Track performance, compete globally, level up your game.
                </p>

                {/* Insert Coin Animation */}
                <InsertCoin />
              </div>
            </CRTMonitor>
            
            {/* Enhanced Live Data Section */}
            <EnhancedLandingPage />
            
            {/* Main CTA in Gaming Style - Reduced spacing and made more prominent */}
            <div className="pb-8">
              <CRTMonitor title="LAUNCH PROTOCOL" size="large">
                <div className="text-center py-6 px-4 bg-white/95 backdrop-blur-sm rounded-lg">
                  <div className="space-y-4">
                    <Link to="/auth">
                      <Button 
                        size="lg" 
                        className="bg-tennis-yellow hover:bg-tennis-yellow/90 text-tennis-green-dark font-orbitron text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 rounded-none border-4 border-tennis-green-dark shadow-[0_0_20px_rgba(255,255,155,0.5)] hover:shadow-[0_0_30px_rgba(255,255,155,0.8)] transition-all duration-300 uppercase tracking-widest hover:scale-105 transform font-bold"
                      >
                        ▶ INITIATE TENNIS PROTOCOL
                      </Button>
                    </Link>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <p className="text-tennis-green-medium text-sm font-orbitron tracking-wider font-bold">
                        [ STATUS: READY FOR LAUNCH ]
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse" />
                        <span className="text-xs text-tennis-green-medium font-orbitron tracking-widest font-bold">
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
    </div>
  );
}
