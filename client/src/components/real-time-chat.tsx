import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Paperclip, Mic, Phone, Video, Users, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage, User, Issue } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChatProps {
  issueId?: number;
  participants?: User[];
}

export function RealTimeChat({ issueId, participants = [] }: ChatProps) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(issueId || null);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: chatMessages = [] } = useQuery({
    queryKey: ["/api/chat-messages", selectedChat],
    enabled: !!selectedChat,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  const { data: activeChats = [] } = useQuery({
    queryKey: ["/api/chat-rooms"],
    refetchInterval: 10000,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) =>
      apiRequest("POST", "/api/chat-messages", messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages", selectedChat] });
      setNewMessage("");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) =>
      apiRequest("PATCH", `/api/chat-messages/${messageId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat-messages", selectedChat] });
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    sendMessageMutation.mutate({
      message: newMessage,
      issueId: selectedChat,
      messageType: "text",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedChat) {
      // In a real implementation, you would upload the file and get a URL
      const fileUrl = URL.createObjectURL(file);
      sendMessageMutation.mutate({
        message: `File: ${file.name}`,
        issueId: selectedChat,
        messageType: file.type.startsWith("image/") ? "image" : "file",
        attachments: [fileUrl],
      });
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real implementation, you would start audio recording
    setTimeout(() => {
      setIsRecording(false);
      if (selectedChat) {
        sendMessageMutation.mutate({
          message: "Voice message",
          issueId: selectedChat,
          messageType: "audio",
          attachments: ["voice_note.wav"],
        });
      }
    }, 3000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const formatMessageTime = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t.justNow || "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return "🖼️";
      case "audio":
        return "🎵";
      case "file":
        return "📎";
      default:
        return "";
    }
  };

  return (
    <div className="flex h-96">
      {/* Chat List Sidebar */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold">{t.activeChats || "Active Chats"}</h3>
        </div>
        <ScrollArea className="h-80">
          <div className="p-2 space-y-2">
            {activeChats.map((chat: any) => (
              <div
                key={chat.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedChat === chat.id
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setSelectedChat(chat.id)}
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{chat.title?.charAt(0) || "I"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {chat.title || `Issue #${chat.id}`}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage || t.noMessages || "No messages"}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {chat.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>I</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">Issue #{selectedChat}</h4>
                  <p className="text-xs text-gray-500">
                    {participants.length} {t.participants || "participants"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Users className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <div className="space-y-4">
                      <h3 className="font-semibold">{t.participants || "Participants"}</h3>
                      {participants.map((user) => (
                        <div key={user.id} className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((message: ChatMessage) => {
                  const sender = users.find((u: User) => u.id === message.senderId);
                  const isOwnMessage = message.senderId === 1; // Current user ID

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? "order-2" : "order-1"}`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isOwnMessage
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                          }`}
                        >
                          {!isOwnMessage && (
                            <p className="text-xs font-medium mb-1">
                              {sender?.name || t.unknown || "Unknown"}
                            </p>
                          )}
                          <div className="flex items-center space-x-2">
                            {getMessageTypeIcon(message.messageType) && (
                              <span>{getMessageTypeIcon(message.messageType)}</span>
                            )}
                            <p className="text-sm">{message.message}</p>
                          </div>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="text-xs opacity-75">
                                  📎 {attachment}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                      {!isOwnMessage && (
                        <Avatar className="h-6 w-6 order-0 mr-2">
                          <AvatarFallback className="text-xs">
                            {sender?.name?.charAt(0) || "?"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,audio/*,.pdf,.doc,.docx"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                  <Input
                    placeholder={t.typeMessage || "Type a message..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={sendMessageMutation.isPending}
                  />
                </div>
                <Button
                  variant={isRecording ? "destructive" : "ghost"}
                  size="sm"
                  onClick={startRecording}
                  disabled={isRecording}
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t.selectChatToStart || "Select a chat to start messaging"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChatWidget({ issueId }: { issueId: number }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-96">
        <div className="h-full">
          <RealTimeChat issueId={issueId} />
        </div>
      </SheetContent>
    </Sheet>
  );
}