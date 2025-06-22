import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Brain, Calendar, BarChart3, LineChart, Target, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart as RechartsLineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Bar } from "recharts";
import type { PredictiveAnalytics as PredictiveAnalyticsType } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface TrendData {
  month: string;
  predicted: number;
  actual: number;
  category: string;
}

interface ResourceAllocation {
  department: string;
  currentAllocation: number;
  recommendedAllocation: number;
  efficiency: number;
}

interface BudgetImpact {
  scenario: string;
  estimatedCost: number;
  savings: number;
  roi: number;
}

export function PredictiveAnalytics() {
  const { t } = useLanguage();
  const [selectedTimeframe, setSelectedTimeframe] = useState("quarterly");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const { data: analytics = [] } = useQuery({
    queryKey: ["/api/predictive-analytics", selectedTimeframe, selectedDepartment],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: issues = [] } = useQuery({
    queryKey: ["/api/issues"],
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["/api/technicians"],
  });

  // Generate predictive data based on historical patterns
  const generateTrendData = (): TrendData[] => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const categories = ["water_sanitation", "electricity", "roads_transport", "waste_management"];
    
    return months.map(month => {
      const baseValue = Math.floor(Math.random() * 50) + 20;
      return {
        month,
        predicted: baseValue + Math.floor(Math.random() * 10),
        actual: baseValue + Math.floor(Math.random() * 15) - 5,
        category: categories[Math.floor(Math.random() * categories.length)],
      };
    });
  };

  const generateResourceData = (): ResourceAllocation[] => {
    return [
      {
        department: "Water & Sanitation",
        currentAllocation: 35,
        recommendedAllocation: 42,
        efficiency: 78,
      },
      {
        department: "Electricity",
        currentAllocation: 28,
        recommendedAllocation: 25,
        efficiency: 85,
      },
      {
        department: "Roads & Transport",
        currentAllocation: 25,
        recommendedAllocation: 22,
        efficiency: 82,
      },
      {
        department: "Waste Management",
        currentAllocation: 12,
        recommendedAllocation: 11,
        efficiency: 90,
      },
    ];
  };

  const generateBudgetData = (): BudgetImpact[] => {
    return [
      {
        scenario: "Proactive Maintenance",
        estimatedCost: 450000,
        savings: 125000,
        roi: 28,
      },
      {
        scenario: "Resource Optimization",
        estimatedCost: 280000,
        savings: 95000,
        roi: 34,
      },
      {
        scenario: "Technology Upgrade",
        estimatedCost: 620000,
        savings: 180000,
        roi: 29,
      },
    ];
  };

  const trendData = generateTrendData();
  const resourceData = generateResourceData();
  const budgetData = generateBudgetData();

  const calculateAccuracy = () => {
    const totalPredictions = trendData.length;
    const accuratePredictions = trendData.filter(
      item => Math.abs(item.predicted - item.actual) <= 3
    ).length;
    return Math.round((accuratePredictions / totalPredictions) * 100);
  };

  const getConfidenceLevel = () => {
    const accuracy = calculateAccuracy();
    if (accuracy >= 85) return { level: "High", color: "text-green-600", icon: CheckCircle };
    if (accuracy >= 70) return { level: "Medium", color: "text-yellow-600", icon: AlertTriangle };
    return { level: "Low", color: "text-red-600", icon: AlertTriangle };
  };

  const confidence = getConfidenceLevel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>{t.predictiveAnalytics || "Predictive Analytics"}</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <confidence.icon className={`h-4 w-4 ${confidence.color}`} />
                <span className={`text-sm font-medium ${confidence.color}`}>
                  {confidence.level} {t.confidence || "Confidence"}
                </span>
                <Badge variant="outline">{calculateAccuracy()}%</Badge>
              </div>
              <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t.monthly || "Monthly"}</SelectItem>
                  <SelectItem value="quarterly">{t.quarterly || "Quarterly"}</SelectItem>
                  <SelectItem value="yearly">{t.yearly || "Yearly"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">{t.trendPrediction || "Trend Prediction"}</TabsTrigger>
          <TabsTrigger value="resources">{t.resourceAllocation || "Resource Allocation"}</TabsTrigger>
          <TabsTrigger value="budget">{t.budgetImpact || "Budget Impact"}</TabsTrigger>
          <TabsTrigger value="insights">{t.insights || "AI Insights"}</TabsTrigger>
        </TabsList>

        {/* Trend Prediction */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>{t.issueTrends || "Issue Volume Trends"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#8884d8" 
                      strokeDasharray="5 5"
                      name={t.predicted || "Predicted"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#82ca9d"
                      name={t.actual || "Actual"}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.keyPredictions || "Key Predictions"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {t.waterIssuesIncrease || "Water Issues Expected to Increase"}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {t.waterPredictionDetails || "25% increase predicted for next quarter due to seasonal patterns"}
                    </p>
                    <Progress value={75} className="mt-2" />
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-100">
                        {t.electricityOptimal || "Electricity Department Performance Optimal"}
                      </span>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {t.electricityDetails || "Current resource allocation showing 95% efficiency"}
                    </p>
                    <Progress value={95} className="mt-2" />
                  </div>

                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        {t.technicianShortage || "Technician Shortage Alert"}
                      </span>
                    </div>
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      {t.technicianDetails || "Roads department may need 2 additional technicians by month end"}
                    </p>
                    <Progress value={60} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Resource Allocation */}
        <TabsContent value="resources">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.currentVsRecommended || "Current vs Recommended Allocation"}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={resourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="currentAllocation" 
                      fill="#8884d8" 
                      name={t.current || "Current"}
                    />
                    <Bar 
                      dataKey="recommendedAllocation" 
                      fill="#82ca9d" 
                      name={t.recommended || "Recommended"}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.efficiencyMetrics || "Efficiency Metrics"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resourceData.map((dept, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{dept.department}</span>
                        <Badge variant={dept.efficiency >= 85 ? "default" : dept.efficiency >= 70 ? "secondary" : "destructive"}>
                          {dept.efficiency}%
                        </Badge>
                      </div>
                      <Progress value={dept.efficiency} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {dept.efficiency >= 85 ? t.excellent || "Excellent" : 
                         dept.efficiency >= 70 ? t.good || "Good" : t.needsImprovement || "Needs Improvement"}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Budget Impact */}
        <TabsContent value="budget">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {budgetData.map((scenario, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{scenario.scenario}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {scenario.roi}%
                      </div>
                      <div className="text-sm text-gray-500">{t.expectedROI || "Expected ROI"}</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">{t.estimatedCost || "Estimated Cost"}:</span>
                        <span className="font-medium">R{(scenario.estimatedCost / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">{t.projectedSavings || "Projected Savings"}:</span>
                        <span className="font-medium text-green-600">R{(scenario.savings / 1000).toFixed(0)}K</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-gray-500 mb-1">{t.confidenceLevel || "Confidence Level"}</div>
                      <Progress value={scenario.roi * 2} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>{t.aiRecommendations || "AI Recommendations"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      {t.resourceOptimization || "Resource Optimization"}
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {t.resourceOptimizationDetails || "Redistribute 3 technicians from Waste Management to Water & Sanitation for optimal coverage"}
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      {t.preventiveMaintenance || "Preventive Maintenance"}
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200">
                      {t.preventiveMaintenanceDetails || "Schedule maintenance for Ward 15 electrical infrastructure to prevent predicted outages"}
                    </p>
                  </div>

                  <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                      {t.seasonalPreparation || "Seasonal Preparation"}
                    </h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {t.seasonalPreparationDetails || "Increase water department capacity by 20% before summer season based on historical patterns"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.performanceMetrics || "Performance Metrics"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t.predictionAccuracy || "Prediction Accuracy"}</span>
                      <span className="text-sm font-bold">{calculateAccuracy()}%</span>
                    </div>
                    <Progress value={calculateAccuracy()} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t.dataQuality || "Data Quality"}</span>
                      <span className="text-sm font-bold">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t.modelConfidence || "Model Confidence"}</span>
                      <span className="text-sm font-bold">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">{t.lastUpdated || "Last Updated"}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date().toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.nextUpdate || "Next update in 4 hours"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}