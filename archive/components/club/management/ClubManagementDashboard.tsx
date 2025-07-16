import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceRedemptionSettingsComponent } from './ServiceRedemptionSettings';
import { MemberSpendingLimits } from './MemberSpendingLimits';
import { OverdraftMonitoring } from './OverdraftMonitoring';
import { TokenPackPurchasing } from './TokenPackPurchasing';
import { Settings, Users, AlertTriangle, ShoppingCart } from 'lucide-react';

interface ClubManagementDashboardProps {
  clubId: string;
}

export function ClubManagementDashboard({ clubId }: ClubManagementDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-tennis-green-dark mb-2">Club Management</h2>
        <p className="text-gray-600">
          Configure token pool settings, member limits, and service redemption rules
        </p>
      </div>

      <Tabs defaultValue="service-settings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="service-settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Service Settings</span>
          </TabsTrigger>
          <TabsTrigger value="member-limits" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Member Limits</span>
          </TabsTrigger>
          <TabsTrigger value="overdraft" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Overdraft</span>
          </TabsTrigger>
          <TabsTrigger value="purchase" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Purchase</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="service-settings">
          <ServiceRedemptionSettingsComponent clubId={clubId} />
        </TabsContent>

        <TabsContent value="member-limits">
          <MemberSpendingLimits clubId={clubId} />
        </TabsContent>

        <TabsContent value="overdraft">
          <OverdraftMonitoring clubId={clubId} />
        </TabsContent>

        <TabsContent value="purchase">
          <TokenPackPurchasing clubId={clubId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}