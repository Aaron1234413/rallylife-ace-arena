import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerHP } from '@/hooks/usePlayerHP';
import { usePlayerTokens } from '@/hooks/usePlayerTokens';
import { useConversations } from '@/hooks/useConversations';
import { useStandardSessionFetch } from '@/hooks/useStandardSessionFetch';
import { Play, MessageSquare, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function QuickActions() {
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
      description: "Find nearby sessions or start playing",
      onClick: () => navigate('/play'),
      gradient: "from-tennis-green-primary to-tennis-green-dark",
      count: nearbySessions
    },
    {
      icon: MessageSquare,
      label: "Messages",
      content: getMessagesContent(),
      description: "Chat with players and coaches",
      onClick: () => navigate('/messages'),
      gradient: "from-tennis-green-medium to-tennis-green-primary",
      count: unreadCount
    },
    {
      icon: Store,
      label: "Store",
      content: getStoreContent(),
      description: "Browse boosters and equipment",
      onClick: () => navigate('/store'),
      gradient: "from-tennis-green-accent to-tennis-green-medium"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {actions.map((action, index) => {
        const IconComponent = action.icon;
        return (
          <Card 
            key={index} 
            className="relative group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            onClick={action.onClick}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
            
            <CardContent className="p-6 relative">
              {/* Badge for counts */}
              {action.count > 0 && (
                <Badge className="absolute top-4 right-4 bg-tennis-green-primary text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                  {action.count}
                </Badge>
              )}
              
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${action.gradient} shadow-md group-hover:shadow-lg transition-shadow`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-tennis-green-dark mb-1">
                    {action.label}
                  </h3>
                  <p className="text-sm text-tennis-green-primary font-medium mb-1">
                    {action.content}
                  </p>
                  <p className="text-xs text-tennis-green-medium">
                    {action.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}