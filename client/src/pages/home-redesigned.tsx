import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  MapPin, 
  MessageSquare, 
  AlertTriangle, 
  CreditCard,
  FileText,
  Phone,
  Calendar,
  Search,
  Bell,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Droplets,
  Trash,
  Home as HomeIcon,
  ArrowRight,
  Plus,
  Eye,
  Users,
  TrendingUp,
  Award,
  Star
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuickAction {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  color: string;
  urgent?: boolean;
}

export function HomePage() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch quick stats
  const { data: quickStats } = useQuery({
    queryKey: ["/api/quick-stats"],
    queryFn: () => fetch("/api/quick-stats").then(res => res.json())
  });

  // Fetch recent successes  
  const { data: recentSuccesses } = useQuery({
    queryKey: ["/api/recent-successes"],
    queryFn: () => fetch("/api/recent-successes").then(res => res.json())
  });

  // Fetch upcoming events
  const { data: upcomingEvents } = useQuery({
    queryKey: ["/api/events/upcoming"],
    queryFn: () => fetch("/api/events/upcoming").then(res => res.json())
  });

  const quickActions: QuickAction[] = [
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: "Report an Issue",
      description: "Water leaks, potholes, broken streetlights",
      link: "/report-issue",
      color: "bg-red-500 hover:bg-red-600",
      urgent: true
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Pay Bills",
      description: "Water, electricity, rates & taxes",
      link: "/financial",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "View My Bills",
      description: "Check balances and payment history",
      link: "/financial?tab=bills",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Track My Reports",
      description: "See status of your reported issues",
      link: "/track-issues",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Emergency Services",
      description: "Police, Fire, Medical, Municipal",
      link: "/emergency",
      color: "bg-red-600 hover:bg-red-700",
      urgent: true
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book Services",
      description: "Appointments, permits, applications",
      link: "/book-service",
      color: "bg-indigo-500 hover:bg-indigo-600"
    }
  ];

  const serviceCategories = [
    {
      icon: <Droplets className="h-5 w-5" />,
      name: "Water & Sanitation",
      issues: ["Water leaks", "No water supply", "Burst pipes", "Sewage problems"],
      color: "text-blue-600"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      name: "Electricity",
      issues: ["Power outages", "Streetlight repairs", "Meter problems", "Electrical faults"],
      color: "text-yellow-600"
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      name: "Roads & Transport",
      issues: ["Potholes", "Traffic lights", "Road signs", "Public transport"],
      color: "text-gray-600"
    },
    {
      icon: <Trash className="h-5 w-5" />,
      name: "Waste Management",
      issues: ["Missed collection", "Illegal dumping", "Recycling", "Bulk waste"],
      color: "text-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-4">
                <HomeIcon className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              ADA_Smart Munics
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your Digital Gateway to Municipal Services
            </p>
            
            {/* Quick Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for services, report issues, or find information..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg bg-white/90 backdrop-blur-sm border-0 rounded-full focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{quickStats?.totalIssues || 0}</div>
                <div className="text-sm text-blue-100">Active Issues</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{quickStats?.resolvedToday || 0}</div>
                <div className="text-sm text-blue-100">Resolved Today</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{quickStats?.averageResolutionTime || 0}h</div>
                <div className="text-sm text-blue-100">Avg Resolution</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{quickStats?.citizenSatisfaction || 0}%</div>
                <div className="text-sm text-blue-100">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            What do you need to do today?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Quick access to the most common municipal services
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-0 bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`${action.color} text-white p-3 rounded-lg transition-transform group-hover:scale-110`}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 flex items-center">
                          {action.title}
                          {action.urgent && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Priority
                            </Badge>
                          )}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Service Categories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Report Issues by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceCategories.map((category, index) => (
              <Card key={index} className="group cursor-pointer transition-all duration-200 hover:shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <div className={category.color}>
                      {category.icon}
                    </div>
                    <span className="text-base">{category.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.issues.map((issue, issueIndex) => (
                      <li key={issueIndex} className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">
                        • {issue}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    Report Issue
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Updates & Events */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Successes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Recent Successes</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSuccesses?.slice(0, 4).map((success: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {success.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                        Resolved in {success.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Successes
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Upcoming Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents?.slice(0, 4).map((event: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {event.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                        {event.date} • {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Events
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Notice */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full">
                <Phone className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">
                  Emergency Services
                </h3>
                <p className="text-red-800 dark:text-red-300 mb-4">
                  For life-threatening emergencies, always call the appropriate emergency number first.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="font-bold text-red-900 dark:text-red-200">10111</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Police</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-900 dark:text-red-200">10177</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Fire</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-900 dark:text-red-200">10177</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Medical</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-red-900 dark:text-red-200">080 011 0000</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Municipal</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}