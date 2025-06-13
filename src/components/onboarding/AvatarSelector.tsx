
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
            <img 
              src={avatar} 
              alt={`Avatar option ${index + 1}`}
              className="w-16 h-16 rounded-full mx-auto"
            />
          </button>
        ))}
      </div>
      
      {selectedAvatar && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Selected Avatar:</p>
          <img 
            src={selectedAvatar} 
            alt="Selected avatar"
            className="w-20 h-20 rounded-full mx-auto border-2 border-tennis-green-dark"
          />
        </div>
      )}
    </div>
  );
}
