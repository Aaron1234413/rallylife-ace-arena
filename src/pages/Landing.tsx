
import React from 'react';
import { StarField } from '@/components/landing/StarField';
import { MissionHeader } from '@/components/landing/MissionHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Star Background */}
      <StarField />
      
      {/* Main Content */}
      <div className="relative z-10">
        <MissionHeader />
        
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-6xl md:text-8xl font-orbitron font-bold text-tennis-green-primary mb-6 tracking-wider">
              TENNIS
              <br />
              <span className="text-tennis-yellow animate-pulse">PROTOCOL</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-tennis-green-light font-poppins max-w-2xl mx-auto leading-relaxed">
              Mission Control for the ultimate tennis gaming experience. 
              Track performance, compete globally, level up your game.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-16">
              <div className="border border-tennis-green-primary/30 bg-tennis-green-primary/5 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-orbitron text-tennis-green-primary mb-2">2,847</div>
                <div className="text-tennis-green-light">Matches Today</div>
              </div>
              <div className="border border-tennis-green-primary/30 bg-tennis-green-primary/5 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-orbitron text-tennis-green-primary mb-2">15,293</div>
                <div className="text-tennis-green-light">Active Players</div>
              </div>
              <div className="border border-tennis-green-primary/30 bg-tennis-green-primary/5 p-6 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-orbitron text-tennis-green-primary mb-2">98,456</div>
                <div className="text-tennis-green-light">XP Earned</div>
              </div>
            </div>
            
            {/* Main CTA */}
            <div className="space-y-4">
              <Link to="/auth">
                <Button 
                  size="lg" 
                  className="bg-tennis-green-primary hover:bg-tennis-green-accent text-black font-orbitron text-xl px-12 py-6 rounded-none border-2 border-tennis-green-primary shadow-[0_0_20px_rgba(155,255,155,0.5)] hover:shadow-[0_0_30px_rgba(155,255,155,0.8)] transition-all duration-300 uppercase tracking-widest"
                >
                  ▶ INITIATE TENNIS PROTOCOL
                </Button>
              </Link>
              <p className="text-tennis-green-light/70 text-sm font-orbitron tracking-wider">
                [ STATUS: READY FOR LAUNCH ]
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
