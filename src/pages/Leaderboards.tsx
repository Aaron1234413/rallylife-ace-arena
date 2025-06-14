
import React from 'react';
import { CoachLeaderboard } from '@/components/leaderboards/CoachLeaderboard';

export default function Leaderboards() {
  return (
    <div className="p-3 sm:p-4 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-tennis-green-dark mb-2">
          Coach Leaderboards
        </h1>
        <p className="text-tennis-green-medium max-w-2xl mx-auto">
          Discover the top performing coaches across different metrics including reputation,
          experience, and player success rates.
        </p>
      </div>
      
      <CoachLeaderboard />
    </div>
  );
}
