import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  MapPin, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar,
  Search,
  Bell,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  Shield,
  Award,
  Globe,
  ArrowRight,
  Play,
  Star,
  Heart,
  Home as HomeIcon,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRequest } from "@/lib/queryClient";

interface QuickStats {
  totalIssues: number;
  resolvedToday: number;
  averageResolutionTime: number;
  citizenSatisfaction: number;
  activeUsers: number;
  upcomingEvents: number;
}

interface FeatureHighlight {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  badge?: string;
}

export function HomePage() {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    phone: '',
    role: 'citizen'
  });
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('POST', '/api/auth/login', loginData);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
        
        // Save authentication data
        const authData = {
          user: data.user,
          loginTime: new Date().toISOString(),
          rememberMe: false
        };
        sessionStorage.setItem("municipalAuth", JSON.stringify(authData));
        
        // Navigate based on role
        switch (data.user.role) {
          case "citizen":
            setLocation("/citizen");
            break;
          case "official":
          case "admin":
            setLocation("/official");
            break;
          case "mayor":
            setLocation("/mayor");
            break;
          case "ward_councillor":
            setLocation("/ward-councillor");
            break;
          case "tech_manager":
            setLocation("/tech-manager");
            break;
          default:
            setLocation("/citizen");
        }
        
        setShowAuth(false);
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('POST', '/api/auth/register', registerData);
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Registration Successful!",
          description: "Your account has been created. You can now log in.",
        });
        setAuthMode('login');
        setRegisterData({
          username: '',
          password: '',
          name: '',
          email: '',
          phone: '',
          role: 'citizen'
        });
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to create account",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: quickStats } = useQuery<QuickStats>({
    queryKey: ["/api/quick-stats"],
    refetchInterval: 30000,
  });

  const { data: recentSuccesses = [] } = useQuery({
    queryKey: ["/api/recent-successes"],
    refetchInterval: 60000,
  });

  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ["/api/events/upcoming"],
  });

  const heroSlides = [
    {
      title: t.heroTitle1 || "Empowering Citizens, Strengthening Communities",
      subtitle: t.heroSubtitle1 || "Report issues, track progress, and engage with your local government through our comprehensive digital platform.",
      image: "🏢",
      cta: t.getStarted || "Get Started",
      link: "/citizen"
    },
    {
      title: t.heroTitle2 || "Real-Time Service Delivery",
      subtitle: t.heroSubtitle2 || "Experience transparent governance with live updates, AI-powered analytics, and direct communication channels.",
      image: "⚡",
      cta: t.viewDashboard || "View Dashboard",
      link: "/master"
    },
    {
      title: t.heroTitle3 || "Smart Municipal Management",
      subtitle: t.heroSubtitle3 || "Advanced predictive analytics and automated workflows help municipalities deliver better services efficiently.",
      image: "🔮",
      cta: t.learnMore || "Learn More",
      link: "#features"
    }
  ];

  const features: FeatureHighlight[] = [
    {
      icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
      title: t.issueReporting || "Issue Reporting",
      description: t.issueReportingDesc || "Report municipal issues with photos, GPS location, and AI-powered categorization for faster resolution.",
      link: "/citizen",
      badge: "AI-Powered"
    },
    {
      icon: <MapPin className="h-8 w-8 text-blue-500" />,
      title: t.interactiveMaps || "Interactive Maps",
      description: t.interactiveMapsDesc || "Visualize issues, track technicians, and analyze municipal data with our advanced mapping system.",
      link: "/master",
      badge: "Real-Time"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-green-500" />,
      title: t.predictiveAnalytics || "Predictive Analytics",
      description: t.predictiveAnalyticsDesc || "AI-driven insights help predict service demands and optimize resource allocation.",
      link: "/master",
      badge: "Advanced AI"
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-purple-500" />,
      title: t.realTimeChat || "Real-Time Communication",
      description: t.realTimeChatDesc || "Direct communication between citizens and technicians with multimedia support and translations.",
      link: "/master",
      badge: "Multi-Language"
    },
    {
      icon: <Bell className="h-8 w-8 text-orange-500" />,
      title: t.smartNotifications || "Smart Notifications",
      description: t.smartNotificationsDesc || "Intelligent alerts via SMS, email, and push notifications based on user preferences.",
      link: "/master",
      badge: "Multi-Channel"
    },
    {
      icon: <Users className="h-8 w-8 text-indigo-500" />,
      title: t.communityEngagement || "Community Engagement",
      description: t.communityEngagementDesc || "Forums, events, and collaborative initiatives to strengthen community bonds.",
      link: "/master",
      badge: "Social"
    }
  ];

  const quickActions = [
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: t.reportIssue || "Report Issue",
      description: t.quickReport || "Quickly report a municipal issue",
      link: "/citizen",
      color: "bg-red-500"
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: t.trackIssue || "Track Issue",
      description: t.checkStatus || "Check the status of your reports",
      link: "/citizen",
      color: "bg-blue-500"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: t.events || "Events",
      description: t.communityEvents || "View upcoming community events",
      link: "/master",
      color: "bg-green-500"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: t.analytics || "Analytics",
      description: t.viewInsights || "View municipal performance insights",
      link: "/master",
      color: "bg-purple-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <HomeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ADA_Smart Munics</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t.tagline || "Connecting Communities"}</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">{t.features || "Features"}</a>
              <a href="#stats" className="text-gray-600 hover:text-blue-600 transition-colors">{t.stats || "Statistics"}</a>
              <Button onClick={() => setShowAuth(true)}>{t.getStarted || "Get Started"}</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-8 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-green-600">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="h-full flex flex-col sm:flex-row items-center justify-center sm:justify-between text-white p-4 sm:p-8 lg:p-12">
                  <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6 text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">{slide.title}</h1>
                    <p className="text-sm sm:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto sm:mx-0">{slide.subtitle}</p>
                    <Link href={slide.link}>
                      <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100 text-sm sm:text-base">
                        {slide.cta}
                        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </Link>
                  </div>
                  <div className="text-4xl sm:text-6xl lg:text-8xl opacity-20 mt-4 sm:mt-0 hidden sm:block">{slide.image}</div>
                </div>
              </div>
            ))}
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 sm:left-4 sm:transform-none lg:left-12 flex space-x-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    index === currentSlide ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section id="stats" className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t.liveStats || "Live Municipal Statistics"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-600">{quickStats?.totalIssues || 0}</div>
                <div className="text-sm text-gray-600">{t.totalIssues || "Total Issues"}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-600">{quickStats?.resolvedToday || 0}</div>
                <div className="text-sm text-gray-600">{t.resolvedToday || "Resolved Today"}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-600">{quickStats?.averageResolutionTime || 0}h</div>
                <div className="text-sm text-gray-600">{t.avgResolution || "Avg Resolution"}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-orange-600">{quickStats?.citizenSatisfaction || 0}%</div>
                <div className="text-sm text-gray-600">{t.satisfaction || "Satisfaction"}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-indigo-600">{quickStats?.activeUsers || 0}</div>
                <div className="text-sm text-gray-600">{t.activeUsers || "Active Users"}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-red-600">{quickStats?.upcomingEvents || 0}</div>
                <div className="text-sm text-gray-600">{t.upcomingEvents || "Upcoming Events"}</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900 dark:text-white">
            {t.quickActions || "Quick Actions"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="p-4 sm:p-6 text-center flex flex-col items-center justify-center min-h-[120px] sm:min-h-[140px]">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                      <div className="text-white">{action.icon}</div>
                    </div>
                    <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base leading-tight">{action.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-tight">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.advancedFeatures || "Advanced Features"}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t.featuresDescription || "Comprehensive tools and intelligent systems designed to enhance municipal service delivery and citizen engagement."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Link key={index} href={feature.link}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      {feature.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories & Events */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="successes" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12">
              <TabsTrigger value="successes">{t.successStories || "Success Stories"}</TabsTrigger>
              <TabsTrigger value="events">{t.upcomingEvents || "Upcoming Events"}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="successes">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentSuccesses.slice(0, 3).map((success: any, index: number) => (
                  <Card key={index} className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                          <h3 className="font-semibold">{success.title || "Issue Resolved"}</h3>
                          <p className="text-sm text-gray-600">{success.ward || "Ward 12"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        {success.description || "Water leak fixed within 4 hours of reporting"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(success.date || Date.now()).toLocaleDateString()}
                        </span>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm">{success.rating || "4.8"}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="events">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.slice(0, 3).map((event: any, index: number) => (
                  <Card key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                          <h3 className="font-semibold">{event.title || "Town Hall Meeting"}</h3>
                          <p className="text-sm text-gray-600">{event.location || "City Hall"}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                        {event.description || "Monthly community meeting to discuss local issues"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(event.date || Date.now()).toLocaleDateString()}
                        </span>
                        <Badge variant="outline">
                          {event.attendees || 45} {t.attending || "attending"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Trust & Security */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">
            {t.trustSecurity || "Trust & Security"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="font-semibold mb-2">{t.dataProtection || "Data Protection"}</h3>
              <p className="text-sm text-gray-600">{t.dataProtectionDesc || "Enterprise-grade security"}</p>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="h-12 w-12 text-yellow-600 mb-4" />
              <h3 className="font-semibold mb-2">{t.realTimeUpdates || "Real-Time Updates"}</h3>
              <p className="text-sm text-gray-600">{t.realTimeDesc || "Instant notifications"}</p>
            </div>
            <div className="flex flex-col items-center">
              <Globe className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="font-semibold mb-2">{t.multiLanguage || "Multi-Language"}</h3>
              <p className="text-sm text-gray-600">{t.multiLanguageDesc || "11 South African languages"}</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="font-semibold mb-2">{t.certified || "Certified Platform"}</h3>
              <p className="text-sm text-gray-600">{t.certifiedDesc || "Government approved"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            {t.joinCommunity || "Join Our Digital Community"}
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            {t.joinDescription || "Be part of the future of municipal service delivery. Report issues, track progress, and build stronger communities together."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/citizen">
              <Button size="lg" variant="secondary" className="bg-white text-gray-900 hover:bg-gray-100">
                <Users className="mr-2 h-5 w-5" />
                {t.startAsCitizen || "Start as Citizen"}
              </Button>
            </Link>
            <Link href="/master">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <BarChart3 className="mr-2 h-5 w-5" />
                {t.viewDashboard || "View Dashboard"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <HomeIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">ADA_Smart Munics</h3>
              </div>
              <p className="text-gray-300 mb-4 max-w-md">
                {t.footerDescription || "Empowering citizens and strengthening communities through innovative digital solutions for municipal service delivery."}
              </p>
              <div className="flex space-x-4">
                <span className="text-2xl">🇿🇦</span>
                <span className="text-gray-300">{t.proudlySA || "Proudly South African"}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t.quickLinks || "Quick Links"}</h4>
              <ul className="space-y-2 text-gray-300">
                <li><Link href="/citizen" className="hover:text-white transition-colors">{t.reportIssue || "Report Issue"}</Link></li>
                <li><Link href="/master" className="hover:text-white transition-colors">{t.dashboard || "Dashboard"}</Link></li>
                <li><a href="#features" className="hover:text-white transition-colors">{t.features || "Features"}</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">{t.about || "About"}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t.support || "Support"}</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">{t.helpCenter || "Help Center"}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.contactUs || "Contact Us"}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.privacyPolicy || "Privacy Policy"}</a></li>
                <li><a href="#" className="hover:text-white transition-colors">{t.accessibility || "Accessibility"}</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 {t.municipalPlatform || "Municipal Service Delivery Platform"}. {t.allRightsReserved || "All rights reserved"}.</p>
            <p className="mt-2">{t.developedBy || "Developed by Adacode Solutions - Empowering Smart Municipal Governance"}</p>
          </div>
        </div>
      </footer>

      {/* Authentication Dialog */}
      <Dialog open={showAuth} onOpenChange={setShowAuth}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    value={loginData.username}
                    onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input
                    id="register-name"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-username">Username</Label>
                  <Input
                    id="register-username"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="register-phone">Phone</Label>
                  <Input
                    id="register-phone"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={registerData.role} onValueChange={(value) => setRegisterData({...registerData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="official">Municipal Official</SelectItem>
                      <SelectItem value="mayor">Mayor</SelectItem>
                      <SelectItem value="ward_councillor">Ward Councillor</SelectItem>
                      <SelectItem value="tech_manager">Technical Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}