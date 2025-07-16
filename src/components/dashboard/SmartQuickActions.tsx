import React from 'react';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useConversations } from '@/hooks/useConversations';
import { useStandardSessionFetch } from '@/hooks/useStandardSessionFetch';
import { Play, MessageSquare, Store } from 'lucide-react';

export function SmartQuickActions() {
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
      return `${nearbySessions} session${nearbySessions === 1 ? '' : 's'} nearby`;
    }
    return "Find your next match";
  };

  const getMessagesContent = () => {
    if (unreadCount > 0) {
      return `${unreadCount} unread message${unreadCount === 1 ? '' : 's'}`;
    }
    return "Connect with other players";
  };

  const getStoreContent = () => {
    const currentHP = hpData?.current_hp || 100;
    const maxHP = hpData?.max_hp || 100;
    
    if (currentHP < 50) {
      return "HP is low - boost your energy!";
    }
    if (regularTokens < 100) {
      return "Earn more tokens to unlock gear";
    }
    return "Browse premium equipment";
  };

  const actions = [
    {
      icon: Play,
      label: "Play",
      content: getPlayContent(),
      onClick: () => navigate('/play'),
      bgColor: "bg-tennis-green-primary",
      textColor: "text-tennis-green-primary"
    },
    {
      icon: MessageSquare,
      label: "Messages",
      content: getMessagesContent(),
      onClick: () => navigate('/messages'),
      bgColor: "bg-tennis-green-medium",
      textColor: "text-tennis-green-medium",
      badge: unreadCount > 0 ? unreadCount : undefined
    },
    {
      icon: Store,
      label: "Store",
      content: getStoreContent(),
      onClick: () => navigate('/store'),
      bgColor: "bg-tennis-green-accent",
      textColor: "text-tennis-green-accent"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <Card 
            key={index} 
            className="relative cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-card border-border"
            onClick={action.onClick}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-full ${action.bgColor}`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <h3 className={`font-semibold text-lg ${action.textColor}`}>
                  {action.label}
                </h3>
                {action.badge && (
                  <div className="ml-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {action.badge}
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-sm">{action.content}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}