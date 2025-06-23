import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageCircle, Send, Phone, User, Clock, CheckCircle2 } from "lucide-react";

interface WhatsappMessage {
  id: number;
  userId: number | null;
  phoneNumber: string;
  message: string;
  direction: string;
  messageId: string | null;
  status: string;
  timestamp: string;
  agentId: number | null;
  issueId: number | null;
  messageType: string;
  templateName: string | null;
}

interface WhatsappConversation {
  id: number;
  citizenId: number;
  agentId: number | null;
  phoneNumber: string;
  status: string;
  subject: string | null;
  issueId: number | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  lastMessageAt: string;
}

export default function WhatsAppDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<WhatsappConversation | null>(null);
  const [messageText, setMessageText] = useState("");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState("");

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<WhatsappConversation[]>({
    queryKey: ["/api/whatsapp/conversations"]
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<WhatsappMessage[]>({
    queryKey: ["/api/whatsapp/messages", selectedConversation?.phoneNumber],
    enabled: !!selectedConversation?.phoneNumber
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { phoneNumber: string; message: string; agentId: number; issueId?: number }) => {
      return await apiRequest("POST", "/api/whatsapp/send-message", data);
    },
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/conversations"] });
      toast({
        title: "Message Sent",
        description: "WhatsApp message sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update conversation status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (data: { conversationId: number; status: string; agentId?: number }) => {
      return await apiRequest("PATCH", `/api/whatsapp/conversations/${data.conversationId}/status`, {
        status: data.status,
        agentId: data.agentId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/whatsapp/conversations"] });
      toast({
        title: "Status Updated",
        description: "Conversation status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to update status: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      phoneNumber: selectedConversation.phoneNumber,
      message: messageText,
      agentId: 2, // Current agent ID (would come from auth context)
      issueId: selectedConversation.issueId || undefined
    });
  };

  const handleAssignToMe = (conversation: WhatsappConversation) => {
    updateStatusMutation.mutate({
      conversationId: conversation.id,
      status: "open",
      agentId: 2 // Current agent ID
    });
  };

  const handleCloseConversation = (conversation: WhatsappConversation) => {
    updateStatusMutation.mutate({
      conversationId: conversation.id,
      status: "closed"
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Communication Center</h1>
            <p className="text-gray-600">Communicate with citizens via WhatsApp</p>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Conversations List */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Conversations</h2>
            <p className="text-sm text-gray-600">{conversations.length} conversations</p>
          </div>

          {conversationsLoading ? (
            <div className="p-4 text-center text-gray-600">Loading conversations...</div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    selectedConversation?.id === conversation.id ? "bg-blue-50 border-blue-200" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {conversation.phoneNumber}
                        </p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.subject || "General inquiry"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(conversation.lastMessageAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge className={getStatusColor(conversation.status)}>
                        {conversation.status}
                      </Badge>
                      {conversation.issueId && (
                        <Badge variant="outline" className="text-xs">
                          Issue #{conversation.issueId}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex space-x-2">
                    {!conversation.agentId && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignToMe(conversation);
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        <User className="h-3 w-3 mr-1" />
                        Assign to Me
                      </Button>
                    )}
                    {conversation.status === "open" && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseConversation(conversation);
                        }}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.phoneNumber}</h3>
                      <p className="text-sm text-gray-600">{selectedConversation.subject}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(selectedConversation.status)}>
                    {selectedConversation.status}
                  </Badge>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center text-gray-600">Loading messages...</div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.direction === "outbound"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">
                            {formatTime(message.timestamp)}
                          </p>
                          {message.direction === "outbound" && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span className="text-xs opacity-70">{message.status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="self-end bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}