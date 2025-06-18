
import React from 'react';
import { getRandomMessage } from '@/utils/motivationalMessages';

export function TrainingGreeting() {
  const message = getRandomMessage('startMatch'); // Reusing existing motivational messages

  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Ready to Train?
      </h1>
      <p className="text-lg text-gray-600">
        {message}
      </p>
    </div>
  );
}
