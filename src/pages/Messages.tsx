
import React from 'react';
import { MessageSquare, Lock, Gamepad2 } from 'lucide-react';

export default function Messages() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-tennis-green-dark via-tennis-green-medium to-tennis-green-light">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg">
            <span className="text-xl">💬</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Messages</h1>
          <p className="text-tennis-green-bg/90">Connect with players and coaches</p>
        </div>

        {/* Gaming Terminal Coming Soon */}
        <div className="bg-black/90 backdrop-blur-sm rounded-xl shadow-xl border-4 border-tennis-yellow overflow-hidden max-w-2xl mx-auto">
          <div className="p-8 text-center space-y-6">
            {/* Gaming Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-tennis-yellow">
                <Gamepad2 className="h-8 w-8 animate-pulse" />
                <span className="text-2xl font-orbitron font-bold tracking-wider">FEATURE LOCKED</span>
                <Gamepad2 className="h-8 w-8 animate-pulse" />
              </div>
              
              <div className="font-orbitron text-tennis-green-primary text-lg tracking-widest animate-pulse">
                [ MESSAGES SYSTEM INITIALIZING... ]
              </div>
            </div>

            {/* Lock Icon */}
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-tennis-yellow/20 rounded-full border-2 border-tennis-yellow">
                <Lock className="h-10 w-10 text-tennis-yellow animate-bounce" />
              </div>
              <div className="absolute inset-0 bg-tennis-yellow/10 rounded-full animate-ping"></div>
            </div>

            {/* Description */}
            <div className="space-y-4 text-white">
              <p className="text-lg font-poppins">
                This communication module is currently under development.
              </p>
              <p className="text-tennis-green-bg font-poppins">
                Connect with players through the <span className="text-tennis-yellow font-semibold">Pulse</span> and <span className="text-tennis-yellow font-semibold">Feed</span> features for now!
              </p>
            </div>

            {/* Status */}
            <div className="bg-tennis-green-dark/50 border border-tennis-green-primary/30 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse"></div>
                <span className="text-tennis-green-primary font-orbitron font-bold tracking-wider text-sm">
                  STATUS: COMING SOON™
                </span>
                <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Gaming Style Border Effects */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-tennis-yellow"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-tennis-yellow"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-tennis-yellow"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-tennis-yellow"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
