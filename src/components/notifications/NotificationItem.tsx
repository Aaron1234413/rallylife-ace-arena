import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  match_id?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'challenge_received':
        return '🎾';
      case 'challenge_accepted':
        return '✅';
      case 'challenge_declined':
        return '❌';
      case 'opponent_running_late':
        return '⏰';
      case 'match_completed':
        return '🏆';
      case 'match_cancelled':
        return '🚫';
      default:
        return '📧';
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      className={cn(
        "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
        !notification.read && "bg-primary/5 border-l-2 border-l-primary"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="text-lg flex-shrink-0">
          {getNotificationIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn(
              "text-sm font-medium truncate",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};