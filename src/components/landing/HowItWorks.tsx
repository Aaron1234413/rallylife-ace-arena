
import React from 'react';
import { CRTMonitor } from './CRTMonitor';
import { Trophy, Users, Target, ArrowRight, ShoppingBag, Zap, Heart } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Create & Customize',
      description: 'Set up your tennis profile, customize your avatar, and choose your gear preferences',
      icon: Target,
      color: 'text-tennis-green-primary',
      bgColor: 'bg-tennis-green-primary/10'
    },
    {
      number: 2,
      title: 'Play & Progress',
      description: 'Join matches, training sessions, and social events while earning XP and achievements',
      icon: Trophy,
      color: 'text-tennis-yellow',
      bgColor: 'bg-tennis-yellow/10'
    },
    {
      number: 3,
      title: 'Shop & Socialize',
      description: 'Buy virtual/real tennis gear in the marketplace and connect with the community',
      icon: Users,
      color: 'text-tennis-green-accent',
      bgColor: 'bg-tennis-green-accent/10'
    }
  ];

  const features = [
    {
      name: 'Smart Training',
      description: 'AI-powered training recommendations based on your performance',
      icon: '🎯'
    },
    {
      name: 'Marketplace Hub',
      description: 'Buy virtual gear upgrades and real tennis equipment',
      icon: '🛒'
    },
    {
      name: 'Multi-Play Modes',
      description: 'Social play, competitive matches, coaching sessions with real-time tracking',
      icon: '⚡'
    },
    {
      name: 'Recovery & Growth',
      description: 'Improve recovery with meditation, stretching, and personalized programs',
      icon: '🌟'
    }
  ];

  return (
    <div className="px-2 md:px-0">
      <CRTMonitor title="HOW RAKO WORKS" size="large">
        <div className="py-8 md:py-10 px-6 md:px-8 bg-white/95 backdrop-blur-sm rounded-lg">
          {/* Header */}
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-tennis-green-dark mb-4">
              Your Tennis Gaming Journey
            </h2>
            <p className="text-sm md:text-base text-tennis-green-medium font-poppins max-w-2xl mx-auto">
              From signup to champion - here's how RAKO transforms your tennis experience
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mb-12 md:mb-14">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={step.number} className="relative">
                  <div className={`
                    p-6 md:p-7 rounded-lg border-2 border-tennis-green-medium/30 
                    hover:border-tennis-green-primary/60 transition-all duration-300
                    hover:scale-105 transform ${step.bgColor} h-full
                  `}>
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-tennis-green-dark text-white font-orbitron font-bold flex items-center justify-center text-base md:text-lg">
                        {step.number}
                      </div>
                      <Icon className={`h-7 w-7 md:h-9 md:w-9 ${step.color}`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg md:text-xl font-orbitron font-bold text-tennis-green-dark mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm md:text-base text-tennis-green-medium font-poppins leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Arrow for desktop */}
                  {!isLast && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="h-6 w-6 text-tennis-green-primary animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key Features Preview */}
          <div className="border-t border-tennis-green-medium/30 pt-8 md:pt-10">
            <h3 className="text-xl md:text-2xl font-orbitron font-bold text-tennis-green-dark text-center mb-8 md:mb-10">
              What You'll Experience
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-5">
              {features.map((feature) => (
                <div 
                  key={feature.name}
                  className="text-center p-5 md:p-6 rounded-lg bg-tennis-green-subtle/20 border border-tennis-green-medium/20 hover:border-tennis-green-primary/40 transition-all duration-300 hover:scale-105 transform"
                >
                  <div className="text-3xl md:text-4xl mb-4">{feature.icon}</div>
                  <h4 className="font-orbitron font-bold text-tennis-green-dark mb-3 text-base md:text-lg">
                    {feature.name}
                  </h4>
                  <p className="text-xs md:text-sm text-tennis-green-medium font-poppins leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CRTMonitor>
    </div>
  );
}
