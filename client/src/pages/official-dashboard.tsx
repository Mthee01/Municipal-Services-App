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
import { Textarea } from "@/components/ui/textarea";
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
  Send,
  Menu,
  X,
  BarChart3,
  Settings,
  Phone,
  MessageSquare
} from "lucide-react";
import { Link } from "wouter";
import type { Issue, Technician, Team, IssueNote, IssueEscalation } from "@shared/schema";
import { TechnicianLocationTracker } from "@/components/technician-location-tracker";

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

export default function OfficialDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set());
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [showLocationTracker, setShowLocationTracker] = useState(false);
  const [showIssueDetails, setShowIssueDetails] = useState(false);
  const [selectedIssueForView, setSelectedIssueForView] = useState<Issue | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState<number[]>([]);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [conversationType, setConversationType] = useState("citizens");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Sidebar configuration
  const sidebarItems = [
    { id: "overview", label: "Call Centre Overview", icon: Phone },
    { id: "issues", label: "Issue Management", icon: AlertCircle },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "teams", label: "Team Coordination", icon: Users },
    { id: "tracking", label: "Live Tracking", icon: MapPin },
    { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
    { id: "settings", label: "Centre Settings", icon: Settings },
  ];

  const handleLogout = () => {
    // Clear frontend authentication data
    localStorage.removeItem("municipalAuth");
    sessionStorage.removeItem("municipalAuth");
    // Redirect to logout endpoint to clear server session
    window.location.href = '/api/auth/logout';
  };

  // Fetch data
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ["/api/issues"],
    refetchInterval: 30000, // Refresh every 30 seconds for call centre
  });

  const { data: technicians = [], isLoading: techsLoading } = useQuery({
    queryKey: ["/api/technicians"],
    refetchInterval: 30000,
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/teams"],
  });

  const { data: analytics = {}, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/analytics/call-centre"],
  });

  // Filter and search issues - MUST be before any conditional returns
  const filteredIssues = useMemo(() => {
    return (issues as Issue[]).filter((issue: Issue) => {
      const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
      const matchesPriority = filterPriority === "all" || issue.priority === filterPriority;
      const matchesCategory = filterCategory === "all" || issue.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  }, [issues, searchTerm, filterStatus, filterPriority, filterCategory]);

  if (issuesLoading || techsLoading || teamsLoading || analyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl mx-auto p-6">
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

  // Calculate stats
  const issuesArray = issues as Issue[];
  const techniciansArray = technicians as Technician[];
  const teamsArray = teams as Team[];
  
  const stats = {
    totalIssues: issuesArray.length,
    openIssues: issuesArray.filter((i: Issue) => i.status === 'open').length,
    assignedIssues: issuesArray.filter((i: Issue) => i.status === 'assigned').length,
    inProgressIssues: issuesArray.filter((i: Issue) => i.status === 'in_progress').length,
    resolvedIssues: issuesArray.filter((i: Issue) => i.status === 'resolved').length,
    activeTechnicians: techniciansArray.filter((t: Technician) => t.status === 'available' || t.status === 'on_job').length,
    activeTeams: teamsArray.length,
    avgResponseTime: 2.5, // Mock data
  };

  const handleSelectIssue = (issueId: number, selected: boolean) => {
    const newSelection = new Set(selectedIssues);
    if (selected) {
      newSelection.add(issueId);
    } else {
      newSelection.delete(issueId);
    }
    setSelectedIssues(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedIssues.size === filteredIssues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(filteredIssues.map((issue: Issue) => issue.id)));
    }
  };

  const handleExportSelected = () => {
    const selectedIssueData = filteredIssues.filter((issue: Issue) => selectedIssues.has(issue.id));
    const csvData = [
      ['RefNo', 'Title', 'Category', 'Priority', 'Status', 'Assigned To', 'Created', 'Location'],
      ...selectedIssueData.map((issue: Issue) => [
        issue.referenceNumber || `REF${issue.id}`,
        issue.title,
        issue.category.replace('_', ' '),
        issue.priority,
        issue.status.replace('_', ' '),
        getTechnicianName(issue.assignedTo),
        formatRelativeTime(issue.createdAt as Date),
        issue.location || 'Not specified'
      ])
    ];
    
    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `call_centre_issues_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: `Exported ${selectedIssues.size} issues to CSV file.`,
    });
  };

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssueForView(issue);
    setShowIssueDetails(true);
  };

  const getTechnicianName = (technicianId: string | number | null) => {
    if (!technicianId) return '-';
    const id = typeof technicianId === 'string' ? parseInt(technicianId) : technicianId;
    const technician = techniciansArray.find((tech: Technician) => tech.id === id);
    return technician ? technician.name : `Tech #${id}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Call Centre Dashboard</h1>
                  <p className="text-sm text-gray-500">Centralized issue coordination and dispatch</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <Phone className="w-4 h-4 mr-1" />
                Call Centre
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
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200 w-full text-left`}
                    >
                      <Icon
                        className={`${
                          activeSection === item.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
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

              {/* Call Centre Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Call Centre Overview</h2>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-900">{stats.totalIssues}</div>
                          <p className="text-xs text-blue-600">All tracked issues</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                          <TriangleAlert className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-900">{stats.openIssues}</div>
                          <p className="text-xs text-orange-600">Awaiting assignment</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Active Technicians</CardTitle>
                          <Wrench className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-900">{stats.activeTechnicians}</div>
                          <p className="text-xs text-green-600">Available & working</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                          <Clock className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-900">{stats.avgResponseTime}h</div>
                          <p className="text-xs text-purple-600">Target: 2.0h</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Report Issue for Citizen */}
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
                      <CardHeader>
                        <CardTitle className="text-blue-900">Report Issue for Citizen</CardTitle>
                        <p className="text-sm text-blue-700">Capture and report issues on behalf of citizens who call or can't use the app</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Phone className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Phone Support</h4>
                                <p className="text-xs text-gray-600">Help citizens report issues over the phone</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Accessibility</h4>
                                <p className="text-xs text-gray-600">Assist citizens who can't use digital platforms</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-blue-200">
                              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-yellow-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">Immediate Action</h4>
                                <p className="text-xs text-gray-600">Issues enter system immediately for processing</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col gap-2">
                            <Button 
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => setShowCreateIssue(true)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              New Citizen Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {filteredIssues.slice(0, 5).map((issue: Issue) => (
                            <div key={issue.id} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <h4 className="font-medium">{issue.title}</h4>
                                <p className="text-sm text-gray-600">{issue.category.replace('_', ' ')}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge className={getPriorityColor(issue.priority)}>
                                  {issue.priority}
                                </Badge>
                                <Badge className={getStatusColor(issue.status)}>
                                  {issue.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Communication Section */}
              {activeSection === "communication" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Communication Centre</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Contact List */}
                      <div className="lg:col-span-1">
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle>Contacts</CardTitle>
                              <Select value={conversationType} onValueChange={setConversationType}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="citizens">Citizens</SelectItem>
                                  <SelectItem value="technicians">Technicians</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {conversationType === "citizens" ? (
                                // Mock citizens data - in real app this would come from API
                                [
                                  { id: 1, name: "John Smith", phone: "+27 82 123 4567", lastMessage: "Issue with water supply", time: "2 min ago", unread: true },
                                  { id: 2, name: "Mary Johnson", phone: "+27 83 234 5678", lastMessage: "Thanks for the update", time: "5 min ago", unread: false },
                                  { id: 3, name: "David Wilson", phone: "+27 84 345 6789", lastMessage: "When will this be fixed?", time: "12 min ago", unread: true },
                                ].map((citizen) => (
                                  <div 
                                    key={citizen.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                      selectedContact?.id === citizen.id
                                        ? 'bg-blue-50 border-blue-200 border'
                                        : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                                    onClick={() => setSelectedContact(citizen)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <h4 className="font-medium text-sm">{citizen.name}</h4>
                                          {citizen.unread && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600">{citizen.phone}</p>
                                        <p className="text-xs text-gray-500 truncate">{citizen.lastMessage}</p>
                                      </div>
                                      <span className="text-xs text-gray-400">{citizen.time}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                // Technicians from actual data
                                techniciansArray.map((technician: any) => (
                                  <div 
                                    key={technician.id}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                      selectedContact?.id === technician.id
                                        ? 'bg-blue-50 border-blue-200 border'
                                        : 'hover:bg-gray-50 border border-transparent'
                                    }`}
                                    onClick={() => setSelectedContact(technician)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <h4 className="font-medium text-sm">{technician.name}</h4>
                                          <div className={`w-2 h-2 rounded-full ${
                                            technician.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                          }`}></div>
                                        </div>
                                        <p className="text-xs text-gray-600">{technician.phone}</p>
                                        <p className="text-xs text-gray-500">{technician.department}</p>
                                      </div>
                                      <span className="text-xs text-gray-400">{technician.status}</span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Chat Interface */}
                      <div className="lg:col-span-2">
                        {selectedContact ? (
                          <Card className="h-[500px] flex flex-col">
                            <CardHeader className="border-b">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-700">
                                    {selectedContact.name.split(' ').map((n: string) => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="font-medium">{selectedContact.name}</h3>
                                  <p className="text-sm text-gray-600">{selectedContact.phone}</p>
                                </div>
                              </div>
                            </CardHeader>
                            
                            {/* Messages Area */}
                            <CardContent className="flex-1 overflow-y-auto p-4">
                              <div className="space-y-4">
                                {/* Sample conversation */}
                                <div className="flex space-x-2">
                                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-gray-600">
                                      {selectedContact.name.split(' ').map((n: string) => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                                      <p className="text-sm">
                                        {conversationType === "citizens" 
                                          ? "Hi, I reported a water leak yesterday. Any updates?"
                                          : "Heading to the site now. Should be there in 15 minutes."
                                        }
                                      </p>
                                    </div>
                                    <span className="text-xs text-gray-500 ml-2">10:30 AM</span>
                                  </div>
                                </div>
                                
                                <div className="flex space-x-2 justify-end">
                                  <div className="flex-1 flex justify-end">
                                    <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                                      <p className="text-sm">
                                        {conversationType === "citizens" 
                                          ? "Thank you for following up. Our technician is on the way and should arrive within the next hour."
                                          : "Perfect! Please update the issue status once you start working on it."
                                        }
                                      </p>
                                    </div>
                                  </div>
                                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-medium text-white">You</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            
                            {/* Message Input */}
                            <div className="border-t p-4">
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Type your message..."
                                  value={messageText}
                                  onChange={(e) => setMessageText(e.target.value)}
                                  className="flex-1"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter' && messageText.trim()) {
                                      // Handle sending message
                                      toast({
                                        title: "Message Sent",
                                        description: `Message sent to ${selectedContact.name}`,
                                      });
                                      setMessageText("");
                                    }
                                  }}
                                />
                                <Button 
                                  onClick={() => {
                                    if (messageText.trim()) {
                                      toast({
                                        title: "Message Sent",
                                        description: `Message sent to ${selectedContact.name}`,
                                      });
                                      setMessageText("");
                                    }
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ) : (
                          <Card className="h-[500px] flex items-center justify-center">
                            <div className="text-center">
                              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Conversation Selected</h3>
                              <p className="text-gray-600">Select a {conversationType === "citizens" ? "citizen" : "technician"} to start messaging</p>
                            </div>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Issue Management Section */}
              {activeSection === "issues" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Issue Management</h2>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6">
                      <div className="flex-1 min-w-64">
                        <Input
                          placeholder="Search issues..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Issues Table */}
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Issues ({filteredIssues.length})</CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleSelectAll}
                            >
                              {selectedIssues.size === filteredIssues.length ? 'Deselect All' : 'Select All'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={selectedIssues.size === 0}
                              onClick={handleExportSelected}
                            >
                              <FileDown className="w-4 h-4 mr-2" />
                              Export ({selectedIssues.size})
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-12">
                                  <Checkbox
                                    checked={selectedIssues.size === filteredIssues.length}
                                    onCheckedChange={handleSelectAll}
                                  />
                                </TableHead>
                                <TableHead>Issue</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredIssues.map((issue: Issue) => (
                                <TableRow key={issue.id}>
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedIssues.has(issue.id)}
                                      onCheckedChange={(checked) => handleSelectIssue(issue.id, checked as boolean)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div>
                                      <div className="font-medium">{issue.title}</div>
                                      <div className="text-xs text-blue-600 font-mono mb-1">
                                        {issue.referenceNumber || `REF${issue.id}`}
                                      </div>
                                      <div className="text-sm text-gray-600 truncate max-w-xs">
                                        {issue.description}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <span className="capitalize">{issue.category.replace('_', ' ')}</span>
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
                                    {getTechnicianName(issue.assignedTo)}
                                  </TableCell>
                                  <TableCell>
                                    {formatRelativeTime(issue.createdAt as Date)}
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleViewIssue(issue)}
                                    >
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Team Coordination Section */}
              {activeSection === "teams" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Coordination</h2>
                    
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Active Teams</CardTitle>
                          <Button onClick={() => setShowCreateTeam(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Team
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {teamsArray.length > 0 ? (
                            teamsArray.map((team: Team) => (
                              <div key={team.id} className="p-4 border rounded-lg">
                                <h4 className="font-medium">{team.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {team.members?.length || 0} members
                                </p>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8">
                              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">No Teams Created</h3>
                              <p className="text-gray-600">Create teams to coordinate technician groups</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Live Tracking Section */}
              {activeSection === "tracking" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Tracking</h2>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Technician Location Tracking</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TechnicianLocationTracker />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Performance Analytics Section */}
              {activeSection === "analytics" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Analytics</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Response Times</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Average Response:</span>
                              <span className="font-medium">{stats.avgResponseTime}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Target Response:</span>
                              <span className="font-medium">2.0h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Performance:</span>
                              <span className="font-medium text-green-600">Good</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Call Centre Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Issues Handled Today:</span>
                              <span className="font-medium">{stats.inProgressIssues + stats.resolvedIssues}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Resolution Rate:</span>
                              <span className="font-medium">78%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Active Technicians:</span>
                              <span className="font-medium">{stats.activeTechnicians}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* Centre Settings Section */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Centre Settings</h2>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Call Centre Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Priority Settings</h4>
                            <p className="text-sm text-gray-600">Configure priority levels and escalation rules</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Notification Preferences</h4>
                            <p className="text-sm text-gray-600">Manage alert settings and communication channels</p>
                          </div>
                          <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Team Management</h4>
                            <p className="text-sm text-gray-600">Configure team structures and assignments</p>
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

      {/* Create Team Dialog */}
      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <h2 className="text-lg font-semibold">Create New Team</h2>
            <p className="text-sm text-gray-600">Set up a new coordination team for technicians</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="team-name" className="text-right">
                Team Name
              </label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                className="col-span-3"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="team-department" className="text-right">
                Department
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="electrical">Electrical Team</SelectItem>
                  <SelectItem value="water">Water & Sanitation Team</SelectItem>
                  <SelectItem value="roads">Roads & Public Works Team</SelectItem>
                  <SelectItem value="waste">Waste Management Team</SelectItem>
                  <SelectItem value="emergency">Emergency Response Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="team-description" className="text-right pt-2">
                Description
              </label>
              <Textarea
                id="team-description"
                placeholder="Team responsibilities and coverage area"
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateTeam(false)}>
              Cancel
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Issue Dialog */}
      <Dialog open={showCreateIssue} onOpenChange={setShowCreateIssue}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <h2 className="text-lg font-semibold">Report Issue for Citizen</h2>
            <p className="text-sm text-gray-600">Create an issue report on behalf of a citizen who called or needs assistance</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="citizen-name" className="text-right">
                Citizen Name
              </label>
              <Input
                id="citizen-name"
                placeholder="Enter citizen's name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="citizen-phone" className="text-right">
                Phone Number
              </label>
              <Input
                id="citizen-phone"
                placeholder="Enter phone number"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="issue-title" className="text-right">
                Issue Title
              </label>
              <Input
                id="issue-title"
                placeholder="Brief description of the issue"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="issue-category" className="text-right">
                Category
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water">Water & Sanitation</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="roads">Roads & Transport</SelectItem>
                  <SelectItem value="waste">Waste Management</SelectItem>
                  <SelectItem value="safety">Safety & Security</SelectItem>
                  <SelectItem value="housing">Housing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="issue-priority" className="text-right">
                Priority
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="issue-location" className="text-right">
                Location
              </label>
              <Input
                id="issue-location"
                placeholder="Address or location description"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="issue-description" className="text-right pt-2">
                Description
              </label>
              <Textarea
                id="issue-description"
                placeholder="Detailed description of the issue as reported by citizen"
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateIssue(false)}>
              Cancel
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Send className="w-4 h-4 mr-2" />
              Submit Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Issue Details Dialog */}
      <Dialog open={showIssueDetails} onOpenChange={setShowIssueDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <h2 className="text-lg font-semibold">Issue Details</h2>
            <p className="text-sm text-gray-600">
              {selectedIssueForView?.referenceNumber || `REF${selectedIssueForView?.id}`}
            </p>
          </DialogHeader>
          {selectedIssueForView && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-gray-700 mt-1">{selectedIssueForView.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm text-gray-700 mt-1 capitalize">
                    {selectedIssueForView.category.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(selectedIssueForView.priority)}>
                      {selectedIssueForView.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedIssueForView.status)}>
                      {selectedIssueForView.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-gray-700 mt-1">
                  {selectedIssueForView.location || 'Location not specified'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-700 mt-1">{selectedIssueForView.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {getTechnicianName(selectedIssueForView.assignedTo)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-gray-700 mt-1">
                    {formatRelativeTime(selectedIssueForView.createdAt as Date)}
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowIssueDetails(false)}>
              Close
            </Button>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <StickyNote className="w-4 h-4 mr-2" />
              Add Notes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}