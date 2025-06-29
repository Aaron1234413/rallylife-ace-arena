
import React, { useEffect, useRef, useState } from 'react';
import { useLandingPageData } from '@/hooks/useLandingPageData';

interface GlobalActivityMapProps {
  className?: string;
}

export function GlobalActivityMap({ className }: GlobalActivityMapProps) {
  const { activityLocations, loading } = useLandingPageData();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  // World map paths (simplified world outline)
  const worldPath = "M158.8 298.2c-1.2-0.8-2.3-1.7-3.4-2.6-0.5-0.4-1-0.8-1.5-1.2-4.6-3.6-8.9-7.5-12.9-11.7-8.1-8.5-15.3-17.8-21.5-27.8-6.2-10-11.4-20.7-15.5-31.8-4.1-11.1-7.1-22.6-8.9-34.3-1.8-11.7-2.4-23.6-1.8-35.4 0.6-11.8 2.4-23.5 5.4-34.9 3-11.4 7.2-22.5 12.6-33.1 5.4-10.6 12-20.7 19.8-30.1 7.8-9.4 16.8-18.1 26.9-25.9 10.1-7.8 21.3-14.7 33.5-20.5 12.2-5.8 25.4-10.5 39.4-13.9 14-3.4 28.8-5.5 44.4-6.2 15.6-0.7 31.9-0.1 49.1 1.9 17.2 2 35.3 5.4 54.2 10.2 18.9 4.8 38.6 11 59 18.5 20.4 7.5 41.5 16.3 63.1 26.3 21.6 10 43.7 21.2 66.2 33.6 22.5 12.4 45.4 26 68.6 40.8 23.2 14.8 46.7 30.8 70.5 48 23.8 17.2 47.9 35.6 72.3 55.2 24.4 19.6 49.1 40.4 74.1 62.4 25 22 50.3 45.2 75.9 69.6 25.6 24.4 51.5 49.9 77.7 76.6 26.2 26.7 52.7 54.6 79.5 83.7 26.8 29.1 54 59.4 81.5 91 27.5 31.6 55.3 64.5 83.4 98.6 28.1 34.1 56.5 69.4 85.2 106 28.7 36.6 57.7 74.4 87 113.4 29.3 39 58.9 79.2 88.8 120.6 29.9 41.4 60.1 83.9 90.6 127.6 30.5 43.7 61.3 88.6 92.4 134.7z";

  const getPulseIntensity = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'high': return 'animate-[pulse_0.8s_ease-in-out_infinite]';
      case 'medium': return 'animate-[pulse_1.2s_ease-in-out_infinite]';
      case 'low': return 'animate-[pulse_2s_ease-in-out_infinite]';
      default: return 'animate-pulse';
    }
  };

  const getPulseColor = (intensity: 'low' | 'medium' | 'high') => {
    switch (intensity) {
      case 'high': return '#ef4444';
      case 'medium': return '#ffff9b';
      case 'low': return '#9bff9b';
      default: return '#9bff9b';
    }
  };

  // Convert lat/lng to SVG coordinates (simple projection)
  const projectToSVG = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x, y };
  };

  if (loading) {
    return (
      <div className={`bg-black/40 border border-tennis-green-primary/30 rounded p-4 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-primary mx-auto mb-2"></div>
          <p className="text-tennis-green-light text-sm">Loading global activity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/40 border border-tennis-green-primary/30 rounded p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-lg animate-bounce">🌍</div>
        <span className="text-tennis-green-primary font-orbitron text-sm uppercase tracking-wider">
          Global Tennis Activity
        </span>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox="0 0 800 400"
          className="w-full h-64 bg-black/20 rounded border border-tennis-green-primary/20"
        >
          {/* World outline */}
          <path
            d="M50 100 L750 100 L750 300 L50 300 Z M100 150 L700 150 L700 250 L100 250 Z"
            fill="none"
            stroke="#1f2937"
            strokeWidth="1"
            opacity="0.3"
          />
          
          {/* Continent outlines (simplified) */}
          <g fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.4">
            {/* North America */}
            <path d="M80 120 Q120 100 180 110 L200 140 Q180 180 120 170 Z" />
            {/* Europe */}
            <path d="M350 130 Q380 120 420 125 L430 155 Q400 165 360 160 Z" />
            {/* Asia */}
            <path d="M450 110 Q550 100 650 120 L680 160 Q600 180 480 170 Z" />
            {/* Africa */}
            <path d="M340 180 Q380 170 420 180 L430 240 Q390 260 350 250 Z" />
            {/* South America */}
            <path d="M180 200 Q220 190 250 200 L240 280 Q200 290 180 280 Z" />
            {/* Australia */}
            <path d="M580 260 Q620 250 660 260 L650 290 Q610 300 580 290 Z" />
          </g>

          {/* Activity markers */}
          {activityLocations.map((location) => {
            const { x, y } = projectToSVG(location.lat, location.lng);
            const isHovered = hoveredLocation === location.id;
            
            return (
              <g key={location.id}>
                {/* Pulse ring */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 20 : 15}
                  fill="none"
                  stroke={getPulseColor(location.pulse_intensity)}
                  strokeWidth="2"
                  opacity="0.3"
                  className={getPulseIntensity(location.pulse_intensity)}
                />
                
                {/* Main marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 8 : 6}
                  fill={getPulseColor(location.pulse_intensity)}
                  className={`cursor-pointer transition-all duration-300 ${getPulseIntensity(location.pulse_intensity)}`}
                  onMouseEnter={() => setHoveredLocation(location.id)}
                  onMouseLeave={() => setHoveredLocation(null)}
                />
                
                {/* Activity count indicator */}
                <text
                  x={x}
                  y={y - (isHovered ? 12 : 10)}
                  textAnchor="middle"
                  className="text-xs font-orbitron font-bold fill-white pointer-events-none"
                  fontSize={isHovered ? "10" : "8"}
                >
                  {location.activity_count}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredLocation && (
          <div className="absolute bottom-4 left-4 bg-black/80 border border-tennis-green-primary/50 rounded p-3 max-w-xs">
            {(() => {
              const location = activityLocations.find(loc => loc.id === hoveredLocation);
              if (!location) return null;
              
              return (
                <div>
                  <div className="font-orbitron font-bold text-tennis-green-primary text-sm mb-1">
                    {location.city}, {location.country}
                  </div>
                  <div className="text-tennis-green-light text-xs mb-2">
                    {location.recent_activity}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-tennis-green-light/70">
                      {location.activity_count} activities
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-orbitron ${
                      location.pulse_intensity === 'high' ? 'bg-red-500/20 text-red-300' :
                      location.pulse_intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }`}>
                      {location.pulse_intensity.toUpperCase()}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Activity summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-black/20 rounded p-2">
          <div className="text-tennis-green-primary font-orbitron text-lg font-bold">
            {activityLocations.length}
          </div>
          <div className="text-tennis-green-light text-xs uppercase tracking-wider">
            Cities
          </div>
        </div>
        <div className="bg-black/20 rounded p-2">
          <div className="text-tennis-green-primary font-orbitron text-lg font-bold">
            {activityLocations.reduce((sum, loc) => sum + loc.activity_count, 0)}
          </div>
          <div className="text-tennis-green-light text-xs uppercase tracking-wider">
            Activities
          </div>
        </div>
        <div className="bg-black/20 rounded p-2">
          <div className="text-tennis-green-primary font-orbitron text-lg font-bold">
            {activityLocations.filter(loc => loc.pulse_intensity === 'high').length}
          </div>
          <div className="text-tennis-green-light text-xs uppercase tracking-wider">
            Hotspots
          </div>
        </div>
      </div>
    </div>
  );
}
