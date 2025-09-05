import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Filter, MapPin, X, BarChart3, Users, Clock, CheckCircle, AlertTriangle, TrendingUp, User, Menu, CreditCard, MessageCircle, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { IssueForm } from "@/components/issue-form";
import { IssueCard } from "@/components/issue-card";
import { PaymentSection } from "@/components/payment-section";
import { CommunityFeatures } from "@/components/community-features";
import { VoucherSection } from "@/components/voucher-section";
import { RealTimeNotifications } from "@/components/real-time-notifications";
import { GISMapIntegration } from "@/components/gis-map-integration";
import Chatbot from "@/components/chatbot";
import WhatsAppIntegration from "@/components/whatsapp-integration";
import CitizenWhatsAppCenter from "@/components/citizen-whatsapp-center";
import { useAuth } from "@/hooks/useAuth";
import type { Issue, Technician } from "@shared/schema";

// Helper functions for status and priority colors
function getStatusColor(status: string): string {
  switch (status) {
    case "open":
      return "bg-red-50 text-red-700 border-red-200";
    case "assigned":
      return "text-white border-mtn-blue";
    case "in_progress":
      return "text-black border-mtn-yellow";
    case "resolved":
    case "closed":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "bg-red-50 text-red-700 border-red-200";
    case "high":
      return "bg-orange-50 text-orange-700 border-orange-200";
    case "medium":
      return "text-black border-mtn-yellow";
    case "low":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

const categories = [
  { value: "water_sanitation", label: "Water & Sanitation", icon: "💧" },
  { value: "electricity", label: "Electricity", icon: "⚡" },
  { value: "roads_transport", label: "Roads & Transport", icon: "🚗" },
  { value: "waste_management", label: "Waste Management", icon: "🗑️" },
  { value: "safety_security", label: "Safety & Security", icon: "🛡️" },
  { value: "housing", label: "Housing", icon: "🏠" },
  { value: "other", label: "Other", icon: "❓" },
];

export default function CitizenDashboard() {
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [issueToRate, setIssueToRate] = useState<Issue | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Check URL parameters to auto-open report issue form or navigate to specific tabs
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Handle report issue parameter
    if (urlParams.get('report') === 'true') {
      setShowIssueForm(true);
    }
    
    // Handle tab navigation parameters
    const tabParam = urlParams.get('tab');
    if (tabParam) {
      if (tabParam === 'payments') {
        setActiveSection('payments');
      } else if (tabParam === 'my-issues') {
        setActiveSection('my-issues');
      } else if (tabParam === 'community') {
        setActiveSection('community');
      } else if (tabParam === 'communication') {
        setActiveSection('communication');
      }
    }
    
    // Clean up URL parameters
    if (urlParams.has('report') || urlParams.has('tab')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location]);

  // Sidebar configuration
  const sidebarItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "my-issues", label: "My Issues", icon: FileText },
    { id: "community", label: "Community", icon: Users },
    { id: "map", label: "Map View", icon: MapPin },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "communication", label: "Help & Chat", icon: MessageCircle },
  ];

  const { data: userIssues = [], isLoading: userIssuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues", { user: "current" }],
  });

  // Fetch technicians for name lookup
  const { data: technicians = [] } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
  });

  // Fetch all issues for community view and map display
  const { data: allIssues = [], isLoading: allIssuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
  });

  // Community issues are all issues except user's own (for community tab)
  const currentUserId = currentUser?.id;
  const communityIssues = allIssues.filter(issue => 
    issue.status !== "resolved" && 
    issue.status !== "closed" &&
    (!currentUserId || issue.reporterId !== currentUserId)
  );

  // Filter user issues based on current filters
  const filteredUserIssues = userIssues.filter(issue => {
    const statusMatch = statusFilter === "all" || issue.status === statusFilter;
    const categoryMatch = categoryFilter === "all" || issue.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  // Filter community issues
  const filteredCommunityIssues = communityIssues.filter(issue => {
    const categoryMatch = categoryFilter === "all" || issue.category === categoryFilter;
    return categoryMatch;
  });

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  // Handle issue rating
  const submitRating = useMutation({
    mutationFn: async ({ issueId, rating, feedback }: { issueId: number; rating: number; feedback: string }) => {
      const response = await fetch(`/api/issues/${issueId}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      });
      setShowRatingModal(false);
      setRating(0);
      setFeedback("");
      setIssueToRate(null);
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRateService = (issue: Issue) => {
    setIssueToRate(issue);
    setShowRatingModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Citizen Dashboard</h1>
                  <p className="text-sm text-gray-500">Report issues, track progress, and stay connected</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowIssueForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white hidden md:flex"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
              <RealTimeNotifications userRole="citizen" />
              <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <User className="w-4 h-4 mr-1" />
                Citizen
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
                          ? 'bg-green-50 border-green-300 text-green-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md border-l-4 transition-all duration-200 w-full text-left`}
                    >
                      <Icon
                        className={`${
                          activeSection === item.id ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 flex-shrink-0 h-6 w-6`}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
              
              {/* Quick Report Button in Sidebar for Mobile */}
              <div className="mt-6 pt-4 border-t border-gray-200 px-2 md:hidden">
                <Button 
                  onClick={() => {
                    setShowIssueForm(true);
                    setSidebarOpen(false);
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
              </div>
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

              {/* Dashboard Overview */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Citizen Dashboard</h2>
                    <p className="text-gray-600 mb-6">Report issues, track progress, and stay connected with your community</p>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-blue-600">My Issues</p>
                            <p className="text-2xl font-bold text-blue-900">{userIssues.length}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-8 w-8 text-green-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-green-600">Resolved</p>
                            <p className="text-2xl font-bold text-green-900">
                              {userIssues.filter(issue => issue.status === 'resolved' || issue.status === 'closed').length}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <Clock className="h-8 w-8 text-yellow-600" />
                          <div className="ml-4">
                            <p className="text-sm font-medium text-yellow-600">In Progress</p>
                            <p className="text-2xl font-bold text-yellow-900">
                              {userIssues.filter(issue => issue.status === 'assigned' || issue.status === 'in_progress').length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Categories */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Categories</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-6">
                        {categories.map((category) => (
                          <div 
                            key={category.value} 
                            className="text-center group cursor-pointer"
                            onClick={() => {
                              setCategoryFilter(category.value);
                              setActiveSection('my-issues');
                            }}
                          >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all duration-200 bg-gray-100 group-hover:bg-green-100 group-hover:scale-105">
                              <span className="text-lg sm:text-2xl">{category.icon}</span>
                            </div>
                            <h3 className="font-medium text-xs sm:text-sm text-gray-900">
                              {category.label}
                            </h3>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* My Issues Section */}
              {activeSection === "my-issues" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">My Issues</h2>
                      <div className="flex space-x-4">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="assigned">Assigned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {userIssuesLoading ? (
                      <div className="text-center py-8">Loading your issues...</div>
                    ) : filteredUserIssues.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No issues found matching your filters.</p>
                        <Button 
                          onClick={() => setShowIssueForm(true)}
                          className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Report Your First Issue
                        </Button>
                      </div>
                    ) : (
                      <div className="grid gap-6">
                        {filteredUserIssues.map((issue) => (
                          <IssueCard
                            key={issue.id}
                            issue={issue}
                            onViewDetails={(issue) => {
                              setSelectedIssue(issue);
                              setShowDetailsModal(true);
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Community Section */}
              {activeSection === "community" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Issues</h2>
                    <CommunityFeatures />
                  </div>
                </div>
              )}

              {/* Map View Section */}
              {activeSection === "map" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Map View</h2>
                    <GISMapIntegration issues={allIssues} />
                  </div>
                </div>
              )}

              {/* Payments Section */}
              {activeSection === "payments" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Payments & Vouchers</h2>
                    <Tabs defaultValue="payments" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                        <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
                      </TabsList>
                      <TabsContent value="payments" className="space-y-4">
                        <PaymentSection />
                      </TabsContent>
                      <TabsContent value="vouchers" className="space-y-4">
                        <VoucherSection />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}

              {/* Communication Section */}
              {activeSection === "communication" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Help & Communication</h2>
                    <Tabs defaultValue="whatsapp" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                        <TabsTrigger value="support">Support</TabsTrigger>
                      </TabsList>
                      <TabsContent value="whatsapp" className="space-y-4">
                        <CitizenWhatsAppCenter />
                      </TabsContent>
                      <TabsContent value="support" className="space-y-4">
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">Need help? Our support team is here to assist you.</p>
                          <p className="text-sm text-gray-500">You can also use the chat widget in the bottom right corner.</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>
      </div>

      {/* Issue Form Modal */}
      {showIssueForm && (
        <IssueForm
          isOpen={showIssueForm}
          onClose={() => setShowIssueForm(false)}
        />
      )}

      {/* Issue Details Modal */}
      {showDetailsModal && selectedIssue && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedIssue.title}</DialogTitle>
              <DialogDescription>
                Issue #{selectedIssue.referenceNumber} • {selectedIssue.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm text-gray-600">{selectedIssue.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedIssue.status)}>
                    {selectedIssue.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedIssue.priority)}>
                    {selectedIssue.priority.replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Location</Label>
                <p className="text-sm text-gray-600">{selectedIssue.location}</p>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Reported</Label>
                <p className="text-sm text-gray-600">{new Date(selectedIssue.createdAt).toLocaleDateString()}</p>
              </div>

              {selectedIssue.assignedTo && (
                <div>
                  <Label className="text-sm font-medium">Assigned To</Label>
                  <p className="text-sm text-gray-600">Technician #{selectedIssue.assignedTo}</p>
                </div>
              )}

              {selectedIssue.rating && (
                <div>
                  <Label className="text-sm font-medium">Your Rating</Label>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className={star <= selectedIssue.rating! ? "text-yellow-400" : "text-gray-300"}>
                        ⭐
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">({selectedIssue.rating}/5 stars)</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)} className="min-w-[100px]">
                Close
              </Button>
              {(selectedIssue.status === 'resolved' || selectedIssue.status === 'closed') && !selectedIssue.rating && (
                <Button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleRateService(selectedIssue);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Rate Service
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rating Modal */}
      {showRatingModal && issueToRate && (
        <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Rate Service</DialogTitle>
              <DialogDescription>
                How would you rate the service for "{issueToRate.title}"?
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Rating</Label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600">({rating}/5 stars)</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-sm font-medium">Feedback (Optional)</Label>
                <Textarea 
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience..."
                  className="min-h-[80px]"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowRatingModal(false)}
                disabled={submitRating.isPending}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => submitRating.mutate({ 
                  issueId: issueToRate.id, 
                  rating, 
                  feedback 
                })}
                disabled={rating === 0 || submitRating.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {submitRating.isPending ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Floating Chatbot */}
      <Chatbot userId={currentUser?.id || 1} />
    </div>
  );
}