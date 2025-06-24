import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wrench,
  DropletIcon as Water,
  Zap,
  Car,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Filter,
  Plus,
  FileDown,
  Truck,
  TriangleAlert,
  MessageCircle
} from "lucide-react";
import { Link } from "wouter";
import type { Issue, Technician, Team } from "@shared/schema";

// Helper functions
const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800';
    case 'assigned': return 'bg-yellow-100 text-yellow-800';
    case 'in_progress': return 'bg-orange-100 text-orange-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'water_sanitation': return <Water className="h-4 w-4 text-blue-600" />;
    case 'electricity': return <Zap className="h-4 w-4 text-yellow-600" />;
    case 'roads_transport': return <Car className="h-4 w-4 text-gray-600" />;
    case 'waste_management': return <Trash2 className="h-4 w-4 text-green-600" />;
    default: return <AlertTriangle className="h-4 w-4 text-orange-600" />;
  }
};

export default function OfficialDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportMethod, setExportMethod] = useState("email");

  // Queries - Real-time issue fetching for call center agents
  const { data: issues = [], isLoading: issuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
    refetchInterval: 5000, // Refetch every 5 seconds to catch new citizen issues
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const { data: technicians = [], isLoading: techniciansLoading } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"]
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"]
  });

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/whatsapp/unread-count"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations
  const assignTechnicianMutation = useMutation({
    mutationFn: async (data: { issueId: number; technicianId: number }) => {
      return apiRequest("POST", "/api/issues/assign", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      setShowAssignModal(false);
      setSelectedIssue(null);
      setSelectedTechnician("");
      toast({
        title: "Success",
        description: "Technician assigned successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign technician",
        variant: "destructive",
      });
    }
  });

  // Filtered issues with priority for new citizen reports
  const filteredIssues = useMemo(() => {
    const filtered = issues.filter((issue: Issue) => {
      return issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    // Sort to show newest issues first (especially new citizen reports)
    return filtered.sort((a: Issue, b: Issue) => {
      // Prioritize unassigned issues (new citizen reports)
      if (a.status === 'open' && b.status !== 'open') return -1;
      if (b.status === 'open' && a.status !== 'open') return 1;
      
      // Then by creation time (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [issues, searchTerm]);

  // Handle assign technician
  const handleAssignTechnician = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowAssignModal(true);
  };

  const handleConfirmAssignment = () => {
    if (selectedIssue && selectedTechnician) {
      assignTechnicianMutation.mutate({
        issueId: selectedIssue.id,
        technicianId: parseInt(selectedTechnician)
      });
    }
  };

  // Handle export report
  const handleExportReport = () => {
    setShowExportModal(true);
  };

  const handleExportSubmit = async () => {
    if (exportMethod === "email" && !exportEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['ID', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Ward', 'Assigned To', 'Created', 'Reporter'],
      ...filteredIssues.map(issue => [
        issue.id,
        `"${issue.title}"`,
        issue.category.replace('_', ' '),
        issue.priority,
        issue.status.replace('_', ' '),
        `"${issue.location}"`,
        issue.ward || 'N/A',
        issue.assignedTo || 'Unassigned',
        new Date(issue.createdAt).toLocaleDateString(),
        issue.reporterName || 'Anonymous'
      ])
    ].map(row => row.join(',')).join('\n');

    if (exportMethod === "email") {
      try {
        await apiRequest("POST", "/api/export-report", {
          email: exportEmail,
          reportData: csvContent,
          reportType: "issues",
          fileName: `issues-report-${new Date().toISOString().split('T')[0]}.csv`
        });
        
        toast({
          title: "Success",
          description: `Report sent to ${exportEmail}`,
        });
        setShowExportModal(false);
        setExportEmail("");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to send report via email",
          variant: "destructive",
        });
      }
    } else {
      // Download directly
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `issues-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
      setShowExportModal(false);
    }
  };

  // Statistics calculations
  const stats = useMemo(() => {
    const totalIssues = issues.length;
    const openIssues = issues.filter((issue: Issue) => issue.status === 'open').length;
    const assignedIssues = issues.filter((issue: Issue) => issue.status === 'assigned').length;
    const resolvedIssues = issues.filter((issue: Issue) => issue.status === 'resolved').length;
    const criticalIssues = issues.filter((issue: Issue) => issue.priority === 'critical').length;

    return {
      totalIssues,
      openIssues,
      assignedIssues,
      resolvedIssues,
      criticalIssues,
      resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0
    };
  }, [issues]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Municipal Official Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage service requests and city operations</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Link href="/whatsapp">
                <div className="relative">
                  <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2 w-full sm:w-auto">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp Center</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </Button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              </Link>
              <div className="text-right w-full sm:w-auto">
                <p className="text-sm text-gray-500">Welcome back</p>
                <p className="font-semibold text-gray-900">Municipal Official</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics Overview */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Issues</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalIssues}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Open Issues</p>
                    <p className="text-2xl font-bold text-red-600">{stats.openIssues}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assigned</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.assignedIssues}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolvedIssues}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical</p>
                    <p className="text-2xl font-bold text-red-600">{stats.criticalIssues}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <TriangleAlert className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Resolution Rate</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resolutionRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-4 bg-white border-t border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search issues by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <Button
                onClick={handleExportReport}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Issues Table */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Issues</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {issuesLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Loading issues...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Issue</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIssues.slice(0, 10).map((issue) => (
                        <TableRow key={issue.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{issue.title}</span>
                              <span className="text-sm text-gray-600">{issue.location}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700">{issue.category.replace('_', ' ')}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-700">
                              {issue.assignedTo || 'Unassigned'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(issue.createdAt)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {!issue.assignedTo && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAssignTechnician(issue)}
                                className="text-xs"
                              >
                                Assign
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredIssues.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No issues match your filters.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Action Buttons */}
      <section className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Button
              onClick={() => setShowAssignModal(true)}
              className="bg-sa-green hover:bg-green-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Assign Technician
            </Button>
            <Button 
              variant="outline" 
              className="text-sm px-4 py-2"
              onClick={handleExportReport}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </section>

      {/* Assign Technician Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Technician to Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Select Issue</label>
              <Select 
                value={selectedIssue?.id.toString() || ""} 
                onValueChange={(value) => {
                  const issue = filteredIssues.find(i => i.id.toString() === value);
                  if (issue) setSelectedIssue(issue);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an issue to assign..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredIssues.filter(issue => !issue.assignedTo).map((issue) => (
                    <SelectItem key={issue.id} value={issue.id.toString()}>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{issue.title}</span>
                        <span className="text-xs text-gray-500">{issue.category.replace('_', ' ')} • Ward {issue.ward}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedIssue && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Select Technician</label>
                <Select 
                  value={selectedTechnician} 
                  onValueChange={setSelectedTechnician}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a technician..." />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians
                      .filter(tech => tech.status === "available")
                      .map((tech) => (
                        <SelectItem key={tech.id} value={tech.id.toString()}>
                          <div className="flex flex-col">
                            <span>{tech.name} - {tech.department}</span>
                            <span className="text-xs text-gray-500">
                              Skills: {tech.skills?.join(", ") || "General"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedIssue(null);
                  setSelectedTechnician("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmAssignment}
                disabled={!selectedIssue || !selectedTechnician || assignTechnicianMutation.isPending}
                className="bg-sa-green hover:bg-green-700"
              >
                {assignTechnicianMutation.isPending ? "Assigning..." : "Assign Technician"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Management */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Resource Management</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Team Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Team Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamsLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Loading teams...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{team.name}</p>
                            <p className="text-sm text-gray-600">Currently: {team.currentLocation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={team.status === "available" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                            {team.status.replace("_", " ")}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            Updated {formatRelativeTime(team.lastUpdate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Equipment Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Equipment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Truck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Water Tanker #03</p>
                        <p className="text-sm text-gray-600">Sector 2 - Route A</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <p className="text-xs text-gray-500 mt-1">GPS: 5 min ago</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Wrench className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Service Van #12</p>
                        <p className="text-sm text-gray-600">Ward 7 - Electrical Team</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-yellow-100 text-yellow-800">In Service</Badge>
                      <p className="text-xs text-gray-500 mt-1">GPS: 2 min ago</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <TriangleAlert className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Emergency Vehicle #01</p>
                        <p className="text-sm text-gray-600">Municipal Garage</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800">Maintenance</Badge>
                      <p className="text-xs text-gray-500 mt-1">Updated: 1 hour ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Export Report Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Issues Report</DialogTitle>
            <DialogDescription>
              Choose how you would like to receive the issues report.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <Label htmlFor="export-method">Delivery Method</Label>
              <Select value={exportMethod} onValueChange={setExportMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Send via Email</SelectItem>
                  <SelectItem value="download">Download Directly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {exportMethod === "email" && (
              <div className="space-y-2">
                <Label htmlFor="export-email">Email Address</Label>
                <Input
                  id="export-email"
                  type="email"
                  placeholder="Enter email address"
                  value={exportEmail}
                  onChange={(e) => setExportEmail(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportSubmit}>
              {exportMethod === "email" ? "Send Report" : "Download Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}