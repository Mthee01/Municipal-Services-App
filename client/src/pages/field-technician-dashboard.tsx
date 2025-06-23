import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  MapPin, Clock, Wrench, Camera, Package, MessageSquare, Navigation, 
  CheckCircle, AlertCircle, PlayCircle, StopCircle, Upload, Send,
  Phone, User, Calendar, MapIcon, Settings, Bell, Search, Filter
} from "lucide-react";

interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  ward: string | null;
  createdAt: Date;
  assignedTo?: string;
  technicianId?: number;
}

interface FieldReport {
  id: number;
  issueId: number;
  technicianId: number;
  reportType: string;
  description: string;
  findings: string;
  actionsTaken: string;
  materialsUsed: string[];
  photos: string[] | null;
  nextSteps: string;
  createdAt: Date;
}

interface PartsOrder {
  id: number;
  technicianId: number;
  partName: string;
  quantity: number;
  urgency: string;
  status: string;
  justification: string;
  orderDate: Date;
  expectedDelivery: Date | null;
}

interface TechnicianMessage {
  id: number;
  fromUserId: number;
  toUserId: number;
  subject: string;
  content: string;
  messageType: string;
  priority: string;
  sentAt: Date;
  readAt: Date | null;
}

interface WorkSession {
  issueId: number;
  arrivalTime?: Date;
  isActive: boolean;
}

export default function FieldTechnicianDashboard() {
  const [activeWorkSessions, setActiveWorkSessions] = useState<WorkSession[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [photoCapture, setPhotoCapture] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Current technician ID (would come from auth context in real app)
  const currentTechnicianId = 1;

  // Fetch assigned issues
  const { data: assignedIssues = [], isLoading: issuesLoading } = useQuery({
    queryKey: ['/api/issues', { status: 'assigned,in_progress', technicianId: currentTechnicianId }],
  });

  // Fetch field reports
  const { data: fieldReports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ['/api/field-reports', { technicianId: currentTechnicianId }],
  });

  // Fetch parts orders
  const { data: partsOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['/api/parts-orders', { technicianId: currentTechnicianId }],
  });

  // Fetch messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/technician-messages', { userId: currentTechnicianId }],
  });

  // Fetch parts inventory
  const { data: partsInventory = [] } = useQuery({
    queryKey: ['/api/parts-inventory'],
  });

  // Fetch active work sessions
  const { data: fetchedActiveSessions = [] } = useQuery({
    queryKey: ['/api/work-sessions/active', { technicianId: currentTechnicianId }],
  });

  // Combine fetched sessions with local state
  useEffect(() => {
    if (Array.isArray(fetchedActiveSessions) && fetchedActiveSessions.length > 0) {
      const sessionsWithDates = fetchedActiveSessions.map((session: any) => ({
        ...session,
        arrivalTime: session.arrivalTime ? new Date(session.arrivalTime) : undefined
      }));
      setActiveWorkSessions(sessionsWithDates as WorkSession[]);
    }
  }, [fetchedActiveSessions]);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn("Location access denied:", error);
        }
      );
    }
  }, []);

  // Start work session mutation
  const startWorkMutation = useMutation({
    mutationFn: async (issueId: number) => {
      return apiRequest("POST", "/api/work-sessions/start", {
        issueId,
        technicianId: currentTechnicianId,
        latitude: currentLocation?.lat?.toString() || '0',
        longitude: currentLocation?.lng?.toString() || '0',
        address: 'On site'
      });
    },
    onSuccess: (data, issueId) => {
      setActiveWorkSessions(prev => [...prev, { issueId, arrivalTime: new Date(), isActive: true }]);
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions/active'] });
      toast({
        title: "Work Session Started",
        description: "You have successfully started working on this issue.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start work session.",
        variant: "destructive",
      });
    }
  });

  // Complete work session mutation
  const completeWorkMutation = useMutation({
    mutationFn: async ({ issueId, notes }: { issueId: number; notes: string }) => {
      return apiRequest("POST", "/api/work-sessions/complete", {
        issueId,
        technicianId: currentTechnicianId,
        completionNotes: notes
      });
    },
    onSuccess: (data, { issueId }) => {
      setActiveWorkSessions(prev => prev.filter(session => session.issueId !== issueId));
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions/active'] });
      toast({
        title: "Work Completed",
        description: "Issue has been marked as resolved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete work session.",
        variant: "destructive",
      });
    }
  });

  // Create field report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const formData = new FormData();
      Object.keys(reportData).forEach(key => {
        if (key === 'photos' && reportData[key]) {
          reportData[key].forEach((file: File) => {
            formData.append('photos', file);
          });
        } else if (key === 'materialsUsed') {
          formData.append(key, JSON.stringify(reportData[key]));
        } else {
          formData.append(key, reportData[key]);
        }
      });
      
      return fetch('/api/field-reports', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/field-reports'] });
      setPhotoCapture([]);
      toast({
        title: "Report Submitted",
        description: "Field report has been successfully submitted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit field report.",
        variant: "destructive",
      });
    }
  });

  // Create parts order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/parts-orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parts-orders'] });
      toast({
        title: "Parts Order Submitted",
        description: "Your parts order has been submitted for approval.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit parts order.",
        variant: "destructive",
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return apiRequest("POST", "/api/technician-messages", messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technician-messages'] });
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    }
  });

  const handlePhotoCapture = (files: FileList | null) => {
    if (files) {
      const newPhotos = Array.from(files).slice(0, 5 - photoCapture.length);
      setPhotoCapture(prev => [...prev, ...newPhotos]);
    }
  };

  const getSessionForIssue = (issueId: number) => {
    return activeWorkSessions.find(session => session.issueId === issueId);
  };

  const calculateWorkDuration = (startTime: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              Field Technician Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage work assignments, reports, and communication
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0">
              <Navigation className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">
                {currentLocation ? 'Location Active' : 'Location Unavailable'}
              </span>
              <span className="sm:hidden">
                {currentLocation ? 'GPS On' : 'GPS Off'}
              </span>
            </Badge>
            <Button variant="outline" size="sm" className="flex-shrink-0 min-w-[44px] sm:min-w-[120px] px-2 sm:px-3">
              <Bell className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Notifications</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        <Tabs defaultValue="work-assignments" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="work-assignments" className="text-xs sm:text-sm">Work Orders</TabsTrigger>
            <TabsTrigger value="active-sessions" className="text-xs sm:text-sm">Active Work</TabsTrigger>
            <TabsTrigger value="field-reports" className="text-xs sm:text-sm">Reports</TabsTrigger>
            <TabsTrigger value="parts-ordering" className="text-xs sm:text-sm">Parts</TabsTrigger>
            <TabsTrigger value="communication" className="text-xs sm:text-sm">Messages</TabsTrigger>
            <TabsTrigger value="location-tracking" className="text-xs sm:text-sm">Location</TabsTrigger>
          </TabsList>

          {/* Work Assignments Tab */}
          <TabsContent value="work-assignments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Assigned Work Orders
                </CardTitle>
                <CardDescription>
                  Issues assigned to you for completion
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issuesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : assignedIssues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No work assignments available
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {assignedIssues.map((issue: Issue) => (
                      <WorkAssignmentCard
                        key={issue.id}
                        issue={issue}
                        session={getSessionForIssue(issue.id)}
                        onStartWork={() => startWorkMutation.mutate(issue.id)}
                        onViewDetails={() => setSelectedIssue(issue)}
                        isStarting={startWorkMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Sessions Tab */}
          <TabsContent value="active-sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Active Work Sessions
                </CardTitle>
                <CardDescription>
                  Currently active work sessions and timers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeWorkSessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No active work sessions
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {activeWorkSessions.map((session) => {
                      const issue = assignedIssues.find((i: Issue) => i.id === session.issueId);
                      return issue ? (
                        <ActiveSessionCard
                          key={session.issueId}
                          session={session}
                          issue={issue}
                          onComplete={(notes) => completeWorkMutation.mutate({ issueId: session.issueId, notes })}
                          isCompleting={completeWorkMutation.isPending}
                        />
                      ) : null;
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Field Reports Tab */}
          <TabsContent value="field-reports" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <FieldReportForm
                onSubmit={(data) => createReportMutation.mutate(data)}
                isSubmitting={createReportMutation.isPending}
                assignedIssues={assignedIssues}
                photoCapture={photoCapture}
                onPhotoCapture={handlePhotoCapture}
                fileInputRef={fileInputRef}
              />
              <FieldReportsHistory
                reports={fieldReports}
                isLoading={reportsLoading}
              />
            </div>
          </TabsContent>

          {/* Parts & Inventory Tab */}
          <TabsContent value="parts-ordering" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PartsOrderForm
                onSubmit={(data) => createOrderMutation.mutate(data)}
                isSubmitting={createOrderMutation.isPending}
                partsInventory={partsInventory}
              />
              <PartsOrderHistory
                orders={partsOrders}
                isLoading={ordersLoading}
              />
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <CommunicationPanel
                onSendMessage={(data) => sendMessageMutation.mutate(data)}
                isSending={sendMessageMutation.isPending}
              />
              <MessagesHistory
                messages={messages}
                isLoading={messagesLoading}
                currentUserId={currentTechnicianId}
              />
            </div>
          </TabsContent>

          {/* Location & Travel Tab */}
          <TabsContent value="location-tracking" className="space-y-6">
            <LocationTrackingPanel
              currentLocation={currentLocation}
              activeWorkSessions={activeWorkSessions}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Issue Details Dialog */}
      {selectedIssue && (
        <IssueDetailsDialog
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}

// Work Assignment Card Component
function WorkAssignmentCard({ 
  issue, 
  session, 
  onStartWork, 
  onViewDetails,
  isStarting 
}: { 
  issue: Issue; 
  session?: WorkSession; 
  onStartWork: () => void;
  onViewDetails: () => void;
  isStarting: boolean;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Content area with proper spacing */}
        <div className="p-4 pb-0">
          {/* Header with title and badges */}
          <div className="mb-3">
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <h3 className="font-semibold text-base leading-tight break-words flex-1 min-w-0">{issue.title}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`${getPriorityColor(issue.priority)} text-xs px-2 py-1 whitespace-nowrap`}>
                {issue.priority}
              </Badge>
              <Badge variant="outline" className={`${getStatusColor(issue.status)} text-xs px-2 py-1 whitespace-nowrap`}>
                {issue.status}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words leading-relaxed">
              {issue.description}
            </p>
          </div>

          {/* Location and date info */}
          <div className="mb-4 space-y-2">
            <div className="flex items-start gap-2 text-sm text-gray-500">
              <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span className="break-words leading-relaxed flex-1">{issue.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="whitespace-nowrap">{new Date(issue.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action buttons section */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="flex flex-col gap-3">
            {issue.status === 'resolved' || issue.status === 'completed' ? (
              <>
                <div className="flex items-center justify-center p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md">
                  <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">Issue Resolved</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewDetails}
                  className="w-full min-h-[48px] px-4 py-3 text-sm font-medium"
                >
                  <Search className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>View Details</span>
                </Button>
              </>
            ) : session ? (
              <>
                <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-md">
                  <PlayCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">Work In Progress</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewDetails}
                  className="w-full min-h-[48px] px-4 py-3 text-sm font-medium"
                >
                  <Search className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>View Details</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  size="sm" 
                  onClick={onStartWork}
                  disabled={isStarting}
                  className="w-full min-h-[48px] px-4 py-3 text-sm font-medium"
                >
                  <PlayCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>{isStarting ? 'Starting...' : 'Start Work'}</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onViewDetails}
                  className="w-full min-h-[48px] px-4 py-3 text-sm font-medium"
                >
                  <Search className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>View Details</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Active Session Card Component
function ActiveSessionCard({ 
  session, 
  issue, 
  onComplete,
  isCompleting 
}: { 
  session: WorkSession; 
  issue: Issue; 
  onComplete: (notes: string) => void;
  isCompleting: boolean;
}) {
  const [completionNotes, setCompletionNotes] = useState('');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold">{issue.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{issue.location}</p>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-2">
              <Clock className="w-3 h-3 mr-1" />
              {session.arrivalTime ? calculateWorkDuration(session.arrivalTime) : '0h 0m'}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="completion-notes">Completion Notes</Label>
            <Textarea
              id="completion-notes"
              placeholder="Describe the work completed..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={() => onComplete(completionNotes)}
            disabled={isCompleting || !completionNotes.trim()}
            className="w-full min-h-[44px] text-sm"
          >
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{isCompleting ? 'Completing...' : 'Complete Work'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Field Report Form Component
function FieldReportForm({ 
  onSubmit, 
  isSubmitting, 
  assignedIssues, 
  photoCapture, 
  onPhotoCapture,
  fileInputRef 
}: any) {
  const [formData, setFormData] = useState({
    issueId: '',
    reportType: 'progress',
    description: '',
    findings: '',
    actionsTaken: '',
    materialsUsed: '',
    nextSteps: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      issueId: parseInt(formData.issueId),
      technicianId: 1, // Current technician
      materialsUsed: formData.materialsUsed.split('\n').filter(Boolean),
      photos: photoCapture
    });
    setFormData({
      issueId: '',
      reportType: 'progress',
      description: '',
      findings: '',
      actionsTaken: '',
      materialsUsed: '',
      nextSteps: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Submit Field Report
        </CardTitle>
        <CardDescription>
          Document your work progress and findings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="issue-select">Select Issue</Label>
            <Select value={formData.issueId} onValueChange={(value) => setFormData(prev => ({ ...prev, issueId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an issue..." />
              </SelectTrigger>
              <SelectContent>
                {assignedIssues.map((issue: Issue) => (
                  <SelectItem key={issue.id} value={issue.id.toString()}>
                    {issue.title} - {issue.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={formData.reportType} onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Progress Update</SelectItem>
                <SelectItem value="completion">Work Completion</SelectItem>
                <SelectItem value="issue">Issue Found</SelectItem>
                <SelectItem value="safety">Safety Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the current status..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="findings">Findings</Label>
            <Textarea
              id="findings"
              placeholder="What did you discover..."
              value={formData.findings}
              onChange={(e) => setFormData(prev => ({ ...prev, findings: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="actions">Actions Taken</Label>
            <Textarea
              id="actions"
              placeholder="What work was performed..."
              value={formData.actionsTaken}
              onChange={(e) => setFormData(prev => ({ ...prev, actionsTaken: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="materials">Materials Used (one per line)</Label>
            <Textarea
              id="materials"
              placeholder="List materials used..."
              value={formData.materialsUsed}
              onChange={(e) => setFormData(prev => ({ ...prev, materialsUsed: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="next-steps">Next Steps</Label>
            <Textarea
              id="next-steps"
              placeholder="What needs to be done next..."
              value={formData.nextSteps}
              onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
            />
          </div>

          <div className="space-y-3">
            <Label>Photos ({photoCapture.length}/5)</Label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={photoCapture.length >= 5}
                className="min-h-[44px] text-sm whitespace-nowrap"
              >
                <Camera className="w-4 h-4 mr-2 flex-shrink-0" />
                <span>Add Photos</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => onPhotoCapture(e.target.files)}
                className="hidden"
              />
            </div>
            {photoCapture.length > 0 && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {photoCapture.map((file, index) => (
                  <div key={index} className="text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded truncate">
                    {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !formData.issueId || !formData.description} 
            className="w-full min-h-[48px] text-sm"
          >
            <Upload className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Field Reports History Component
function FieldReportsHistory({ reports, isLoading }: { reports: FieldReport[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report History</CardTitle>
        <CardDescription>
          Previously submitted field reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No reports submitted yet
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{report.reportType}</Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{report.description}</p>
                  {report.photos && report.photos.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-500">
                        {report.photos.length} photo(s) attached
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Parts Order Form Component
function PartsOrderForm({ onSubmit, isSubmitting, partsInventory }: any) {
  const [formData, setFormData] = useState({
    partName: '',
    quantity: 1,
    urgency: 'medium',
    justification: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      technicianId: 1, // Current technician
      status: 'pending'
    });
    setFormData({
      partName: '',
      quantity: 1,
      urgency: 'medium',
      justification: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Parts
        </CardTitle>
        <CardDescription>
          Request parts and materials for your work
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="part-name">Part Name</Label>
            <Input
              id="part-name"
              placeholder="Enter part name..."
              value={formData.partName}
              onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="urgency">Urgency</Label>
            <Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="justification">Justification</Label>
            <Textarea
              id="justification"
              placeholder="Why is this part needed..."
              value={formData.justification}
              onChange={(e) => setFormData(prev => ({ ...prev, justification: e.target.value }))}
              required
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full min-h-[48px] text-sm">
            <Package className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Order'}</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Parts Order History Component
function PartsOrderHistory({ orders, isLoading }: { orders: PartsOrder[]; isLoading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          Status of your parts orders
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No parts orders yet
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{order.partName}</span>
                    <Badge variant="outline" className={
                      order.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Quantity: {order.quantity}</p>
                    <p>Urgency: {order.urgency}</p>
                    <p>Ordered: {new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Communication Panel Component
function CommunicationPanel({ onSendMessage, isSending }: any) {
  const [messageData, setMessageData] = useState({
    toUserId: '',
    subject: '',
    content: '',
    messageType: 'general',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage({
      ...messageData,
      fromUserId: 1, // Current technician
      toUserId: parseInt(messageData.toUserId)
    });
    setMessageData({
      toUserId: '',
      subject: '',
      content: '',
      messageType: 'general',
      priority: 'medium'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Send Message
        </CardTitle>
        <CardDescription>
          Communicate with managers and call center
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipient">Recipient</Label>
            <Select value={messageData.toUserId} onValueChange={(value) => setMessageData(prev => ({ ...prev, toUserId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select recipient..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Technical Manager</SelectItem>
                <SelectItem value="3">Call Center Agent</SelectItem>
                <SelectItem value="4">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message-type">Message Type</Label>
            <Select value={messageData.messageType} onValueChange={(value) => setMessageData(prev => ({ ...prev, messageType: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="urgent">Urgent Request</SelectItem>
                <SelectItem value="status_update">Status Update</SelectItem>
                <SelectItem value="help_request">Help Request</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Message subject..."
              value={messageData.subject}
              onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              placeholder="Type your message..."
              value={messageData.content}
              onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
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
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {messages.map((message: TechnicianMessage) => (
                <div key={message.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{message.subject}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={
                        message.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                        message.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }>
                        {message.priority}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(message.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{message.content}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {message.fromUserId === currentUserId ? 'Sent' : 'Received'}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

// Location Tracking Panel Component
function LocationTrackingPanel({ currentLocation, activeWorkSessions }: any) {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="w-5 h-5" />
            Current Location
          </CardTitle>
          <CardDescription>
            Real-time location tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentLocation ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Latitude</Label>
                  <p className="text-sm font-mono">{currentLocation.lat.toFixed(6)}</p>
                </div>
                <div>
                  <Label>Longitude</Label>
                  <p className="text-sm font-mono">{currentLocation.lng.toFixed(6)}</p>
                </div>
              </div>
              <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Map visualization would appear here</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Location access not available
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Travel & Time Tracking</CardTitle>
          <CardDescription>
            Track time spent traveling between sites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeWorkSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No active sessions to track
              </div>
            ) : (
              activeWorkSessions.map((session: WorkSession) => (
                <div key={session.issueId} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Issue #{session.issueId}</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Clock className="w-3 h-3 mr-1" />
                      {session.arrivalTime ? calculateWorkDuration(session.arrivalTime) : '0h 0m'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Issue Details Dialog Component
function IssueDetailsDialog({ issue, onClose }: { issue: Issue; onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold truncate">{issue.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <span>Issue #{issue.id}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {issue.location}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">{issue.category}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <div>
                <Badge variant="outline" className={getPriorityColor(issue.priority)}>
                  {issue.priority}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Status</Label>
              <div>
                <Badge variant="outline" className={getStatusColor(issue.status)}>
                  {issue.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ward</Label>
              <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">{issue.ward || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Description</Label>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-sm leading-relaxed">{issue.description}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Created Date</Label>
            <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {new Date(issue.createdAt).toLocaleString()}
            </p>
          </div>

          {(issue.status === 'resolved' || issue.status === 'completed') && issue.resolvedAt && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Closing Date</Label>
              <p className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-2 rounded border border-blue-200 dark:border-blue-800">
                {new Date(issue.resolvedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose} className="min-w-[100px]">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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