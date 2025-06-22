import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IssueForm } from "@/components/issue-form";
import { IssueCard } from "@/components/issue-card";
import { PaymentSection } from "@/components/payment-section";
import { CommunityFeatures } from "@/components/community-features";
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-sa-green to-green-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'hsl(220, 85%, 15%)' }}>Report Issues. Track Progress. Build Community.</h2>
          <p className="text-xl text-yellow-600 mb-8">Your voice matters in building better municipal services</p>
          <Button 
            onClick={() => setShowIssueForm(true)}
            className="bg-sa-gold hover:bg-yellow-500 text-black font-semibold px-8 py-4 text-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Report New Issue
          </Button>
          <p className="text-sm text-green-200 mt-2">⚡ Report in under 60 seconds</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((category) => (
              <div key={category.value} className="text-center group cursor-pointer">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-100 transition-colors">
                  <span className="text-2xl">{category.icon}</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{category.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* My Issues Dashboard */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
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
        </div>
      </section>

      {/* Community Hub */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <CommunityFeatures />
        </div>
      </section>

      {/* Payment Section */}
      <PaymentSection />

      {/* Issue Form Modal */}
      <IssueForm 
        isOpen={showIssueForm}
        onClose={() => setShowIssueForm(false)}
      />
    </div>
  );
}
