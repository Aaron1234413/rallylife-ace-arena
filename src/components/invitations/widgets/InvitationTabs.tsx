import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Inbox, MailOpen } from 'lucide-react';

interface InvitationTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  totalReceived: number;
  totalSent: number;
}

export const InvitationTabs: React.FC<InvitationTabsProps> = ({
  activeTab,
  onTabChange,
  totalReceived,
  totalSent
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="received" className="flex items-center gap-2">
          <Inbox className="h-4 w-4" />
          Received
          {totalReceived > 0 && (
            <Badge variant="secondary" className="ml-1 bg-hsl(var(--tennis-green-accent)) text-white animate-pulse">
              {totalReceived}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="flex items-center gap-2">
          <MailOpen className="h-4 w-4" />
          Sent
          {totalSent > 0 && (
            <Badge variant="outline" className="ml-1 border-hsl(var(--tennis-yellow)) text-hsl(var(--tennis-yellow))">
              {totalSent}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};