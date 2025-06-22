import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Building2, Users, Wrench, TrendingUp, MapPin, Clock, Star, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { formatCurrency } from "@/lib/utils";

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

  if (statsLoading || techLoading || wardsLoading) {
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mayor Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Municipality-wide performance overview</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Building2 className="w-4 h-4 mr-1" />
          Executive View
        </Badge>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Population</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {municipalityStats?.totalPopulation?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Across {municipalityStats?.totalWards || 0} wards
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {municipalityStats?.resolutionRate?.toFixed(1) || 0}%
            </div>
            <Progress value={municipalityStats?.resolutionRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {municipalityStats?.avgPerformanceRating || 0}/5
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-300">
              {municipalityStats?.totalTechnicians || 0} technicians
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {municipalityStats?.avgResolutionTime || 0}h
            </div>
            <p className="text-xs text-orange-600 dark:text-orange-300">
              Municipality average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="wards">Ward Performance</TabsTrigger>
          <TabsTrigger value="technicians">Technician Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Department</CardTitle>
                <CardDescription>Current workload distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
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
              <CardHeader>
                <CardTitle>Ward Issue Distribution</CardTitle>
                <CardDescription>Issues reported per ward</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={wardPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="issues" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentData.map((dept) => (
              <Card key={dept.name}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    {dept.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Technicians</span>
                    <span className="font-semibold">{dept.technicians}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Available</span>
                    <Badge variant={dept.available > 0 ? "default" : "destructive"}>
                      {dept.available}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Performance</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{dept.performance.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Completed Issues</span>
                    <span className="font-semibold text-green-600">{dept.completed}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="wards" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {wards?.map((ward: any) => (
              <Card key={ward.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {ward.wardNumber}
                  </CardTitle>
                  <CardDescription>{ward.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Population</span>
                    <span className="font-semibold">{ward.population?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Area</span>
                    <span className="font-semibold">{ward.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Active Issues</span>
                    <Badge variant="outline">
                      {municipalityStats?.issuesPerWard[ward.wardNumber] || 0}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">Councillor</span>
                    <p className="font-semibold text-sm">{ward.councillorName}</p>
                    <p className="text-xs text-gray-500">{ward.councillorPhone}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance Overview</CardTitle>
              <CardDescription>Performance metrics across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {technicianPerformance?.slice(0, 10).map((tech: any) => (
                  <div key={tech.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{tech.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{tech.department}</p>
                      <p className="text-xs text-gray-500">{tech.currentLocation}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <Badge variant={tech.status === "available" ? "default" : "secondary"}>
                        {tech.status}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm font-semibold">{tech.performanceRating}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {tech.completedIssues} completed • {tech.avgResolutionTime}h avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}