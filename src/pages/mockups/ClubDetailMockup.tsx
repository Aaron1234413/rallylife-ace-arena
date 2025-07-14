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
  Coins,
  Plus,
  Edit,
  Check,
  ArrowRight,
  ChevronRight,
  CheckCircle,
  X
} from "lucide-react";

export function ClubDetailMockup() {
  // Time-first booking flow states
  const [bookingStep, setBookingStep] = useState<'time' | 'services' | 'payment' | 'confirmation'>('time');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<'tokens' | 'money'>('tokens');
  
  // Business management states
  const [isAddingService, setIsAddingService] = useState(false);
  const [isEditingCourt, setIsEditingCourt] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    type: 'court',
    duration: 60,
    price: { tokens: 100, money: 25 },
    description: ''
  });

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

          {/* Book & Play Tab - TIME-FIRST FLOW */}
          <TabsContent value="book-play" className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center gap-2 ${bookingStep === 'time' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep === 'time' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  1
                </div>
                <span className="text-sm font-medium">When?</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 ${bookingStep === 'services' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep === 'services' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  2
                </div>
                <span className="text-sm font-medium">What?</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <div className={`flex items-center gap-2 ${bookingStep === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bookingStep === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  3
                </div>
                <span className="text-sm font-medium">Pay</span>
              </div>
            </div>

            {/* Step 1: Time Selection */}
            {bookingStep === 'time' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">When do you want to play?</CardTitle>
                  <p className="text-muted-foreground">Choose your preferred date and time</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Date Selection */}
                    <div className="flex flex-col items-center">
                      <Label className="text-lg font-medium mb-4">Pick a Date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border pointer-events-auto"
                      />
                    </div>

                    {/* Time Selection */}
                    <div>
                      <Label className="text-lg font-medium mb-4 block text-center">Available Times</Label>
                      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : slot.available ? "outline" : "secondary"}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                            className="flex flex-col h-auto p-4 text-left"
                          >
                            <span className="font-bold text-lg">{slot.time}</span>
                            <span className="text-sm opacity-70">{slot.court}</span>
                            {!slot.available && <span className="text-xs text-red-500">Booked</span>}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-6">
                    <Button 
                      size="lg" 
                      className="px-8"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setBookingStep('services')}
                    >
                      Next: Choose What to Play
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Service Selection */}
            {bookingStep === 'services' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">What's available at {selectedTime}?</CardTitle>
                  <p className="text-muted-foreground">
                    {selectedDate?.toLocaleDateString()} at {selectedTime}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={`p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg ${
                          selectedService === service.id 
                            ? 'border-primary bg-primary/10 shadow-md' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-semibold">{service.name}</h3>
                          <Badge 
                            variant={service.type === 'court' ? 'secondary' : 'outline'}
                            className="text-sm"
                          >
                            {service.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-lg">
                            <Clock className="w-5 h-5" />
                            {service.duration} min
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 font-semibold">
                              <Coins className="w-5 h-5 text-primary" />
                              {service.price.tokens}
                            </span>
                            <span className="text-muted-foreground">or</span>
                            <span className="flex items-center gap-1 font-semibold">
                              <DollarSign className="w-5 h-5 text-green-500" />
                              ${service.price.money}
                            </span>
                          </div>
                        </div>
                        {selectedService === service.id && (
                          <div className="mt-4 p-3 bg-primary/20 rounded-lg flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <span className="font-medium text-primary">Selected!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setBookingStep('time')}
                      className="px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      size="lg" 
                      className="px-8"
                      disabled={!selectedService}
                      onClick={() => setBookingStep('payment')}
                    >
                      Next: Payment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Payment */}
            {bookingStep === 'payment' && (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">Almost there!</CardTitle>
                  <p className="text-muted-foreground">Choose your payment method</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Booking Summary */}
                  <div className="bg-muted/50 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Date & Time:</span>
                        <span className="font-medium">{selectedDate?.toLocaleDateString()} at {selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span className="font-medium">{services.find(s => s.id === selectedService)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="font-medium">{services.find(s => s.id === selectedService)?.duration} minutes</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setPaymentMethod('tokens')}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'tokens' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Coins className="w-8 h-8 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold">Pay with Tokens</h3>
                          <p className="text-sm text-muted-foreground">Use your club tokens</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {services.find(s => s.id === selectedService)?.price.tokens} tokens
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">You have 1,250 tokens</p>
                    </div>

                    <div
                      onClick={() => setPaymentMethod('money')}
                      className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === 'money' 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <CreditCard className="w-8 h-8 text-green-500" />
                        <div>
                          <h3 className="text-lg font-semibold">Pay with Money</h3>
                          <p className="text-sm text-muted-foreground">Credit/Debit card</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-500">
                        ${services.find(s => s.id === selectedService)?.price.money}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">Secure payment via Stripe</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setBookingStep('services')}
                      className="px-6"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      size="lg" 
                      className="px-8"
                      onClick={() => setBookingStep('confirmation')}
                    >
                      Confirm Booking
                      <Check className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Confirmation */}
            {bookingStep === 'confirmation' && (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
                  <p className="text-muted-foreground mb-8">
                    Your booking for {selectedDate?.toLocaleDateString()} at {selectedTime} has been confirmed.
                  </p>
                  
                  <div className="bg-muted/50 p-6 rounded-xl max-w-md mx-auto mb-8">
                    <h3 className="font-semibold mb-3">Booking Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Service:</strong> {services.find(s => s.id === selectedService)?.name}</p>
                      <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {selectedTime}</p>
                      <p><strong>Payment:</strong> {paymentMethod === 'tokens' ? `${services.find(s => s.id === selectedService)?.price.tokens} tokens` : `$${services.find(s => s.id === selectedService)?.price.money}`}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button 
                      onClick={() => {
                        setBookingStep('time');
                        setSelectedTime('');
                        setSelectedService('');
                      }}
                      className="px-8"
                    >
                      Book Another Session
                    </Button>
                    <Button variant="outline" className="px-8">
                      View My Bookings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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

            {/* Service Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Service Management</CardTitle>
                  <Dialog open={isAddingService} onOpenChange={setIsAddingService}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Add Service
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Service</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="serviceName">Service Name</Label>
                          <Input 
                            id="serviceName" 
                            value={newService.name}
                            onChange={(e) => setNewService({...newService, name: e.target.value})}
                            placeholder="e.g., Private Coaching Session"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="serviceType">Service Type</Label>
                          <Select 
                            value={newService.type} 
                            onValueChange={(value) => setNewService({...newService, type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="court">Court Booking</SelectItem>
                              <SelectItem value="coaching">Coaching Service</SelectItem>
                              <SelectItem value="event">Event/Tournament</SelectItem>
                              <SelectItem value="equipment">Equipment Rental</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="duration">Duration (min)</Label>
                            <Input 
                              id="duration" 
                              type="number"
                              value={newService.duration}
                              onChange={(e) => setNewService({...newService, duration: parseInt(e.target.value)})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="tokens">Token Price</Label>
                            <Input 
                              id="tokens" 
                              type="number"
                              value={newService.price.tokens}
                              onChange={(e) => setNewService({
                                ...newService, 
                                price: {...newService.price, tokens: parseInt(e.target.value)}
                              })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="money">Money Price ($)</Label>
                          <Input 
                            id="money" 
                            type="number"
                            value={newService.price.money}
                            onChange={(e) => setNewService({
                              ...newService, 
                              price: {...newService.price, money: parseInt(e.target.value)}
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input 
                            id="description" 
                            value={newService.description}
                            onChange={(e) => setNewService({...newService, description: e.target.value})}
                            placeholder="Brief description of the service"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1"
                            onClick={() => {
                              // In real app, would save to database
                              setIsAddingService(false);
                              setNewService({
                                name: '',
                                type: 'court',
                                duration: 60,
                                price: { tokens: 100, money: 25 },
                                description: ''
                              });
                            }}
                          >
                            Add Service
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsAddingService(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{service.name}</h4>
                          <Badge variant={service.type === 'court' ? 'secondary' : 'outline'}>
                            {service.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {service.duration}min
                          </span>
                          <span className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-primary" />
                            {service.price.tokens}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            ${service.price.money}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right mr-4">
                          <p className="font-medium">85% utilization</p>
                          <p className="text-sm text-muted-foreground">142 bookings</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Court Availability Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Court Availability</CardTitle>
                  <Button variant="outline" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Manage Hours
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2 text-center">
                    <div className="font-medium">Time</div>
                    <div className="font-medium">Mon</div>
                    <div className="font-medium">Tue</div>
                    <div className="font-medium">Wed</div>
                    <div className="font-medium">Thu</div>
                    <div className="font-medium">Fri</div>
                    <div className="font-medium">Sat</div>
                  </div>
                  
                  {['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'].map((time) => (
                    <div key={time} className="grid grid-cols-7 gap-2 text-center">
                      <div className="font-medium">{time}</div>
                      {[1,2,3,4,5,6].map((day) => (
                        <div 
                          key={day}
                          className="h-8 bg-green-100 border border-green-300 rounded cursor-pointer hover:bg-green-200 flex items-center justify-center text-xs"
                        >
                          Available
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Quick Actions</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Block Time Slot</Button>
                    <Button variant="outline" size="sm">Set Maintenance Window</Button>
                    <Button variant="outline" size="sm">Bulk Edit Hours</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Management */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Dynamic Pricing Rules</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Peak Hours (6PM - 8PM)</p>
                        <p className="text-sm text-muted-foreground">+25% price increase</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Active</Badge>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Weekend Premium</p>
                        <p className="text-sm text-muted-foreground">+15% on Sat/Sun</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Active</Badge>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Early Bird Discount</p>
                        <p className="text-sm text-muted-foreground">-10% before 10AM</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Inactive</Badge>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Pricing Rule
                  </Button>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-3">Token Exchange Rate</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>1 Token = $</Label>
                      <Input type="number" defaultValue="0.25" step="0.01" />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Token Purchase</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                  </div>
                  <Button className="mt-4">Update Exchange Rate</Button>
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