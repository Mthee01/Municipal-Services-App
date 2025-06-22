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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
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

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
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
      role: "citizen",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: (data) => {
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
    <div className="min-h-screen bg-gradient-to-br from-sa-green via-green-600 to-green-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              <div>
                <Badge className="bg-sa-gold text-black mb-4">
                  Digital Municipal Services
                </Badge>
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  Your Voice in
                  <span className="block text-sa-gold">Municipal Services</span>
                </h1>
                <p className="text-xl text-green-100 mb-8 leading-relaxed">
                  Empowering South African citizens to engage with local government, 
                  report issues, track service delivery, and build stronger communities 
                  through transparent digital platforms.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-blue-300" />
                  <span>Water & Electricity Vouchers</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-300" />
                  <span>GPS Issue Reporting</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-300" />
                  <span>Community Engagement</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-300" />
                  <span>Real-time Tracking</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8 border-t border-green-400">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-sa-gold">{stat.number}</div>
                    <div className="text-sm text-green-200">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Auth Forms */}
            <div className="flex justify-center">
              <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold" style={{ color: 'hsl(220, 85%, 15%)' }}>
                    Welcome Back
                  </CardTitle>
                  <p className="text-gray-600">Access your municipal services</p>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="login">Login</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter your username" {...field} />
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
                                      placeholder="Enter your password"
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
                            className="w-full bg-sa-green hover:bg-green-700"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Signing In...
                              </>
                            ) : (
                              "Sign In"
                            )}
                          </Button>
                        </form>
                      </Form>

                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                          Demo credentials available for testing all roles
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="register">
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
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
                            className="w-full bg-sa-green hover:bg-green-700"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                Creating Account...
                              </>
                            ) : (
                              "Create Account"
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
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <p className="text-xl text-green-100 mb-8">
            Join thousands of citizens already using our platform to improve their communities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-sa-gold text-black hover:bg-yellow-500 font-semibold"
              onClick={() => setActiveTab("register")}
            >
              Get Started Today
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-green-600"
              onClick={() => setActiveTab("login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}