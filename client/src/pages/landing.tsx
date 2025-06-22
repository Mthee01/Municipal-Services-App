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
import { ContactForm } from "@/components/contact-form";

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
  const [showContactForm, setShowContactForm] = useState(false);
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
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t.welcome,
        description: `${t.welcome} ${data.user?.name || data.user?.username}!`,
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user.role);
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created",
        description: "Your account has been created successfully!",
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user.role);
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
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
      icon: <MapPin className="h-8 w-8 text-blue-500" />,
      title: "Report Issues",
      description: "Easily report municipal issues with GPS location and photo evidence for faster resolution."
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Community Engagement",
      description: "Connect with your community, track neighborhood improvements, and participate in local governance."
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-500" />,
      title: "Real-time Updates",
      description: "Get instant notifications about issue progress, municipal announcements, and service updates."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
      title: "Track Progress",
      description: "Monitor the status of your reports and see how your municipality is performing."
    },
    {
      icon: <Shield className="h-8 w-8 text-red-500" />,
      title: "Secure Payments",
      description: "Make municipal payments securely online for utilities, taxes, and other services."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-500" />,
      title: "Utility Management",
      description: "Purchase prepaid electricity and water vouchers instantly through our platform."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Citizens" },
    { number: "25K+", label: "Issues Resolved" },
    { number: "15", label: "Municipalities" },
    { number: "95%", label: "Satisfaction Rate" }
  ];

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
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(34,197,94,0.6) 1px, transparent 1px),
              linear-gradient(rgba(34,197,94,0.6) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
        
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

      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-sa-green to-green-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-black">MuniConnect</h1>
                <p className="text-xs text-gray-600">Citizen Engagement Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <div className="hidden sm:flex space-x-6">
                <a href="#features" className="text-black hover:text-sa-green transition-colors font-medium">Features</a>
                <button 
                  onClick={() => setShowContactForm(true)}
                  className="text-black hover:text-sa-green transition-colors font-medium"
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
          
          {/* Running Welcome Message */}
          <div className="bg-sa-green/10 border-t border-sa-green/20 py-2 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-sa-green font-medium text-sm">
                Welcome to our Muni smart app. We are pleased to have you here. Welcome to our Muni smart app. We are pleased to have you here. Welcome to our Muni smart app. We are pleased to have you here. Welcome to our Muni smart app. We are pleased to have you here.
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-20 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="text-black">Transform Your</span>
                  <br />
                  <span 
                    className="bg-gradient-to-r from-sa-green via-green-500 to-blue-600 bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(135deg, hsl(142, 76%, 36%) 0%, hsl(158, 64%, 52%) 50%, hsl(217, 91%, 60%) 100%)'
                    }}
                  >
                    Municipality
                  </span>
                </h1>
                <p className="text-xl text-black leading-relaxed max-w-lg">
                  {t.yourVoiceMatters} Connect directly with your local government, 
                  report issues, track progress, and build stronger communities together.
                </p>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-black">{stat.number}</div>
                    <div className="text-sm text-black font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Auth Forms (Top Right) */}
            <div className="relative">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-sa-green/20 to-blue-500/20 rounded-full blur-2xl"></div>
              <Card className="relative z-10 bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                  <CardTitle className="text-2xl font-bold text-black">
                    {activeTab === "login" ? t.login : t.createAccount}
                  </CardTitle>
                  <p className="text-gray-600">
                    {activeTab === "login" 
                      ? "Access your municipal dashboard" 
                      : "Join your community platform"
                    }
                  </p>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                      <TabsTrigger value="login" className="text-sm font-medium">
                        {t.login}
                      </TabsTrigger>
                      <TabsTrigger value="register" className="text-sm font-medium">
                        {t.register}
                      </TabsTrigger>
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

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={showContactForm} 
        onClose={() => setShowContactForm(false)} 
      />
    </div>
  );
}