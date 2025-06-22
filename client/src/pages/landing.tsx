import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Eye, EyeOff, MapPin, Users, Clock, CheckCircle, Shield, Zap, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/language-selector";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  municipalityAccountNo: z.string().min(5, "Municipality account number must be at least 5 characters").optional().or(z.literal("")),
  role: z.enum(["citizen", "official", "admin", "ward_councillor", "mayor", "tech_manager"]),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface LandingPageProps {
  onLogin: (userRole: string) => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const { toast } = useToast();
  const { t } = useLanguage();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      municipalityAccountNo: "",
      role: "citizen",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Store user session
      const userData = {
        user: data.user,
        loginTime: new Date().toISOString(),
        rememberMe: variables.rememberMe
      };
      
      if (variables.rememberMe) {
        localStorage.setItem("municipalAuth", JSON.stringify(userData));
      } else {
        sessionStorage.setItem("municipalAuth", JSON.stringify(userData));
      }
      
      toast({
        title: "Login Successful",
        description: "Welcome back to the municipal platform!",
      });
      onLogin(data.user?.role || "citizen");
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully!",
      });
      setActiveTab("login");
    },
    onError: () => {
      toast({
        title: "Registration Failed",
        description: "Unable to create account. Username may already exist.",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: "Report Issues",
      description: "Report municipal issues in your area with photos and location tracking",
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Community Engagement",
      description: "Connect with fellow citizens and stay updated on local developments",
    },
    {
      icon: <Clock className="h-6 w-6 text-orange-600" />,
      title: "Real-time Updates",
      description: "Track the progress of your reports and get notified of updates",
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      title: "Service Delivery",
      description: "Access municipal services and make payments conveniently online",
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-600" />,
      title: "Transparency",
      description: "View municipal performance data and hold officials accountable",
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Quick Services",
      description: "Purchase utilities vouchers and access services in under 60 seconds",
    },
  ];

  const stats = [
    { number: "50,000+", label: "Citizens Served" },
    { number: "15,000+", label: "Issues Resolved" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Platform Availability" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sa-green via-green-600 to-green-700 relative">
      {/* Geometric Background Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.3) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.2) 1px, transparent 1px),
            linear-gradient(45deg, transparent 24%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.08) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.08) 75%, rgba(255,255,255,0.08) 76%, transparent 77%)
          `,
          backgroundSize: '50px 50px, 30px 30px, 60px 60px',
          backgroundPosition: '0 0, 15px 15px, 0 0'
        }}
      />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse pointer-events-none z-0" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-yellow-300/10 rounded-full blur-md animate-pulse delay-1000 pointer-events-none z-0" />
      <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-white/8 rounded-full blur-lg animate-pulse delay-2000 pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-green-300/5 rounded-full blur-md animate-pulse delay-500 pointer-events-none z-0" />
      
      {/* Hero Section */}
      <div className="relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-black space-y-8">
              <div>
                <Badge className="bg-sa-gold text-black mb-4">
                  Digital Municipal Services
                </Badge>
                <h1 className="text-4xl font-bold mb-6 leading-tight text-black">
                  {t.welcome}
                  <span className="block text-black">
                    {t.dashboard}
                  </span>
                </h1>
                <p className="text-xl text-black mb-8 leading-relaxed font-medium">
                  {t.yourVoiceMatters}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Droplets className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-black font-semibold">{t.buyVoucher}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-black font-semibold">{t.reportIssue}</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-black font-semibold">Community Engagement</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-200">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-black font-semibold">Real-time Tracking</span>
                </div>
              </div>

              {/* Quick Action Callout */}
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <div>
                    <p className="text-red-700 font-bold text-xl">
                      {t.reportIn60Seconds}
                    </p>
                    <p className="text-red-600 text-sm mt-1">Fast-track your service requests</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-white/30">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                    <div className="text-3xl font-bold text-sa-gold mb-2">{stat.number}</div>
                    <div className="text-sm text-black font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Auth Forms */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-2xl bg-white/95 backdrop-blur-sm border-0">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <CardTitle className="text-3xl font-bold text-black">
                      Get Started
                    </CardTitle>
                    <LanguageSelector />
                  </div>
                  <p className="text-gray-600 font-medium text-lg">Access your municipal services</p>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-gray-100 rounded-xl p-1">
                      <TabsTrigger value="login" className="rounded-lg font-semibold text-base">{t.login}</TabsTrigger>
                      <TabsTrigger value="register" className="rounded-lg font-semibold text-base">{t.register}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="mt-8">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t.username}</FormLabel>
                                <FormControl>
                                  <Input placeholder={`Enter your ${t.username.toLowerCase()}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder={`Enter your ${t.password.toLowerCase()}`}
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={loginForm.control}
                            name="rememberMe"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>
                                    {t.keepMeLoggedIn}
                                  </FormLabel>
                                </div>
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-sa-green to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Signing In...
                              </>
                            ) : (
                              t.login
                            )}
                          </Button>
                        </form>
                      </Form>

                      <div className="mt-6 text-center">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <p className="text-sm text-blue-700 font-medium">
                            🚀 Demo credentials available for testing all roles
                          </p>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="register" className="mt-8">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                          <FormField
                            control={registerForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Choose a username" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Optional)</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="your.email@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="+27 XX XXX XXXX" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="municipalityAccountNo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Municipality Account Number (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your municipal account number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select account type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="citizen">Citizen</SelectItem>
                                    <SelectItem value="official">Municipal Official</SelectItem>
                                    <SelectItem value="ward_councillor">Ward Councillor</SelectItem>
                                    <SelectItem value="mayor">Mayor</SelectItem>
                                    <SelectItem value="tech_manager">Technical Manager</SelectItem>
                                    <SelectItem value="admin">Administrator</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Create a secure password"
                                      {...field}
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-sa-green to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Creating Account...
                              </>
                            ) : (
                              t.createAccount
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 relative z-20">
        {/* Subtle background pattern for features section */}
        <div 
          className="absolute inset-0 z-0 opacity-3 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px),
              linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '25px 25px'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: 'hsl(220, 85%, 15%)' }}>
              Empowering Citizens Through Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform bridges the gap between citizens and municipal services, 
              creating transparency, accountability, and efficient service delivery.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {feature.icon}
                    <h3 className="text-lg font-semibold" style={{ color: 'hsl(220, 85%, 15%)' }}>
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-sa-green to-green-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-black mb-8">
            Join thousands of citizens already using our platform to improve their communities
          </p>

        </div>
      </div>
    </div>
  );
}