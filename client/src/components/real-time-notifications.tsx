import { useState, useEffect } from "react";
import { Bell, X, AlertTriangle, CheckCircle, Info, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  issueId?: number;
  location?: string;
}

interface RealTimeNotificationsProps {
  userRole: string;
}

export function RealTimeNotifications({ userRole }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // WebSocket connection for real-time notifications
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("WebSocket connected successfully");
      };
      
      ws.onmessage = (event) => {
        try {
          const notification: Notification = JSON.parse(event.data);
          if (shouldReceiveNotification(notification, userRole)) {
            setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
            setUnreadCount(prev => prev + 1);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.warn("WebSocket connection error:", error);
        // Continue with app functionality even if WebSocket fails
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };

      // Simulate some initial notifications
      const initialNotifications = generateInitialNotifications(userRole);
      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.filter(n => !n.read).length);

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.warn("WebSocket not available:", error);
      // Continue with app functionality even if WebSocket fails
      const initialNotifications = generateInitialNotifications(userRole);
      setNotifications(initialNotifications);
      setUnreadCount(initialNotifications.filter(n => !n.read).length);
    }
  }, [userRole]);

  const shouldReceiveNotification = (notification: Notification, role: string): boolean => {
    // Role-based notification filtering
    switch (role) {
      case "citizen":
        return ["success", "info"].includes(notification.type);
      case "official":
        return true; // Call centre agents get all notifications
      case "tech_manager":
        return notification.type === "warning" || notification.message.includes("technician");
      case "mayor":
        return notification.type === "error" || notification.message.includes("critical");
      case "ward_councillor":
        return notification.location?.includes("Ward") || false;
      default:
        return true;
    }
  };

  const generateInitialNotifications = (role: string): Notification[] => {
    const baseNotifications = [
      {
        id: "1",
        type: "success" as const,
        title: "Issue Resolved",
        message: "Water leak on Main Street has been successfully repaired",
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        read: false,
        issueId: 123,
        location: "Ward 1"
      },
      {
        id: "2",
        type: "warning" as const,
        title: "High Priority Issue",
        message: "Multiple power outages reported in Ward 2 area",
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        read: false,
        location: "Ward 2"
      },
      {
        id: "3",
        type: "info" as const,
        title: "Scheduled Maintenance",
        message: "Water supply maintenance scheduled for tomorrow 8 AM - 12 PM",
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        read: true,
        location: "Ward 3"
      }
    ];

    return baseNotifications.filter(notification => 
      shouldReceiveNotification(notification, role)
    );
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden z-50 shadow-lg">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {getIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(notification.timestamp)}
                        {notification.location && (
                          <span className="ml-2">• {notification.location}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}