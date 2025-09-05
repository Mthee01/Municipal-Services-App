import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, Wrench, TrendingUp, MapPin, Clock, Star, Target, Bell, Menu, X, BarChart3, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { RealTimeNotifications } from "@/components/real-time-notifications";
import { GISMapIntegration } from "@/components/gis-map-integration";
import { AIAnalyticsDashboard } from "@/components/ai-analytics-dashboard";

export default function MayorDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar configuration
  const sidebarItems = [
    { id: "overview", label: "Executive Overview", icon: Building2 },
    { id: "performance", label: "Performance Analytics", icon: BarChart3 },
    { id: "wards", label: "Ward Management", icon: MapPin },
    { id: "technicians", label: "Resource Management", icon: Wrench },
    { id: "ai-insights", label: "AI Insights", icon: TrendingUp },
    { id: "settings", label: "Municipality Settings", icon: Settings },
  ];

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  const { data: municipalityStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/municipality"],
  });

  const { data: technicianPerformance = {}, isLoading: techLoading } = useQuery({
    queryKey: ["/api/analytics/technicians"],
  });

  const { data: wards = [], isLoading: wardsLoading } = useQuery({
    queryKey: ["/api/wards"],
  });

  const { data: allIssues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ["/api/issues"],
  });

  if (statsLoading || techLoading || wardsLoading || issuesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Mock data for demonstration - in real app this would come from API
  const mockStats = {
    totalPopulation: 125000,
    totalWards: 12,
    resolutionRate: 78.5,
    avgPerformanceRating: 4.2,
    totalTechnicians: 35,
    avgResolutionTime: 2.3,
    ...(typeof municipalityStats === 'object' && municipalityStats !== null ? municipalityStats : {})
  };

  const wardData = (Array.isArray(wards) ? wards : []).map((ward: any, index: number) => ({
    name: `Ward ${ward.wardNumber || index + 1}`,
    issues: Math.floor(Math.random() * 50) + 10,
    population: Math.floor(Math.random() * 15000) + 5000,
    councillor: ward.councillorName || `Councillor ${index + 1}`,
  }));

  const departmentData = [
    { name: 'Water & Sanitation', technicians: 12, available: 8, performance: 85, completed: 145 },
    { name: 'Electricity', technicians: 8, available: 6, performance: 92, completed: 98 },
    { name: 'Roads & Transport', technicians: 6, available: 4, performance: 78, completed: 67 },
    { name: 'Waste Management', technicians: 5, available: 3, performance: 81, completed: 89 },
    { name: 'Safety & Security', technicians: 4, available: 2, performance: 88, completed: 34 },
  ];

  const issuesTrendData = [
    { month: 'Jan', reported: 120, resolved: 95 },
    { month: 'Feb', reported: 135, resolved: 110 },
    { month: 'Mar', reported: 142, resolved: 128 },
    { month: 'Apr', reported: 128, resolved: 135 },
    { month: 'May', reported: 156, resolved: 142 },
    { month: 'Jun', reported: 149, resolved: 151 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Mayor Dashboard</h1>
                  <p className="text-sm text-gray-500">Municipality-wide executive overview</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <RealTimeNotifications userRole="mayor" />
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Building2 className="w-4 h-4 mr-1" />
                Mayor
              </Badge>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`${
                        activeSection === item.id
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200 w-full text-left`}
                    >
                      <Icon
                        className={`${
                          activeSection === item.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

              {/* Executive Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Executive Overview</h2>
                    
                    {/* Key Performance Indicators */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Population</CardTitle>
                          <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-900">
                            {mockStats.totalPopulation.toLocaleString()}
                          </div>
                          <p className="text-xs text-blue-600">
                            Across {mockStats.totalWards} wards
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
                          <Target className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-900">
                            {mockStats.resolutionRate}%
                          </div>
                          <Progress value={mockStats.resolutionRate} className="mt-2 h-2" />
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
                          <Star className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-900">
                            {mockStats.avgPerformanceRating}/5
                          </div>
                          <p className="text-xs text-purple-600">
                            {mockStats.totalTechnicians} technicians
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                          <Clock className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-900">
                            {mockStats.avgResolutionTime} days
                          </div>
                          <p className="text-xs text-orange-600">
                            Target: 2.0 days
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Issues Trend Chart */}
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle>Issues Trend</CardTitle>
                        <CardDescription>Monthly reported vs resolved issues</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={issuesTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="reported" stroke="#ef4444" strokeWidth={2} />
                            <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Performance Analytics Section */}
              {activeSection === "performance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Analytics</h2>
                    
                    {/* Department Performance */}
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle>Department Performance</CardTitle>
                        <CardDescription>Technician allocation and performance by department</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={departmentData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="technicians" fill="#3b82f6" />
                            <Bar dataKey="available" fill="#10b981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Ward Management Section */}
              {activeSection === "wards" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ward Management</h2>
                    
                    {/* Ward Performance Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wardData.slice(0, 6).map((ward, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-lg">{ward.name}</CardTitle>
                            <CardDescription>Councillor: {ward.councillor}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Population:</span>
                                <span className="font-medium">{ward.population.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Active Issues:</span>
                                <span className="font-medium">{ward.issues}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Resource Management Section */}
              {activeSection === "technicians" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Resource Management</h2>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Technician Allocation</CardTitle>
                        <CardDescription>Current technician distribution across departments</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {departmentData.map((dept, index) => (
                            <div key={index} className="border-b pb-4 last:border-b-0">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{dept.name}</h4>
                                <Badge variant="outline">
                                  {dept.available}/{dept.technicians} available
                                </Badge>
                              </div>
                              <Progress value={(dept.available / dept.technicians) * 100} className="h-2" />
                              <p className="text-sm text-gray-600 mt-1">
                                Performance: {dept.performance}% | Completed: {dept.completed}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* AI Insights Section */}
              {activeSection === "ai-insights" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Insights</h2>
                    <AIAnalyticsDashboard userRole="mayor" />
                  </div>
                </div>
              )}

              {/* Municipality Settings Section */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Municipality Settings</h2>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>System Configuration</CardTitle>
                        <CardDescription>Municipality-wide settings and preferences</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Emergency Response Settings</h4>
                            <p className="text-sm text-gray-600">Configure alert thresholds and response protocols</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Performance Targets</h4>
                            <p className="text-sm text-gray-600">Set department-specific KPI targets and benchmarks</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Communication Preferences</h4>
                            <p className="text-sm text-gray-600">Manage notification settings and communication channels</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}