import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Users, Wrench, MapPin, Clock, Star, AlertCircle, CheckCircle, Navigation, StickyNote, Eye, FileText, Download, Printer, Calendar, User, Phone, Mail } from "lucide-react";
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
  const [showIssueDetails, setShowIssueDetails] = useState(false);
  const [selectedIssueForDetails, setSelectedIssueForDetails] = useState<any>(null);
  const [selectedIssuesForExport, setSelectedIssuesForExport] = useState<Set<number>>(new Set());
  const [showExportModal, setShowExportModal] = useState(false);
  const [showCompletionReportModal, setShowCompletionReportModal] = useState(false);
  const [selectedCompletionReport, setSelectedCompletionReport] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedReportForReview, setSelectedReportForReview] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
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

  // Fetch all completion reports for tech manager review
  const { data: completionReports = [] } = useQuery({
    queryKey: ["/api/completion-reports"],
    queryFn: () => apiRequest("/api/completion-reports", 'GET'),
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
    refetchOnWindowFocus: false
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

  // Generate unique job order number based on issue ID
  const generateJobOrderNumber = (issueId: number) => {
    const year = new Date().getFullYear();
    const paddedId = String(issueId).padStart(3, '0');
    return `JO-${paddedId}-${year}`;
  };

  // Handle viewing issue details
  const handleViewIssueDetails = (issue: any) => {
    setSelectedIssueForDetails(issue);
    setShowIssueDetails(true);
  };

  // Handle issue selection for export
  const handleIssueSelection = (issueId: number, selected: boolean) => {
    const newSelection = new Set(selectedIssuesForExport);
    if (selected) {
      newSelection.add(issueId);
    } else {
      newSelection.delete(issueId);
    }
    setSelectedIssuesForExport(newSelection);
  };

  // Handle select all issues
  const handleSelectAllIssues = () => {
    const allIssueIds = new Set(issuesList.map((issue: any) => issue.id));
    setSelectedIssuesForExport(allIssueIds);
  };

  // Handle clear selection
  const handleClearSelection = () => {
    setSelectedIssuesForExport(new Set());
  };

  // Export selected issues as JSON
  const exportAsJSON = () => {
    const selectedIssues = issuesList.filter((issue: any) => 
      selectedIssuesForExport.has(issue.id)
    );
    const exportData = {
      exportDate: new Date().toISOString(),
      totalIssues: selectedIssues.length,
      issues: selectedIssues.map(issue => ({
        ...issue,
        jobOrderNumber: generateJobOrderNumber(issue.id)
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issues-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: `Exported ${selectedIssues.length} issues as JSON` });
    setShowExportModal(false);
  };

  // Export selected issues as CSV
  const exportAsCSV = () => {
    const selectedIssues = issuesList.filter((issue: any) => 
      selectedIssuesForExport.has(issue.id)
    );
    
    const headers = [
      'Job Order Number', 'Reference Number', 'Title', 'Category', 'Priority', 
      'Status', 'Location', 'Ward', 'Assigned To', 'Reported By', 'Created At', 
      'Updated At', 'Description'
    ];
    
    const csvContent = [
      headers.join(','),
      ...selectedIssues.map(issue => [
        generateJobOrderNumber(issue.id),
        issue.referenceNumber || '',
        `"${issue.title.replace(/"/g, '""')}"`,
        issue.category,
        issue.priority,
        issue.status,
        `"${issue.location.replace(/"/g, '""')}"`,
        issue.ward || '',
        issue.assignedTo || '',
        issue.reportedBy || '',
        new Date(issue.createdAt).toLocaleDateString(),
        new Date(issue.updatedAt).toLocaleDateString(),
        `"${(issue.description || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `issues-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: `Exported ${selectedIssues.length} issues as CSV` });
    setShowExportModal(false);
  };

  // Print selected issues
  const printSelectedIssues = () => {
    const selectedIssues = issuesList.filter((issue: any) => 
      selectedIssuesForExport.has(issue.id)
    );
    
    const printContent = `
      <html>
        <head>
          <title>Issues Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .issue { border: 1px solid #ccc; margin: 15px 0; padding: 15px; page-break-inside: avoid; }
            .job-order { background: #e3f2fd; padding: 5px 10px; display: inline-block; margin-bottom: 10px; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .detail-item { margin-bottom: 5px; }
            .label { font-weight: bold; }
            .description { margin-top: 15px; padding: 10px; background: #f5f5f5; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Municipal Issues Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Total Issues: ${selectedIssues.length}</p>
          </div>
          ${selectedIssues.map(issue => `
            <div class="issue">
              <div class="job-order">Job Order: ${generateJobOrderNumber(issue.id)}</div>
              <div class="title">${issue.title}</div>
              <div class="details">
                <div class="detail-item"><span class="label">Reference:</span> ${issue.referenceNumber || 'N/A'}</div>
                <div class="detail-item"><span class="label">Category:</span> ${issue.category}</div>
                <div class="detail-item"><span class="label">Priority:</span> ${issue.priority}</div>
                <div class="detail-item"><span class="label">Status:</span> ${issue.status}</div>
                <div class="detail-item"><span class="label">Location:</span> ${issue.location}</div>
                <div class="detail-item"><span class="label">Ward:</span> ${issue.ward || 'N/A'}</div>
                <div class="detail-item"><span class="label">Assigned To:</span> ${issue.assignedTo || 'Unassigned'}</div>
                <div class="detail-item"><span class="label">Reported By:</span> ${issue.reportedBy || 'N/A'}</div>
                <div class="detail-item"><span class="label">Created:</span> ${new Date(issue.createdAt).toLocaleDateString()}</div>
                <div class="detail-item"><span class="label">Updated:</span> ${new Date(issue.updatedAt).toLocaleDateString()}</div>
              </div>
              ${issue.description ? `<div class="description"><strong>Description:</strong> ${issue.description}</div>` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
    
    toast({ title: `Preparing to print ${selectedIssues.length} issues` });
    setShowExportModal(false);
  };

  // Completion report approval handlers
  const handleApproveReport = (report: any) => {
    setSelectedReportForReview(report);
    setReviewNotes("");
    setShowApprovalModal(true);
  };

  const handleRejectReport = (report: any) => {
    setSelectedReportForReview(report);
    setReviewNotes("");
    setShowRejectionModal(true);
  };

  const approveReportMutation = useMutation({
    mutationFn: ({ reportId, reviewNotes }: { reportId: number; reviewNotes: string }) =>
      apiRequest("POST", `/api/completion-reports/${reportId}/approve`, { reviewNotes, reviewedBy: 5 }), // Tech manager ID
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/completion-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({ 
        title: "Report Approved", 
        description: "Completion report has been approved successfully.",
      });
      setShowApprovalModal(false);
    },
    onError: () => {
      toast({ 
        title: "Approval Failed", 
        description: "Failed to approve completion report. Please try again.",
        variant: "destructive"
      });
    }
  });

  const rejectReportMutation = useMutation({
    mutationFn: ({ reportId, reviewNotes }: { reportId: number; reviewNotes: string }) =>
      apiRequest("POST", `/api/completion-reports/${reportId}/reject`, { reviewNotes, reviewedBy: 5 }), // Tech manager ID
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/completion-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({ 
        title: "Report Rejected", 
        description: "Completion report has been rejected and issue reopened.",
      });
      setShowRejectionModal(false);
    },
    onError: () => {
      toast({ 
        title: "Rejection Failed", 
        description: "Failed to reject completion report. Please try again.",
        variant: "destructive"
      });
    }
  });

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
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 h-auto">
          <TabsTrigger value="assignments" className="text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">Issue Assignments</span>
            <span className="sm:hidden">Issues</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm p-2 sm:p-3">
            <span className="hidden sm:inline">Completed Work</span>
            <span className="sm:hidden">Completed</span>
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
          {/* Export Controls */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Issue Management & Export</CardTitle>
                  <CardDescription>Select issues to view details, print, or export reports</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {selectedIssuesForExport.size} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAllIssues}
                    disabled={selectedIssuesForExport.size === issuesList.length}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                    disabled={selectedIssuesForExport.size === 0}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={() => setShowExportModal(true)}
                    disabled={selectedIssuesForExport.size === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export ({selectedIssuesForExport.size})
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

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
                          <div className="flex items-center space-x-2 ml-3 shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedIssuesForExport.has(issue.id)}
                              onChange={(e) => handleIssueSelection(issue.id, e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewIssueDetails(issue)}
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
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
                    
                    const jobOrderNumber = generateJobOrderNumber(issue.id);
                    
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
                          <input
                            type="checkbox"
                            checked={selectedIssuesForExport.has(issue.id)}
                            onChange={(e) => handleIssueSelection(issue.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {jobOrderNumber}
                          </span>
                          <h4 className={`font-semibold text-sm ${
                            isEscalated ? 'text-red-900 dark:text-red-100' : ''
                          }`}>{issue.title}</h4>
                          {isEscalated && (
                            <Badge variant="destructive" className="bg-red-600 text-white text-xs animate-pulse">
                              ESCALATED
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewIssueDetails(issue)}
                            className="text-xs"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Badge variant="outline" className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </div>
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

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Work Reports</CardTitle>
              <CardDescription>
                View and export completion reports submitted by technicians
              </CardDescription>
            </CardHeader>
            <CardContent>
              {completionReports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No completed work reports yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completionReports.map((report: any) => (
                    <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {report.jobCardNumber}
                          </Badge>
                          <Badge className={
                            report.approvalStatus === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" :
                            report.approvalStatus === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" :
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          }>
                            {report.approvalStatus === "approved" ? "Approved" : 
                             report.approvalStatus === "rejected" ? "Rejected" : "Pending Review"}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-yellow-600">
                            {'★'.repeat(report.customerSatisfaction)}
                            <span className="ml-1 text-gray-500">({report.customerSatisfaction}/5)</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCompletionReport(report);
                              setShowCompletionReportModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Report
                          </Button>
                          
                          {report.approvalStatus === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApproveReport(report)}
                              >
                                ✓ Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleRejectReport(report)}
                              >
                                ✗ Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const reportText = `
COMPLETION REPORT
================
Job Order: ${report.jobCardNumber}
Technician ID: ${report.technicianId}
Issue ID: ${report.issueId}
Completed: ${new Date(report.completedAt).toLocaleString()}

Work Description:
${report.workCompleted}

Materials Used:
${report.materialsUsed.join(', ')}

Time Taken: ${report.timeTaken} minutes
Customer Satisfaction: ${report.customerSatisfaction}/5 stars

Issues Found:
${report.issuesFound}

Recommendations:
${report.recommendations}

Additional Notes:
${report.additionalNotes}
                              `.trim();
                              
                              const blob = new Blob([reportText], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `completion-report-${report.jobCardNumber}.txt`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {report.workCompleted.substring(0, 100)}{report.workCompleted.length > 100 ? '...' : ''}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {report.timeTaken} minutes
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Technician {report.technicianId}
                          </div>
                          {report.materialsUsed && report.materialsUsed.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Wrench className="w-4 h-4" />
                              {report.materialsUsed.length} materials used
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          Completed: {new Date(report.completedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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

      {/* Issue Details Modal */}
      <Dialog open={showIssueDetails} onOpenChange={setShowIssueDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Issue Details - {selectedIssueForDetails?.title}
            </DialogTitle>
            <DialogDescription>
              Complete information for {selectedIssueForDetails?.referenceNumber || `Issue #${selectedIssueForDetails?.id}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedIssueForDetails && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Job Order Number</Label>
                        <p className="text-sm font-mono bg-blue-50 px-2 py-1 rounded mt-1">
                          {generateJobOrderNumber(selectedIssueForDetails.id)}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Reference Number</Label>
                        <p className="text-sm mt-1">{selectedIssueForDetails.referenceNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Category</Label>
                        <p className="text-sm mt-1 capitalize">{selectedIssueForDetails.category.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Priority</Label>
                        <Badge variant="outline" className={`mt-1 ${getPriorityColor(selectedIssueForDetails.priority)}`}>
                          {selectedIssueForDetails.priority}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                        <Badge variant="outline" className={`mt-1 ${getStatusColor(selectedIssueForDetails.status)}`}>
                          {selectedIssueForDetails.status}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Ward</Label>
                        <p className="text-sm mt-1">{selectedIssueForDetails.ward || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Address</Label>
                      <p className="text-sm mt-1">{selectedIssueForDetails.location}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Assignment & Timeline */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assignment Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Assigned To</Label>
                      <p className="text-sm mt-1">{selectedIssueForDetails.assignedTo || 'Unassigned'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Reported By</Label>
                      <p className="text-sm mt-1">{selectedIssueForDetails.reportedBy || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Created</Label>
                      <p className="text-sm mt-1">
                        {new Date(selectedIssueForDetails.createdAt).toLocaleDateString()} at{' '}
                        {new Date(selectedIssueForDetails.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                      <p className="text-sm mt-1">
                        {new Date(selectedIssueForDetails.updatedAt).toLocaleDateString()} at{' '}
                        {new Date(selectedIssueForDetails.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {selectedIssueForDetails.description && (
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">{selectedIssueForDetails.description}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowIssueDetails(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                handleIssueSelection(selectedIssueForDetails.id, true);
                setShowIssueDetails(false);
                setShowExportModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export This Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Issues Report
            </DialogTitle>
            <DialogDescription>
              Export {selectedIssuesForExport.size} selected issue{selectedIssuesForExport.size !== 1 ? 's' : ''} in your preferred format
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <Button 
                onClick={exportAsJSON}
                className="w-full justify-start h-auto p-4"
                variant="outline"
              >
                <FileText className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Export as JSON</div>
                  <div className="text-xs text-gray-500">Structured data format for systems</div>
                </div>
              </Button>
              
              <Button 
                onClick={exportAsCSV}
                className="w-full justify-start h-auto p-4"
                variant="outline"
              >
                <FileText className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Export as CSV</div>
                  <div className="text-xs text-gray-500">Spreadsheet format for analysis</div>
                </div>
              </Button>
              
              <Button 
                onClick={printSelectedIssues}
                className="w-full justify-start h-auto p-4"
                variant="outline"
              >
                <Printer className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Print Report</div>
                  <div className="text-xs text-gray-500">Formatted printable document</div>
                </div>
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Completion Report View Modal */}
      <Dialog open={showCompletionReportModal} onOpenChange={setShowCompletionReportModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completion Report Details</DialogTitle>
            <DialogDescription>
              Full completion report submitted by technician
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompletionReport && (
            <div className="space-y-6">
              {/* Header Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Job Order Number</Label>
                  <p className="text-lg font-semibold text-blue-600">{selectedCompletionReport.jobCardNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Technician ID</Label>
                  <p className="text-lg">{selectedCompletionReport.technicianId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Issue ID</Label>
                  <p className="text-lg">{selectedCompletionReport.issueId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Completed At</Label>
                  <p className="text-lg">{new Date(selectedCompletionReport.completedAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Work Description */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Completed</Label>
                <div className="mt-2 p-3 bg-white dark:bg-gray-900 border rounded-lg">
                  <p className="text-gray-900 dark:text-gray-100">{selectedCompletionReport.workCompleted}</p>
                </div>
              </div>

              {/* Materials Used */}
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Materials Used</Label>
                <div className="mt-2 p-3 bg-white dark:bg-gray-900 border rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {selectedCompletionReport.materialsUsed?.map((material: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Time and Satisfaction */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Taken</Label>
                  <div className="mt-2 p-3 bg-white dark:bg-gray-900 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-lg font-semibold">{selectedCompletionReport.timeTaken} minutes</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Satisfaction</Label>
                  <div className="mt-2 p-3 bg-white dark:bg-gray-900 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-yellow-500">
                        {'★'.repeat(selectedCompletionReport.customerSatisfaction)}
                        {'☆'.repeat(5 - selectedCompletionReport.customerSatisfaction)}
                      </div>
                      <span className="text-lg font-semibold">{selectedCompletionReport.customerSatisfaction}/5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues Found */}
              {selectedCompletionReport.issuesFound && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Issues Found</Label>
                  <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-gray-900 dark:text-gray-100">{selectedCompletionReport.issuesFound}</p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {selectedCompletionReport.recommendations && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Recommendations</Label>
                  <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-gray-900 dark:text-gray-100">{selectedCompletionReport.recommendations}</p>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              {selectedCompletionReport.additionalNotes && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Notes</Label>
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-gray-900 dark:text-gray-100">{selectedCompletionReport.additionalNotes}</p>
                  </div>
                </div>
              )}

              {/* Photos Section */}
              {selectedCompletionReport.photos && selectedCompletionReport.photos.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Photos</Label>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedCompletionReport.photos.map((photo: string, index: number) => (
                      <div key={index} className="border rounded-lg overflow-hidden">
                        <img 
                          src={photo} 
                          alt={`Work photo ${index + 1}`}
                          className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                if (selectedCompletionReport) {
                  const reportText = `
COMPLETION REPORT
================
Job Order: ${selectedCompletionReport.jobCardNumber}
Technician ID: ${selectedCompletionReport.technicianId}
Issue ID: ${selectedCompletionReport.issueId}
Completed: ${new Date(selectedCompletionReport.completedAt).toLocaleString()}

Work Description:
${selectedCompletionReport.workCompleted}

Materials Used:
${selectedCompletionReport.materialsUsed?.join(', ') || 'None specified'}

Time Taken: ${selectedCompletionReport.timeTaken} minutes
Customer Satisfaction: ${selectedCompletionReport.customerSatisfaction}/5 stars

Issues Found:
${selectedCompletionReport.issuesFound || 'None reported'}

Recommendations:
${selectedCompletionReport.recommendations || 'None provided'}

Additional Notes:
${selectedCompletionReport.additionalNotes || 'None'}
                  `.trim();
                  
                  const blob = new Blob([reportText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `completion-report-${selectedCompletionReport.jobCardNumber}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" onClick={() => setShowCompletionReportModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Completion Report</DialogTitle>
            <DialogDescription>
              Confirm approval of completion report {selectedReportForReview?.jobCardNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Review Notes (Optional)</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any feedback or comments about the completed work..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalModal(false)}
              disabled={approveReportMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => approveReportMutation.mutate({ 
                reportId: selectedReportForReview?.id, 
                reviewNotes 
              })}
              disabled={approveReportMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveReportMutation.isPending ? "Approving..." : "Approve Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={showRejectionModal} onOpenChange={setShowRejectionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Completion Report</DialogTitle>
            <DialogDescription>
              Provide feedback for rejection of completion report {selectedReportForReview?.jobCardNumber}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Rejection Reason *</Label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Explain why the work is not satisfactory and what needs to be corrected..."
                className="mt-2"
                rows={4}
                required
              />
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> Rejecting this report will reopen the issue and change its status back to "assigned". 
                The technician will see your feedback and need to address the concerns.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectionModal(false)}
              disabled={rejectReportMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => rejectReportMutation.mutate({ 
                reportId: selectedReportForReview?.id, 
                reviewNotes 
              })}
              disabled={rejectReportMutation.isPending || !reviewNotes.trim()}
              variant="destructive"
            >
              {rejectReportMutation.isPending ? "Rejecting..." : "Reject & Reopen Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
    </div>
  );
}