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
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Enhanced Tennis Balls with Trail Effect */}
      {balls.map(ball => (
        <div key={ball.id} className="absolute">
          {/* Ball Trail */}
          <div
            className="absolute w-16 h-3 rounded-full bg-gradient-to-r from-transparent via-accent/30 to-transparent blur-sm"
            style={{
              left: `${ball.x - 40}px`,
              top: `${ball.y - 6}px`,
              transform: `rotate(${Math.atan2(ball.vy, ball.vx)}rad)`
            }}
          />
          
          {/* Main Tennis Ball */}
          <div
            className={`absolute w-12 h-12 rounded-full shadow-2xl transition-opacity duration-500 ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              left: `${ball.x - 25}px`,
              top: `${ball.y - 25}px`,
              background: 'linear-gradient(135deg, #FFEB3B 0%, #FDD835 50%, #F9A825 100%)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 3px 6px rgba(255, 255, 255, 0.4), 0 0 20px rgba(255, 235, 59, 0.3)'
            }}
          >
            {/* Tennis ball curve lines */}
            <div className="absolute inset-0 rounded-full">
              <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-white/80 rounded-full transform -translate-y-1/2" />
              <div className="absolute top-1/2 left-1 right-1 h-0.5 bg-white/80 rounded-full transform -translate-y-1/2 rotate-180" />
            </div>
            
            {/* Ball Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-pulse" />
          </div>
        </div>
      ))}

      {/* Enhanced Welcome Text with Tennis Theme */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-center transition-all duration-1000 ${
          showWelcome ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'
        }`}>
          {/* Main Welcome Title */}
          <div className="relative mb-6">
            <h1 className="text-6xl md:text-8xl font-orbitron font-bold text-foreground mb-4 animate-fade-in drop-shadow-2xl">
              Welcome!
            </h1>
            {/* Title underline effect */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" />
          </div>
          
          {/* Tennis Court Icon */}
          <div className="mb-4 animate-bounce" style={{ animationDuration: '2s' }}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-xl">
              <div className="w-8 h-6 border-2 border-primary-foreground rounded-sm relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary-foreground transform -translate-x-1/2" />
              </div>
            </div>
          </div>
          
          <p className="text-2xl md:text-3xl text-muted-foreground font-medium animate-fade-in drop-shadow-lg">
            🎾 Ready to ace your tennis journey?
          </p>
          
          {/* Status Message */}
          <div className="mt-8 flex justify-center">
            <div className="bg-card/80 backdrop-blur-sm rounded-full px-8 py-4 border border-border shadow-xl">
              <p className="text-foreground font-medium flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Taking you to your dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          >
            {/* Different sparkle types */}
            {i % 3 === 0 ? (
              <div className="w-1 h-1 bg-accent rounded-full shadow-lg" />
            ) : i % 3 === 1 ? (
              <div className="w-2 h-2 bg-primary rounded-full opacity-60" />
            ) : (
              <div className="text-accent text-xs">✨</div>
            )}
          </div>
        ))}
      </div>

      {/* Celebration Confetti Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`confetti-${i}`}
            className="absolute w-3 h-3 animate-bounce opacity-80"
            style={{
              left: `${20 + (i * 5)}%`,
              top: `${10 + (i * 2)}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${1.5 + (i * 0.1)}s`,
              background: i % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
              transform: `rotate(${i * 24}deg)`
            }}
          />
        ))}
      </div>
    </div>
  );
};