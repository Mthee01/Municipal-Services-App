import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/lib/types";

// Simplified imports to avoid circular dependencies
import LandingPage from "@/pages/landing";
import CitizenDashboard from "@/pages/citizen-dashboard";
import OfficialDashboard from "@/pages/official-dashboard";
import MayorDashboard from "@/pages/mayor-dashboard";
import WardCouncillorDashboard from "@/pages/ward-councillor-dashboard";
import TechManagerDashboard from "@/pages/tech-manager-dashboard";
import FieldTechnicianDashboard from "@/pages/field-technician-dashboard";
import WhatsAppDashboard from "@/pages/whatsapp-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showContactForm, setShowContactForm] = useState(false);
  const [location, setLocation] = useLocation();

  // Check for saved authentication on app load
  useEffect(() => {
    const checkSavedAuth = () => {
      console.log("Checking saved authentication...");
      
      // Start with unauthenticated state
      setIsAuthenticated(false);
      setCurrentRole(null);
      
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
              case "call_centre_agent":
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
            setIsAuthenticated(false);
            setCurrentRole(null);
          }
        } catch (error) {
          console.error("Error parsing saved auth:", error);
          localStorage.removeItem("municipalAuth");
          sessionStorage.removeItem("municipalAuth");
          setIsAuthenticated(false);
          setCurrentRole(null);
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
      case "call_centre_agent":
        setLocation("/official");
        break;
      case "admin":
        setLocation("/admin");
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
      case "field_technician":
        setLocation("/field-technician");
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
      case "call_centre_agent":
        setLocation("/official");
        break;
      case "admin":
        setLocation("/admin");
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
      case "field_technician":
        setLocation("/field-technician");
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

  // Show landing page if not authenticated
  if (!isAuthenticated || !currentRole) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LandingPage onLogin={handleLogin} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Header */}
          <nav className="bg-white shadow-sm border-b-2 border-green-600 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">🏢</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">ADA Smart Munic</h1>
                    <p className="text-sm text-gray-600">Citizen Engagement Platform</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Current User Role Display */}
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {currentRole?.replace('_', ' ') || 'User'}
                    </span>
                  </div>
                  
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
              {/* Citizen Dashboard - Only for citizens */}
              {currentRole === "citizen" && (
                <Route path="/" component={CitizenDashboard} />
              )}
              {currentRole === "citizen" && (
                <Route path="/citizen-dashboard" component={CitizenDashboard} />
              )}
              
              {/* Call Centre Agent Dashboard - Only for call centre agents and admins */}
              {(currentRole === "call_centre_agent" || currentRole === "admin") && (
                <Route path="/official" component={OfficialDashboard} />
              )}
              {(currentRole === "call_centre_agent" || currentRole === "admin") && (
                <Route path="/whatsapp" component={WhatsAppDashboard} />
              )}
              
              {/* Mayor Dashboard - Only for mayors and admins */}
              {(currentRole === "mayor" || currentRole === "admin") && (
                <Route path="/mayor" component={MayorDashboard} />
              )}
              
              {/* Ward Councillor Dashboard - Only for ward councillors and admins */}
              {(currentRole === "ward_councillor" || currentRole === "admin") && (
                <Route path="/ward-councillor" component={WardCouncillorDashboard} />
              )}
              
              {/* Tech Manager Dashboard - Only for tech managers and admins */}
              {(currentRole === "tech_manager" || currentRole === "admin") && (
                <Route path="/tech-manager" component={TechManagerDashboard} />
              )}
              
              {/* Field Technician Dashboard - Only for field technicians and admins */}
              {(currentRole === "field_technician" || currentRole === "admin") && (
                <Route path="/field-technician" component={FieldTechnicianDashboard} />
              )}
              
              {/* Admin Dashboard - Only for administrators */}
              {currentRole === "admin" && (
                <Route path="/admin" component={AdminDashboard} />
              )}
              
              {/* Default route based on user role */}
              <Route path="/">
                {currentRole === "citizen" && <CitizenDashboard />}
                {currentRole === "call_centre_agent" && <OfficialDashboard />}
                {currentRole === "admin" && <AdminDashboard />}
                {currentRole === "mayor" && <MayorDashboard />}
                {currentRole === "ward_councillor" && <WardCouncillorDashboard />}
                {currentRole === "tech_manager" && <TechManagerDashboard />}
                {currentRole === "field_technician" && <FieldTechnicianDashboard />}
              </Route>
              
              <Route component={NotFound} />
            </Switch>
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg">🏢</span>
                    </div>
                    <h3 className="text-xl font-bold">ADA Smart Munic</h3>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Connecting citizens with their local government for better service delivery and community engagement.
                  </p>
                  <div className="flex space-x-4">
                    <span className="text-yellow-400">🇿🇦</span>
                    <span className="text-gray-300">Proudly South African</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <button 
                        onClick={() => setLocation("/")}
                        className="hover:text-yellow-400 transition-colors text-left"
                      >
                        Report Issue
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setLocation("/")}
                        className="hover:text-yellow-400 transition-colors text-left"
                      >
                        Pay Bills
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setLocation("/")}
                        className="hover:text-yellow-400 transition-colors text-left"
                      >
                        Track Progress
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setLocation("/")}
                        className="hover:text-yellow-400 transition-colors text-left"
                      >
                        Community Forum
                      </button>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>
                      <button 
                        onClick={() => setLocation("/")}
                        className="hover:text-yellow-400 transition-colors text-left"
                      >
                        Help Center
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setShowContactForm(true)}
                        className="hover:text-yellow-400 transition-colors text-left"
                      >
                        Contact Us
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setShowContactForm(true)}
                        className="hover:text-yellow-400 transition-colors text-left"
                      >
                        Privacy Policy
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setLocation("/")}
                        className="hover:text-yellow-400 transition-colors text-left"
                      >
                        Accessibility
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2024 Municipal Service Delivery Platform. All rights reserved.</p>
                <p className="mt-2">Developed by MTN - Empowering Local Government</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster />

        {/* Contact Form Modal - temporarily removed to fix error */}
        {/* <ContactForm 
          isOpen={showContactForm} 
          onClose={() => setShowContactForm(false)} 
        /> */}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
