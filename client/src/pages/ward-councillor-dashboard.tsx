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
  const wardIssues = issues?.filter((issue: any) => issue.ward === selectedWard) || [];
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

      <div className="relative z-10 container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ward Councillor Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300">Ward-specific performance and issue management</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-48">
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
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <MapPin className="w-4 h-4 mr-1" />
              Ward Level
            </Badge>
          </div>
        </div>

        {/* Ward Information Card */}
        {currentWard && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {currentWard.wardNumber} - {currentWard.name}
            </CardTitle>
            <CardDescription>{currentWard.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {currentWard.population?.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">Population</p>
              </div>
              <div className="text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {currentWard.area}
                </p>
                <p className="text-sm text-green-600 dark:text-green-300">Area</p>
              </div>
              <div className="text-center">
                <Phone className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  {currentWard.councillorName}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-300">Councillor</p>
              </div>
              <div className="text-center">
                <Mail className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                  {currentWard.councillorPhone}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-300">
                  {currentWard.councillorEmail}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wardStats?.totalIssues || 0}</div>
            <p className="text-xs text-muted-foreground">
              In {selectedWard}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{wardStats?.openIssues || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{wardStats?.inProgress || 0}</div>
            <p className="text-xs text-muted-foreground">
              Being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {wardStats?.resolutionRate?.toFixed(1) || 0}%
            </div>
            <Progress value={wardStats?.resolutionRate || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issues">Ward Issues</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="technicians">Technicians</TabsTrigger>
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Category</CardTitle>
                <CardDescription>Distribution of issue types in {selectedWard}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
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
                <CardTitle>Issues by Priority</CardTitle>
                <CardDescription>Priority distribution in {selectedWard}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" />
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

        <TabsContent value="technicians" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Technicians in {selectedWard}</CardTitle>
              <CardDescription>Technicians currently working on ward issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {wardTechnicians.length > 0 ? (
                  wardTechnicians.map((tech: any) => (
                    <div key={tech.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-semibold">{tech.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{tech.department}</p>
                        <p className="text-xs text-gray-500">{tech.currentLocation}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant={tech.status === "available" ? "default" : "secondary"}>
                          {tech.status}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          {tech.completedIssues} completed
                        </p>
                        <p className="text-xs text-gray-500">
                          {tech.avgResolutionTime}h avg time
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No technicians currently assigned to {selectedWard} issues.</p>
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