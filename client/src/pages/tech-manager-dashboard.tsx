import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Wrench, MapPin, Clock, Star, AlertCircle, CheckCircle, Navigation } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { IssueCard } from "@/components/issue-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime, getStatusColor, getPriorityColor } from "@/lib/utils";

export default function TechManagerDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [nearestTechnicians, setNearestTechnicians] = useState<any[]>([]);
  const { toast } = useToast();

  const { data: technicians, isLoading: techLoading } = useQuery({
    queryKey: ["/api/technicians"],
  });

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["/api/issues"],
  });

  const { data: techPerformance, isLoading: perfLoading } = useQuery({
    queryKey: ["/api/analytics/technicians"],
  });

  const { data: departmentStats, isLoading: deptLoading } = useQuery({
    queryKey: ["/api/analytics/departments", selectedDepartment],
    queryFn: () => apiRequest(`/api/analytics/departments${selectedDepartment !== 'all' ? `?department=${selectedDepartment}` : ''}`),
  });

  const assignTechnicianMutation = useMutation({
    mutationFn: ({ technicianId, issueId }: { technicianId: number; issueId: number }) =>
      apiRequest(`/api/technicians/${technicianId}/assign/${issueId}`, {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({ title: "Technician assigned successfully" });
      setSelectedIssue(null);
      setNearestTechnicians([]);
    },
  });

  const updateTechnicianMutation = useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & any) =>
      apiRequest(`/api/technicians/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      toast({ title: "Technician updated successfully" });
    },
  });

  const findNearestTechnicians = async (issue: any) => {
    try {
      // Mock coordinates for demonstration - in real app, would use geocoding
      const mockCoords = {
        latitude: -25.7461,
        longitude: 28.1881,
      };

      const categoryToDepartment: { [key: string]: string } = {
        "water_sanitation": "Water & Sanitation",
        "electricity": "Electricity",
        "roads_transport": "Roads & Transport",
        "waste_management": "Waste Management",
      };

      const department = categoryToDepartment[issue.category];

      const response = await apiRequest("/api/technicians/nearest", {
        method: "POST",
        body: JSON.stringify({
          latitude: mockCoords.latitude,
          longitude: mockCoords.longitude,
          department,
        }),
      });

      setNearestTechnicians(response);
      setSelectedIssue(issue);
    } catch (error) {
      toast({
        title: "Error finding technicians",
        description: "Could not locate nearest available technicians",
        variant: "destructive",
      });
    }
  };

  if (techLoading || issuesLoading || perfLoading || deptLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const departments = ["Water & Sanitation", "Electricity", "Roads & Transport", "Waste Management"];
  const filteredTechnicians = selectedDepartment === "all" 
    ? technicians 
    : technicians?.filter((tech: any) => tech.department === selectedDepartment);

  const unassignedIssues = issues?.filter((issue: any) => !issue.assignedTo && issue.status === "open") || [];
  const assignedIssues = issues?.filter((issue: any) => issue.assignedTo && issue.status !== "resolved") || [];

  const availableTechs = technicians?.filter((tech: any) => tech.status === "available").length || 0;
  const onJobTechs = technicians?.filter((tech: any) => tech.status === "on_job").length || 0;
  const avgPerformance = technicians?.reduce((acc: number, tech: any) => acc + tech.performanceRating, 0) / (technicians?.length || 1);

  const handleAssignTechnician = (technicianId: number) => {
    if (selectedIssue) {
      assignTechnicianMutation.mutate({ technicianId, issueId: selectedIssue.id });
    }
  };

  const handleUpdateTechnicianStatus = (technicianId: number, status: string) => {
    updateTechnicianMutation.mutate({ id: technicianId, status });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Technical Manager Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Technician allocation and performance management</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Wrench className="w-4 h-4 mr-1" />
            Technical View
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Technicians</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{availableTechs}</div>
            <p className="text-xs text-green-600 dark:text-green-300">
              Ready for assignment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Job</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{onJobTechs}</div>
            <p className="text-xs text-blue-600 dark:text-blue-300">
              Currently working
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{unassignedIssues.length}</div>
            <p className="text-xs text-orange-600 dark:text-orange-300">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{avgPerformance.toFixed(1)}/5</div>
            <p className="text-xs text-purple-600 dark:text-purple-300">
              Team average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assignments">Issue Assignments</TabsTrigger>
          <TabsTrigger value="technicians">Technician Management</TabsTrigger>
          <TabsTrigger value="performance">Performance Analytics</TabsTrigger>
          <TabsTrigger value="departments">Department Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Unassigned Issues ({unassignedIssues.length})
                </CardTitle>
                <CardDescription>Issues awaiting technician assignment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {unassignedIssues.map((issue: any) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{issue.title}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{issue.category.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{issue.location} • {issue.ward}</p>
                        <Badge variant="outline" size="sm" className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => findNearestTechnicians(issue)}
                        className="ml-2"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Assign
                      </Button>
                    </div>
                  ))}
                </div>
                {unassignedIssues.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
                    <p className="text-gray-500">All issues have been assigned!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Active Assignments ({assignedIssues.length})
                </CardTitle>
                <CardDescription>Issues currently being worked on</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {assignedIssues.map((issue: any) => (
                    <div key={issue.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{issue.title}</h4>
                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">
                        Assigned to: {issue.assignedTo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {issue.location} • {formatRelativeTime(issue.updatedAt)}
                      </p>
                    </div>
                  ))}
                </div>
                {assignedIssues.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No active assignments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technicians" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTechnicians?.map((tech: any) => (
              <Card key={tech.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{tech.name}</span>
                    <Badge variant={tech.status === "available" ? "default" : "secondary"}>
                      {tech.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{tech.department}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Performance</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold">{tech.performanceRating}/5</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Completed Issues</span>
                    <span className="font-semibold text-green-600">{tech.completedIssues}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">Avg Resolution</span>
                    <span className="font-semibold">{tech.avgResolutionTime}h</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {tech.currentLocation}
                  </div>
                  <div className="flex gap-2 pt-2">
                    {tech.status === "available" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateTechnicianStatus(tech.id, "maintenance")}
                        className="flex-1"
                      >
                        Set Maintenance
                      </Button>
                    )}
                    {tech.status === "maintenance" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateTechnicianStatus(tech.id, "available")}
                        className="flex-1"
                      >
                        Set Available
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance Overview</CardTitle>
              <CardDescription>Performance metrics and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={techPerformance?.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completedIssues" fill="#0ea5e9" name="Completed Issues" />
                  <Bar dataKey="performanceRating" fill="#10b981" name="Performance Rating" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Statistics</CardTitle>
              <CardDescription>
                {selectedDepartment === "all" ? "All departments overview" : `${selectedDepartment} department`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">{departmentStats?.totalTechnicians || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Total Technicians</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold text-green-600">{departmentStats?.availableTechnicians || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Available</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold text-orange-600">{departmentStats?.onJobTechnicians || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">On Job</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">{departmentStats?.avgPerformance?.toFixed(1) || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Avg Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>
              Select the best technician for: {selectedIssue?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {nearestTechnicians.length > 0 ? (
              nearestTechnicians.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{tech.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{tech.department}</p>
                    <p className="text-xs text-gray-500">
                      {tech.distance?.toFixed(1)}km away • {tech.performanceRating}/5 rating
                    </p>
                    <p className="text-xs text-gray-500">{tech.currentLocation}</p>
                  </div>
                  <Button
                    onClick={() => handleAssignTechnician(tech.id)}
                    disabled={assignTechnicianMutation.isPending}
                  >
                    Assign
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No available technicians found for this issue type.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}