import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MapPin, Users, AlertCircle, CheckCircle, Clock, Phone, Mail, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { IssueCard } from "@/components/issue-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime, getStatusColor, getPriorityColor } from "@/lib/utils";

export default function WardCouncillorDashboard() {
  const [selectedWard, setSelectedWard] = useState<string>("Ward 1");
  const [activeTab, setActiveTab] = useState<string>("issues");
  const { toast } = useToast();

  const { data: wards, isLoading: wardsLoading } = useQuery({
    queryKey: ["/api/wards"],
  });

  const { data: wardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/wards", selectedWard, "stats"],
    queryFn: () => apiRequest(`/api/wards/${selectedWard}/stats`),
    enabled: !!selectedWard,
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["/api/issues"],
  });

  const { data: technicians, isLoading: techLoading } = useQuery({
    queryKey: ["/api/technicians"],
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & any) =>
      apiRequest(`/api/issues/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({ title: "Issue updated successfully" });
    },
  });

  if (wardsLoading || statsLoading || issuesLoading || techLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentWard = wards?.find((w: any) => w.wardNumber === selectedWard);
  
  // Ensure we have valid data before filtering
  const allIssues = issues || [];
  const wardIssues = allIssues.filter((issue: any) => issue.ward === selectedWard);
  
  const wardTechnicians = technicians?.filter((tech: any) => 
    wardIssues.some((issue: any) => issue.assignedTo === tech.name)
  ) || [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const categoryData = Object.entries(wardStats?.categoryStats || {}).map(([category, count]) => ({
    name: category.replace('_', ' ').toUpperCase(),
    value: count as number,
  }));

  const priorityData = Object.entries(wardStats?.priorityStats || {}).map(([priority, count]) => ({
    name: priority.toUpperCase(),
    value: count as number,
  }));

  const handleIssueUpdate = (issueId: number, updates: any) => {
    updateIssueMutation.mutate({ id: issueId, ...updates });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Mobile-optimized header */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Ward Councillor
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              Ward performance & issue management
            </p>
          </div>
          
          {/* Mobile-friendly controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                {wards?.map((ward: any) => (
                  <SelectItem key={ward.id} value={ward.wardNumber}>
                    {ward.wardNumber} - {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 self-start sm:self-auto">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs sm:text-sm">Ward Level</span>
            </Badge>
          </div>
        </div>

        {/* Mobile-optimized Ward Information Card */}
        {currentWard && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">{currentWard.wardNumber} - {currentWard.name}</span>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-2">
              {currentWard.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-blue-600" />
                <p className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">
                  {currentWard.population?.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">Population</p>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-green-600" />
                <p className="text-lg sm:text-xl font-bold text-green-900 dark:text-green-100">
                  {currentWard.area}
                </p>
                <p className="text-xs sm:text-sm text-green-600 dark:text-green-300">Area</p>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg col-span-2 lg:col-span-1">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm sm:text-base font-semibold text-purple-900 dark:text-purple-100 truncate">
                  {currentWard.councillorName}
                </p>
                <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-300">Councillor</p>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg col-span-2 lg:col-span-1">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-orange-600" />
                <p className="text-xs sm:text-sm font-semibold text-orange-900 dark:text-orange-100 truncate">
                  {currentWard.councillorPhone}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300 truncate">
                  {currentWard.councillorEmail}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile-optimized Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              Total Issues
            </div>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {wardStats?.totalIssues || 0}
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">
            In {selectedWard}
          </p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              Open Issues
            </div>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-orange-600">
            {wardStats?.openIssues || 0}
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">
            Awaiting attention
          </p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              In Progress
            </div>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-600">
            {wardStats?.inProgress || 0}
          </div>
          <p className="text-xs text-gray-500 truncate mt-1">
            Being worked on
          </p>
        </Card>

        <Card className="p-3 sm:p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              Resolution Rate
            </div>
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-600">
            {wardStats?.resolutionRate?.toFixed(1) || 0}%
          </div>
          <Progress value={wardStats?.resolutionRate || 0} className="mt-2 h-2" />
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1">
          <TabsTrigger value="issues" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">Ward Issues</span>
            <span className="sm:hidden">Issues</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Charts</span>
          </TabsTrigger>
          <TabsTrigger value="technicians" className="text-xs sm:text-sm px-2 py-2 sm:px-3 sm:py-2">
            <span className="hidden sm:inline">Technicians</span>
            <span className="sm:hidden">Techs</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {wardIssues.map((issue: any) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onUpdate={(updatedIssue: any) => handleIssueUpdate(issue.id, updatedIssue)}
              />
            ))}
          </div>
          {wardIssues.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No issues reported in {selectedWard} yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-sm sm:text-base">Issues by Category</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Distribution in {selectedWard}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col space-y-3">
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={false}
                          outerRadius={60}
                          innerRadius={25}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ fontSize: '11px', padding: '6px' }}
                          labelStyle={{ fontSize: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {categoryData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="truncate flex-1">{entry.name}</span>
                        <span className="font-semibold flex-shrink-0">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-sm sm:text-base">Issues by Priority</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Priority distribution in {selectedWard}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={priorityData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      fontSize={9}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                      interval={0}
                    />
                    <YAxis fontSize={9} width={25} />
                    <Tooltip 
                      contentStyle={{ fontSize: '11px', padding: '6px' }}
                      labelStyle={{ fontSize: '10px' }}
                    />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ward Performance Summary</CardTitle>
              <CardDescription>Key metrics for {selectedWard}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Resolution Rate</span>
                      <span className="text-sm text-muted-foreground">
                        {wardStats?.resolutionRate?.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={wardStats?.resolutionRate || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Average Rating</span>
                      <span className="text-sm text-muted-foreground">
                        {wardStats?.avgRating || 0}/5
                      </span>
                    </div>
                    <Progress value={(wardStats?.avgRating || 0) * 20} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Total Issues</span>
                    <span className="font-semibold">{wardStats?.totalIssues || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Resolved Issues</span>
                    <span className="font-semibold text-green-600">{wardStats?.resolved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Open Issues</span>
                    <span className="font-semibold text-orange-600">{wardStats?.openIssues || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">In Progress</span>
                    <span className="font-semibold text-blue-600">{wardStats?.inProgress || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-sm sm:text-base">Active Technicians in {selectedWard}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Technicians currently working on ward issues</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 sm:space-y-4">
                {wardTechnicians.length > 0 ? (
                  wardTechnicians.map((tech: any) => (
                    <div key={tech.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="mb-3 sm:mb-0 flex-1">
                        <h4 className="text-sm sm:text-base font-semibold truncate">{tech.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{tech.department}</p>
                        <p className="text-xs text-gray-500 truncate">{tech.currentLocation}</p>
                      </div>
                      <div className="flex flex-row sm:flex-col sm:text-right justify-between sm:justify-start items-center sm:items-end space-x-2 sm:space-x-0 sm:space-y-1">
                        <Badge 
                          variant={tech.status === "available" ? "default" : "secondary"}
                          className="text-xs px-2 py-1"
                        >
                          {tech.status}
                        </Badge>
                        <div className="flex flex-col sm:text-right text-xs text-gray-500">
                          <span>{tech.completedIssues} completed</span>
                          <span>{tech.avgResolutionTime}h avg</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                    <p className="text-xs sm:text-sm text-gray-500 px-4">No technicians currently assigned to {selectedWard} issues.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </div>
  );
}