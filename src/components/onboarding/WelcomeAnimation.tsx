import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WelcomeAnimationProps {
  onComplete: () => void;
}

interface TennisBall {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounces: number;
}

export const WelcomeAnimation: React.FC<WelcomeAnimationProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const [balls, setBalls] = useState<TennisBall[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Show welcome text immediately
    setShowWelcome(true);

    // Create tennis balls
    const initialBalls: TennisBall[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: -50 - (i * 100), // Start above screen
      vx: (Math.random() - 0.5) * 4, // Random horizontal velocity
      vy: Math.random() * 3 + 2, // Downward velocity
      bounces: 0
    }));

    setBalls(initialBalls);

    // Animation loop
    const animationFrame = () => {
      setBalls(prevBalls => 
        prevBalls.map(ball => {
          let newX = ball.x + ball.vx;
          let newY = ball.y + ball.vy;
          let newVx = ball.vx;
          let newVy = ball.vy + 0.3; // Gravity
          let newBounces = ball.bounces;

          // Bounce off walls
          if (newX <= 25 || newX >= window.innerWidth - 25) {
            newVx = -newVx * 0.8; // Reduce velocity on bounce
            newX = newX <= 25 ? 25 : window.innerWidth - 25;
          }

          // Bounce off floor
          if (newY >= window.innerHeight - 25) {
            newVy = -newVy * 0.7; // Reduce velocity on bounce
            newY = window.innerHeight - 25;
            newBounces += 1;
          }

          return {
            ...ball,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy,
            bounces: newBounces
          };
        })
      );
    };

    const intervalId = setInterval(animationFrame, 16); // ~60fps

    // Stop animation and redirect after 4 seconds
    const timeout = setTimeout(() => {
      setIsAnimating(false);
      clearInterval(intervalId);
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
        onComplete();
      }, 500);
    }, 4000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeout);
    };
  }, [navigate, onComplete]);

  return (
    <div className="fixed inset-0 bg-tennis-green-bg z-50 overflow-hidden">
      {/* Tennis Balls */}
      {balls.map(ball => (
        <div
          key={ball.id}
          className={`absolute w-12 h-12 rounded-full bg-tennis-yellow border-2 border-white shadow-lg transition-opacity duration-500 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: `${ball.x - 25}px`,
            top: `${ball.y - 25}px`,
            background: 'linear-gradient(135deg, #FFEB3B 0%, #FDD835 50%, #F9A825 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Tennis ball curve lines */}
          <div className="absolute inset-0 rounded-full">
            <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-white/60 rounded-full transform -translate-y-1/2" />
            <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-white/60 rounded-full transform -translate-y-1/2 rotate-180" />
          </div>
        </div>
      ))}

      {/* Welcome Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-center transition-all duration-1000 ${
          showWelcome ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
        }`}>
          <h1 className="text-6xl md:text-8xl font-orbitron font-bold text-tennis-green-dark mb-4 animate-fade-in">
            Welcome!
          </h1>
          <p className="text-2xl md:text-3xl text-tennis-green-medium font-medium animate-fade-in">
            🎾 Ready to ace your tennis journey?
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 border border-tennis-green-light">
              <p className="text-tennis-green-dark font-medium">
                Taking you to your dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-tennis-yellow rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${1 + Math.random()}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};