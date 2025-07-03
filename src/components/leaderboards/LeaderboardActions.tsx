import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MessageCircle, 
  Zap, 
  UserPlus, 
  MoreVertical,
  Calendar,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LeaderboardActionsProps {
  targetUserId: string;
  targetUserName: string;
  targetUserRole: 'player' | 'coach';
  currentUserRole?: 'player' | 'coach';
  compact?: boolean;
}

export function LeaderboardActions({ 
  targetUserId, 
  targetUserName, 
  targetUserRole,
  currentUserRole,
  compact = false 
}: LeaderboardActionsProps) {
  const { toast } = useToast();
  const [isActioning, setIsActioning] = useState(false);

  const handleChallenge = async () => {
    setIsActioning(true);
    try {
      // TODO: Implement challenge creation logic
      toast({
        title: "Challenge Sent!",
        description: `Challenge sent to ${targetUserName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send challenge",
        variant: "destructive",
      });
    } finally {
      setIsActioning(false);
    }
  };

  const handleConnect = async () => {
    setIsActioning(true);
    try {
      // TODO: Implement connection logic
      toast({
        title: "Connection Request Sent!",
        description: `Connection request sent to ${targetUserName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive",
      });
    } finally {
      setIsActioning(false);
    }
  };

  const handleMessage = async () => {
    // TODO: Navigate to messages or open chat modal
    toast({
      title: "Message Feature",
      description: "Opening conversation with " + targetUserName,
    });
  };

  const handleBookLesson = async () => {
    setIsActioning(true);
    try {
      // TODO: Implement lesson booking logic
      toast({
        title: "Lesson Request",
        description: `Lesson request sent to coach ${targetUserName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send lesson request",
        variant: "destructive",
      });
    } finally {
      setIsActioning(false);
    }
  };

  // Define actions based on user roles
  const getAvailableActions = () => {
    const actions = [];

    // Always available: Message
    actions.push({
      id: 'message',
      label: 'Message',
      icon: MessageCircle,
      onClick: handleMessage,
      className: 'text-blue-600 hover:text-blue-700'
    });

    if (currentUserRole === 'player') {
      if (targetUserRole === 'player') {
        // Player to Player: Challenge
        actions.push({
          id: 'challenge',
          label: 'Challenge',
          icon: Zap,
          onClick: handleChallenge,
          className: 'text-orange-600 hover:text-orange-700'
        });
      } else if (targetUserRole === 'coach') {
        // Player to Coach: Connect, Book Lesson
        actions.push({
          id: 'connect',
          label: 'Connect',
          icon: UserPlus,
          onClick: handleConnect,
          className: 'text-green-600 hover:text-green-700'
        });
        actions.push({
          id: 'book',
          label: 'Book Lesson',
          icon: Calendar,
          onClick: handleBookLesson,
          className: 'text-tennis-green-dark hover:text-tennis-green-medium'
        });
      }
    } else if (currentUserRole === 'coach') {
      if (targetUserRole === 'player') {
        // Coach to Player: Connect
        actions.push({
          id: 'connect',
          label: 'Connect',
          icon: UserPlus,
          onClick: handleConnect,
          className: 'text-green-600 hover:text-green-700'
        });
      }
      // Coach to Coach: Just message (no additional actions)
    }

    return actions;
  };

  const actions = getAvailableActions();

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isActioning}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action) => (
            <DropdownMenuItem
              key={action.id}
              onClick={action.onClick}
              className={action.className}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {actions.slice(0, 2).map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="sm"
          onClick={action.onClick}
          disabled={isActioning}
          className={`${action.className} border-current`}
        >
          <action.icon className="h-3 w-3 mr-1" />
          {action.label}
        </Button>
      ))}
      
      {actions.length > 2 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isActioning}
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {actions.slice(2).map((action) => (
              <DropdownMenuItem
                key={action.id}
                onClick={action.onClick}
                className={action.className}
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}