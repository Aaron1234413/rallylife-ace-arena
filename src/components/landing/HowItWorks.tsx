
import React from 'react';
import { CRTMonitor } from './CRTMonitor';
import { Trophy, Users, Target, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Create Your Profile',
      description: 'Set up your tennis profile and customize your avatar',
      icon: Target,
      color: 'text-tennis-green-primary',
      bgColor: 'bg-tennis-green-primary/10'
    },
    {
      number: 2,
      title: 'Track & Train',
      description: 'Log matches, complete training sessions, and earn XP',
      icon: Trophy,
      color: 'text-tennis-yellow',
      bgColor: 'bg-tennis-yellow/10'
    },
    {
      number: 3,
      title: 'Compete & Connect',
      description: 'Challenge players worldwide and join the community',
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
      name: 'Live Matches',
      description: 'Real-time match tracking with global leaderboards',
      icon: '⚡'
    },
    {
      name: 'Social Play',
      description: 'Connect with players, join events, and build your network',
      icon: '🌟'
    }
  ];

  return (
    <div className="px-2 md:px-0">
      <CRTMonitor title="HOW RAKO WORKS" size="large">
        <div className="py-6 md:py-8 px-4 md:px-6 bg-white/95 backdrop-blur-sm rounded-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-orbitron font-bold text-tennis-green-dark mb-3">
              Your Tennis Gaming Journey
            </h2>
            <p className="text-sm md:text-base text-tennis-green-medium font-poppins max-w-2xl mx-auto">
              From signup to champion - here's how RAKO transforms your tennis experience
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={step.number} className="relative">
                  <div className={`
                    p-4 md:p-6 rounded-lg border-2 border-tennis-green-medium/30 
                    hover:border-tennis-green-primary/60 transition-all duration-300
                    hover:scale-105 transform ${step.bgColor}
                  `}>
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-tennis-green-dark text-white font-orbitron font-bold flex items-center justify-center text-sm md:text-base">
                        {step.number}
                      </div>
                      <Icon className={`h-6 w-6 md:h-8 md:w-8 ${step.color}`} />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-lg md:text-xl font-orbitron font-bold text-tennis-green-dark mb-2">
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
          <div className="border-t border-tennis-green-medium/30 pt-6">
            <h3 className="text-xl md:text-2xl font-orbitron font-bold text-tennis-green-dark text-center mb-6">
              What You'll Experience
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {features.map((feature) => (
                <div 
                  key={feature.name}
                  className="text-center p-4 rounded-lg bg-tennis-green-subtle/20 border border-tennis-green-medium/20 hover:border-tennis-green-primary/40 transition-all duration-300"
                >
                  <div className="text-2xl mb-3">{feature.icon}</div>
                  <h4 className="font-orbitron font-bold text-tennis-green-dark mb-2 text-sm md:text-base">
                    {feature.name}
                  </h4>
                  <p className="text-xs md:text-sm text-tennis-green-medium font-poppins">
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
