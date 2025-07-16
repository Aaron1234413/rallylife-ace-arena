import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useConversations } from '@/hooks/useConversations';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export const MessageCenter = () => {
  const [open, setOpen] = useState(false);
  const { conversations, loading } = useConversations();
  const navigate = useNavigate();

  // Calculate total unread count (for now using 0 since unread logic isn't implemented)
  const totalUnreadCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages?conversation=${conversationId}`);
    setOpen(false);
  };

  const handleViewAllMessages = () => {
    navigate('/messages');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquare className="h-4 w-4" />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Messages</h3>
          {conversations.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {conversations.length} conversation{conversations.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading messages...
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="divide-y">
              {conversations.slice(0, 5).map((conversation) => {
                const otherParticipant = conversation.otherParticipant as any;
                return (
                  <div
                    key={conversation.id}
                    className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleConversationClick(conversation.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={otherParticipant?.avatar_url || ''} />
                        <AvatarFallback>
                          {otherParticipant?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {otherParticipant?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {conversations.length > 0 && (
          <div className="p-3 border-t">
            <Button 
              variant="ghost" 
              className="w-full text-sm"
              onClick={handleViewAllMessages}
            >
              View All Messages
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};