
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Heart, Trophy, Zap } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'achievement' | 'challenge' | 'status';
  metadata?: any;
}

interface MessageListProps {
  conversationId: string;
}

export function MessageList({ conversationId }: MessageListProps) {
  // Mock messages for demonstration
  const messages: Message[] = [
    {
      id: '1',
      senderId: 'other',
      content: 'Hey! How was your training session today?',
      timestamp: '10:30 AM',
      type: 'text'
    },
    {
      id: '2',
      senderId: 'me',
      content: 'It was great! Just reached level 5! 🎾',
      timestamp: '10:32 AM',
      type: 'achievement',
      metadata: {
        achievement: 'Rising Star',
        level: 5,
        xpEarned: 100
      }
    },
    {
      id: '3',
      senderId: 'other',
      content: 'Awesome! Want to play a match later?',
      timestamp: '10:35 AM',
      type: 'text'
    },
    {
      id: '4',
      senderId: 'me',
      content: 'I challenge you to a friendly match! 🏆',
      timestamp: '10:36 AM',
      type: 'challenge',
      metadata: {
        challengeType: 'friendly_match',
        stakes: '50 tokens'
      }
    },
    {
      id: '5',
      senderId: 'other',
      content: 'Challenge accepted! See you at the court at 3 PM',
      timestamp: '10:38 AM',
      type: 'text'
    }
  ];

  const renderMessage = (message: Message) => {
    const isMe = message.senderId === 'me';

    return (
      <div
        key={message.id}
        className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md ${isMe ? 'order-2' : 'order-1'}`}>
          {/* Message Content */}
          <div
            className={`px-4 py-2 rounded-lg ${
              isMe
                ? 'bg-tennis-green-dark text-white'
                : 'bg-white border border-gray-200'
            }`}
          >
            {message.type === 'text' && (
              <p className="text-sm">{message.content}</p>
            )}

            {message.type === 'achievement' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-sm">Achievement Unlocked!</span>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{message.metadata.achievement}</p>
                  <p className="text-xs opacity-80">
                    Reached Level {message.metadata.level} • +{message.metadata.xpEarned} XP
                  </p>
                </div>
              </div>
            )}

            {message.type === 'challenge' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-sm">Challenge Sent!</span>
                </div>
                <div className="text-sm">
                  <p>{message.content}</p>
                  <Badge variant="outline" className="mt-1">
                    Stakes: {message.metadata.stakes}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <p
            className={`text-xs text-muted-foreground mt-1 ${
              isMe ? 'text-right' : 'text-left'
            }`}
          >
            {message.timestamp}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        <ScrollArea className="h-96 p-4">
          {messages.map(renderMessage)}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
