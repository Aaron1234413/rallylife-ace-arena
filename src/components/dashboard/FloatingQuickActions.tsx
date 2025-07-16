import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useConversations } from '@/hooks/useConversations';
import { useStandardSessionFetch } from '@/hooks/useStandardSessionFetch';
import { Play, MessageSquare, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function FloatingQuickActions() {
  const navigate = useNavigate();
  const { hpData } = usePlayerHP();
  const { regularTokens } = usePlayerTokens();
  const { conversations } = useConversations();
  const { sessions } = useStandardSessionFetch({
    filterUserParticipation: false,
    includeNonClubSessions: true
  });

  // Calculate unread messages
  const unreadCount = conversations?.filter(conv => conv.unreadCount > 0)?.length || 0;
  
  // Get nearby sessions count
  const nearbySessions = sessions?.length || 0;

  // Smart content for each action
  const getPlayContent = () => {
    if (nearbySessions > 0) {
      return `${nearbySessions} nearby`;
    }
    return "Find matches";
  };

  const getMessagesContent = () => {
    if (unreadCount > 0) {
      return `${unreadCount} unread`;
    }
    return "Connect";
  };

  const getStoreContent = () => {
    const currentHP = hpData?.current_hp || 100;
    
    if (currentHP < 50) {
      return "Low HP";
    }
    if (regularTokens < 100) {
      return "Earn tokens";
    }
    return "Browse";
  };

  const actions = [
    {
      icon: Play,
      label: "Play",
      content: getPlayContent(),
      onClick: () => navigate('/play'),
      bgColor: "bg-tennis-green-primary hover:bg-tennis-green-dark",
      count: nearbySessions
    },
    {
      icon: MessageSquare,
      label: "Messages",
      content: getMessagesContent(),
      onClick: () => navigate('/messages'),
      bgColor: "bg-tennis-green-medium hover:bg-tennis-green-primary",
      count: unreadCount
    },
    {
      icon: Store,
      label: "Store",
      content: getStoreContent(),
      onClick: () => navigate('/store'),
      bgColor: "bg-tennis-green-accent hover:bg-tennis-green-medium"
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <div key={index} className="relative group">
            <Button
              onClick={action.onClick}
              size="lg"
              className={`w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${action.bgColor} border-0`}
            >
              <IconComponent className="h-6 w-6 text-white" />
            </Button>
            
            {/* Badge for counts */}
            {action.count > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                {action.count}
              </Badge>
            )}
            
            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-popover border border-border rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              <div className="text-sm font-medium text-popover-foreground">{action.label}</div>
              <div className="text-xs text-muted-foreground">{action.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}