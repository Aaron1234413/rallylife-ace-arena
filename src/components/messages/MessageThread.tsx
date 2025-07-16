import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useMessages } from '@/hooks/useMessages';
import { useConversationDetails } from '@/hooks/useConversationDetails';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Users, 
  Video, 
  Phone, 
  MessageSquare,
  Calendar,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMessageTemplates } from '@/hooks/useMessageTemplates';

interface MessageThreadProps {
  conversationId: string;
}

export function MessageThread({ conversationId }: MessageThreadProps) {
  const { messages, loading, sendMessage, sending } = useMessages(conversationId);
  const { conversation, loading: conversationLoading } = useConversationDetails(conversationId);
  const { getMatchTemplates, getChallengeTemplates } = useMessageTemplates();

  const otherParticipant = conversation?.otherParticipant;

  const handleTemplateSelect = (template: string) => {
    sendMessage({ content: template });
  };

  const templates = [
    ...getMatchTemplates(),
    ...getChallengeTemplates()
  ];

  if (conversationLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tennis-green-dark mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Thread Header */}
      <div className="bg-white border-b border-tennis-green-light/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={(otherParticipant as any)?.avatar_url || ''} />
                <AvatarFallback>
                  {(otherParticipant as any)?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Online status */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            </div>
            
            <div>
              <h2 className="font-semibold text-tennis-green-dark">
                {(otherParticipant as any)?.full_name || 'Unknown User'}
              </h2>
              <div className="flex items-center gap-2 text-sm text-tennis-green-medium">
                <span>Online</span>
                {conversation?.is_group && (
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Group
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <MapPin className="h-4 w-4 mr-2" />
                  View Location
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-tennis-green-bg/30">
        <MessageList 
          messages={messages} 
          loading={loading} 
          conversationId={conversationId} 
        />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-tennis-green-light/20">
        <MessageInput
          onSendMessage={(content) => sendMessage({ content })}
          onTemplateSelect={handleTemplateSelect}
          templates={templates}
          sending={sending}
          placeholder={`Message ${(otherParticipant as any)?.full_name || 'user'}...`}
        />
      </div>
    </div>
  );
}