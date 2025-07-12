
import React from 'react';
import { CRTMonitor } from './CRTMonitor';
import { Trophy, Users, Target, ArrowRight, ShoppingBag, Zap, Heart } from 'lucide-react';

interface HowItWorksProps {
  steps?: string[];
}

export function HowItWorks({ steps: customSteps }: HowItWorksProps = {}) {
  const defaultSteps = [
    {
      number: 1,
      title: 'Create & Customize',
      description: 'Set up your tennis profile, customize your player avatar, and choose your favorite gear',
      icon: Target,
      color: 'text-tennis-green-primary',
      bgColor: 'bg-tennis-green-primary/10'
    },
    {
      number: 2,
      title: 'Play & Progress',
      description: 'Join matches, training sessions, and events while earning points and unlocking achievements',
      icon: Trophy,
      color: 'text-tennis-yellow',
      bgColor: 'bg-tennis-yellow/10'
    },
    {
      number: 3,
      title: 'Shop & Socialize',
      description: 'Buy cool tennis gear in the store and connect with players around the world',
      icon: Users,
      color: 'text-tennis-green-accent',
      bgColor: 'bg-tennis-green-accent/10'
    }
  ];

  const steps = customSteps ? customSteps.map((step, index) => ({
    number: index + 1,
    title: step.split(' → ')[0],
    description: step.split(' → ')[1] || step,
    icon: [Target, Trophy, Users][index] || Target,
    color: ['text-tennis-green-primary', 'text-tennis-yellow', 'text-tennis-green-accent'][index] || 'text-tennis-green-primary',
    bgColor: ['bg-tennis-green-primary/10', 'bg-tennis-yellow/10', 'bg-tennis-green-accent/10'][index] || 'bg-tennis-green-primary/10'
  })) : defaultSteps;

  const features = [
    {
      name: 'Smart Training',
      description: 'Get personalized training tips based on how you play',
      icon: '🎯'
    },
    {
      name: 'Tennis Store',
      description: 'Buy virtual upgrades and real tennis equipment',
      icon: '🛒'
    },
    {
      name: 'Game Modes',
      description: 'Social games, competitive matches, and coaching sessions with live tracking',
      icon: '⚡'
    },
    {
      name: 'Recovery & Growth',
      description: 'Improve your game with meditation, stretching, and personalized programs',
      icon: '🌟'
    }
  ];

  return (
    <div className="px-2 md:px-0">
      <CRTMonitor title="HOW RAKO WORKS" size="large">
        <div className="py-6 md:py-10 px-4 md:px-8 bg-white/95 backdrop-blur-sm rounded-lg">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-tennis-green-dark mb-4">
              Your Tennis Gaming Adventure
            </h2>
            <p className="text-sm md:text-base text-tennis-green-medium font-poppins max-w-2xl mx-auto">
              From beginner to champion - here's how RAKO makes tennis gaming fun and rewarding
            </p>
          </div>

          {/* Steps - Mobile Horizontal Scroll with Visual Cues */}
          <div className="mb-10 md:mb-14">
            {/* Mobile Horizontal Scroll with Peek */}
            <div className="md:hidden">
              {/* Scroll Indicator Text */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-tennis-green-medium font-orbitron tracking-wider font-bold">
                  SWIPE TO SEE ALL STEPS
                </span>
                <ArrowRight className="h-3 w-3 text-tennis-green-primary animate-pulse" />
              </div>
              
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide pb-4">
                  <div className="flex gap-2 px-1" style={{ width: 'calc(100% + 60px)' }}>
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isLast = index === steps.length - 1;
                      
                      return (
                        <div key={step.number} className="flex-shrink-0 relative" style={{ width: 'calc(100vw - 100px)' }}>
                          <div className={`
                            p-5 rounded-lg border-2 border-tennis-green-medium/30 
                            hover:border-tennis-green-primary/60 transition-all duration-300
                            hover:scale-105 transform ${step.bgColor} h-full
                          `}>
                            {/* Step Number */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 rounded-full bg-tennis-green-dark text-white font-orbitron font-bold flex items-center justify-center text-base">
                                {step.number}
                              </div>
                              <Icon className={`h-7 w-7 ${step.color}`} />
                            </div>
                            
                            {/* Content */}
                            <h3 className="text-lg font-orbitron font-bold text-tennis-green-dark mb-3">
                              {step.title}
                            </h3>
                            <p className="text-sm text-tennis-green-medium font-poppins leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                          
                          {/* Arrow for mobile */}
                          {!isLast && (
                            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 z-10">
                              <ArrowRight className="h-4 w-4 text-tennis-green-primary animate-pulse" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-3">
                  {steps.map((_, index) => (
                    <div key={index} className="w-2 h-2 rounded-full bg-tennis-green-medium/30" />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-3 gap-6">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === steps.length - 1;
                
                return (
                  <div key={step.number} className="relative">
                    <div className={`
                      p-7 rounded-lg border-2 border-tennis-green-medium/30 
                      hover:border-tennis-green-primary/60 transition-all duration-300
                      hover:scale-105 transform ${step.bgColor} h-full
                    `}>
                      {/* Step Number */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-full bg-tennis-green-dark text-white font-orbitron font-bold flex items-center justify-center text-lg">
                          {step.number}
                        </div>
                        <Icon className={`h-9 w-9 ${step.color}`} />
                      </div>
                      
                      {/* Content */}
                      <h3 className="text-xl font-orbitron font-bold text-tennis-green-dark mb-3">
                        {step.title}
                      </h3>
                      <p className="text-base text-tennis-green-medium font-poppins leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Arrow for desktop */}
                    {!isLast && (
                      <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <ArrowRight className="h-6 w-6 text-tennis-green-primary animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Features Preview with Enhanced Mobile UX */}
          <div className="border-t border-tennis-green-medium/30 pt-8 md:pt-10">
            <h3 className="text-xl md:text-2xl font-orbitron font-bold text-tennis-green-dark text-center mb-8 md:mb-10">
              What You'll Love About RAKO
            </h3>
            
            {/* Mobile Horizontal Scroll with Peek */}
            <div className="md:hidden">
              {/* Scroll Indicator Text */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-xs text-tennis-green-medium font-orbitron tracking-wider font-bold">
                  SCROLL FOR MORE FEATURES
                </span>
                <ArrowRight className="h-3 w-3 text-tennis-green-primary animate-pulse" />
              </div>
              
              <div className="relative">
                <div className="overflow-x-auto scrollbar-hide pb-4">
                  <div className="flex gap-2 px-1" style={{ width: 'calc(100% + 60px)' }}>
                    {features.map((feature, index) => (
                      <div 
                        key={feature.name}
                        className="flex-shrink-0 text-center p-5 rounded-lg bg-tennis-green-subtle/20 border border-tennis-green-medium/20 hover:border-tennis-green-primary/40 transition-all duration-300 hover:scale-105 transform"
                        style={{ width: 'calc(100vw - 120px)' }}
                      >
                        <div className="text-3xl mb-4">{feature.icon}</div>
                        <h4 className="font-orbitron font-bold text-tennis-green-dark mb-3 text-base">
                          {feature.name}
                        </h4>
                        <p className="text-xs text-tennis-green-medium font-poppins leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-3">
                  {features.map((_, index) => (
                    <div key={index} className="w-2 h-2 rounded-full bg-tennis-green-medium/30" />
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5">
              {features.map((feature) => (
                <div 
                  key={feature.name}
                  className="text-center p-6 rounded-lg bg-tennis-green-subtle/20 border border-tennis-green-medium/20 hover:border-tennis-green-primary/40 transition-all duration-300 hover:scale-105 transform"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="font-orbitron font-bold text-tennis-green-dark mb-3 text-lg">
                    {feature.name}
                  </h4>
                  <p className="text-sm text-tennis-green-medium font-poppins leading-relaxed">
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
