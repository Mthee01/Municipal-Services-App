import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Send, Phone, Clock, CheckCircle2, AlertCircle, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface WhatsappMessage {
  id: number;
  phoneNumber: string;
  message: string;
  direction: string;
  timestamp: string;
  agentId: number | null;
  status: string;
  messageType: string;
}

interface WhatsappConversation {
  id: number;
  phoneNumber: string;
  status: string;
  subject: string | null;
  agentId: number | null;
  createdAt: string;
  lastMessageAt: string;
}

interface CitizenWhatsAppCenterProps {
  userId?: number;
  phoneNumber?: string;
}

export default function CitizenWhatsAppCenter({ userId, phoneNumber: initialPhoneNumber }: CitizenWhatsAppCenterProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "");
  const [message, setMessage] = useState("");
  const [isConnected, setIsConnected] = useState(!!initialPhoneNumber);
  const [subject, setSubject] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [currentConversation, setCurrentConversation] = useState<WhatsappConversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const categories = [
    { value: "water_sanitation", label: "Water & Sanitation" },
    { value: "electricity", label: "Electricity" },
    { value: "roads_transport", label: "Roads & Transport" },
    { value: "waste_management", label: "Waste Management" },
    { value: "safety_security", label: "Safety & Security" },
    { value: "housing", label: "Housing" },
    { value: "other", label: "Other" },
  ];

  // Fetch conversations for this phone number
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/whatsapp/conversations", phoneNumber],
    queryFn: async () => {
      const response = await apiRequest(`/api/whatsapp/conversations?phoneNumber=${phoneNumber}`);
      return response as WhatsappConversation[];
    },
    enabled: !!phoneNumber && isConnected,
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  // Fetch messages for current conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/whatsapp/messages", currentConversation?.id],
    queryFn: async () => {
      const response = await apiRequest(`/api/whatsapp/messages?conversationId=${currentConversation?.id}`);
      return response as WhatsappMessage[];
    },
    enabled: !!currentConversation,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time effect
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", "/api/whatsapp/send-message", messageData);
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/messages", currentConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/conversations", phoneNumber] });
      toast({
        title: "Message sent",
        description: "Your message has been sent to the call center.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Start conversation mutation
  const startConversationMutation = useMutation({
    mutationFn: async (conversationData: any) => {
      const response = await apiRequest("POST", "/api/whatsapp/start-conversation", conversationData);
      return response as WhatsappConversation;
    },
    onSuccess: (newConversation) => {
      setCurrentConversation(newConversation);
      setIsConnected(true);
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/conversations", phoneNumber] });
      toast({
        title: "Connected to WhatsApp Center",
        description: "You can now communicate with our call center agents.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversations.length > 0 && !currentConversation) {
      // Set the most recent open conversation as current
      const openConversation = conversations.find((c: WhatsappConversation) => c.status === "open");
      if (openConversation) {
        setCurrentConversation(openConversation);
      }
    }
  }, [conversations, currentConversation]);

  const handleConnect = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to connect.",
        variant: "destructive",
      });
      return;
    }

    if (!subject.trim() || !issueCategory) {
      toast({
        title: "Details required",
        description: "Please provide a subject and select an issue category.",
        variant: "destructive",
      });
      return;
    }

    startConversationMutation.mutate({
      citizenId: userId || 1,
      phoneNumber: phoneNumber.trim(),
      subject: subject.trim(),
      issueCategory,
      agentId: null, // Will be assigned by call center
    });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentConversation) return;

    sendMessageMutation.mutate({
      phoneNumber: phoneNumber,
      message: message.trim(),
      conversationId: currentConversation.id,
      direction: "inbound",
      userId: userId,
      messageType: "text",
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "assigned": return "bg-blue-100 text-blue-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-green-600 text-white">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6" />
            <CardTitle>WhatsApp Communication Center</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connect with our call center agents via WhatsApp for immediate assistance with your municipal service needs.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Your Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+27123456789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +27 for South Africa)</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Issue Category</label>
                <Select value={issueCategory} onValueChange={setIssueCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select the type of issue" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full"
                />
              </div>

              <Button 
                onClick={handleConnect}
                disabled={startConversationMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {startConversationMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start WhatsApp Conversation
                  </>
                )}
              </Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">How it works:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enter your phone number and issue details</li>
                <li>• Get connected with a call center agent</li>
                <li>• Receive real-time assistance via WhatsApp</li>
                <li>• Track your conversation history</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Connection Status */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Connected to WhatsApp Center</span>
              <Badge variant="outline">{phoneNumber}</Badge>
            </div>
            {currentConversation && (
              <Badge className={getStatusColor(currentConversation.status)}>
                {currentConversation.status.charAt(0).toUpperCase() + currentConversation.status.slice(1)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Area */}
      <Card className="h-96">
        <CardHeader className="bg-green-600 text-white py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-medium">
                {currentConversation?.subject || "WhatsApp Chat"}
              </span>
            </div>
            {currentConversation?.agentId && (
              <div className="flex items-center space-x-2 text-green-100">
                <User className="h-4 w-4" />
                <span className="text-sm">Agent assigned</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 h-72 overflow-y-auto">
          <div className="p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg: WhatsappMessage, index: number) => (
                <div
                  key={index}
                  className={`flex ${msg.direction === 'inbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.direction === 'inbound'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs ${
                        msg.direction === 'inbound' ? 'text-green-100' : 'text-gray-500'
                      }`}>
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.direction === 'inbound' && (
                        <CheckCircle2 className="h-3 w-3 ml-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-3">
            <Textarea
              placeholder="Type your message to the call center..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 min-h-[60px] resize-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-green-600 hover:bg-green-700 px-6"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardContent className="p-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Need help?</h4>
            <p className="text-sm text-blue-700 mb-2">
              Our call center agents are available to assist you with:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Service request status updates</li>
              <li>• Bill payment assistance</li>
              <li>• Emergency service reporting</li>
              <li>• General municipal inquiries</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}