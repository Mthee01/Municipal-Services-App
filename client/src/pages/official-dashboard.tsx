import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TriangleAlert, Wrench, CheckCircle, Clock, Users, Truck, Plus, FileDown } from "lucide-react";
import { formatRelativeTime, getStatusColor, getPriorityColor } from "@/lib/utils";
import type { Issue, Team } from "@shared/schema";
import type { Statistics } from "@/lib/types";

export default function OfficialDashboard() {
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [wardFilter, setWardFilter] = useState<string>("all");

  const { data: stats, isLoading: statsLoading } = useQuery<Statistics>({
    queryKey: ["/api/stats"],
  });

  const { data: issues = [], isLoading: issuesLoading } = useQuery<Issue[]>({
    queryKey: ["/api/issues"],
  });

  const { data: teams = [], isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const filteredIssues = issues.filter(issue => {
    if (departmentFilter !== "all") {
      const departmentMapping: Record<string, string[]> = {
        "water_sanitation": ["water_sanitation"],
        "electricity": ["electricity"],
        "roads_transport": ["roads_transport"],
        "waste_management": ["waste_management"],
      };
      if (!departmentMapping[departmentFilter]?.includes(issue.category)) return false;
    }
    if (wardFilter !== "all" && issue.ward !== wardFilter) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <TriangleAlert className="h-5 w-5 text-red-500" />;
      case "in_progress":
        return <Wrench className="h-5 w-5 text-yellow-500" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "water_sanitation":
        return "💧";
      case "electricity":
        return "⚡";
      case "roads_transport":
        return "🚗";
      case "waste_management":
        return "🗑️";
      case "safety_security":
        return "🛡️";
      case "housing":
        return "🏠";
      default:
        return "❓";
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
      {/* Dashboard Header */}
      <section className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ADA Smart Munic Dashboard</h2>
              <p className="text-gray-600">Call Centre Operations & Citizen Request Management</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="water_sanitation">Water & Sanitation</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="roads_transport">Roads & Transport</SelectItem>
                  <SelectItem value="waste_management">Waste Management</SelectItem>
                </SelectContent>
              </Select>
              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All Wards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  <SelectItem value="Ward 1">Ward 1</SelectItem>
                  <SelectItem value="Ward 2">Ward 2</SelectItem>
                  <SelectItem value="Ward 3">Ward 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Open Issues</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.openIssues || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <TriangleAlert className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-red-600">Needs attention</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.inProgress || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-yellow-600">Being worked on</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Resolved Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.resolvedToday || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-green-600">Great progress!</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Avg Resolution</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : `${stats?.avgResolution || 0} days`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-green-600">Improving</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issue Management Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Issues</CardTitle>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <Button className="bg-sa-green text-white hover:bg-green-700 text-sm px-3 py-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Assign Technician
                  </Button>
                  <Button variant="outline" className="text-sm px-3 py-2">
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                </div>
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
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                                <div className="text-sm text-gray-500">#{issue.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="capitalize">
                            {issue.category.replace("_", " & ")}
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>{issue.assignedTo || "Unassigned"}</TableCell>
                          <TableCell>{formatRelativeTime(issue.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="text-sa-green hover:text-green-700">
                                View
                              </Button>
                              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                Update
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
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <Truck className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Waste Truck #12</p>
                        <p className="text-sm text-gray-600">Maintenance Bay</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-red-100 text-red-800">Maintenance</Badge>
                      <p className="text-xs text-gray-500 mt-1">Since: 2 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
