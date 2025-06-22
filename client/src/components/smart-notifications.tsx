import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, X, Check, AlertTriangle, Info, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDismiss: (id: number) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDismiss }: NotificationItemProps) {
  const { t } = useLanguage();
  
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "normal":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-800";
      case "high":
        return "bg-orange-100 border-orange-300 dark:bg-orange-900/20 dark:border-orange-800";
      case "normal":
        return "bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800";
      default:
        return "bg-gray-100 border-gray-300 dark:bg-gray-900/20 dark:border-gray-800";
    }
  };

  return (
    <Card className={`${!notification.isRead ? getPriorityColor(notification.priority || "normal") : ""} mb-3`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getPriorityIcon(notification.priority || "normal")}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium text-sm">{notification.title}</h4>
                {!notification.isRead && (
                  <Badge variant="secondary" className="text-xs">
                    {t.new}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {notification.message}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{new Date(notification.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {!notification.isRead && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="h-8 w-8 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SmartNotifications() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("PATCH", `/api/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/notifications/${id}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      apiRequest("PATCH", "/api/notifications/mark-all-read", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  const filteredNotifications = showUnreadOnly 
    ? notifications.filter((n: Notification) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>{t.notifications || "Notifications"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>{t.notifications || "Notifications"}</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={showUnreadOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              {showUnreadOnly ? t.showAll || "Show All" : t.unreadOnly || "Unread Only"}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {t.markAllRead || "Mark All Read"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{showUnreadOnly ? t.noUnreadNotifications || "No unread notifications" : t.noNotifications || "No notifications"}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                  onDismiss={(id) => dismissMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}