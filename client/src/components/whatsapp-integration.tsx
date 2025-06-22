import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MessageSquare, Phone, CheckCircle, Clock, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { WhatsappMessage } from "@shared/schema";

interface WhatsAppIntegrationProps {
  userId?: number;
}

export default function WhatsAppIntegration({ userId }: WhatsAppIntegrationProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/whatsapp", phoneNumber],
    queryFn: () => apiRequest(`/api/whatsapp?phoneNumber=${phoneNumber}`),
    enabled: !!phoneNumber && isConnected,
  });

  const sendWhatsAppMutation = useMutation({
    mutationFn: (messageData: any) => apiRequest("POST", "/api/whatsapp", messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp", phoneNumber] });
    },
  });

  const handleConnect = () => {
    if (phoneNumber.trim()) {
      setIsConnected(true);
      setShowSetup(false);
      
      // Send welcome message via WhatsApp
      sendWhatsAppMutation.mutate({
        phoneNumber: phoneNumber.trim(),
        message: "Welcome to Municipal Services! You can now receive updates and communicate with us via WhatsApp. Reply 'help' for available commands.",
        direction: "outbound",
        messageId: `welcome-${Date.now()}`,
        userId
      });
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setPhoneNumber("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Clock className="w-4 h-4 text-gray-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "read":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isConnected && !showSetup) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <CardTitle>WhatsApp Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <MessageSquare className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect WhatsApp</h3>
            <p className="text-gray-600 mb-4">
              Get instant notifications and updates about your municipal service requests directly on WhatsApp.
            </p>
            <Button 
              onClick={() => setShowSetup(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Phone className="w-4 h-4 mr-2" />
              Connect WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter your WhatsApp number to receive municipal service notifications and updates.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+27 XX XXX XXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <p className="text-sm text-gray-600">
              Include country code (e.g., +27 for South Africa)
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleConnect} disabled={!phoneNumber.trim()}>
              Connect
            </Button>
            <Button variant="outline" onClick={() => setShowSetup(false)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            <CardTitle>WhatsApp Connected</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Active
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect}>
            Disconnect
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <Phone className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium">Connected: {phoneNumber}</span>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Available Commands</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-gray-50 rounded">
                <code className="font-mono">status [issue-id]</code>
                <p className="text-gray-600">Check issue status</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <code className="font-mono">report [type]</code>
                <p className="text-gray-600">Quick issue reporting</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <code className="font-mono">bill</code>
                <p className="text-gray-600">Check account balance</p>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <code className="font-mono">help</code>
                <p className="text-gray-600">Show all commands</p>
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Recent Messages</h4>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {messages.slice(-5).map((message: WhatsappMessage) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg text-sm ${
                      message.direction === "outbound"
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "bg-gray-50 border-l-4 border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {message.direction === "outbound" ? "To you" : "From you"}
                        </p>
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You'll receive automatic notifications for issue updates, payment confirmations, and service announcements.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
}