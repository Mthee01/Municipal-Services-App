import { Link, useLocation } from "wouter";
import { 
  Home,
  AlertTriangle,
  CreditCard,
  FileText,
  Phone,
  Calendar,
  Eye,
  Settings,
  Bell,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavigationItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  urgent?: boolean;
  badge?: string;
}

export function HomeNavigation() {
  const [location] = useLocation();

  const navigationItems: NavigationItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      href: "/"
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      label: "Report Issue",
      href: "/report-issue",
      urgent: true
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Pay Bills",
      href: "/financial"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: "My Bills",
      href: "/financial?tab=bills"
    },
    {
      icon: <Eye className="h-5 w-5" />,
      label: "Track Issues",
      href: "/track-issues"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      label: "Emergency",
      href: "/emergency",
      urgent: true
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Book Service",
      href: "/book-service"
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      href: "/notifications",
      badge: "2"
    }
  ];

  return (
    <Card className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-0 p-2">
      <div className="flex items-center space-x-2">
        {navigationItems.map((item, index) => {
          const isActive = location === item.href || 
            (item.href === "/financial" && location.startsWith("/financial"));
          
          return (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`
                      relative h-10 w-10 p-0 rounded-full transition-all duration-200
                      ${isActive 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "hover:bg-gray-100 text-gray-600"
                      }
                      ${item.urgent && !isActive 
                        ? "hover:bg-red-50 hover:text-red-600" 
                        : ""
                      }
                    `}
                  >
                    {item.icon}
                    {item.urgent && !isActive && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                    {item.badge && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-sm">
                {item.label}
                {item.urgent && <span className="text-red-500 ml-1">•</span>}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </Card>
  );
}

// Mobile-optimized version for smaller screens
export function MobileNavigation() {
  const [location] = useLocation();

  const mobileItems: NavigationItem[] = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Home",
      href: "/"
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      label: "Report",
      href: "/report-issue",
      urgent: true
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Pay",
      href: "/financial"
    },
    {
      icon: <Eye className="h-5 w-5" />,
      label: "Track",
      href: "/track-issues"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      label: "Emergency",
      href: "/emergency",
      urgent: true
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex justify-around items-center">
        {mobileItems.map((item, index) => {
          const isActive = location === item.href || 
            (item.href === "/financial" && location.startsWith("/financial"));
          
          return (
            <Link key={index} href={item.href}>
              <Button
                variant="ghost"
                className={`
                  flex flex-col items-center space-y-1 h-auto py-2 px-3 relative
                  ${isActive 
                    ? "text-blue-600" 
                    : "text-gray-600"
                  }
                  ${item.urgent && !isActive 
                    ? "hover:text-red-600" 
                    : ""
                  }
                `}
              >
                <div className="relative">
                  {item.icon}
                  {item.urgent && !isActive && (
                    <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}