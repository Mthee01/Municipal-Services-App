import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Filter, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [location] = useLocation();

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

  const { data: communityIssues = [], isLoading: communityIssuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues", { community: true }],
  });

  const filteredUserIssues = userIssues.filter(issue => {
    if (statusFilter !== "all" && issue.status !== statusFilter) return false;
    if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
    return true;
  });

  const filteredCommunityIssues = communityIssues.filter(issue => 
    issue.status !== "resolved" && issue.status !== "closed"
  ).slice(0, 6);

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
      <section className="relative z-10 bg-gradient-to-r from-sa-green to-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <h2 className="text-4xl font-bold mb-4" style={{ color: 'hsl(220, 85%, 15%)' }}>Report Issues. Track Progress. Build Community.</h2>
              <p className="text-xl text-yellow-600 mb-8">Your voice matters in building better municipal services</p>
            </div>
            <RealTimeNotifications userRole="citizen" />
          </div>
          <div className="text-center">
            <Button 
              onClick={() => setShowIssueForm(true)}
              className="bg-sa-gold hover:bg-yellow-500 text-black font-semibold px-8 py-4 text-lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Report New Issue
            </Button>
            <p className="text-sm text-red-500 font-bold mt-2">⚡ Report in under 60 seconds</p>
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((category) => (
              <div 
                key={category.value} 
                className="text-center group cursor-pointer"
                onClick={() => setCategoryFilter(category.value)}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-200 ${
                  categoryFilter === category.value 
                    ? 'bg-green-200 ring-2 ring-green-500 scale-110' 
                    : 'bg-gray-100 group-hover:bg-green-100 group-hover:scale-105'
                }`}>
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className={`font-medium text-sm transition-colors ${
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
                <TabsTrigger value="my-issues" className="flex-shrink-0 mobile-tab-trigger px-3 py-3 text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center justify-center">
                  Issues
                </TabsTrigger>
                <TabsTrigger value="community" className="flex-shrink-0 mobile-tab-trigger px-3 py-3 text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center justify-center">
                  Community
                </TabsTrigger>
                <TabsTrigger value="map-view" className="flex-shrink-0 mobile-tab-trigger px-3 py-3 text-xs sm:text-sm whitespace-nowrap min-h-[44px] flex items-center justify-center">
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

            <TabsContent value="my-issues" className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
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
                  onViewDetails={(issue) => console.log("View details", issue)}
                  onRate={(issue) => console.log("Rate issue", issue)}
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
                issues={[...userIssues, ...communityIssues]} 
                onIssueSelect={(issue) => console.log('Selected issue:', issue)}
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

      {/* Floating Chatbot */}
      <Chatbot userId={1} />
    </div>
  );
}
