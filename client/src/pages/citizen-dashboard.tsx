import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Filter, MapPin, X } from "lucide-react";
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
import type { Issue } from "@shared/schema";

// Helper functions for status and priority colors
function getStatusColor(status: string): string {
  switch (status) {
    case "open":
      return "bg-red-50 text-red-700 border-red-200";
    case "assigned":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "in_progress":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
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
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
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
  const [location] = useLocation();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      // For now, just scroll to the relevant section or show appropriate content
      // In a full implementation, you would have actual tabs to switch to
      if (tabParam === 'payments') {
        // Could navigate to payments section
        console.log('Navigate to payments section');
      } else if (tabParam === 'my-issues') {
        // Could filter to show only user's issues
        console.log('Show user issues');
      } else if (tabParam === 'community') {
        // Could show community forum section
        console.log('Navigate to community section');
      } else if (tabParam === 'communication') {
        // Could open chat/help section
        console.log('Open communication/help section');
      }
    }
    
    // Clean up URL parameters
    if (urlParams.has('report') || urlParams.has('tab')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location]);

  const { data: userIssues = [], isLoading: userIssuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues", { user: "current" }],
  });

  // Fetch technicians for name lookup
  const { data: technicians = [] } = useQuery({
    queryKey: ["/api/technicians"],
  });

  // Fetch all issues for community view and map display
  const { data: allIssues = [], isLoading: allIssuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
  });

  // Community issues are all issues except user's own (for community tab)
  const communityIssues = allIssues.filter(issue => 
    issue.status !== "resolved" && issue.status !== "closed"
  ).slice(0, 6);

  const filteredUserIssues = userIssues.filter(issue => {
    if (statusFilter !== "all" && issue.status !== statusFilter) return false;
    if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
    return true;
  });

  // Filter community issues for display

  const handleRateService = (issue: Issue) => {
    console.log("Opening rating modal for", issue);
    setIssueToRate(issue);
    setRating(0);
    setFeedback("");
    setShowRatingModal(true);
  };

  const submitRating = useMutation({
    mutationFn: async ({ issueId, rating, feedback }: { issueId: number; rating: number; feedback: string }) => {
      const response = await fetch(`/api/issues/${issueId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, feedback }),
      });
      if (!response.ok) throw new Error('Failed to submit rating');
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
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemovePhoto = async (issueId: number, photoIndex: number) => {
    try {
      const response = await fetch(`/api/issues/${issueId}/photos/${photoIndex}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove photo');
      }
      
      toast({
        title: "Photo removed",
        description: "The photo has been removed successfully.",
      });
      
      // Refresh the issues data
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      
      // Update the selected issue if it's the same one
      if (selectedIssue && selectedIssue.id === issueId) {
        const updatedResponse = await fetch(`/api/issues/${issueId}`);
        if (updatedResponse.ok) {
          const updatedIssue = await updatedResponse.json();
          setSelectedIssue(updatedIssue);
        }
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove photo. Please try again.",
        variant: "destructive",
      });
    }
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

      {/* Hero Section */}
      <section className="relative z-10 bg-gradient-to-r from-sa-green to-green-600 text-white py-8 sm:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 sm:mb-8 space-y-4 lg:space-y-0">
            <div className="text-center lg:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4" style={{ color: 'hsl(220, 85%, 15%)' }}>Report Issues. Track Progress. Build Community.</h2>
              <p className="text-lg sm:text-xl text-yellow-600 mb-4 sm:mb-8">Your voice matters in building better municipal services</p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <RealTimeNotifications userRole="citizen" />
            </div>
          </div>
          <div className="text-center">
            <Button 
              onClick={() => setShowIssueForm(true)}
              className="bg-sa-gold hover:bg-yellow-500 text-black font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto"
            >
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Report New Issue
            </Button>
            <p className="text-xs sm:text-sm text-red-500 font-bold mt-2">⚡ Report in under 60 seconds</p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative z-10 py-12 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Service Categories</h2>
            {categoryFilter !== "all" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCategoryFilter("all")}
                className="text-gray-600 hover:text-gray-900"
              >
                Clear Filter
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-6">
            {categories.map((category) => (
              <div 
                key={category.value} 
                className="text-center group cursor-pointer"
                onClick={() => setCategoryFilter(category.value)}
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 transition-all duration-200 ${
                  categoryFilter === category.value 
                    ? 'bg-green-200 ring-2 ring-green-500 scale-110' 
                    : 'bg-gray-100 group-hover:bg-green-100 group-hover:scale-105'
                }`}>
                  <span className="text-lg sm:text-2xl">{category.icon}</span>
                </div>
                <h3 className={`font-medium text-xs sm:text-sm transition-colors ${
                  categoryFilter === category.value 
                    ? 'text-green-700 font-semibold' 
                    : 'text-gray-900'
                }`}>
                  {category.label}
                </h3>
              </div>
            ))}
          </div>
          
          {categoryFilter !== "all" && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Showing {categories.find(c => c.value === categoryFilter)?.label} issues
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Tabbed Dashboard */}
      <section className="relative z-10 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Tabs defaultValue="my-issues" className="space-y-6">
            <div className="w-full overflow-x-auto scrollbar-hide">
              <TabsList className="flex w-max min-w-full mobile-tabs p-1 bg-muted rounded-lg">
                <TabsTrigger value="my-issues" className="flex-shrink-0 mobile-tab-trigger px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap min-h-[40px] sm:min-h-[44px] flex items-center justify-center">
                  My Issues
                </TabsTrigger>
                <TabsTrigger value="community" className="flex-shrink-0 mobile-tab-trigger px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap min-h-[40px] sm:min-h-[44px] flex items-center justify-center">
                  Community
                </TabsTrigger>
                <TabsTrigger value="map-view" className="flex-shrink-0 mobile-tab-trigger px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm whitespace-nowrap min-h-[40px] sm:min-h-[44px] flex items-center justify-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex-shrink-0 mobile-tab-trigger px-3 py-3 text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center justify-center">
                  Payments
                </TabsTrigger>
                <TabsTrigger value="vouchers" className="flex-shrink-0 mobile-tab-trigger px-3 py-3 text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center justify-center">
                  Vouchers
                </TabsTrigger>
                <TabsTrigger value="communication" className="flex-shrink-0 mobile-tab-trigger px-3 py-3 text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center justify-center">
                  Support
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex-shrink-0 mobile-tab-trigger px-3 py-3 text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center justify-center">
                  WhatsApp
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="my-issues" className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                <h3 className="text-2xl font-bold text-gray-900">My Recent Issues</h3>
                <div className="flex flex-wrap gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All Categories" />
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
            <div className="text-center py-12">
              <p className="text-gray-600">Loading your issues...</p>
            </div>
          ) : filteredUserIssues.length > 0 ? (
            <div className="space-y-6">
              {filteredUserIssues.map((issue) => (
                <IssueCard 
                  key={issue.id} 
                  issue={issue} 
                  onViewDetails={(issue) => {
                    setSelectedIssue(issue);
                    setShowDetailsModal(true);
                  }}
                  onRate={handleRateService}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                {statusFilter !== "all" || categoryFilter !== "all" 
                  ? "No issues match your filters."
                  : "You haven't reported any issues yet."
                }
              </p>
              <Button onClick={() => setShowIssueForm(true)} className="bg-sa-green hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Report Your First Issue
              </Button>
            </div>
          )}
          </TabsContent>

            <TabsContent value="community" className="space-y-6">
              <CommunityFeatures />
            </TabsContent>

            <TabsContent value="map-view" className="space-y-6">
              <GISMapIntegration 
                issues={allIssues}
                onIssueSelect={(issue) => {
                  console.log('Selected issue from map:', issue);
                  setSelectedIssue(issue);
                  setShowDetailsModal(true);
                }}
                height="600px"
              />
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <PaymentSection />
            </TabsContent>

            <TabsContent value="vouchers" className="space-y-6">
              <VoucherSection />
            </TabsContent>

            <TabsContent value="communication" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WhatsAppIntegration userId={1} />
                <div className="space-y-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Communication Features</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          💬
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">AI Assistant</h4>
                          <p className="text-sm text-blue-700">Get instant help with municipal services via our smart chatbot</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          📱
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900">WhatsApp Notifications</h4>
                          <p className="text-sm text-green-700">Receive real-time updates about your service requests</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          🔔
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-900">Real-time Alerts</h4>
                          <p className="text-sm text-purple-700">Stay informed about service outages and announcements</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <RealTimeNotifications userRole="citizen" />
                </div>
              </div>
            </TabsContent>

            {/* WhatsApp Center Tab */}
            <TabsContent value="whatsapp" className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Communication Center</h2>
                <p className="text-gray-600">Get immediate assistance from our call center agents via WhatsApp</p>
              </div>
              <CitizenWhatsAppCenter userId={1} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Issue Form Modal */}
      <IssueForm 
        isOpen={showIssueForm}
        onClose={() => setShowIssueForm(false)}
      />

      {/* Issue Details Modal */}
      {selectedIssue && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-semibold truncate">{selectedIssue.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-sm">
                <span>RefNo: {selectedIssue.referenceNumber}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {selectedIssue.location}
                </span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded capitalize">{selectedIssue.category.replace("_", " & ")}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Priority</Label>
                  <div>
                    <Badge variant="outline" className={getPriorityColor(selectedIssue.priority)}>
                      {selectedIssue.priority}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div>
                    <Badge variant="outline" className={getStatusColor(selectedIssue.status)}>
                      {selectedIssue.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    {new Date(selectedIssue.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm leading-relaxed">{selectedIssue.description}</p>
                </div>
              </div>

              {selectedIssue.photos && selectedIssue.photos.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Photos ({selectedIssue.photos.length})</Label>
                    {selectedIssue.status === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          // TODO: Add functionality to add more photos to existing issue
                          toast({
                            title: "Coming Soon",
                            description: "Photo editing will be available soon",
                          });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Photos
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedIssue.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Issue photo ${index + 1}`}
                          className="w-full h-40 sm:h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:shadow-lg transition-all"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                            e.currentTarget.className += ' opacity-50';
                          }}
                          onClick={() => {
                            // Open photo in new window for full view
                            window.open(photo, '_blank');
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center">
                            <div className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-md text-sm font-medium">
                              Click to enlarge
                            </div>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          Photo {index + 1}
                        </div>
                        {selectedIssue.status === 'open' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 left-2 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(selectedIssue.id, index);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedIssue.assignedTo && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Assigned Technician</Label>
                  <p className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-2 rounded border border-blue-200 dark:border-blue-800">
                    {(() => {
                      const technician = technicians.find(t => t.id === parseInt(selectedIssue.assignedTo!));
                      return technician ? `${technician.name} (${technician.department})` : `Technician ID: ${selectedIssue.assignedTo}`;
                    })()}
                  </p>
                </div>
              )}

              {(selectedIssue.status === 'resolved' || selectedIssue.status === 'closed') && selectedIssue.resolvedAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Resolved Date</Label>
                  <p className="text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-2 rounded border border-green-200 dark:border-green-800">
                    {new Date(selectedIssue.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedIssue.feedback && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Resolution Notes</Label>
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-700 dark:text-green-400">{selectedIssue.feedback}</p>
                  </div>
                </div>
              )}

              {selectedIssue.rating && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Your Rating</Label>
                  <div className="flex items-center space-x-1">
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
                  className="bg-sa-gold hover:bg-yellow-500 text-black"
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
                <Label htmlFor="feedback" className="text-sm font-medium">
                  Additional Comments (Optional)
                </Label>
                <Textarea
                  id="feedback"
                  placeholder="Share your experience..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
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
                className="bg-sa-gold hover:bg-yellow-500 text-black"
              >
                {submitRating.isPending ? "Submitting..." : "Submit Rating"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showIssueForm && (
        <IssueForm
          isOpen={showIssueForm}
          onClose={() => setShowIssueForm(false)}
        />
      )}

      {/* Floating Chatbot */}
      <Chatbot userId={1} />
    </div>
  );
}
