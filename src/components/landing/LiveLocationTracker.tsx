
import React, { useState } from 'react';
import { useLandingPageData } from '@/hooks/useLandingPageData';
import { formatDistanceToNow } from 'date-fns';

interface LiveLocationTrackerProps {
  className?: string;
}

export function LiveLocationTracker({ className }: LiveLocationTrackerProps) {
  const { activityLocations, loading } = useLandingPageData();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-black/20 rounded animate-pulse">
            <div className="w-3 h-3 bg-tennis-green-primary/30 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-tennis-green-primary/20 rounded w-3/4" />
              <div className="h-3 bg-tennis-green-primary/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="text-lg animate-bounce">📍</div>
        <span className="text-tennis-green-primary font-orbitron text-sm uppercase tracking-wider">
          Live Locations
        </span>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-tennis-green-primary/30">
        {activityLocations
          .sort((a, b) => b.activity_count - a.activity_count)
          .map((location, index) => (
            <div 
              key={location.id}
              className={`
                flex items-center gap-3 p-3 rounded cursor-pointer transition-all duration-300
                ${selectedLocation === location.id 
                  ? 'bg-tennis-green-primary/20 border border-tennis-green-primary/50' 
                  : 'bg-black/20 border border-tennis-green-primary/20 hover:bg-black/30'
                }
              `}
              onClick={() => setSelectedLocation(
                selectedLocation === location.id ? null : location.id
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Pulse indicator */}
              <div className="relative flex-shrink-0">
                <div 
                  className={`
                    w-3 h-3 rounded-full
                    ${location.pulse_intensity === 'high' ? 'bg-red-500 animate-[pulse_0.8s_ease-in-out_infinite]' :
                      location.pulse_intensity === 'medium' ? 'bg-tennis-yellow animate-[pulse_1.2s_ease-in-out_infinite]' :
                      'bg-tennis-green-primary animate-[pulse_2s_ease-in-out_infinite]'
                    }
                  `}
                />
                <div 
                  className={`
                    absolute inset-0 w-3 h-3 rounded-full opacity-30 animate-ping
                    ${location.pulse_intensity === 'high' ? 'bg-red-500' :
                      location.pulse_intensity === 'medium' ? 'bg-tennis-yellow' :
                      'bg-tennis-green-primary'
                    }
                  `}
                />
              </div>

              {/* Location info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-tennis-green-light text-sm truncate">
                    {location.city}, {location.country}
                  </span>
                  <span className="text-xs text-tennis-green-light/60">
                    #{index + 1}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-tennis-green-light/80">
                    {location.activity_count} activities
                  </span>
                  <span className={`
                    text-xs px-2 py-1 rounded font-orbitron
                    ${location.pulse_intensity === 'high' ? 'bg-red-500/20 text-red-300' :
                      location.pulse_intensity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-green-500/20 text-green-300'
                    }
                  `}>
                    {location.pulse_intensity.toUpperCase()}
                  </span>
                </div>

                {/* Expanded details */}
                {selectedLocation === location.id && (
                  <div className="mt-3 pt-3 border-t border-tennis-green-primary/20 space-y-2">
                    <div className="text-xs text-tennis-green-light/70">
                      <span className="font-medium">Recent Activity:</span>
                      <br />
                      {location.recent_activity}
                    </div>
                    <div className="text-xs text-tennis-green-light/50">
                      Updated {formatDistanceToNow(new Date(location.timestamp), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs text-tennis-green-light/70">
                        📊 Activity Level: 
                        <span className="ml-1 font-orbitron">
                          {location.activity_count > 35 ? 'Very High' :
                           location.activity_count > 20 ? 'High' :
                           location.activity_count > 10 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expand indicator */}
              <div className="flex-shrink-0">
                <div className={`
                  text-tennis-green-light/60 transition-transform duration-300
                  ${selectedLocation === location.id ? 'rotate-180' : ''}
                `}>
                  ▲
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Quick stats */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="bg-black/20 rounded p-2">
          <div className="text-tennis-green-primary font-orbitron text-sm font-bold">
            {activityLocations.filter(loc => loc.pulse_intensity === 'high').length}
          </div>
          <div className="text-tennis-green-light text-xs uppercase tracking-wider">
            High Activity
          </div>
        </div>
        <div className="bg-black/20 rounded p-2">
          <div className="text-tennis-green-primary font-orbitron text-sm font-bold">
            {Math.round(activityLocations.reduce((sum, loc) => sum + loc.activity_count, 0) / activityLocations.length)}
          </div>
          <div className="text-tennis-green-light text-xs uppercase tracking-wider">
            Avg Activities
          </div>
        </div>
      </div>
    </div>
  );
}
