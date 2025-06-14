
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCoachAvatar } from '@/hooks/useCoachAvatar';

interface CoachAvatarDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showItems?: boolean;
  className?: string;
}

export function CoachAvatarDisplay({ size = 'md', showItems = true, className = '' }: CoachAvatarDisplayProps) {
  const { equippedItems, loading } = useCoachAvatar();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const badgeSize = size === 'sm' ? 'sm' : 'default';

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-tennis-green-light animate-pulse ${className}`} />
    );
  }

  // Get the primary avatar image (from attire category)
  const primaryAvatar = equippedItems.find(item => item.category === 'attire')?.avatar_item;
  const avatarUrl = primaryAvatar?.image_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=coach-default';

  return (
    <div className={`relative ${className}`}>
      {/* Main avatar */}
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-tennis-green-light bg-white`}>
        <img 
          src={avatarUrl} 
          alt="Coach Avatar" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Equipment badges */}
      {showItems && size !== 'sm' && (
        <div className="absolute -bottom-2 -right-2 flex flex-wrap gap-1 max-w-20">
          {equippedItems
            .filter(item => item.category === 'equipment' || item.category === 'badge')
            .slice(0, 3)
            .map((equipped) => (
              <Badge
                key={equipped.id}
                variant="secondary"
                className={`text-xs ${badgeSize === 'sm' ? 'px-1 py-0' : ''}`}
                title={equipped.avatar_item.name}
              >
                {equipped.category === 'badge' ? '🏆' : '🎾'}
              </Badge>
            ))}
        </div>
      )}

      {/* Professional indicator */}
      {equippedItems.some(item => item.avatar_item.is_professional) && (
        <div className="absolute -top-1 -right-1">
          <Badge variant="default" className="text-xs bg-yellow-500 text-white">
            PRO
          </Badge>
        </div>
      )}
    </div>
  );
}
