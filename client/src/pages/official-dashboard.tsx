import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  MessageCircle,
  StickyNote,
  AlertCircle,
  Send
} from "lucide-react";
import { Link } from "wouter";
import type { Issue, Technician, Team, IssueNote, IssueEscalation } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";

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
  const { user } = useAuth();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportEmail, setExportEmail] = useState("");
  const [exportMethod, setExportMethod] = useState("email");
  const [exportScope, setExportScope] = useState("current"); // "current", "all", "selected"
  const [selectedTickets, setSelectedTickets] = useState<Set<number>>(new Set());
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [newNote, setNewNote] = useState("");
  const [escalationReason, setEscalationReason] = useState("");

  // Queries - Real-time issue fetching for call center agents
  const { data: issues = [], isLoading: issuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
    refetchInterval: 5000, // Refetch every 5 seconds to catch new citizen issues
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Call center agents monitor issues but don't need technician data for assignments
  // Technician management is handled by tech managers

  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/whatsapp/unread-count"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch issue notes and escalations for selected issue
  const { data: issueNotes = [], isLoading: notesLoading } = useQuery<IssueNote[]>({
    queryKey: [`/api/issues/${selectedIssue?.id}/notes`],
    queryFn: async () => {
      const data = await apiRequest("GET", `/api/issues/${selectedIssue?.id}/notes`);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!selectedIssue,
    refetchInterval: 5000, // Refresh notes every 5 seconds
    staleTime: 0, // Always refetch
    cacheTime: 0 // Don't cache
  });

  const { data: issueEscalations = [] } = useQuery<IssueEscalation[]>({
    queryKey: ["/api/issues", selectedIssue?.id, "escalations"],
    enabled: !!selectedIssue
  });

  // Mutations for notes and escalations
  const addNoteMutation = useMutation({
    mutationFn: async (data: { issueId: number; note: string }) => {
      const createdBy = user?.name || user?.username || "Unknown User";
      const createdByRole = user?.role || "call_center_agent";
      
      return apiRequest("POST", `/api/issues/${data.issueId}/notes`, {
        note: data.note,
        noteType: "general",
        createdBy,
        createdByRole
      });
    },
    onSuccess: () => {
      // Force immediate refetch of notes
      queryClient.invalidateQueries({ queryKey: [`/api/issues/${selectedIssue?.id}/notes`] });
      queryClient.refetchQueries({ queryKey: [`/api/issues/${selectedIssue?.id}/notes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      setNewNote("");
      toast({
        title: "Success",
        description: "Note added successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  });

  const escalateMutation = useMutation({
    mutationFn: async (data: { issueId: number; reason: string }) => {
      return apiRequest("POST", `/api/issues/${data.issueId}/escalate`, {
        escalationReason: data.reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/issues", selectedIssue?.id, "escalations"] });
      setEscalationReason("");
      setShowEscalateModal(false);
      toast({
        title: "Success",
        description: "Issue escalated to Technical Manager successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to escalate issue",
        variant: "destructive",
      });
    }
  });

  // Filtered issues with priority for new citizen reports, excluding resolved issues
  const filteredIssues = useMemo(() => {
    const filtered = issues.filter((issue: Issue) => {
      // Exclude resolved issues from call center dashboard
      if (issue.status === 'resolved') {
        return false;
      }
      
      const searchLower = searchTerm.toLowerCase().trim();
      
      // If search term is empty, show all issues
      if (!searchLower) {
        return true;
      }
      
      // If search term matches RefNo exactly, return only that issue
      if (issue.referenceNumber && issue.referenceNumber.toLowerCase() === searchLower) {
        return true;
      }
      
      // If search term is 6 characters (RefNo format), only search by RefNo
      if (searchLower.length === 6) {
        return issue.referenceNumber && issue.referenceNumber.toLowerCase().includes(searchLower);
      }
      
      // Also check if search term is a padded ID (like "000018" for issue ID 18)
      if (searchLower.match(/^0+\d+$/)) {
        const numericId = parseInt(searchLower);
        if (issue.id === numericId) {
          return true;
        }
        // Also check if it matches the fallback format
        const fallbackRef = String(issue.id).padStart(6, '0');
        if (fallbackRef.toLowerCase() === searchLower) {
          return true;
        }
      }
      
      // For other searches, search in multiple fields
      return issue.title.toLowerCase().includes(searchLower) ||
             issue.description.toLowerCase().includes(searchLower) ||
             issue.location.toLowerCase().includes(searchLower) ||
             issue.category.toLowerCase().includes(searchLower);
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

  // Calculate statistics from issues
  const stats = useMemo(() => {
    const totalIssues = issues.length;
    const openIssues = issues.filter(issue => issue.status === 'open').length;
    const assignedIssues = issues.filter(issue => issue.status === 'assigned').length;
    const resolvedIssues = issues.filter(issue => issue.status === 'resolved').length;
    const criticalIssues = issues.filter(issue => issue.priority === 'high' || issue.priority === 'urgent').length;
    
    return {
      totalIssues,
      openIssues,
      assignedIssues,
      resolvedIssues,
      criticalIssues,
      resolutionRate: totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0
    };
  }, [issues]);

  // Handle notes and escalation
  const handleViewNotes = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowNotesModal(true);
  };

  const handleEscalateIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setShowEscalateModal(true);
  };

  const handleAddNote = () => {
    if (selectedIssue && newNote.trim()) {
      addNoteMutation.mutate({
        issueId: selectedIssue.id,
        note: newNote.trim()
      });
    }
  };

  const handleConfirmEscalation = () => {
    if (selectedIssue && escalationReason.trim()) {
      escalateMutation.mutate({
        issueId: selectedIssue.id,
        reason: escalationReason.trim()
      });
    }
  };

  // Handle ticket selection
  const toggleTicketSelection = (ticketId: number) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const selectAllVisibleTickets = () => {
    const allVisibleIds = new Set(filteredIssues.map(issue => issue.id));
    setSelectedTickets(allVisibleIds);
  };

  const clearTicketSelection = () => {
    setSelectedTickets(new Set());
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

    // Determine which issues to export based on scope
    let issuesToExport: Issue[] = [];
    let exportDescription = "";

    switch (exportScope) {
      case "current":
        issuesToExport = filteredIssues;
        exportDescription = `Currently displayed issues (${filteredIssues.length} items)`;
        break;
      case "all":
        issuesToExport = issues;
        exportDescription = `All issues (${issues.length} items)`;
        break;
      case "selected":
        if (selectedTickets.size === 0) {
          toast({
            title: "Error",
            description: "Please select at least one ticket to export",
            variant: "destructive",
          });
          return;
        }
        issuesToExport = issues.filter(issue => selectedTickets.has(issue.id));
        exportDescription = `Selected tickets (${selectedTickets.size} items)`;
        break;
      default:
        issuesToExport = filteredIssues;
        exportDescription = `Currently displayed issues (${filteredIssues.length} items)`;
    }

    const csvContent = [
      ['ID', 'Ref No', 'Title', 'Category', 'Priority', 'Status', 'Location', 'Ward', 'Assigned To', 'Created', 'Reporter'],
      ...issuesToExport.map(issue => [
        issue.id,
        issue.referenceNumber || `Issue-${issue.id}`,
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
          description: `Report (${exportDescription}) sent to ${exportEmail}`,
        });
        setShowExportModal(false);
        setExportEmail("");
        setSelectedTickets(new Set());
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
        description: `Report (${exportDescription}) downloaded successfully`,
      });
      setShowExportModal(false);
      setSelectedTickets(new Set());
    }
  };



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
                    <p className="text-sm font-medium text-gray-600">Active Issues</p>
                    <p className="text-2xl font-bold text-red-600">{filteredIssues.length}</p>
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
                  placeholder="Enter RefNo (e.g. B41419, 68BE82) or search title/location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Selection Summary Bar */}
              {selectedTickets.size > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-blue-800">
                      <strong>{selectedTickets.size}</strong> ticket(s) selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearTicketSelection}
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleExportReport}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                </div>
              )}
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
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedTickets.size === filteredIssues.length && filteredIssues.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectAllVisibleTickets();
                              } else {
                                clearTicketSelection();
                              }
                            }}
                            className="h-4 w-4"
                            title="Select all visible tickets"
                          />
                        </TableHead>
                        <TableHead>RefNo</TableHead>
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
                            <Checkbox
                              checked={selectedTickets.has(issue.id)}
                              onCheckedChange={() => toggleTicketSelection(issue.id)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm font-semibold text-blue-600">
                              {issue.referenceNumber}
                            </div>
                          </TableCell>
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
                            <div className="flex space-x-1">
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
                                variant="outline"
                                onClick={() => handleEscalateIssue(issue)}
                                className="text-xs"
                                disabled={issue.priority === "urgent"}
                              >
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Escalate
                              </Button>
                            </div>
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
              variant="outline" 
              className="text-sm px-4 py-2"
              onClick={handleExportReport}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <div className="text-center text-sm text-gray-600">
              <p>Note: Issue assignments are managed by Technical Managers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Issue Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Issue Notes - {selectedIssue?.title}</DialogTitle>
            <DialogDescription>
              View and add notes for this issue. Notes help track communication and progress.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Add new note */}
            <div className="border-b pb-4">
              <Label htmlFor="new-note">Add New Note</Label>
              <Textarea
                id="new-note"
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mt-2"
                rows={3}
              />
              <Button 
                onClick={handleAddNote}
                disabled={!newNote.trim() || addNoteMutation.isPending}
                className="mt-2"
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {addNoteMutation.isPending ? "Adding..." : "Add Note"}
              </Button>
            </div>

            {/* Existing notes */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Previous Notes</h4>
              {notesLoading ? (
                <p className="text-gray-500 text-sm">Loading notes...</p>
              ) : !Array.isArray(issueNotes) || issueNotes.length === 0 ? (
                <p className="text-gray-500 text-sm">No notes yet for this issue.</p>
              ) : (
                issueNotes.map((note) => (
                  <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-gray-900">{note.createdBy}</span>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.note}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Note
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Escalation Modal */}
      <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Escalate Issue - {selectedIssue?.title}</DialogTitle>
            <DialogDescription>
              Escalate this issue to the Technical Manager. Provide a clear reason for escalation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-800">
                  This will mark the issue as URGENT priority
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="escalation-reason">Escalation Reason *</Label>
              <Textarea
                id="escalation-reason"
                placeholder="Please provide a detailed reason for escalating this issue..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Show existing escalations */}
            {issueEscalations.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Previous Escalations</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {issueEscalations.map((escalation) => (
                    <div key={escalation.id} className="bg-red-50 p-2 rounded text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium">{escalation.escalatedBy}</span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(escalation.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{escalation.escalationReason}</p>
                      <Badge variant="destructive" className="mt-1 text-xs">
                        {escalation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEscalateModal(false);
                  setSelectedIssue(null);
                  setEscalationReason("");
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmEscalation}
                disabled={!escalationReason.trim() || escalateMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                {escalateMutation.isPending ? "Escalating..." : "Escalate to Tech Manager"}
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
                {issuesLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600">Loading teams...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Electrical Team A</p>
                          <p className="text-sm text-gray-600">Currently: Ward 5 - Main Street</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                        <p className="text-xs text-gray-500 mt-1">Updated 2 hours ago</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Water & Sanitation Team B</p>
                          <p className="text-sm text-gray-600">Currently: Ward 3 - Pump Station</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-yellow-100 text-yellow-800">On Job</Badge>
                        <p className="text-xs text-gray-500 mt-1">Updated 30 min ago</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Roads & Public Works Team</p>
                          <p className="text-sm text-gray-600">Currently: Ward 7 - Highway Maintenance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                        <p className="text-xs text-gray-500 mt-1">Updated 1 hour ago</p>
                      </div>
                    </div>
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

      {/* Notes Modal */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Issue Notes - {selectedIssue?.title}</DialogTitle>
            <DialogDescription>
              View and add notes for this issue
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Existing notes */}
            <div className="max-h-60 overflow-y-auto space-y-2">
              {notesLoading ? (
                <p className="text-gray-500 text-center py-4">Loading notes...</p>
              ) : !Array.isArray(issueNotes) || issueNotes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No notes yet</p>
              ) : (
                issueNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-gray-900">{note.createdBy}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{note.note}</p>
                  </div>
                ))
              )}
            </div>
            
            {/* Add new note */}
            <div className="space-y-2">
              <Label htmlFor="new-note">Add Note</Label>
              <Textarea
                id="new-note"
                placeholder="Enter your note about this issue..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddNote}
              disabled={!newNote.trim() || addNoteMutation.isPending}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              {addNoteMutation.isPending ? "Adding..." : "Add Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Modal */}
      <Dialog open={showEscalateModal} onOpenChange={setShowEscalateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Issue - {selectedIssue?.title}</DialogTitle>
            <DialogDescription>
              Escalate this issue to the Technical Manager. This will mark it as URGENT priority.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="escalation-reason">Reason for Escalation</Label>
              <Textarea
                id="escalation-reason"
                placeholder="Explain why this issue needs immediate attention..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmEscalation}
              disabled={!escalationReason.trim() || escalateMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {escalateMutation.isPending ? "Escalating..." : "Escalate to Tech Manager"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {/* Export Scope Selection */}
            <div className="space-y-4">
              <Label htmlFor="export-scope">What to Export</Label>
              <Select value={exportScope} onValueChange={setExportScope}>
                <SelectTrigger>
                  <SelectValue placeholder="Select export scope" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current">
                    Currently Displayed Issues ({filteredIssues.length} items)
                  </SelectItem>
                  <SelectItem value="all">
                    All Issues ({issues.length} items)
                  </SelectItem>
                  <SelectItem value="selected">
                    Selected Tickets ({selectedTickets.size} items)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Show info about selected scope */}
            {exportScope === "selected" && selectedTickets.size === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  No tickets selected. Please select tickets from the table to export them.
                </p>
              </div>
            )}
            
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