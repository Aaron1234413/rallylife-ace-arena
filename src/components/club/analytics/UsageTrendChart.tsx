import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { MonthlyUsage } from '@/types/clubAnalytics';

interface UsageTrendChartProps {
  monthlyUsage: MonthlyUsage[];
}

export function UsageTrendChart({ monthlyUsage }: UsageTrendChartProps) {
  const formatMonth = (month: string) => {
    const date = new Date(month + '-01');
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const chartData = monthlyUsage.map(data => ({
    ...data,
    monthFormatted: formatMonth(data.month),
    efficiency: data.efficiency_percentage
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Token Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Token Usage Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthFormatted" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  typeof value === 'number' ? value.toLocaleString() : value,
                  name
                ]}
              />
              <Legend />
              <Bar dataKey="allocated" stackId="a" fill="hsl(var(--primary))" name="Allocated" />
              <Bar dataKey="rollover" stackId="a" fill="hsl(var(--secondary))" name="Rollover" />
              <Bar dataKey="purchased" stackId="a" fill="hsl(var(--accent))" name="Purchased" />
              <Bar dataKey="used" fill="hsl(var(--destructive))" name="Used" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Efficiency Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthFormatted" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Efficiency']}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-500">Average</div>
              <div className="font-bold">
                {Math.round(chartData.reduce((acc, curr) => acc + curr.efficiency, 0) / chartData.length)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Best Month</div>
              <div className="font-bold text-green-600">
                {Math.max(...chartData.map(d => d.efficiency))}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Current</div>
              <div className="font-bold">
                {chartData[chartData.length - 1]?.efficiency || 0}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}