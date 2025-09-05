import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, AlertCircle, CheckCircle, Clock, Phone, Mail, TrendingUp, Menu, X, BarChart3, Settings, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { IssueCard } from "@/components/issue-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime, getStatusColor, getPriorityColor } from "@/lib/utils";
import { RealTimeNotifications } from "@/components/real-time-notifications";

export default function WardCouncillorDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWard, setSelectedWard] = useState<string>("Ward 1");
  const { toast } = useToast();

  // Sidebar configuration
  const sidebarItems = [
    { id: "dashboard", label: "Ward Overview", icon: MapPin },
    { id: "issues", label: "Issue Management", icon: AlertCircle },
    { id: "residents", label: "Resident Services", icon: Users },
    { id: "performance", label: "Ward Analytics", icon: BarChart3 },
    { id: "communication", label: "Communication Hub", icon: MessageSquare },
    { id: "settings", label: "Ward Settings", icon: Settings },
  ];

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  const { data: wards = [], isLoading: wardsLoading } = useQuery({
    queryKey: ["/api/wards"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/wards");
      return await response.json();
    },
  });

  const { data: wardStats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/wards", selectedWard, "stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/wards/${selectedWard}/stats`);
      return await response.json();
    },
    enabled: !!selectedWard,
  });

  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ["/api/issues"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/issues");
      return await response.json();
    },
  });

  const { data: technicians = [], isLoading: techLoading } = useQuery({
    queryKey: ["/api/technicians"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/technicians");
      return await response.json();
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & any) =>
      apiRequest("PATCH", `/api/issues/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wards", selectedWard, "stats"] });
      toast({
        title: "Success",
        description: "Issue updated successfully",
      });
    },
  });

  if (wardsLoading || statsLoading || issuesLoading || techLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto p-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Mock data for ward statistics
  const mockWardStats = {
    totalResidents: 8500,
    activeIssues: 23,
    resolvedThisMonth: 45,
    averageResolutionTime: 3.2,
    ...wardStats
  };

  const wardIssues = issues.filter((issue: any) => issue.ward === selectedWard);
  const pendingIssues = wardIssues.filter((issue: any) => issue.status === 'pending');
  const inProgressIssues = wardIssues.filter((issue: any) => issue.status === 'in_progress');
  const resolvedIssues = wardIssues.filter((issue: any) => issue.status === 'resolved');

  const COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6'];

  const issuesByCategory = [
    { name: 'Water & Sanitation', value: 8, color: '#3b82f6' },
    { name: 'Electricity', value: 5, color: '#ef4444' },
    { name: 'Roads', value: 6, color: '#f97316' },
    { name: 'Waste Management', value: 4, color: '#22c55e' },
  ];

  const monthlyTrend = [
    { month: 'Jan', reported: 35, resolved: 28 },
    { month: 'Feb', reported: 42, resolved: 38 },
    { month: 'Mar', reported: 38, resolved: 35 },
    { month: 'Apr', reported: 45, resolved: 41 },
    { month: 'May', reported: 41, resolved: 43 },
    { month: 'Jun', reported: 39, resolved: 45 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Ward Councillor Dashboard</h1>
                  <p className="text-sm text-gray-500">Community representation and services</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedWard} onValueChange={setSelectedWard}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={`Ward ${i + 1}`} value={`Ward ${i + 1}`}>
                      Ward {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <RealTimeNotifications userRole="ward_councillor" />
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <MapPin className="w-4 h-4 mr-1" />
                Councillor
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
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200 w-full text-left`}
                    >
                      <Icon
                        className={`${
                          activeSection === item.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
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

              {/* Ward Overview Section */}
              {activeSection === "dashboard" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ward Overview - {selectedWard}</h2>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
                          <Users className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-900">
                            {mockWardStats.totalResidents.toLocaleString()}
                          </div>
                          <p className="text-xs text-green-600">Registered voters: 6,200</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-red-50 to-red-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-900">
                            {mockWardStats.activeIssues}
                          </div>
                          <p className="text-xs text-red-600">
                            {pendingIssues.length} pending, {inProgressIssues.length} in progress
                          </p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Resolved This Month</CardTitle>
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-900">
                            {mockWardStats.resolvedThisMonth}
                          </div>
                          <p className="text-xs text-blue-600">+12% from last month</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                          <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-900">
                            {mockWardStats.averageResolutionTime} days
                          </div>
                          <p className="text-xs text-purple-600">Target: 3.0 days</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Issues by Category</CardTitle>
                          <CardDescription>Current distribution of active issues</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                              <Pie
                                data={issuesByCategory}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={(entry) => `${entry.name}: ${entry.value}`}
                              >
                                {issuesByCategory.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Trend</CardTitle>
                          <CardDescription>Issues reported vs resolved over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrend}>
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
                </div>
              )}

              {/* Issue Management Section */}
              {activeSection === "issues" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Issue Management - {selectedWard}</h2>
                    
                    <Tabs defaultValue="pending" className="space-y-4">
                      <TabsList>
                        <TabsTrigger value="pending">Pending ({pendingIssues.length})</TabsTrigger>
                        <TabsTrigger value="in_progress">In Progress ({inProgressIssues.length})</TabsTrigger>
                        <TabsTrigger value="resolved">Resolved ({resolvedIssues.length})</TabsTrigger>
                      </TabsList>

                      <TabsContent value="pending" className="space-y-4">
                        {pendingIssues.length > 0 ? (
                          pendingIssues.map((issue: any) => (
                            <IssueCard
                              key={issue.id}
                              issue={issue}
                              onUpdate={(issue) => {
                                // Status update functionality
                              }}
                              showActions={true}
                            />
                          ))
                        ) : (
                          <Card className="p-8 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Issues</h3>
                            <p className="text-gray-600">All issues in your ward have been addressed!</p>
                          </Card>
                        )}
                      </TabsContent>

                      <TabsContent value="in_progress" className="space-y-4">
                        {inProgressIssues.map((issue: any) => (
                          <IssueCard
                            key={issue.id}
                            issue={issue}
                            onUpdate={(issue) => {
                              // Status update functionality
                            }}
                            showActions={true}
                          />
                        ))}
                      </TabsContent>

                      <TabsContent value="resolved" className="space-y-4">
                        {resolvedIssues.slice(0, 10).map((issue: any) => (
                          <IssueCard
                            key={issue.id}
                            issue={issue}
                            onUpdate={(issue) => {
                              // Status update functionality
                            }}
                            showActions={false}
                          />
                        ))}
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}

              {/* Resident Services Section */}
              {activeSection === "residents" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Resident Services - {selectedWard}</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-green-600" />
                            Contact Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p><strong>Office:</strong> (021) 555-0123</p>
                            <p><strong>Mobile:</strong> (082) 555-0123</p>
                            <p><strong>Email:</strong> councillor@municipality.gov.za</p>
                            <p><strong>Office Hours:</strong> Mon-Fri 8:00-16:30</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            Ward Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p><strong>Population:</strong> {mockWardStats.totalResidents.toLocaleString()}</p>
                            <p><strong>Area:</strong> 12.5 km²</p>
                            <p><strong>Households:</strong> 2,850</p>
                            <p><strong>Voting Districts:</strong> 4</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                            Recent Achievements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p>• New park development completed</p>
                            <p>• Street lighting project finished</p>
                            <p>• Community hall renovations</p>
                            <p>• Road maintenance program</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Analytics Section */}
              {activeSection === "performance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ward Analytics - {selectedWard}</h2>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>Key performance indicators for your ward</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="reported" fill="#ef4444" />
                            <Bar dataKey="resolved" fill="#22c55e" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Communication Hub Section */}
              {activeSection === "communication" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Communication Hub</h2>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Community Engagement Tools</CardTitle>
                        <CardDescription>Manage communication with ward residents</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">WhatsApp Groups</h4>
                            <p className="text-sm text-gray-600 mb-3">Manage community WhatsApp groups</p>
                            <Button size="sm">Manage Groups</Button>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">SMS Notifications</h4>
                            <p className="text-sm text-gray-600 mb-3">Send bulk SMS to residents</p>
                            <Button size="sm">Send SMS</Button>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Email Newsletter</h4>
                            <p className="text-sm text-gray-600 mb-3">Ward newsletter and updates</p>
                            <Button size="sm">Create Newsletter</Button>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Community Meetings</h4>
                            <p className="text-sm text-gray-600 mb-3">Schedule and manage meetings</p>
                            <Button size="sm">Schedule Meeting</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Ward Settings Section */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Ward Settings</h2>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Ward Configuration</CardTitle>
                        <CardDescription>Manage ward-specific settings and preferences</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Notification Preferences</h4>
                            <p className="text-sm text-gray-600">Configure how you receive notifications</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Issue Categories</h4>
                            <p className="text-sm text-gray-600">Customize issue categories for your ward</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Response Templates</h4>
                            <p className="text-sm text-gray-600">Create templates for common responses</p>
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