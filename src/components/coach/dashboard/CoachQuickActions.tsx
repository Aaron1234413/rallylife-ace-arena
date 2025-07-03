
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MessageSquare, 
  UserPlus, 
  BarChart3, 
  Award, 
  Settings,
  FileText,
  Video
} from 'lucide-react';

export function CoachQuickActions() {
  const navigate = useNavigate();
  const quickActions = [
    {
      title: 'Schedule Session',
      description: 'Book a new coaching session',
      icon: Calendar,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => console.log('Schedule session')
    },
    {
      title: 'Message Client',
      description: 'Send a message to a client',
      icon: MessageSquare,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => navigate('/messages')
    },
    {
      title: 'Add New Client',
      description: 'Onboard a new student',
      icon: UserPlus,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => console.log('Add client')
    },
    {
      title: 'View Analytics',
      description: 'Check detailed statistics',
      icon: BarChart3,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => console.log('View analytics')
    },
    {
      title: 'Create Lesson Plan',
      description: 'Design training content',
      icon: FileText,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      action: () => console.log('Create lesson')
    },
    {
      title: 'Start Video Call',
      description: 'Begin virtual coaching',
      icon: Video,
      color: 'bg-red-500 hover:bg-red-600',
      action: () => console.log('Start call')
    },
    {
      title: 'Award Achievement',
      description: 'Recognize client progress',
      icon: Award,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => console.log('Award achievement')
    },
    {
      title: 'Settings',
      description: 'Manage your profile',
      icon: Settings,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => console.log('Open settings')
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and shortcuts for efficient coaching
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-20 flex-col gap-2 p-2 hover:scale-105 transition-transform ${action.color} text-white border-none`}
                onClick={action.action}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium text-center leading-tight">
                  {action.title}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
