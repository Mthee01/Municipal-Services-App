import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Users, Wrench, MapPin, Clock, Star, AlertCircle, CheckCircle, Navigation, StickyNote, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { IssueCard } from "@/components/issue-card";
import { TechnicianLocationTracker } from "@/components/technician-location-tracker";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatRelativeTime, getStatusColor, getPriorityColor } from "@/lib/utils";

export default function TechManagerDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [nearestTechnicians, setNearestTechnicians] = useState<any[]>([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedIssueForNotes, setSelectedIssueForNotes] = useState<any>(null);
  const { toast } = useToast();

  const { data: technicians = [], isLoading: techLoading } = useQuery({
    queryKey: ["/api/technicians"],
  });

  // Real-time issue fetching for tech managers
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ["/api/issues"],
    refetchInterval: 5000, // Refetch every 5 seconds to catch new citizen issues
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: techPerformance = [], isLoading: perfLoading } = useQuery({
    queryKey: ["/api/analytics/technicians"],
  });

  const { data: departmentStats, isLoading: deptLoading } = useQuery({
    queryKey: ["/api/analytics/departments", selectedDepartment],
    queryFn: async () => {
      return await apiRequest("GET", `/api/analytics/departments${selectedDepartment !== 'all' ? `?department=${selectedDepartment}` : ''}`);
    },
  });

  // Fetch issue notes for selected issue
  const { data: issueNotes = [] } = useQuery({
    queryKey: [`/api/issues/${selectedIssueForNotes?.id}/notes`],
    enabled: !!selectedIssueForNotes
  });

  // Fetch issue escalations for selected issue
  const { data: issueEscalations = [], isLoading: escalationsLoading } = useQuery({
    queryKey: [`/api/issues/${selectedIssueForNotes?.id}/escalations`],
    enabled: !!selectedIssueForNotes,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      console.log(`Fetched escalations for issue ${selectedIssueForNotes?.id}:`, data);
    },
    onError: (error) => {
      console.error(`Error fetching escalations for issue ${selectedIssueForNotes?.id}:`, error);
    }
  });

  // Handle viewing notes
  const handleViewNotes = (issue: any) => {
    console.log("Opening notes modal for issue:", issue.id, "Title:", issue.title);
    setSelectedIssueForNotes(issue);
    setShowNotesModal(true);
  };

  const assignTechnicianMutation = useMutation({
    mutationFn: ({ technicianId, issueId }: { technicianId: number; issueId: number }) =>
      apiRequest("POST", `/api/technicians/${technicianId}/assign/${issueId}`),
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
      apiRequest("PATCH", `/api/technicians/${id}`, updates),
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

      const technicianData = await apiRequest("POST", "/api/technicians/nearest", {
        latitude: mockCoords.latitude,
        longitude: mockCoords.longitude,
        department,
      });

      console.log("Nearest technicians data:", technicianData);
      setNearestTechnicians(Array.isArray(technicianData) ? technicianData : []);
      setSelectedIssue(issue);
    } catch (error) {
      console.error("Error finding technicians:", error);
      toast({
        title: "Error finding technicians",
        description: "Could not locate nearest available technicians",
        variant: "destructive",
      });
      setNearestTechnicians([]);
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
  const techniciansList = Array.isArray(technicians) ? technicians : [];
  const issuesList = Array.isArray(issues) ? issues : [];

  const filteredTechnicians = selectedDepartment === "all" 
    ? techniciansList
    : techniciansList.filter((tech: any) => tech.department === selectedDepartment);

  // Prioritize new citizen issues in unassigned list
  const unassignedIssues = issuesList
    .filter((issue: any) => !issue.assignedTo && issue.status === "open")
    .sort((a: any, b: any) => {
      // Sort by creation time - newest citizen reports first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  const assignedIssues = issuesList.filter((issue: any) => issue.assignedTo && issue.status !== "resolved");

  const availableTechs = techniciansList.filter((tech: any) => tech.status === "available").length;
  const onJobTechs = techniciansList.filter((tech: any) => tech.status === "on_job").length;
  const avgPerformance = techniciansList.reduce((acc: number, tech: any) => acc + (tech.performanceRating || 0), 0) / Math.max(techniciansList.length, 1);

  const handleAssignTechnician = (technicianId: number) => {
    if (selectedIssue) {
      assignTechnicianMutation.mutate({ technicianId, issueId: selectedIssue.id });
    }
  };

  const handleUpdateTechnicianStatus = (technicianId: number, status: string) => {
    updateTechnicianMutation.mutate({ id: technicianId, status });
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

    <div className="relative z-10 container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Technical Manager Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Technician allocation and performance management</p>
        </div>
        <div className="flex items-center">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            <Wrench className="w-4 h-4 mr-1" />
            Technical View
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="assignments" className="text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">Issue Assignments</span>
            <span className="sm:hidden">Issues</span>
          </TabsTrigger>
          <TabsTrigger value="technicians" className="text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">Technician Management</span>
            <span className="sm:hidden">Technicians</span>
          </TabsTrigger>
          <TabsTrigger value="tracking" className="text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">Location Tracking</span>
            <span className="sm:hidden">Tracking</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">Performance Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">Department Overview</span>
            <span className="sm:hidden">Departments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                  {unassignedIssues.map((issue: any) => {
                    // Check if issue is newly reported (within last hour)
                    const isNewIssue = new Date().getTime() - new Date(issue.createdAt).getTime() < 3600000;
                    // Check if issue is escalated (urgent priority with escalation history or recent escalation)
                    const isEscalated = issue.priority === 'urgent' && (
                      (issue.escalationHistory && issue.escalationHistory.length > 0) ||
                      // Also mark urgent issues as escalated even without explicit escalation history
                      issue.priority === 'urgent'
                    );
                    
                    return (
                      <div key={issue.id} className={`flex flex-col gap-3 p-4 border rounded-lg relative ${
                        isEscalated 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : isNewIssue 
                          ? 'border-blue-500 bg-blue-50' 
                          : ''
                      }`}>
                        {isEscalated && (
                          <div className="absolute -top-1 -right-1 flex items-center">
                            <div className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-500 opacity-75"></div>
                            <div className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></div>
                          </div>
                        )}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold text-sm truncate ${
                                isEscalated ? 'text-red-900 dark:text-red-100' : ''
                              }`}>{issue.title}</h4>
                              {isNewIssue && <Badge variant="default" className="bg-blue-500 text-white text-xs">NEW</Badge>}
                              {isEscalated && (
                                <Badge variant="destructive" className="bg-red-600 text-white text-xs animate-pulse">
                                  ESCALATED
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{issue.category.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-500 mb-2">{issue.location} • {issue.ward}</p>
                            <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </div>
                          <div className="flex space-x-2 ml-3 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewNotes(issue)}
                              className="text-xs"
                            >
                              <StickyNote className="h-3 w-3 mr-1" />
                              Notes
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => findNearestTechnicians(issue)}
                            >
                              <Navigation className="w-4 h-4 mr-1" />
                              Assign
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  {assignedIssues.map((issue: any) => {
                    // Check if issue is escalated (urgent priority with escalation history or recent escalation)
                    const isEscalated = issue.priority === 'urgent' && (
                      (issue.escalationHistory && issue.escalationHistory.length > 0) ||
                      // Also mark urgent issues as escalated even without explicit escalation history
                      issue.priority === 'urgent'
                    );
                    
                    return (
                    <div key={issue.id} className={`p-3 border rounded-lg relative ${
                      isEscalated ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : ''
                    }`}>
                      {isEscalated && (
                        <div className="absolute -top-1 -right-1 flex items-center">
                          <div className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-500 opacity-75"></div>
                          <div className="relative inline-flex rounded-full h-4 w-4 bg-red-600"></div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold text-sm ${
                            isEscalated ? 'text-red-900 dark:text-red-100' : ''
                          }`}>{issue.title}</h4>
                          {isEscalated && (
                            <Badge variant="destructive" className="bg-red-600 text-white text-xs animate-pulse">
                              ESCALATED
                            </Badge>
                          )}
                        </div>
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
                    );
                  })}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
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
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t pt-2">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {tech.currentLocation}
                  </div>
                  
                  <div className="pt-2">
                    {tech.status === "available" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateTechnicianStatus(tech.id, "maintenance")}
                        className="w-full"
                      >
                        Set Maintenance
                      </Button>
                    )}
                    {tech.status === "maintenance" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateTechnicianStatus(tech.id, "available")}
                        className="w-full"
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

        <TabsContent value="tracking" className="space-y-4">
          <TechnicianLocationTracker />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technician Performance Overview</CardTitle>
              <CardDescription>Performance metrics and completion rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={(techPerformance as any[])?.slice(0, 10) || []}>
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-lg sm:text-2xl font-bold">{departmentStats?.totalTechnicians || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Total Technicians</p>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-green-600" />
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{departmentStats?.availableTechnicians || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Available</p>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-lg sm:text-2xl font-bold text-orange-600">{departmentStats?.onJobTechnicians || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">On Job</p>
                </div>
                <div className="text-center p-3 sm:p-4 border rounded-lg">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-lg sm:text-2xl font-bold text-purple-600">{departmentStats?.avgPerformance?.toFixed(1) || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Avg Performance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent className="max-w-2xl mx-3 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
            <DialogDescription>
              Select the best technician for: {selectedIssue?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {nearestTechnicians.length > 0 ? (
              nearestTechnicians.map((tech) => (
                <div key={tech.id} className="flex flex-col gap-3 p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{tech.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{tech.department}</p>
                      <p className="text-xs text-gray-500">
                        {tech.distance?.toFixed(1)}km away • {tech.performanceRating}/5 rating
                      </p>
                      <p className="text-xs text-gray-500 truncate">{tech.currentLocation}</p>
                    </div>
                    <Button
                      onClick={() => handleAssignTechnician(tech.id)}
                      disabled={assignTechnicianMutation.isPending}
                      className="shrink-0 ml-3"
                    >
                      Assign
                    </Button>
                  </div>
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

      {/* Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Issue Notes - {selectedIssueForNotes?.title}</DialogTitle>
            <DialogDescription>
              View notes and communication history for this issue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {/* Escalations Section */}
              {Array.isArray(issueEscalations) && issueEscalations.length > 0 && (
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-semibold text-red-700 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Escalations ({issueEscalations.length})
                  </h3>
                  {issueEscalations.map((escalation) => (
                    <div key={escalation.id} className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-red-900">{escalation.escalatedBy}</span>
                        <span className="text-xs text-red-600">
                          {escalation.escalatedAt && !isNaN(new Date(escalation.escalatedAt).getTime()) 
                            ? new Date(escalation.escalatedAt).toLocaleString()
                            : escalation.createdAt && !isNaN(new Date(escalation.createdAt).getTime())
                            ? new Date(escalation.createdAt).toLocaleString()
                            : 'Date not available'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-red-800 font-medium">Escalated to: {escalation.escalatedTo}</p>
                      <p className="text-sm text-red-700 mt-1">{escalation.reason}</p>
                      <Badge variant="destructive" className="mt-2 text-xs">
                        ESCALATED
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Notes Section */}
              {Array.isArray(issueNotes) && issueNotes.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <StickyNote className="w-4 h-4 mr-2" />
                    Notes ({issueNotes.length})
                  </h3>
                  {issueNotes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm text-gray-900">{note.createdBy}</span>
                        <span className="text-xs text-gray-500">
                          {note.createdAt && !isNaN(new Date(note.createdAt).getTime()) 
                            ? new Date(note.createdAt).toLocaleString()
                            : 'Date not available'
                          }
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{note.note}</p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {note.noteType || 'General'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* No content message */}
              {(!Array.isArray(issueNotes) || issueNotes.length === 0) && 
               (!Array.isArray(issueEscalations) || issueEscalations.length === 0) && (
                <div className="text-center py-8">
                  <StickyNote className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">No notes or escalations yet for this issue</p>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}