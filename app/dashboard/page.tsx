"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, XAxis, YAxis, Bar, Line, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Tractor, Wheat, PiggyBank, Package, Cloud, Calendar, TrendingUp, AlertCircle, Trash2 } from "lucide-react";
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { useData } from '@/app/context/DataContext';
import { CreateAlertDialog } from '@/components/alerts/create-alert-dialog';
import { AlertService } from '@/lib/alert-service';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface DashboardData {
  revenue: {
    month: string;
    amount: number;
  }[];
  alerts: {
    id: string;
    type: 'weather' | 'crop' | 'livestock' | 'inventory';
    message: string;
    date: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  weather: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
}

const initialData: DashboardData = {
  revenue: [
    { month: "Jan", amount: 12000 },
    { month: "Feb", amount: 15000 },
    { month: "Mar", amount: 18000 },
    { month: "Apr", amount: 21000 },
    { month: "May", amount: 24000 },
    { month: "Jun", amount: 28000 }
  ],
  alerts: [],
  weather: {
    temperature: 22,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12
  }
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { crops, inventory, livestock } = useData();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialData);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);
  const alertService = new AlertService();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchAlerts = async () => {
    try {
      const alerts = await alertService.getActiveAlerts();
      const dashboardAlerts = alerts.map(alert => ({
        id: alert.id,
        type: alert.type as 'weather' | 'crop' | 'livestock' | 'inventory',
        message: alert.message,
        date: typeof alert.startTime === 'string' ? alert.startTime : new Date(alert.startTime).toISOString(),
        priority: alert.severity as 'low' | 'medium' | 'high',
      }));
      setDashboardData(prev => ({
        ...prev,
        alerts: dashboardAlerts,
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts');
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (alertData: {
    type: string;
    severity: string;
    message: string;
    startTime: Date;
    endTime: Date;
  }) => {
    try {
      const newAlert = await alertService.createAlert(alertData);
      await fetchAlerts(); // Re-fetch all alerts after creation
      toast.success('Alert created successfully');
    } catch (error) {
      console.error('Error creating alert:', error);
      toast.error('Failed to create alert');
    }
  };

  const handleDeleteAlert = async () => {
    if (!alertToDelete) return;
    try {
      await alertService.deleteAlert(alertToDelete);
      setDeleteDialogOpen(false);
      setAlertToDelete(null);
      await fetchAlerts();
      toast.success('Alert deleted successfully');
    } catch (error) {
      toast.error('Failed to delete alert');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GROWING': return 'text-green-500';
      case 'PLANTED': return 'text-blue-500';
      case 'HARVESTED': return 'text-amber-500';
      case 'PLANNED': return 'text-gray-500';
      case 'FAILED': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
          Welcome, {session.user?.name || 'User'}
        </h1>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar className="h-5 w-5" />
          <span>{format(new Date(), 'MMMM d, yyyy')}</span>
        </div>
      </div>
      
      {/* Alerts Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Recent Alerts
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {dashboardData.alerts.map((alert) => (
            <Card key={alert.id} className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-md relative">
              <button
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                onClick={() => { setAlertToDelete(alert.id); setDeleteDialogOpen(true); }}
                aria-label="Delete alert"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className={getPriorityColor(alert.priority)}>
                    {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(alert.date), 'MMM d')}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 dark:text-gray-100">{alert.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Alert</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this alert? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAlertToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAlert}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4">
              <Wheat className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Crops Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {crops.map((crop) => (
                <div key={crop.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-gray-100">{crop.name}</span>
                    <Badge className={getStatusColor(crop.status)}>
                      {crop.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Area: {crop.area} hectares</span>
                      <span>Harvest: {new Date(crop.expectedHarvest).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
              <PiggyBank className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Livestock Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {livestock.map((animal) => (
                <div key={animal.type} className="flex justify-between items-center">
                  <span className="text-gray-900 dark:text-gray-100">{animal.type}</span>
                  <Badge className={getStatusColor(animal.status)}>
                    {animal.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mb-4">
              <Cloud className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Weather Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-gray-100">Temperature</span>
                <span className="text-gray-600 dark:text-gray-400">{dashboardData.weather.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-gray-100">Condition</span>
                <span className="text-gray-600 dark:text-gray-400">{dashboardData.weather.condition}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-900 dark:text-gray-100">Humidity</span>
                <span className="text-gray-600 dark:text-gray-400">{dashboardData.weather.humidity}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all border-0 shadow-md">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
              <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-xl text-gray-900 dark:text-gray-100">Inventory Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inventory.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 dark:text-gray-100">{item.category}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.current} / {item.max}
                    </span>
                  </div>
                  <Progress 
                    value={(item.current / item.max) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 md:grid-cols-2 mb-8">
        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Wheat className="h-5 w-5 text-green-600 dark:text-green-400" />
              Crop Yield Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crops}>
                <XAxis 
                  dataKey="name" 
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}kg`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--background)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: 'var(--foreground)'
                  }}
                  cursor={{ fill: 'currentColor', opacity: 0.1 }}
                />
                <CartesianGrid 
                  strokeDasharray="3 3"
                  stroke="currentColor" 
                  className="text-gray-200 dark:text-gray-700" 
                  opacity={0.2}
                />
                <Bar 
                  dataKey="yield" 
                  fill="hsl(143, 70%, 50%)"
                  className="dark:fill-green-500 opacity-90 hover:opacity-100 transition-opacity"
                  radius={[4, 4, 0, 0]}
                  onClick={(data) => setSelectedCrop(data.name)}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.revenue}>
                <XAxis 
                  dataKey="month" 
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--background)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    color: 'var(--foreground)'
                  }}
                  cursor={{ stroke: 'currentColor', strokeWidth: 1, opacity: 0.5 }}
                />
                <CartesianGrid 
                  strokeDasharray="3 3"
                  stroke="currentColor" 
                  className="text-gray-200 dark:text-gray-700" 
                  opacity={0.2}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(217, 91%, 60%)"
                  className="dark:stroke-blue-500"
                  strokeWidth={3}
                  dot={{ 
                    fill: "var(--background)",
                    stroke: "hsl(217, 91%, 60%)",
                    className: "dark:stroke-blue-500",
                    strokeWidth: 2,
                    r: 4
                  }}
                  activeDot={{
                    fill: "hsl(217, 91%, 60%)",
                    className: "dark:fill-blue-500",
                    stroke: "var(--background)",
                    strokeWidth: 2,
                    r: 6
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button variant="outline" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Schedule Task
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setIsCreateAlertOpen(true)}
        >
          <AlertCircle className="h-4 w-4" />
          Add Alert
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/livestock')}
        >
          <PiggyBank className="h-4 w-4" />
          Update Livestock
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => router.push('/inventory')}
        >
          <Package className="h-4 w-4" />
          Update Inventory
        </Button>
      </div>

      <CreateAlertDialog
        open={isCreateAlertOpen}
        onOpenChange={setIsCreateAlertOpen}
        onSubmit={handleCreateAlert}
      />
    </div>
  );
}