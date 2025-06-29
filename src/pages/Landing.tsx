
import React from 'react';
import { StarField } from '@/components/landing/StarField';
import { MissionHeader } from '@/components/landing/MissionHeader';
import { CRTMonitor } from '@/components/landing/CRTMonitor';
import { ScanLines } from '@/components/landing/ScanLines';
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
        
        {/* Hero Section - Mobile Optimized */}
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
          <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">
            
            {/* Rako Network Status - Moved above main terminal */}
            <div className="text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-tennis-green-dark/90 border border-tennis-green-primary/60 rounded-lg backdrop-blur-sm hover:border-tennis-green-primary transition-all duration-300 animate-glow-pulse">
                <div className="relative">
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-tennis-green-primary rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 md:w-3 md:h-3 bg-tennis-green-primary rounded-full animate-ping opacity-30"></div>
                </div>
                <span className="text-tennis-green-primary text-xs md:text-sm font-orbitron tracking-wider uppercase font-bold">
                  Rako Network: Online
                </span>
                <div className="text-tennis-yellow text-xs animate-float">⚡</div>
              </div>
            </div>
            
            {/* Main Title in CRT Monitor - Mobile Responsive */}
            <div className="px-2 md:px-0">
              <CRTMonitor title="MAIN TERMINAL" size="large">
                <div className="text-center py-4 md:py-6 px-3 md:px-4 bg-white/95 backdrop-blur-sm rounded-lg">
                  <div className="mb-4">
                    <h1 className="text-2xl md:text-4xl lg:text-6xl font-orbitron font-bold text-tennis-green-dark mb-2 md:mb-4 tracking-wider leading-tight">
                      RAKO
                    </h1>
                    <div className="text-xl md:text-3xl lg:text-4xl font-orbitron font-bold text-tennis-yellow animate-pulse mb-2">
                      Smart Tennis Gaming Platform
                    </div>
                  </div>
                  
                  <p className="text-sm md:text-base lg:text-lg text-tennis-green-medium font-poppins max-w-2xl mx-auto leading-relaxed mb-4 md:mb-6 px-2">
                    Track your progress, compete globally, and level up your tennis game with our revolutionary gaming platform.
                  </p>
                </div>
              </CRTMonitor>
            </div>
            
            {/* Enhanced Live Data Section - Mobile Optimized */}
            <div className="px-2 md:px-0">
              <EnhancedLandingPage />
            </div>
            
            {/* Main CTA in Gaming Style - Mobile Optimized */}
            <div className="pb-4 md:pb-8 px-2 md:px-0">
              <CRTMonitor title="LAUNCH RAKO PLATFORM" size="large">
                <div className="text-center py-4 md:py-6 px-3 md:px-4 bg-white/95 backdrop-blur-sm rounded-lg">
                  <div className="space-y-3 md:space-y-4">
                    <Link to="/auth" className="block">
                      <Button 
                        size="lg" 
                        className="w-full md:w-auto bg-tennis-yellow hover:bg-tennis-yellow/90 text-tennis-green-dark font-orbitron text-base md:text-lg lg:text-xl px-4 md:px-8 lg:px-12 py-3 md:py-4 lg:py-6 rounded-none border-4 border-tennis-green-dark shadow-[0_0_20px_rgba(255,255,155,0.5)] hover:shadow-[0_0_30px_rgba(255,255,155,0.8)] transition-all duration-300 uppercase tracking-widest hover:scale-105 transform font-bold min-h-[3rem] md:min-h-[4rem]"
                      >
                        <span className="text-center leading-tight">
                          ▶ START YOUR TENNIS JOURNEY
                        </span>
                      </Button>
                    </Link>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <p className="text-tennis-green-medium text-xs md:text-sm font-orbitron tracking-wider font-bold">
                        [ STATUS: READY FOR LAUNCH ]
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse" />
                        <span className="text-xs text-tennis-green-medium font-orbitron tracking-widest font-bold">
                          RAKO SYSTEM ONLINE
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
