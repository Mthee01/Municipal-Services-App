import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  AlertTriangle, 
  Target, 
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  Zap,
  Users,
  MapPin
} from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

interface AIInsight {
  id: string;
  type: "prediction" | "anomaly" | "recommendation" | "trend";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  category: string;
  actionRequired: boolean;
  data?: any;
}

interface AnalyticsData {
  issueResolutionTrend: Array<{ month: string; resolved: number; predicted: number }>;
  departmentPerformance: Array<{ department: string; efficiency: number; satisfaction: number }>;
  citizenSentiment: Array<{ category: string; sentiment: number; volume: number }>;
  resourceOptimization: Array<{ resource: string; utilization: number; optimal: number }>;
  predictedDemand: Array<{ service: string; current: number; predicted: number; trend: string }>;
}

export function AIAnalyticsDashboard({ userRole }: { userRole: string }) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    generateAIInsights();
    loadAnalyticsData();
  }, [userRole]);

  const generateAIInsights = async () => {
    setIsGeneratingInsights(true);
    
    // Simulate AI insight generation based on role
    setTimeout(() => {
      const roleBasedInsights = getRoleBasedInsights(userRole);
      setInsights(roleBasedInsights);
      setIsGeneratingInsights(false);
    }, 2000);
  };

  const getRoleBasedInsights = (role: string): AIInsight[] => {
    const baseInsights: AIInsight[] = [
      {
        id: "1",
        type: "prediction",
        title: "Water Infrastructure Stress Prediction",
        description: "AI models predict 23% increase in water-related issues in Ward 2 over next 30 days due to seasonal patterns and infrastructure age.",
        confidence: 87,
        impact: "high",
        category: "Infrastructure",
        actionRequired: true,
        data: { timeframe: "30 days", affected_area: "Ward 2", probability: 0.87 }
      },
      {
        id: "2",
        type: "anomaly",
        title: "Unusual Service Request Pattern Detected",
        description: "15% spike in electricity-related complaints detected in last 48 hours, significantly above normal variance.",
        confidence: 92,
        impact: "medium",
        category: "Service Delivery",
        actionRequired: true,
        data: { spike_percentage: 15, detection_time: "48 hours", normal_range: "5-8 daily" }
      },
      {
        id: "3",
        type: "recommendation",
        title: "Technician Resource Optimization",
        description: "Deploy 2 additional water technicians to Ward 1 during 10 AM - 2 PM for optimal response times based on historical patterns.",
        confidence: 79,
        impact: "medium",
        category: "Resource Management",
        actionRequired: false,
        data: { recommended_technicians: 2, optimal_hours: "10 AM - 2 PM", efficiency_gain: "18%" }
      },
      {
        id: "4",
        type: "trend",
        title: "Citizen Satisfaction Improvement Trend",
        description: "Overall satisfaction scores trending upward (+12%) following implementation of real-time updates and faster response protocols.",
        confidence: 84,
        impact: "high",
        category: "Citizen Experience",
        actionRequired: false,
        data: { improvement_percentage: 12, factors: ["real-time updates", "faster response"] }
      }
    ];

    // Filter insights based on user role
    switch (role) {
      case "mayor":
        return baseInsights;
      case "tech_manager":
        return baseInsights.filter(i => ["Resource Management", "Infrastructure"].includes(i.category));
      case "ward_councillor":
        return baseInsights.filter(i => i.description.includes("Ward"));
      case "official":
        return baseInsights.filter(i => ["Service Delivery", "Citizen Experience"].includes(i.category));
      default:
        return baseInsights.slice(0, 2);
    }
  };

  const loadAnalyticsData = () => {
    const mockData: AnalyticsData = {
      issueResolutionTrend: [
        { month: "Jan", resolved: 245, predicted: 260 },
        { month: "Feb", resolved: 289, predicted: 295 },
        { month: "Mar", resolved: 312, predicted: 320 },
        { month: "Apr", resolved: 298, predicted: 340 },
        { month: "May", resolved: 356, predicted: 365 },
        { month: "Jun", resolved: 378, predicted: 385 }
      ],
      departmentPerformance: [
        { department: "Water & Sanitation", efficiency: 85, satisfaction: 78 },
        { department: "Electricity", efficiency: 72, satisfaction: 81 },
        { department: "Roads & Transport", efficiency: 68, satisfaction: 74 },
        { department: "Waste Management", efficiency: 91, satisfaction: 86 }
      ],
      citizenSentiment: [
        { category: "Water Services", sentiment: 78, volume: 234 },
        { category: "Electricity", sentiment: 65, volume: 189 },
        { category: "Road Maintenance", sentiment: 82, volume: 156 },
        { category: "Waste Collection", sentiment: 91, volume: 203 }
      ],
      resourceOptimization: [
        { resource: "Technicians", utilization: 87, optimal: 85 },
        { resource: "Vehicles", utilization: 72, optimal: 80 },
        { resource: "Equipment", utilization: 91, optimal: 88 },
        { resource: "Budget", utilization: 78, optimal: 85 }
      ],
      predictedDemand: [
        { service: "Water Repairs", current: 45, predicted: 52, trend: "increasing" },
        { service: "Power Outages", current: 23, predicted: 19, trend: "decreasing" },
        { service: "Road Maintenance", current: 67, predicted: 71, trend: "stable" },
        { service: "Waste Collection", current: 34, predicted: 29, trend: "decreasing" }
      ]
    };
    
    setAnalyticsData(mockData);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "prediction": return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "anomaly": return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "recommendation": return <Target className="h-5 w-5 text-green-500" />;
      case "trend": return <Activity className="h-5 w-5 text-purple-500" />;
      default: return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold">AI-Powered Analytics</h2>
            <p className="text-gray-600">Intelligent insights for municipal management</p>
          </div>
        </div>
        <Button onClick={generateAIInsights} disabled={isGeneratingInsights}>
          {isGeneratingInsights ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Refresh Insights
            </>
          )}
        </Button>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card 
            key={insight.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              insight.actionRequired ? "border-orange-200 bg-orange-50" : ""
            }`}
            onClick={() => setSelectedInsight(insight)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <div>
                    <CardTitle className="text-lg">{insight.title}</CardTitle>
                    <Badge variant="outline" className={getImpactColor(insight.impact)}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                </div>
                {insight.actionRequired && (
                  <Badge variant="destructive" className="text-xs">
                    Action Required
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">{insight.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Confidence:</span>
                  <Progress value={insight.confidence} className="w-20" />
                  <span className="text-sm text-gray-600">{insight.confidence}%</span>
                </div>
                <Badge variant="outline">{insight.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Dashboard */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5" />
                Issue Resolution Trends vs AI Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={analyticsData?.issueResolutionTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="resolved" stroke="#3B82F6" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="AI Prediction" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Department Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="efficiency" fill="#3B82F6" name="Efficiency %" />
                  <Bar dataKey="satisfaction" fill="#10B981" name="Satisfaction %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Citizen Sentiment Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={analyticsData?.citizenSentiment}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="sentiment"
                    label={({ category, sentiment }) => `${category}: ${sentiment}%`}
                  >
                    {analyticsData?.citizenSentiment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyticsData?.predictedDemand.map((prediction, index) => (
              <Card key={prediction.service}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {prediction.service}
                    <Badge variant={prediction.trend === "increasing" ? "destructive" : 
                                  prediction.trend === "decreasing" ? "default" : "secondary"}>
                      {prediction.trend}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current:</span>
                      <span className="font-medium">{prediction.current} cases</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Predicted:</span>
                      <span className="font-medium">{prediction.predicted} cases</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Change:</span>
                      <span className={`font-medium ${
                        prediction.predicted > prediction.current ? "text-red-600" : "text-green-600"
                      }`}>
                        {prediction.predicted > prediction.current ? "+" : ""}
                        {((prediction.predicted - prediction.current) / prediction.current * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Insight Modal */}
      {selectedInsight && (
        <Card className="fixed inset-4 z-50 overflow-auto bg-white shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {getInsightIcon(selectedInsight.type)}
                <div>
                  <CardTitle>{selectedInsight.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getImpactColor(selectedInsight.impact)}>
                      {selectedInsight.impact} impact
                    </Badge>
                    <Badge variant="outline">{selectedInsight.category}</Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedInsight(null)}>×</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{selectedInsight.description}</p>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">AI Analysis Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Confidence Level:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={selectedInsight.confidence} className="flex-1" />
                      <span>{selectedInsight.confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Data Sources:</span>
                    <p className="mt-1">Historical patterns, real-time monitoring, citizen feedback</p>
                  </div>
                </div>
              </div>

              {selectedInsight.actionRequired && (
                <div className="border-t pt-4 bg-orange-50 p-4 rounded">
                  <h4 className="font-medium text-orange-800 mb-2">Recommended Actions</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Review resource allocation for affected areas</li>
                    <li>• Consider preventive maintenance scheduling</li>
                    <li>• Monitor situation for next 48-72 hours</li>
                    <li>• Notify relevant department heads</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}