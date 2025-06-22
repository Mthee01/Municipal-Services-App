import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  Bell, 
  Search, 
  Map, 
  MessageCircle, 
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Filter
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmartNotifications } from "@/components/smart-notifications";
import { AdvancedSearch } from "@/components/advanced-search";
import { InteractiveMaps } from "@/components/interactive-maps";
import { RealTimeChat } from "@/components/real-time-chat";
import { PredictiveAnalytics } from "@/components/predictive-analytics";
import { EnhancedIssueForm } from "@/components/enhanced-issue-form";
import { CommunityFeatures } from "@/components/community-features";
import { useLanguage } from "@/contexts/LanguageContext";

interface DashboardStats {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  activeTechnicians: number;
  avgResolutionTime: number;
  citizenSatisfaction: number;
  emergencyIssues: number;
  pendingPayments: number;
}

export function MasterDashboard() {
  const { t } = useLanguage();
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats", selectedTimeframe],
    refetchInterval: 30000,
  });

  const { data: recentActivity = [] } = useQuery({
    queryKey: ["/api/dashboard/recent-activity"],
    refetchInterval: 15000,
  });

  const { data: systemAlerts = [] } = useQuery({
    queryKey: ["/api/system-alerts/active"],
    refetchInterval: 60000,
  });

  const getStatCard = (
    title: string,
    value: number | string,
    icon: React.ReactNode,
    trend?: { value: number; isPositive: boolean },
    color: string = "blue"
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t.masterDashboard || "Master Dashboard"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t.comprehensiveOverview || "Comprehensive municipality management overview"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowIssueForm(true)}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t.reportIssue || "Report Issue"}
            </Button>
          </div>
        </div>

        {/* System Alerts */}
        {systemAlerts.length > 0 && (
          <div className="space-y-2">
            {systemAlerts.slice(0, 3).map((alert: any) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.severity === "critical" 
                    ? "bg-red-50 border-red-500 dark:bg-red-900/20" 
                    : alert.severity === "warning"
                    ? "bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20"
                    : "bg-blue-50 border-blue-500 dark:bg-blue-900/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`h-4 w-4 ${
                      alert.severity === "critical" 
                        ? "text-red-600" 
                        : alert.severity === "warning"
                        ? "text-yellow-600"
                        : "text-blue-600"
                    }`} />
                    <span className="font-medium">{alert.title}</span>
                    <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">×</Button>
                </div>
                <p className="text-sm mt-1 ml-6">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getStatCard(
            t.totalIssues || "Total Issues",
            stats?.totalIssues || 0,
            <BarChart3 className="h-6 w-6 text-blue-600" />,
            { value: 12, isPositive: false },
            "blue"
          )}
          {getStatCard(
            t.openIssues || "Open Issues",
            stats?.openIssues || 0,
            <AlertTriangle className="h-6 w-6 text-red-600" />,
            { value: 8, isPositive: false },
            "red"
          )}
          {getStatCard(
            t.activeTechnicians || "Active Technicians",
            stats?.activeTechnicians || 0,
            <Users className="h-6 w-6 text-green-600" />,
            { value: 5, isPositive: true },
            "green"
          )}
          {getStatCard(
            t.avgResolutionTime || "Avg Resolution Time",
            `${stats?.avgResolutionTime || 0}h`,
            <Clock className="h-6 w-6 text-purple-600" />,
            { value: 15, isPositive: true },
            "purple"
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <LayoutDashboard className="h-4 w-4" />
              <span>{t.overview || "Overview"}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>{t.notifications || "Notifications"}</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>{t.search || "Search"}</span>
            </TabsTrigger>
            <TabsTrigger value="maps" className="flex items-center space-x-2">
              <Map className="h-4 w-4" />
              <span>{t.maps || "Maps"}</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>{t.analytics || "Analytics"}</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>{t.community || "Community"}</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>{t.recentActivity || "Recent Activity"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 8).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === "issue_created" ? "bg-red-500" :
                          activity.type === "issue_resolved" ? "bg-green-500" :
                          activity.type === "technician_assigned" ? "bg-blue-500" :
                          "bg-gray-500"
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.description}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>{t.performanceMetrics || "Performance Metrics"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.citizenSatisfaction || "Citizen Satisfaction"}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${stats?.citizenSatisfaction || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{stats?.citizenSatisfaction || 0}%</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.resolutionRate || "Resolution Rate"}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${((stats?.resolvedIssues || 0) / (stats?.totalIssues || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round(((stats?.resolvedIssues || 0) / (stats?.totalIssues || 1)) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.emergencyResponse || "Emergency Response"}</span>
                      <Badge variant={stats?.emergencyIssues === 0 ? "default" : "destructive"}>
                        {stats?.emergencyIssues || 0} {t.active || "active"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t.pendingPayments || "Pending Payments"}</span>
                      <Badge variant="secondary">
                        R{((stats?.pendingPayments || 0) / 100).toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t.quickActions || "Quick Actions"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col space-y-2">
                    <AlertTriangle className="h-6 w-6" />
                    <span>{t.reportIssue || "Report Issue"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2">
                    <Users className="h-6 w-6" />
                    <span>{t.assignTechnician || "Assign Technician"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2">
                    <MessageCircle className="h-6 w-6" />
                    <span>{t.communityChat || "Community Chat"}</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col space-y-2">
                    <Settings className="h-6 w-6" />
                    <span>{t.systemSettings || "System Settings"}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <SmartNotifications />
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <AdvancedSearch />
          </TabsContent>

          {/* Maps Tab */}
          <TabsContent value="maps">
            <InteractiveMaps />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <PredictiveAnalytics />
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community">
            <div className="space-y-6">
              <CommunityFeatures />
              <RealTimeChat />
            </div>
          </TabsContent>
        </Tabs>

        {/* Floating Chat Widget */}
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
            onClick={() => {/* Open chat */}}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>

        {/* Enhanced Issue Form Modal */}
        <EnhancedIssueForm 
          isOpen={showIssueForm} 
          onClose={() => setShowIssueForm(false)} 
        />
      </div>
    </div>
  );
}