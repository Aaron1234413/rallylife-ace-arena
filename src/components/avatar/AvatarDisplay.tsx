
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface AvatarDisplayProps {
  avatarUrl?: string;
  equippedItems?: any;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
  showBorder?: boolean;
}

export function AvatarDisplay({ 
  avatarUrl, 
  equippedItems, 
  size = 'medium', 
  className = '',
  showBorder = false
}: AvatarDisplayProps) {
  const sizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  // If we have equipped items, we could generate a custom avatar
  // For now, we'll use the profile avatar_url or a default
  const displayUrl = avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

  return (
    <Avatar 
      className={`${sizeClasses[size]} ${showBorder ? 'border-2 border-tennis-green-dark' : ''} ${className}`}
    >
      <AvatarImage src={displayUrl} alt="Player avatar" />
      <AvatarFallback>
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  );
}
