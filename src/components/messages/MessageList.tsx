
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface MessageListProps {
  messages: any[];
  loading: boolean;
  conversationId: string;
}

export function MessageList({ messages, loading, conversationId }: MessageListProps) {
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-dark mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (message: any) => {
    if (message.message_type === 'challenge' && message.metadata?.challenge_id) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-orange-800">Challenge Sent!</span>
          </div>
          <p className="text-sm text-orange-700">{message.content}</p>
        </div>
      );
    }

    if (message.message_type === 'achievement' && message.metadata?.achievement_id) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="font-medium text-yellow-800">Achievement Shared!</span>
          </div>
          <p className="text-sm text-yellow-700">{message.content}</p>
        </div>
      );
    }

    return <p>{message.content}</p>;
  };

  return (
    <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
      <div className="space-y-4 pb-4">
        {messages.map((message: any) => {
          const isCurrentUser = message.sender_id === user?.id;
          const senderName = message.profiles?.full_name || 'Unknown User';

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isCurrentUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.profiles?.avatar_url || ''} />
                  <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}

              <div className={`flex-1 max-w-xs ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                {!isCurrentUser && (
                  <p className="text-xs text-muted-foreground mb-1">{senderName}</p>
                )}
                
                <div
                  className={`rounded-lg px-3 py-2 inline-block ${
                    isCurrentUser
                      ? 'bg-tennis-green-dark text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {renderMessageContent(message)}
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTime(message.created_at)}
                </p>
              </div>

              {isCurrentUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ''} />
                  <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
