
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Award,
  DollarSign,
  Target
} from 'lucide-react';

interface CoachAnalyticsProps {
  cxpData: any;
  tokenData: any;
  crpData: any;
}

// Generate dynamic monthly progress data based on current data
const generateMonthlyProgress = (cxpData: any, tokenData: any) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const currentCXP = cxpData?.total_cxp_earned || 450;
  const currentCTK = tokenData?.lifetime_earned || 1200;
  
  return months.map((month, index) => ({
    month,
    cxp: Math.round(currentCXP * (index + 1) / 6),
    ctk: Math.round(currentCTK * (index + 1) / 6),
    clients: Math.min(8 + index * 0.7, 15)
  }));
};

const clientProgress = [
  { name: 'Beginner', value: 30, color: '#8884d8' },
  { name: 'Intermediate', value: 45, color: '#82ca9d' },
  { name: 'Advanced', value: 25, color: '#ffc658' }
];

const weeklyActivity = [
  { day: 'Mon', sessions: 4 },
  { day: 'Tue', sessions: 3 },
  { day: 'Wed', sessions: 5 },
  { day: 'Thu', sessions: 2 },
  { day: 'Fri', sessions: 6 },
  { day: 'Sat', sessions: 8 },
  { day: 'Sun', sessions: 4 }
];

export function CoachAnalytics({ cxpData, tokenData, crpData }: CoachAnalyticsProps) {
  const monthlyProgress = generateMonthlyProgress(cxpData, tokenData);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Analytics & Insights</h2>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Monthly Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="cxp" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Client Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Client Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={clientProgress}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {clientProgress.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">This Week's Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  CXP Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Level</span>
                    <Badge variant="outline">{cxpData?.current_level || 1}</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {cxpData?.cxp_to_next_level || 0} CXP to next level
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total CXP</p>
                    <p className="font-semibold">{cxpData?.total_cxp_earned || 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coaching Tier</p>
                    <p className="font-semibold capitalize">{cxpData?.coaching_tier || 'Novice'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  This Month's Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Client Sessions</span>
                    <span>28/30</span>
                  </div>
                  <Progress value={93} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CXP Target</span>
                    <span>450/500</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CTK Earned</span>
                    <span>1200/1000</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cxpData?.current_level || 1}</div>
                <p className="text-xs text-muted-foreground">{cxpData?.coaching_tier || 'Novice'} tier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Coach Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tokenData?.current_tokens?.toLocaleString() || '0'}</div>
                <p className="text-xs text-muted-foreground">{tokenData?.lifetime_earned?.toLocaleString() || '0'} earned total</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Reputation (CRP)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{crpData?.current_crp?.toFixed(1) || '100.0'}</div>
                <p className="text-xs text-muted-foreground">{crpData?.reputation_level || 'Bronze'} level</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{((cxpData?.commission_rate || 0.15) * 100).toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Current earning rate</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  CTK Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="ctk" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Session Fees</span>
                    <span className="font-semibold">$2,840</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platform Bonuses</span>
                    <span className="font-semibold">$456</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Achievement Rewards</span>
                    <span className="font-semibold">$120</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-semibold">
                    <span>Total This Month</span>
                    <span>$3,416</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
