
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AvatarDisplay } from '@/components/avatar/AvatarDisplay';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onAvatarSelect: (url: string) => void;
}

export function AvatarSelector({ selectedAvatar, onAvatarSelect }: AvatarSelectorProps) {
  const avatarOptions = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player1&backgroundColor=b6e3f4',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player2&backgroundColor=c0aede',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player3&backgroundColor=d1d4ed',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player4&backgroundColor=ffd5dc',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player5&backgroundColor=ffdfba',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player6&backgroundColor=c7ceea',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player7&backgroundColor=ffeaa7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=player8&backgroundColor=fab1a0'
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {avatarOptions.map((avatar, index) => (
          <button
            key={index}
            onClick={() => onAvatarSelect(avatar)}
            className={`p-2 rounded-lg border-2 transition-all hover:scale-105 ${
              selectedAvatar === avatar 
                ? 'border-tennis-green-dark bg-tennis-green-light/20' 
                : 'border-gray-200 hover:border-tennis-green-light'
            }`}
          >
            <AvatarDisplay 
              avatarUrl={avatar}
              size="large"
              className="mx-auto"
            />
          </button>
        ))}
      </div>
      
      {selectedAvatar && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Selected Avatar:</p>
          <div className="flex justify-center">
            <AvatarDisplay 
              avatarUrl={selectedAvatar}
              size="xl"
              showBorder={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
