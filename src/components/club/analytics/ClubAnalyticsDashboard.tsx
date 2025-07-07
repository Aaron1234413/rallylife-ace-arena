import React from 'react';
import { TokenPoolAnalytics } from './TokenPoolAnalytics';
import { UsageTrendChart } from './UsageTrendChart';
import { RedemptionBreakdown } from './RedemptionBreakdown';
import { MemberActivityTable } from './MemberActivityTable';
import { ClubTokenAnalytics } from '@/types/clubAnalytics';

interface ClubAnalyticsDashboardProps {
  analytics: ClubTokenAnalytics;
}

export function ClubAnalyticsDashboard({ analytics }: ClubAnalyticsDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Token Pool Overview */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Token Pool Overview</h2>
        <TokenPoolAnalytics analytics={analytics} />
      </section>

      {/* Usage Trends */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Usage Trends</h2>
        <UsageTrendChart monthlyUsage={analytics.monthly_usage_trend} />
      </section>

      {/* Service Breakdown */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Service Redemption Analysis</h2>
        <RedemptionBreakdown redemptionData={analytics.redemption_breakdown} />
      </section>

      {/* Member Activity */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Member Activity</h2>
        <MemberActivityTable memberActivity={analytics.member_activity} />
      </section>
    </div>
  );
}