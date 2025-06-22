import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/language-selector";
import { RoleToggle } from "@/components/role-toggle";
import CitizenDashboard from "@/pages/citizen-dashboard";
import OfficialDashboard from "@/pages/official-dashboard";
import NotFound from "@/pages/not-found";
import type { UserRole } from "@/lib/types";

function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>("citizen");
  const [language, setLanguage] = useState("en");

  return (
    <QueryClientProvider client={queryClient}>
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
                  <LanguageSelector value={language} onValueChange={setLanguage} />
                  
                  {/* User Role Toggle */}
                  <RoleToggle currentRole={currentRole} onRoleChange={setCurrentRole} />
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>
            {currentRole === "citizen" ? <CitizenDashboard /> : <OfficialDashboard />}
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
    </QueryClientProvider>
  );
}

export default App;
