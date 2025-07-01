
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCoachCXP } from '@/hooks/useCoachCXP';
import { useCoachTokens } from '@/hooks/useCoachTokens';
import { useCoachCRP } from '@/hooks/useCoachCRP';
import { useCoachLeaderboards } from '@/hooks/useCoachLeaderboards';
import { CoachOverviewCards } from '@/components/coach/dashboard/CoachOverviewCards';
import { ClientManagementPanel } from '@/components/coach/dashboard/ClientManagementPanel';
import { CoachAnalytics } from '@/components/coach/dashboard/CoachAnalytics';
import { CoachQuickActions } from '@/components/coach/dashboard/CoachQuickActions';
import { RecentActivity } from '@/components/coach/dashboard/RecentActivity';
import { CoachActionPanel } from '@/components/coach/CoachActionPanel';

const CoachDashboard = () => {
  const { user } = useAuth();
  const { cxpData, activities: cxpActivities, loading: cxpLoading } = useCoachCXP();
  const { tokenData, transactions, loading: tokensLoading } = useCoachTokens();
  const { crpData, isLoading: crpLoading } = useCoachCRP();

  return (
    <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-tennis-green-dark">
          Coach Dashboard 🎾
        </h1>
        <p className="text-tennis-green-medium mt-2">
          Manage your clients, track progress, and grow your coaching business
        </p>
      </div>

      {/* Overview Cards */}
      <CoachOverviewCards
        cxpData={cxpData}
        tokenData={tokenData}
        crpData={crpData}
        cxpLoading={cxpLoading}
        tokensLoading={tokensLoading}
        crpLoading={crpLoading}
      />

      {/* Quick Actions */}
      <CoachQuickActions />
      
      {/* Action Panel for Testing */}
      <CoachActionPanel />

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-3">
        {/* Client Management - Takes 2 columns on large screens */}
        <div className="lg:col-span-2">
          <ClientManagementPanel />
        </div>

        {/* Recent Activity - Takes 1 column on large screens */}
        <div className="lg:col-span-1">
          <RecentActivity
            cxpActivities={cxpActivities}
            transactions={transactions}
            cxpLoading={cxpLoading}
            tokensLoading={tokensLoading}
          />
        </div>
      </div>

      {/* Analytics Section */}
      <CoachAnalytics
        cxpData={cxpData}
        tokenData={tokenData}
        crpData={crpData}
      />
    </div>
  );
};

export default CoachDashboard;
