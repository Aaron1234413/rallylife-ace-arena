import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { RedemptionByService } from '@/types/clubAnalytics';

interface RedemptionBreakdownProps {
  redemptionData: RedemptionByService[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  '#8884d8',
  '#82ca9d'
];

export function RedemptionBreakdown({ redemptionData }: RedemptionBreakdownProps) {
  const chartData = redemptionData.map((item, index) => ({
    name: item.service_name,
    value: item.tokens_redeemed,
    percentage: item.percentage_of_total,
    fill: COLORS[index % COLORS.length]
  }));

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'court_booking': return '🎾';
      case 'coaching': return '👨‍🏫';
      case 'events': return '🏆';
      case 'food_beverage': return '🍽️';
      case 'merchandise': return '🛍️';
      default: return '📋';
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Service Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Token Usage by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [typeof value === 'number' ? value.toLocaleString() : value, 'Tokens']}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {redemptionData.map((service, index) => (
              <div key={service.service_type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getServiceIcon(service.service_type)}</span>
                    <span className="font-medium">{service.service_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{service.tokens_redeemed.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{service.percentage_of_total.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress 
                  value={service.percentage_of_total} 
                  className="h-2"
                />
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <span>Transactions: </span>
                    <span className="font-medium">{service.transaction_count}</span>
                  </div>
                  <div>
                    <span>Avg per transaction: </span>
                    <span className="font-medium">{service.average_per_transaction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}