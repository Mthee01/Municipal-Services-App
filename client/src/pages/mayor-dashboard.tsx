import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, Wrench, TrendingUp, MapPin, Clock, Star, Target, Bell } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { RealTimeNotifications } from "@/components/real-time-notifications";
import { GISMapIntegration } from "@/components/gis-map-integration";
import { AIAnalyticsDashboard } from "@/components/ai-analytics-dashboard";

export default function MayorDashboard() {
  const { data: municipalityStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/analytics/municipality"],
  });

  const { data: technicianPerformance, isLoading: techLoading } = useQuery({
    queryKey: ["/api/analytics/technicians"],
  });

  const { data: wards, isLoading: wardsLoading } = useQuery({
    queryKey: ["/api/wards"],
  });

  const { data: allIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ["/api/issues"],
  });

  if (statsLoading || techLoading || wardsLoading || issuesLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
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

  const wardPerformanceData = wards?.map((ward: any) => ({
    name: ward.wardNumber,
    issues: municipalityStats?.issuesPerWard[ward.wardNumber] || 0,
    population: ward.population || 0,
    councillor: ward.councillorName,
  })) || [];

  const departmentData = Object.entries(municipalityStats?.departmentStats || {}).map(([dept, stats]: [string, any]) => ({
    name: dept,
    technicians: stats.totalTechnicians,
    available: stats.availableTechnicians,
    performance: stats.avgPerformance,
    completed: stats.completedIssues,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Background geometric patterns */}
      <div className="absolute inset-0 z-0">
        {/* Animated geometric shapes */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-400/40 to-purple-400/40 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-br from-green-400/40 to-blue-400/40 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-32 left-20 w-80 h-80 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-60 left-1/2 w-96 h-96 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-3000"></div>
        <div className="absolute bottom-40 right-10 w-60 h-60 bg-gradient-to-br from-cyan-400/35 to-teal-400/35 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-4000"></div>
        
        {/* Additional decorative patterns */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 10%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)
            `
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white truncate">Mayor Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Municipality-wide performance overview with AI insights</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <RealTimeNotifications userRole="mayor" />
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs md:text-sm">
            <Building2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            <span className="hidden sm:inline">Executive </span>View
          </Badge>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Population</CardTitle>
            <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-1 md:pt-2">
            <div className="text-lg md:text-2xl font-bold text-blue-900 dark:text-blue-100">
              {municipalityStats?.totalPopulation?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              <span className="hidden md:inline">Across </span>{municipalityStats?.totalWards || 0} wards
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Resolution Rate</CardTitle>
            <Target className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-1 md:pt-2">
            <div className="text-lg md:text-2xl font-bold text-green-900 dark:text-green-100">
              {municipalityStats?.resolutionRate?.toFixed(1) || 0}%
            </div>
            <Progress value={municipalityStats?.resolutionRate || 0} className="mt-1 md:mt-2 h-1 md:h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Avg Performance</CardTitle>
            <Star className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="pt-1 md:pt-2">
            <div className="text-lg md:text-2xl font-bold text-purple-900 dark:text-purple-100">
              {municipalityStats?.avgPerformanceRating || 0}/5
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-300">
              {municipalityStats?.totalTechnicians || 0} techs
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 md:pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="pt-1 md:pt-2">
            <div className="text-lg md:text-2xl font-bold text-orange-900 dark:text-orange-100">
              {municipalityStats?.avgResolutionTime || 0}h
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-300">
              <span className="hidden md:inline">Municipality </span>avg
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="tabs-list-mobile">
          <TabsTrigger value="overview" className="tabs-trigger-mobile">
            <span className="hidden md:inline">Overview</span>
            <span className="md:hidden">Home</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="tabs-trigger-mobile">
            <span className="hidden md:inline">Departments</span>
            <span className="md:hidden">Depts</span>
          </TabsTrigger>
          <TabsTrigger value="wards" className="tabs-trigger-mobile">
            <span className="hidden md:inline">Ward Performance</span>
            <span className="md:hidden">Wards</span>
          </TabsTrigger>
          <TabsTrigger value="technicians" className="tabs-trigger-mobile">
            <span className="hidden md:inline">Technician Analytics</span>
            <span className="md:hidden">Techs</span>
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="tabs-trigger-mobile">
            <span className="hidden md:inline">AI Insights</span>
            <span className="md:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger value="gis-map" className="tabs-trigger-mobile">
            <span className="hidden md:inline">GIS Mapping</span>
            <span className="md:hidden">Map</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
            <Card>
              <CardHeader className="pb-2 md:pb-6">
                <CardTitle className="text-sm md:text-base">Issues by Department</CardTitle>
                <CardDescription className="text-xs md:text-sm">Current workload distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="completed"
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 md:pb-6">
                <CardTitle className="text-sm md:text-base">Ward Issue Distribution</CardTitle>
                <CardDescription className="text-xs md:text-sm">Issues reported per ward</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={wardPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={10} />
                    <YAxis fontSize={10} />
                    <Tooltip />
                    <Bar dataKey="issues" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {departmentData.map((dept) => (
              <Card key={dept.name}>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                    <Wrench className="w-4 h-4 md:w-5 md:h-5" />
                    {dept.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Total Technicians</span>
                    <span className="font-semibold text-sm md:text-base">{dept.technicians}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Available</span>
                    <Badge variant={dept.available > 0 ? "default" : "destructive"} className="text-xs">
                      {dept.available}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Performance</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                      <span className="font-semibold text-sm md:text-base">{dept.performance.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Completed Issues</span>
                    <span className="font-semibold text-green-600 text-sm md:text-base">{dept.completed}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wards" className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {wards?.map((ward: any) => (
              <Card key={ward.id}>
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                    {ward.wardNumber}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">{ward.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Population</span>
                    <span className="font-semibold text-sm md:text-base">{ward.population?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Area</span>
                    <span className="font-semibold text-sm md:text-base">{ward.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Active Issues</span>
                    <Badge variant="outline" className="text-xs">
                      {municipalityStats?.issuesPerWard[ward.wardNumber] || 0}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Councillor</span>
                    <p className="font-semibold text-xs md:text-sm">{ward.councillorName}</p>
                    <p className="text-xs text-gray-500">{ward.councillorPhone}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="pb-2 md:pb-6">
              <CardTitle className="text-sm md:text-base">Technician Performance Overview</CardTitle>
              <CardDescription className="text-xs md:text-sm">Performance metrics across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 md:space-y-4">
                {technicianPerformance?.slice(0, 10).map((tech: any) => (
                  <div key={tech.id} className="flex items-center justify-between p-2 md:p-3 border rounded-lg">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm md:text-base truncate">{tech.name}</h4>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">{tech.department}</p>
                      <p className="text-xs text-gray-500 truncate">{tech.currentLocation}</p>
                    </div>
                    <div className="text-right space-y-1 flex-shrink-0">
                      <Badge variant={tech.status === "available" ? "default" : "secondary"} className="text-xs">
                        {tech.status}
                      </Badge>
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs md:text-sm font-semibold">{tech.performanceRating}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {tech.completedIssues} <span className="hidden sm:inline">completed</span> • {tech.avgResolutionTime}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <AIAnalyticsDashboard userRole="mayor" />
        </TabsContent>

        <TabsContent value="gis-map" className="space-y-3 md:space-y-4">
          <GISMapIntegration 
            issues={allIssues || []} 
            onIssueSelect={(issue) => console.log('Selected issue:', issue)}
            height="400px"
          />
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}