
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  Clock,
  Target,
  Award
} from 'lucide-react';

// Mock data for demonstration
const mockClients = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    avatar: null,
    level: 15,
    hp: 85,
    maxHp: 100,
    lastActivity: '2 hours ago',
    status: 'active',
    progress: 78,
    achievements: 12,
    sessionsThisWeek: 3
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    avatar: null,
    level: 8,
    hp: 92,
    maxHp: 100,
    lastActivity: '1 day ago',
    status: 'active',
    progress: 45,
    achievements: 6,
    sessionsThisWeek: 2
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    avatar: null,
    level: 22,
    hp: 100,
    maxHp: 100,
    lastActivity: '3 hours ago',
    status: 'premium',
    progress: 92,
    achievements: 25,
    sessionsThisWeek: 4
  }
];

export function ClientManagementPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'active': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Client Management
            </CardTitle>
            <CardDescription>
              Monitor and manage your tennis students
            </CardDescription>
          </div>
          <Button size="sm" className="bg-tennis-green-light hover:bg-tennis-green-dark">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Client Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Clients ({mockClients.length})</TabsTrigger>
            <TabsTrigger value="active">Active (2)</TabsTrigger>
            <TabsTrigger value="premium">Premium (1)</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={client.avatar || ''} />
                      <AvatarFallback className="bg-tennis-green-light text-white">
                        {client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{client.name}</h4>
                          <Badge className={getStatusColor(client.status)}>
                            {client.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-blue-500" />
                          <span>Level {client.level}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span>{client.progress}% progress</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-yellow-500" />
                          <span>{client.achievements} achievements</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-purple-500" />
                          <span>{client.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="active">
            <p className="text-center text-muted-foreground py-8">
              Active clients will be displayed here
            </p>
          </TabsContent>

          <TabsContent value="premium">
            <p className="text-center text-muted-foreground py-8">
              Premium clients will be displayed here
            </p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
