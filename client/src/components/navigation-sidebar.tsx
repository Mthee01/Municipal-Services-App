import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Menu,
  X,
  Home,
  User,
  FileText,
  Users,
  MapPin,
  MessageSquare,
  CreditCard,
  Settings,
  BarChart3,
  Wrench,
  Shield,
  Bell,
  Search,
  Calendar,
  ClipboardList,
  Smartphone,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { UserRole } from "@/lib/types";

interface NavigationSidebarProps {
  currentRole: UserRole;
  onLogout: () => void;
  className?: string;
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    icon: Home,
    label: "Dashboard",
    path: "/",
    roles: ["citizen", "admin", "mayor", "ward_councillor", "tech_manager", "field_technician", "call_centre_agent"]
  },
  {
    icon: FileText,
    label: "Report Issue",
    path: "/report",
    roles: ["citizen"]
  },
  {
    icon: ClipboardList,
    label: "My Reports",
    path: "/my-reports",
    roles: ["citizen"]
  },
  {
    icon: CreditCard,
    label: "Payments",
    path: "/payments",
    roles: ["citizen"]
  },
  {
    icon: Users,
    label: "Community",
    path: "/community",
    roles: ["citizen"]
  },
  {
    icon: Users,
    label: "User Management",
    path: "/admin",
    roles: ["admin"]
  },
  {
    icon: FileText,
    label: "Issues Overview",
    path: "/official",
    roles: ["call_centre_agent", "admin"]
  },
  {
    icon: Smartphone,
    label: "WhatsApp Center",
    path: "/whatsapp",
    roles: ["call_centre_agent", "admin"]
  },
  {
    icon: BarChart3,
    label: "Executive Dashboard",
    path: "/mayor",
    roles: ["mayor", "admin"]
  },
  {
    icon: MapPin,
    label: "Ward Overview",
    path: "/ward-councillor",
    roles: ["ward_councillor", "admin"]
  },
  {
    icon: Wrench,
    label: "Team Management",
    path: "/tech-manager",
    roles: ["tech_manager", "admin"]
  },
  {
    icon: MapPin,
    label: "Field Operations",
    path: "/field-technician",
    roles: ["field_technician", "admin"]
  },
  {
    icon: Calendar,
    label: "Location Tracker",
    path: "/location",
    roles: ["field_technician", "admin"]
  }
];

export function NavigationSidebar({ currentRole, onLogout, className = "" }: NavigationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [location] = useLocation();

  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentRole)
  );

  const getUserDisplayName = (role: UserRole) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getUserInitials = (role: UserRole) => {
    return role.split('_').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const isActiveRoute = (itemPath: string) => {
    if (itemPath === "/" && currentRole === "citizen") {
      return location === "/" || location === "/citizen-dashboard";
    }
    if (itemPath === "/" && currentRole === "admin") {
      return location === "/admin";
    }
    if (itemPath === "/" && currentRole === "call_centre_agent") {
      return location === "/official";
    }
    if (itemPath === "/" && currentRole === "mayor") {
      return location === "/mayor";
    }
    if (itemPath === "/" && currentRole === "ward_councillor") {
      return location === "/ward-councillor";
    }
    if (itemPath === "/" && currentRole === "tech_manager") {
      return location === "/tech-manager";
    }
    if (itemPath === "/" && currentRole === "field_technician") {
      return location === "/field-technician";
    }
    return location === itemPath;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-6 rounded overflow-hidden bg-gradient-to-br from-mtn-yellow to-mtn-light-yellow shadow-md border border-white/30">
                <img 
                  src="/attached_assets/image_1755271254719.png" 
                  alt="MTN Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h2 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-mtn-blue to-mtn-dark-blue">
                  Smart Munic
                </h2>
                <p className="text-xs text-gray-600 -mt-0.5">Citizen Platform</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0 hover:bg-gray-100 hidden md:flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 bg-gradient-to-br from-mtn-yellow to-mtn-blue shadow-md">
            <AvatarFallback className="bg-transparent text-white text-sm font-bold">
              {getUserInitials(currentRole)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{getUserDisplayName(currentRole)}</p>
              <p className="text-xs text-green-600 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Online
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <ScrollArea className="flex-1 p-3">
        <nav className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start h-11 px-3 text-left transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-mtn-light-yellow/50 to-blue-50 text-mtn-blue border-l-4 border-mtn-blue font-semibold shadow-sm" 
                      : "hover:bg-gray-50 text-gray-700 hover:text-mtn-blue border-l-4 border-transparent"
                  } ${isCollapsed ? "px-2" : ""}`}
                >
                  <Icon className={`h-5 w-5 ${isCollapsed ? "" : "mr-3"} flex-shrink-0 ${isActive ? "text-mtn-blue" : ""}`} />
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs bg-mtn-light-yellow text-mtn-blue">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-3 border-t border-gray-200">
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-9 px-3 text-gray-600 hover:text-mtn-blue hover:bg-gray-50"
            >
              <Bell className="h-4 w-4 mr-3" />
              Notifications
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start h-9 px-3 text-gray-600 hover:text-mtn-blue hover:bg-gray-50"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className={`w-full ${isCollapsed ? "px-2" : ""} border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors duration-200`}
        >
          <Shield className={`h-4 w-4 ${isCollapsed ? "" : "mr-2"} flex-shrink-0`} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 h-10 w-10 p-0 bg-white shadow-lg border-gray-200"
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-72"
        } ${className}`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-72 z-50 transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
}