import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, X, Minimize2, Maximize2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage } from "@shared/schema";

interface ChatbotProps {
  userId?: number;
  onMinimize?: () => void;
  isMinimized?: boolean;
}

export default function Chatbot({ userId, onMinimize, isMinimized = false }: ChatbotProps) {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `citizen-${userId || 'guest'}-${Date.now()}`);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/chat", sessionId],
    queryFn: () => apiRequest(`/api/chat/${sessionId}`),
    enabled: isOpen,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) => apiRequest("POST", "/api/chat", messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat", sessionId] });
      setMessage("");
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageData = {
      sessionId,
      userId,
      message: message.trim(),
      isBot: false,
      messageType: "text",
    };

    sendMessageMutation.mutate(messageData);
  };

  const handleQuickReply = (option: string) => {
    setMessage(option);
    handleSendMessage();
  };

  const startChat = async () => {
    setIsOpen(true);
    
    // Send welcome message if no messages exist
    if (messages.length === 0) {
      const welcomeMessage = {
        sessionId,
        userId,
        message: "hello",
        isBot: false,
        messageType: "text",
      };
      sendMessageMutation.mutate(welcomeMessage);
    }
  };

  if (isMinimized) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 bg-sa-gold hover:bg-sa-gold/90 text-white shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  if (!isOpen) {
    return (
      <Button
        onClick={startChat}
        className="fixed bottom-4 right-4 rounded-full w-14 h-14 bg-sa-gold hover:bg-sa-gold/90 text-white shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-sa-gold" />
            <CardTitle className="text-lg">Municipal Assistant</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {onMinimize && (
              <Button variant="ghost" size="sm" onClick={onMinimize}>
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          I'm here to help with municipal services and information.
        </p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-sa-gold border-t-transparent rounded-full" />
              </div>
            ) : (
              messages.map((msg: ChatMessage) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      msg.isBot
                        ? "bg-gray-100 text-gray-900"
                        : "bg-sa-gold text-white"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {msg.isBot ? (
                        <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                      ) : (
                        <User className="w-4 h-4 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        
                        {/* Quick reply buttons */}
                        {msg.isBot && msg.messageType === "quick_reply" && msg.metadata?.options && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {msg.metadata.options.map((option: string, index: number) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-7"
                                onClick={() => handleQuickReply(option)}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="bg-sa-gold hover:bg-sa-gold/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick access buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickReply("Report Issue")}
            className="text-xs"
          >
            Report Issue
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickReply("Pay Bills")}
            className="text-xs"
          >
            Pay Bills
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickReply("Track Request")}
            className="text-xs"
          >
            Track Request
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickReply("Get Support")}
            className="text-xs"
          >
            Get Support
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}