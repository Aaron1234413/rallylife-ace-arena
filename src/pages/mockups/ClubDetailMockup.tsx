import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Calendar as CalendarIcon,
  Users,
  Zap,
  MapPin,
  Star,
  Settings,
  TrendingUp,
  Activity,
  CreditCard,
  Crown,
  User,
  Target,
  BarChart3,
  Coins
} from "lucide-react";

export function ClubDetailMockup() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  // Mock data for time slots
  const timeSlots = [
    { time: "08:00", available: true, court: "Court 1" },
    { time: "09:00", available: false, court: "Court 2" },
    { time: "10:00", available: true, court: "Court 1" },
    { time: "11:00", available: true, court: "Court 3" },
    { time: "12:00", available: false, court: "Court 2" },
    { time: "13:00", available: true, court: "Court 1" },
    { time: "14:00", available: true, court: "Court 2" },
    { time: "15:00", available: false, court: "Court 3" },
    { time: "16:00", available: true, court: "Court 1" },
    { time: "17:00", available: true, court: "Court 2" },
    { time: "18:00", available: true, court: "Court 3" },
    { time: "19:00", available: false, court: "Court 1" },
  ];

  // Mock services data
  const services = [
    {
      id: "court-1",
      name: "Court 1 - Hard Surface",
      type: "court",
      duration: 60,
      price: { tokens: 100, money: 25 },
      description: "Professional hard court with lights"
    },
    {
      id: "court-2", 
      name: "Court 2 - Clay Surface",
      type: "court",
      duration: 60,
      price: { tokens: 120, money: 30 },
      description: "European clay court surface"
    },
    {
      id: "coach-john",
      name: "Private Lesson with Coach John",
      type: "coaching",
      duration: 60,
      price: { tokens: 200, money: 80 },
      description: "1-on-1 coaching session for technique improvement"
    },
    {
      id: "group-lesson",
      name: "Group Lesson (4 players)",
      type: "coaching", 
      duration: 90,
      price: { tokens: 80, money: 25 },
      description: "Small group coaching session"
    }
  ];

  const members = [
    { name: "Sarah Chen", avatar: "/placeholder-avatar.jpg", role: "Owner", online: true },
    { name: "Mike Johnson", avatar: "/placeholder-avatar.jpg", role: "Coach", online: true },
    { name: "Lisa Wang", avatar: "/placeholder-avatar.jpg", role: "Member", online: false },
    { name: "David Smith", avatar: "/placeholder-avatar.jpg", role: "Member", online: true },
    { name: "Emma Brown", avatar: "/placeholder-avatar.jpg", role: "Coach", online: false },
    { name: "Alex Rodriguez", avatar: "/placeholder-avatar.jpg", role: "Member", online: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Clubs
            </Button>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="/placeholder-club.jpg" />
                <AvatarFallback>CTC</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Central Tennis Club</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  Downtown District
                  <Badge variant="secondary">Owner</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="book-play" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="book-play">Book & Play</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Book & Play Tab - NEW UNIFIED INTERFACE */}
          <TabsContent value="book-play" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Time Selection */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5" />
                      Select Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Calendar */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Choose Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border pointer-events-auto"
                        />
                      </div>

                      {/* Time Slots */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">Available Times</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                          {timeSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              variant={selectedTime === slot.time ? "default" : slot.available ? "outline" : "secondary"}
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className="flex flex-col h-auto p-3 text-left"
                            >
                              <span className="font-medium">{slot.time}</span>
                              <span className="text-xs opacity-70">{slot.court}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Services Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Choose Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedService === service.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium">{service.name}</h3>
                            <Badge variant={service.type === 'court' ? 'secondary' : 'outline'}>
                              {service.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {service.duration}min
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Coins className="w-4 h-4 text-primary" />
                                {service.price.tokens}
                              </span>
                              <span className="text-muted-foreground">or</span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-green-500" />
                                {service.price.money}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Date</span>
                        <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Time</span>
                        <span className="font-medium">{selectedTime}</span>
                      </div>
                    )}
                    {selectedService && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Service</span>
                          <span className="font-medium text-right">{services.find(s => s.id === selectedService)?.name}</span>
                        </div>
                        <Separator />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Token Payment</span>
                            <span className="font-medium flex items-center gap-1">
                              <Coins className="w-4 h-4 text-primary" />
                              {services.find(s => s.id === selectedService)?.price.tokens}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Money Payment</span>
                            <span className="font-medium flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              {services.find(s => s.id === selectedService)?.price.money}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full" 
                          disabled={!selectedDate || !selectedTime || !selectedService}
                        >
                          Book Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirm Booking</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <h4 className="font-medium">Booking Details</h4>
                            <div className="space-y-1 text-sm">
                              <p>Date: {selectedDate?.toLocaleDateString()}</p>
                              <p>Time: {selectedTime}</p>
                              <p>Service: {services.find(s => s.id === selectedService)?.name}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium">Payment Method</h4>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Choose payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tokens">
                                  Pay with Tokens ({services.find(s => s.id === selectedService)?.price.tokens})
                                </SelectItem>
                                <SelectItem value="money">
                                  Pay with Money (${services.find(s => s.id === selectedService)?.price.money})
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Button className="w-full">Confirm Booking</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Your Tokens</span>
                      <span className="font-bold flex items-center gap-1">
                        <Coins className="w-4 h-4 text-primary" />
                        1,250
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This Month</span>
                      <span className="font-medium">8 bookings</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next Booking</span>
                      <span className="font-medium text-right">Tomorrow<br/>2:00 PM</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Club Members</h2>
                <p className="text-muted-foreground">147 active members</p>
              </div>
              <Button className="gap-2">
                <Users className="w-4 h-4" />
                Invite Members
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        {member.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{member.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'Owner' ? 'default' : member.role === 'Coach' ? 'secondary' : 'outline'}>
                            {member.role}
                          </Badge>
                          {member.online && <span className="text-xs text-green-500">Online</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Business Tab - NEW ANALYTICS */}
          <TabsContent value="business" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Business Analytics</h2>
                <p className="text-muted-foreground">Club performance insights</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <Crown className="w-4 h-4" />
                Pro Plan
              </Badge>
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold">$4,250</p>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +12% vs last month
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Bookings</p>
                      <p className="text-2xl font-bold">342</p>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +8% vs last month
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Utilization Rate</p>
                      <p className="text-2xl font-bold">78%</p>
                      <p className="text-xs text-green-500 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +5% vs last month
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics - Tiered by Subscription */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Court Bookings</span>
                      <span className="font-medium">$2,850</span>
                    </div>
                    <Progress value={67} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Coaching Services</span>
                      <span className="font-medium">$1,200</span>
                    </div>
                    <Progress value={28} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Events & Tournaments</span>
                      <span className="font-medium">$200</span>
                    </div>
                    <Progress value={5} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Member Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Members</span>
                    <span className="font-bold">142/147</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Average Bookings/Member</span>
                    <span className="font-medium">2.4/month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Peak Hours</span>
                    <span className="font-medium">6PM - 8PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Most Popular Court</span>
                    <span className="font-medium">Court 2 (Clay)</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">85% utilization</p>
                        <p className="text-sm text-muted-foreground">142 bookings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Club Settings</h2>
              <p className="text-muted-foreground">Manage your club configuration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clubName">Club Name</Label>
                    <Input id="clubName" defaultValue="Central Tennis Club" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue="Downtown District" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input id="description" defaultValue="Premium tennis facility with professional coaching" />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Current Plan</span>
                    <Badge>Pro Plan</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Monthly Cost</span>
                    <span className="font-medium">$99/month</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next Billing</span>
                    <span>Jan 15, 2024</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}