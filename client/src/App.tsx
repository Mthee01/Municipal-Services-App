import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { RoleToggle } from "@/components/role-toggle";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { HomePage } from "@/pages/home";
import CitizenDashboard from "@/pages/citizen-dashboard";
import OfficialDashboard from "@/pages/official-dashboard";
import MayorDashboard from "@/pages/mayor-dashboard";
import WardCouncillorDashboard from "@/pages/ward-councillor-dashboard";
import TechManagerDashboard from "@/pages/tech-manager-dashboard";
import SystemAdminDashboard from "@/pages/system-admin-dashboard";
import { MasterDashboard } from "@/pages/master-dashboard";
import NotFound from "@/pages/not-found";
import type { UserRole } from "@/lib/types";

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState("en");
  const [location, setLocation] = useLocation();

  // Check for saved authentication on app load
  useEffect(() => {
    const checkSavedAuth = () => {
      // Check localStorage first (remember me)
      let savedAuth = localStorage.getItem("municipalAuth");
      if (!savedAuth) {
        // Check sessionStorage (session-only)
        savedAuth = sessionStorage.getItem("municipalAuth");
      }
      
      if (savedAuth) {
        try {
          const authData = JSON.parse(savedAuth);
          const loginTime = new Date(authData.loginTime).getTime();
          const now = new Date().getTime();
          const hoursPassed = (now - loginTime) / (1000 * 60 * 60);
          
          // For "remember me", allow longer sessions (30 days)
          // For regular sessions, expire after 24 hours
          const maxHours = authData.rememberMe ? 24 * 30 : 24;
          
          if (hoursPassed < maxHours && authData.user) {
            setCurrentRole(authData.user.role as UserRole);
            setIsAuthenticated(true);
            
            // Navigate to appropriate dashboard
            switch (authData.user.role) {
              case "citizen":
                setLocation("/");
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
                setLocation("/");
            }
          } else {
            // Session expired, clear storage
            localStorage.removeItem("municipalAuth");
            sessionStorage.removeItem("municipalAuth");
          }
        } catch (error) {
          console.error("Error parsing saved auth:", error);
          localStorage.removeItem("municipalAuth");
          sessionStorage.removeItem("municipalAuth");
        }
      }
    };
    
    checkSavedAuth();
  }, [setLocation]);

  const handleLogin = (userRole: string) => {
    setCurrentRole(userRole as UserRole);
    setIsAuthenticated(true);
    // Navigate to appropriate dashboard based on role
    switch (userRole) {
      case "citizen":
        setLocation("/");
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
        setLocation("/");
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    // Navigate to appropriate dashboard based on role
    switch (role) {
      case "citizen":
        setLocation("/");
        break;
      case "official":
      case "admin":
        setLocation("/official");
        break;
      case "mayor":
        setLocation("/mayor");
        break;
      case "wardCouncillor":
        setLocation("/ward-councillor");
        break;
      case "techManager":
        setLocation("/tech-manager");
        break;
      case "systemAdmin":
        setLocation("/system-admin");
        break;
      default:
        setLocation("/");
    }
  };

  const handleLogout = () => {
    // Clear saved authentication
    localStorage.removeItem("municipalAuth");
    sessionStorage.removeItem("municipalAuth");
    
    setCurrentRole(null);
    setIsAuthenticated(false);
    setLocation("/");
  };

  // Show home page if not authenticated and on root path
  if ((!isAuthenticated || !currentRole) && location === "/") {
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <HomePage />
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  // Check for test role access
  const testRole = localStorage.getItem('testRole');
  if (!isAuthenticated && testRole) {
    setIsAuthenticated(true);
    setCurrentRole(testRole as UserRole);
  }

  // If not authenticated but trying to access other pages, redirect to home
  if (!isAuthenticated || !currentRole) {
    if (location !== "/") {
      setLocation("/");
    }
    return (
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <HomePage />
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Header */}
          <nav className="bg-white shadow-sm border-b-2 border-sa-green sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-sa-green rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🏢</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Municipal Services</h1>
                    <p className="text-sm text-gray-600">Citizen Engagement Platform</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Language Selector */}
                  <LanguageSelector />
                  
                  {/* User Role Toggle */}
                  <RoleToggle currentRole={currentRole} onRoleChange={handleRoleChange} />
                  
                  {/* Sign Out Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            <Switch>
              <Route path="/" component={CitizenDashboard} />
              <Route path="/master" component={MasterDashboard} />
              <Route path="/official" component={OfficialDashboard} />
              <Route path="/mayor" component={MayorDashboard} />
              <Route path="/ward-councillor" component={WardCouncillorDashboard} />
              <Route path="/tech-manager" component={TechManagerDashboard} />
              <Route path="/system-admin" component={SystemAdminDashboard} />
              <Route component={NotFound} />
            </Switch>
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-sa-green rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🏢</span>
                    </div>
                    <h3 className="text-xl font-bold">Municipal Services</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Connecting citizens with their local government for better service delivery and community engagement.
                  </p>
                  <div className="flex space-x-4">
                    <span className="text-sa-gold">🇿🇦</span>
                    <span className="text-gray-300">Proudly South African</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="#" className="hover:text-sa-gold transition-colors">Report Issue</a></li>
                    <li><a href="#" className="hover:text-sa-gold transition-colors">Pay Bills</a></li>
                    <li><a href="#" className="hover:text-sa-gold transition-colors">Track Progress</a></li>
                    <li><a href="#" className="hover:text-sa-gold transition-colors">Community Forum</a></li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><a href="#" className="hover:text-sa-gold transition-colors">Help Center</a></li>
                    <li><a href="#" className="hover:text-sa-gold transition-colors">Contact Us</a></li>
                    <li><a href="#" className="hover:text-sa-gold transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-sa-gold transition-colors">Accessibility</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Municipal Service Delivery Platform. All rights reserved.</p>
                <p className="mt-2">Developed by Adacode - Empowering Local Government</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
