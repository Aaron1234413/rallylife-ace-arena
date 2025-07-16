import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Calendar,
  MapPin,
  Trophy,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTemplateSelect?: (template: string) => void;
  templates?: Array<{ category: string; text: string; icon?: React.ReactNode }>;
  sending?: boolean;
  placeholder?: string;
}

export function MessageInput({ 
  onSendMessage, 
  onTemplateSelect,
  templates = [],
  sending = false,
  placeholder = "Type your message..."
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sending) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleTemplateSelect = (template: string) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    } else {
      setMessage(template);
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, typeof templates>);

  return (
    <div className="p-4">
      {/* Quick Templates */}
      {templates.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  Quick Match
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-80">
                {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {category}
                    </div>
                    {categoryTemplates.map((template, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleTemplateSelect(template.text)}
                        className="flex items-start gap-2 py-2"
                      >
                        {template.icon && (
                          <div className="mt-0.5 text-tennis-green-primary">
                            {template.icon}
                          </div>
                        )}
                        <span className="text-sm">{template.text}</span>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="text-xs">
              <MapPin className="h-3 w-3 mr-1" />
              Share Location
            </Button>

            <Button variant="outline" size="sm" className="text-xs">
              <Trophy className="h-3 w-3 mr-1" />
              Share Achievement
            </Button>
          </div>
        </div>
      )}

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            disabled={sending}
            className="pr-20 min-h-[44px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          {/* Input Actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={!message.trim() || sending}
          className="bg-tennis-green-primary hover:bg-tennis-green-medium h-[44px] px-4"
        >
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Message Status */}
      {sending && (
        <div className="mt-2 flex items-center gap-2 text-sm text-tennis-green-medium">
          <div className="w-2 h-2 bg-tennis-green-primary rounded-full animate-pulse"></div>
          Sending message...
        </div>
      )}
    </div>
  );
}