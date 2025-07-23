import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  MapPin, 
  MessageSquare, 
  FileText,
  Play, 
  Square, 
  Navigation,
  Send,
  Clock,
  User,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Issue {
  id: number;
  title: string;
  description: string;
  location: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'emergency';
  status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assignedTo: number | null;
  assignedToName: string | null;
  createdAt: string;
  referenceNumber: string;
}

interface WorkSession {
  id: number;
  issueId: number;
  technicianId: number;
  startTime: string;
  endTime?: string;
  status: 'active' | 'completed';
  notes?: string;
  issueTitle?: string;
  issueLocation?: string;
}

interface CompletionReport {
  id: number;
  issueId: number;
  technicianId: number;
  workDescription: string;
  timeSpent: number;
  materialsUsed: string;
  customerSatisfaction: number;
  completedAt: string;
  issueTitle?: string;
}

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  subject: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  fromUserName?: string;
}

export default function FieldTechnicianDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Current user ID - would typically come from auth context
  const currentUserId = 7; // Field technician user ID
  
  // State for UI
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showIssueDetails, setShowIssueDetails] = useState(false);
  const [messageData, setMessageData] = useState({ subject: '', content: '' });
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // API Queries
  const { data: issues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['/api/technicians/issues', currentUserId],
    queryFn: () => apiRequest(`/api/technicians/issues?technicianId=${currentUserId}`),
  });

  const { data: workSessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/technicians/work-sessions', currentUserId],
    queryFn: () => apiRequest(`/api/technicians/work-sessions?technicianId=${currentUserId}`),
  });

  const { data: completionReports = [] } = useQuery({
    queryKey: ['/api/technicians/completion-reports', currentUserId],
    queryFn: () => apiRequest(`/api/technicians/completion-reports?technicianId=${currentUserId}`),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/technicians/messages', currentUserId],
    queryFn: () => apiRequest(`/api/technicians/messages?technicianId=${currentUserId}`),
  });

  // Mutations
  const startWorkMutation = useMutation({
    mutationFn: (issueId: number) => apiRequest('/api/technicians/start-work', 'POST', { issueId, technicianId: currentUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/work-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/issues'] });
      toast({ title: 'Work session started', description: 'You can now track your progress on this issue.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to start work session', variant: 'destructive' });
    }
  });

  const completeWorkMutation = useMutation({
    mutationFn: (data: { sessionId: number; notes: string }) => 
      apiRequest('/api/technicians/complete-work', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/work-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/issues'] });
      toast({ title: 'Work completed', description: 'Issue has been resolved successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to complete work', variant: 'destructive' });
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData: any) => apiRequest('/api/technicians/messages', 'POST', messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/messages'] });
      setMessageData({ subject: '', content: '' });
      toast({ title: 'Message sent', description: 'Your message has been sent successfully.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to send message', variant: 'destructive' });
    }
  });

  // Location tracking functions
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Error', description: 'Geolocation not supported by this browser', variant: 'destructive' });
      return;
    }

    setIsTracking(true);
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationAccuracy(accuracy);
        
        // Send location update to server
        apiRequest('/api/technicians/location', 'POST', {
          technicianId: currentUserId,
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString()
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({ title: 'Location Error', description: 'Failed to get current location', variant: 'destructive' });
        setIsTracking(false);
      },
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  };

  const stopLocationTracking = () => {
    setIsTracking(false);
  };

  const handleStartWork = (issue: Issue) => {
    startWorkMutation.mutate(issue.id);
  };

  const handleCompleteWork = (sessionId: number, notes: string) => {
    if (!notes.trim()) {
      toast({ title: 'Error', description: 'Please provide completion notes', variant: 'destructive' });
      return;
    }
    completeWorkMutation.mutate({ sessionId, notes });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageData.subject.trim() || !messageData.content.trim()) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }
    
    sendMessageMutation.mutate({
      fromUserId: currentUserId,
      toUserId: 5, // Tech manager ID
      subject: messageData.subject,
      content: messageData.content
    });
  };

  const generateJobOrderNumber = (issueId: number) => {
    const paddedId = issueId.toString().padStart(3, '0');
    const year = new Date().getFullYear();
    return `JO-${paddedId}-${year}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Field Technician Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your work assignments and track progress
          </p>
        </div>

        <Tabs defaultValue="work-orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="work-orders" className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Work Orders
            </TabsTrigger>
            <TabsTrigger value="active-work" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Active Work
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </TabsTrigger>
          </TabsList>

          <TabsContent value="work-orders">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Work Orders</CardTitle>
                <CardDescription>
                  Issues assigned to you that need attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issuesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : issues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No work orders assigned
                  </div>
                ) : (
                  <div className="space-y-4">
                    {issues.map((issue: Issue) => (
                      <div key={issue.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {generateJobOrderNumber(issue.id)}
                            </Badge>
                            <Badge className={getPriorityColor(issue.priority)}>
                              {issue.priority}
                            </Badge>
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedIssue(issue);
                                setShowIssueDetails(true);
                              }}
                            >
                              Details
                            </Button>
                            {issue.status === 'assigned' && (
                              <Button
                                size="sm"
                                onClick={() => handleStartWork(issue)}
                                disabled={startWorkMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Start Work
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {issue.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {issue.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {issue.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active-work">
            <Card>
              <CardHeader>
                <CardTitle>Active Work Sessions</CardTitle>
                <CardDescription>
                  Track your ongoing work and complete tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : workSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active work sessions
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workSessions.map((session: WorkSession) => (
                      <div key={session.id} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              IN PROGRESS
                            </Badge>
                            <span className="text-sm text-gray-600">
                              Started: {new Date(session.startTime).toLocaleTimeString()}
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              const notes = prompt('Enter completion notes:');
                              if (notes) {
                                handleCompleteWork(session.id, notes);
                              }
                            }}
                            disabled={completeWorkMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Complete Work
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {session.issueTitle || `Issue #${session.issueId}`}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {session.issueLocation || 'Location not specified'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Duration: {calculateWorkDuration(new Date(session.startTime))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <div className="grid gap-6 md:grid-cols-2">
              <SendMessageForm 
                messageData={messageData} 
                setMessageData={setMessageData}
                onSubmit={handleSendMessage}
                isSending={sendMessageMutation.isPending}
              />
              
              <MessagesHistory 
                messages={messages} 
                isLoading={false}
                currentUserId={currentUserId}
              />
            </div>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Location Tracking</CardTitle>
                <CardDescription>
                  Share your location with the dispatch center
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">GPS Tracking</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow the system to track your location for dispatch coordination
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!isTracking ? (
                        <Button onClick={startLocationTracking} className="bg-green-600 hover:bg-green-700 text-white">
                          <Navigation className="w-4 h-4 mr-2" />
                          Start Tracking
                        </Button>
                      ) : (
                        <Button onClick={stopLocationTracking} variant="outline">
                          <Square className="w-4 h-4 mr-2" />
                          Stop Tracking
                        </Button>
                      )}
                    </div>
                  </div>

                  {currentLocation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-100">Current Location</span>
                        {isTracking && (
                          <div className="flex items-center gap-1 text-green-600">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm">Live</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <div>Latitude: {currentLocation.lat.toFixed(6)}</div>
                        <div>Longitude: {currentLocation.lng.toFixed(6)}</div>
                        {locationAccuracy && (
                          <div>Accuracy: ±{Math.round(locationAccuracy)}m</div>
                        )}
                      </div>
                    </div>
                  )}

                  {!currentLocation && isTracking && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Getting your location...</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Issue Details Dialog */}
        <Dialog open={showIssueDetails} onOpenChange={setShowIssueDetails}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Issue Details</DialogTitle>
            </DialogHeader>
            
            {selectedIssue && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {generateJobOrderNumber(selectedIssue.id)}
                  </Badge>
                  <Badge className={getPriorityColor(selectedIssue.priority)}>
                    {selectedIssue.priority}
                  </Badge>
                  <Badge className={getStatusColor(selectedIssue.status)}>
                    {selectedIssue.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</Label>
                  <p className="mt-1 text-sm">{selectedIssue.title}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{selectedIssue.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</Label>
                    <p className="mt-1 text-sm">{selectedIssue.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</Label>
                    <p className="mt-1 text-sm">{selectedIssue.category}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</Label>
                  <p className="mt-1 text-sm">{new Date(selectedIssue.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowIssueDetails(false)}>
                    Close
                  </Button>
                  {selectedIssue.status === 'assigned' && (
                    <Button
                      onClick={() => {
                        handleStartWork(selectedIssue);
                        setShowIssueDetails(false);
                      }}
                      disabled={startWorkMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Work
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Send Message Form Component
function SendMessageForm({ messageData, setMessageData, onSubmit, isSending }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Message</CardTitle>
        <CardDescription>
          Send a message to your supervisor or dispatch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Message subject..."
              value={messageData.subject}
              onChange={(e) => setMessageData((prev: any) => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              placeholder="Type your message..."
              value={messageData.content}
              onChange={(e) => setMessageData((prev: any) => ({ ...prev, content: e.target.value }))}
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={isSending} className="w-full">
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Messages History Component
function MessagesHistory({ messages, isLoading, currentUserId }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Message History</CardTitle>
        <CardDescription>
          Recent communication
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages yet
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message: Message) => (
              <div key={message.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{message.subject}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{message.content}</p>
                <div className="text-xs text-gray-500 mt-1">
                  From: {message.fromUserName || 'System'}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function calculateWorkDuration(startTime: Date) {
  const now = new Date();
  const diffMs = now.getTime() - startTime.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  return `${hours}h ${minutes}m`;
}