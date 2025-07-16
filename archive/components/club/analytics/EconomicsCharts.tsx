import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity 
} from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 2400, tokens: 1800, services: 600 },
  { month: 'Feb', revenue: 2100, tokens: 1500, services: 600 },
  { month: 'Mar', revenue: 2800, tokens: 2000, services: 800 },
  { month: 'Apr', revenue: 3200, tokens: 2400, services: 800 },
  { month: 'May', revenue: 2900, tokens: 2100, services: 800 },
  { month: 'Jun', revenue: 3400, tokens: 2600, services: 800 }
];

const usageData = [
  { month: 'Jan', tokens: 45000, available: 50000 },
  { month: 'Feb', tokens: 42000, available: 50000 },
  { month: 'Mar', tokens: 48000, available: 50000 },
  { month: 'Apr', tokens: 51000, available: 55000 },
  { month: 'May', tokens: 47000, available: 55000 },
  { month: 'Jun', tokens: 52000, available: 55000 }
];

const serviceBreakdown = [
  { name: 'Court Bookings', value: 45, color: '#10b981' },
  { name: 'Coaching', value: 30, color: '#3b82f6' },
  { name: 'Events', value: 15, color: '#8b5cf6' },
  { name: 'Equipment', value: 10, color: '#f59e0b' }
];

export function EconomicsCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Trend */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Revenue Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [`$${value}`, name === 'tokens' ? 'Token Sales' : 'Service Revenue']}
              />
              <Legend />
              <Bar dataKey="tokens" stackId="a" fill="#10b981" name="Token Sales" />
              <Bar dataKey="services" stackId="a" fill="#3b82f6" name="Services" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Token Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <Activity className="h-5 w-5 text-blue-500" />
            Token Pool Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value?.toLocaleString()} tokens`, '']} />
              <Line 
                type="monotone" 
                dataKey="tokens" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Used Tokens"
              />
              <Line 
                type="monotone" 
                dataKey="available" 
                stroke="#6b7280" 
                strokeDasharray="5 5"
                name="Available Tokens"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tennis-green-dark">
            <DollarSign className="h-5 w-5 text-purple-500" />
            Revenue by Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={serviceBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {serviceBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Revenue Share']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}