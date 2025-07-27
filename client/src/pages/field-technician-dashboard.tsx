import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
  AlertTriangle,
  Package,
  ShoppingCart,
  Truck,
  CheckSquare,
  Camera,
  X,
  Award,
  Star,
  Trophy
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
  partsOrderId?: number;
  partsOrderStatus?: 'none' | 'pending' | 'approved' | 'ordered' | 'delivered' | 'installed';
}

interface PartsOrder {
  id: number;
  technicianId: number;
  issueId: number;
  orderNumber: string;
  status: 'pending' | 'approved' | 'ordered' | 'delivered' | 'cancelled';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  partsRequested: string[];
  justification: string;
  totalEstimatedCost?: number;
  createdAt: string;
  approvedAt?: string;
  deliveredAt?: string;
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

interface AchievementBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  isRare: boolean;
  pointsRequired: number;
}

interface TechnicianBadge {
  id: number;
  technicianId: number;
  earnedAt: string;
  reason?: string;
  badge: AchievementBadge;
}

interface TechnicianStats {
  id: number;
  technicianId: number;
  totalIssuesCompleted: number;
  averageRating: number;
  fastCompletions: number;
  perfectRatings: number;
  streakDays: number;
  longestStreak: number;
  emergencyResponses: number;
  totalHoursWorked: number;
  badgesEarned: number;
  lastUpdated: string;
}

export default function FieldTechnicianDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Current user ID - would typically come from auth context
  const currentUserId = 6; // Field technician user ID (matching test data)
  
  // State for UI
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showIssueDetails, setShowIssueDetails] = useState(false);
  const [messageData, setMessageData] = useState({ subject: '', content: '' });
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  // Parts ordering state
  const [showPartsOrderDialog, setShowPartsOrderDialog] = useState(false);
  const [selectedWorkSession, setSelectedWorkSession] = useState<WorkSession | null>(null);
  const [partsOrderData, setPartsOrderData] = useState({
    parts: [''],
    justification: '',
    priority: 'normal' as 'urgent' | 'high' | 'normal' | 'low'
  });
  const [showPartsStatusDialog, setShowPartsStatusDialog] = useState(false);
  const [selectedPartsOrder, setSelectedPartsOrder] = useState<PartsOrder | null>(null);
  const [showCompletionReportDialog, setShowCompletionReportDialog] = useState(false);
  const [selectedSessionForCompletion, setSelectedSessionForCompletion] = useState<WorkSession | null>(null);
  const [completionReportData, setCompletionReportData] = useState({
    workCompleted: '',
    materialsUsed: [''],
    timeTaken: '',
    issuesFound: '',
    recommendations: '',
    customerSatisfaction: 5,
    additionalNotes: '',
    photos: [] as string[]
  });
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [showCompletedWorkDetails, setShowCompletedWorkDetails] = useState(false);
  const [selectedCompletedWork, setSelectedCompletedWork] = useState<any>(null);

  // API Queries
  const { data: issues = [], isLoading: issuesLoading, error: issuesError } = useQuery({
    queryKey: ['/api/issues', currentUserId],
    queryFn: () => apiRequest('GET', `/api/issues?technicianId=${currentUserId}`),
  });



  const { data: workSessions = [], isLoading: sessionsLoading, error: sessionsError } = useQuery({
    queryKey: ['/api/work-sessions/active', currentUserId],
    queryFn: () => apiRequest('GET', `/api/work-sessions/active?technicianId=${currentUserId}`),
  });



  const { data: completionReports = [] } = useQuery({
    queryKey: ['/api/completion-reports', currentUserId],
    queryFn: () => apiRequest('GET', `/api/completion-reports?technicianId=${currentUserId}`),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['/api/messages', currentUserId],
    queryFn: () => apiRequest(`/api/messages?userId=${currentUserId}`, 'GET'),
  });

  const { data: partsOrders = [] } = useQuery({
    queryKey: ['/api/parts-orders', currentUserId],
    queryFn: () => apiRequest(`/api/parts-orders?technicianId=${currentUserId}`, 'GET'),
  });

  const { data: fieldReports = [] } = useQuery({
    queryKey: ['/api/field-reports', currentUserId],
    queryFn: () => apiRequest('GET', `/api/field-reports?technicianId=${currentUserId}`),
  });

  // Achievement Badge Queries
  const { data: technicianBadges = [] } = useQuery({
    queryKey: ['/api/technicians', currentUserId, 'badges'],
    queryFn: () => apiRequest('GET', `/api/technicians/${currentUserId}/badges`),
  });

  const { data: technicianStats } = useQuery({
    queryKey: ['/api/technicians', currentUserId, 'stats'],
    queryFn: () => apiRequest('GET', `/api/technicians/${currentUserId}/stats`),
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ['/api/achievement-badges'],
    queryFn: () => apiRequest('GET', '/api/achievement-badges'),
  });

  // Mutations
  const startWorkMutation = useMutation({
    mutationFn: (issueId: number) => apiRequest('/api/work-sessions/start', 'POST', { issueId, technicianId: currentUserId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-sessions/active'] });
      queryClient.invalidateQueries({ queryKey: ['/api/issues'] });
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

  const createPartsOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest('/api/parts-orders', 'POST', orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parts-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/work-sessions'] });
      setShowPartsOrderDialog(false);
      setPartsOrderData({ parts: [''], justification: '', priority: 'normal' });
      toast({ title: 'Parts order created', description: 'Your parts order has been submitted for approval.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to create parts order', variant: 'destructive' });
    }
  });

  const updatePartsOrderMutation = useMutation({
    mutationFn: ({ orderId, updates }: { orderId: number; updates: any }) => 
      apiRequest(`/api/parts-orders/${orderId}`, 'PATCH', updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parts-orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/work-sessions'] });
      toast({ title: 'Parts status updated', description: 'Parts order status has been updated.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to update parts order', variant: 'destructive' });
    }
  });

  const createCompletionReportMutation = useMutation({
    mutationFn: (reportData: any) => apiRequest('/api/technicians/completion-reports', 'POST', reportData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/completion-reports'] });
      queryClient.invalidateQueries({ queryKey: ['/api/technicians/work-sessions'] });
      setShowCompletionReportDialog(false);
      setCompletionReportData({
        workCompleted: '',
        materialsUsed: [''],
        timeTaken: '',
        issuesFound: '',
        recommendations: '',
        customerSatisfaction: 5,
        additionalNotes: '',
        photos: []
      });
      toast({ title: 'Completion report submitted', description: 'Report has been sent to technical manager.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to submit completion report', variant: 'destructive' });
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

  const handleCompleteWork = (sessionId: number) => {
    // Check if there are pending parts orders for this work session
    const session = workSessions.find((s: WorkSession) => s.id === sessionId);
    if (session) {
      const issuePartsOrders = partsOrders.filter((order: PartsOrder) => order.issueId === session.issueId);
      const pendingOrders = issuePartsOrders.filter((order: PartsOrder) => 
        order.status !== 'cancelled' && order.status !== 'delivered'
      );
      
      if (pendingOrders.length > 0) {
        toast({ 
          title: 'Cannot complete work', 
          description: 'Please ensure all parts are delivered and installed before completing work.',
          variant: 'destructive' 
        });
        return;
      }
    }
    
    // Open completion report dialog instead of directly completing work
    setSelectedSessionForCompletion(session);
    setShowCompletionReportDialog(true);
  };

  const handleOrderParts = (session: WorkSession) => {
    setSelectedWorkSession(session);
    setShowPartsOrderDialog(true);
  };

  const handleSubmitPartsOrder = () => {
    if (!selectedWorkSession || !partsOrderData.justification.trim() || partsOrderData.parts.filter(p => p.trim()).length === 0) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const orderData = {
      technicianId: currentUserId,
      issueId: selectedWorkSession.issueId,
      partsRequested: partsOrderData.parts.filter(p => p.trim()),
      justification: partsOrderData.justification,
      priority: partsOrderData.priority,
      orderNumber: `PO-${Date.now().toString().slice(-6)}-${String(currentUserId).padStart(3, '0')}`
    };

    createPartsOrderMutation.mutate(orderData);
  };

  const handleUpdatePartsStatus = (orderId: number, status: string) => {
    updatePartsOrderMutation.mutate({ orderId, updates: { status } });
    setShowPartsStatusDialog(false);
  };

  const addPartsField = () => {
    setPartsOrderData(prev => ({ ...prev, parts: [...prev.parts, ''] }));
  };

  const removePartsField = (index: number) => {
    setPartsOrderData(prev => ({ 
      ...prev, 
      parts: prev.parts.filter((_, i) => i !== index) 
    }));
  };

  const updatePartsField = (index: number, value: string) => {
    setPartsOrderData(prev => ({ 
      ...prev, 
      parts: prev.parts.map((part, i) => i === index ? value : part) 
    }));
  };

  const getPartsOrderForIssue = (issueId: number) => {
    return partsOrders.find((order: PartsOrder) => order.issueId === issueId && order.status !== 'cancelled');
  };

  const handleSubmitCompletionReport = () => {
    if (!selectedSessionForCompletion || !completionReportData.workCompleted.trim() || !completionReportData.timeTaken.trim()) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const reportData = {
      issueId: selectedSessionForCompletion.issueId,
      technicianId: currentUserId,
      jobCardNumber: `JC-${String(selectedSessionForCompletion.issueId).padStart(3, '0')}-${new Date().getFullYear()}`,
      workCompleted: completionReportData.workCompleted,
      materialsUsed: completionReportData.materialsUsed.filter(m => m.trim()),
      timeTaken: parseInt(completionReportData.timeTaken),
      issuesFound: completionReportData.issuesFound,
      recommendations: completionReportData.recommendations,
      customerSatisfaction: completionReportData.customerSatisfaction,
      additionalNotes: completionReportData.additionalNotes,
      photos: completionReportData.photos
    };

    createCompletionReportMutation.mutate(reportData);
    
    // After successful report submission, complete the work session
    completeWorkMutation.mutate({ 
      sessionId: selectedSessionForCompletion.id, 
      notes: `Work completed with report: ${completionReportData.workCompleted}` 
    });
  };

  const addMaterialField = () => {
    setCompletionReportData(prev => ({ ...prev, materialsUsed: [...prev.materialsUsed, ''] }));
  };

  const removeMaterialField = (index: number) => {
    setCompletionReportData(prev => ({ 
      ...prev, 
      materialsUsed: prev.materialsUsed.filter((_, i) => i !== index) 
    }));
  };

  const updateMaterialField = (index: number, value: string) => {
    setCompletionReportData(prev => ({ 
      ...prev, 
      materialsUsed: prev.materialsUsed.map((material, i) => i === index ? value : material) 
    }));
  };

  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsCapturingPhoto(true);
    const newPhotos: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          // Convert to base64 for storage
          const reader = new FileReader();
          const photoPromise = new Promise<string>((resolve) => {
            reader.onload = (e) => {
              resolve(e.target?.result as string);
            };
            reader.readAsDataURL(file);
          });
          const photoData = await photoPromise;
          newPhotos.push(photoData);
        }
      }

      setCompletionReportData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));

      toast({ 
        title: 'Photos added', 
        description: `${newPhotos.length} photo(s) added to completion report` 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to process photos', 
        variant: 'destructive' 
      });
    } finally {
      setIsCapturingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    setCompletionReportData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const openCamera = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
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

  const handleNavigateToLocation = (location: string) => {
    // Encode the location for URL
    const encodedLocation = encodeURIComponent(location);
    
    // Create Google Maps URL for navigation
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}`;
    
    // Open in new tab/window
    window.open(mapsUrl, '_blank');
    
    toast({
      title: 'Opening Navigation',
      description: `Getting directions to ${location}`,
    });
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm p-2">
            <TabsList className="grid w-full grid-cols-6 bg-gray-50 dark:bg-gray-700 rounded-md h-auto p-1">
              <TabsTrigger 
                value="work-orders" 
                className="flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm hover:bg-white/50 transition-all duration-200"
              >
                <ClipboardList className="w-5 h-5" />
                <span className="whitespace-nowrap">Work Orders</span>
              </TabsTrigger>
              <TabsTrigger 
                value="active-work" 
                className="flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm hover:bg-white/50 transition-all duration-200"
              >
                <Play className="w-5 h-5" />
                <span className="whitespace-nowrap">Active Work</span>
              </TabsTrigger>
              <TabsTrigger 
                value="completed-work" 
                className="flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-sm hover:bg-white/50 transition-all duration-200"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="whitespace-nowrap">Completed</span>
              </TabsTrigger>
              <TabsTrigger 
                value="field-reports" 
                className="flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-sm hover:bg-white/50 transition-all duration-200"
              >
                <FileText className="w-5 h-5" />
                <span className="whitespace-nowrap">Reports</span>
              </TabsTrigger>
              <TabsTrigger 
                value="messages" 
                className="flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm hover:bg-white/50 transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="whitespace-nowrap">Messages</span>
              </TabsTrigger>
              <TabsTrigger 
                value="location" 
                className="flex flex-col items-center gap-1 px-3 py-3 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-red-700 data-[state=active]:shadow-sm hover:bg-white/50 transition-all duration-200"
              >
                <MapPin className="w-5 h-5" />
                <span className="whitespace-nowrap">Location</span>
              </TabsTrigger>

            </TabsList>
          </div>

          <TabsContent value="work-orders">
            <Card>
              <CardHeader>
                <CardTitle>Work Orders</CardTitle>
                <CardDescription>
                  Assigned issues awaiting work start - click "Start Work" to begin
                </CardDescription>
              </CardHeader>
              <CardContent>
                {issuesLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {issues.filter((issue: Issue) => ['assigned', 'open'].includes(issue.status)).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No work orders awaiting start
                      </div>
                    ) : issues.filter((issue: Issue) => ['assigned', 'open'].includes(issue.status)).map((issue: Issue) => (
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
                            {(issue.status === 'assigned' || issue.status === 'open') && (
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
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span 
                                  className="cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                                  onClick={() => handleNavigateToLocation(issue.location)}
                                  title="Click to get directions"
                                >
                                  {issue.location}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleNavigateToLocation(issue.location)}
                              className="flex items-center gap-1 text-xs px-2 py-1 h-7"
                            >
                              <Navigation className="w-3 h-3" />
                              Navigate
                            </Button>
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
                  Work currently in progress - manage parts orders and complete tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workSessions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No active work sessions
                      </div>
                    ) : (
                      workSessions.map((session: WorkSession) => {
                      const partsOrder = getPartsOrderForIssue(session.issueId);
                      const canComplete = !partsOrder || partsOrder.status === 'delivered';
                      
                      return (
                        <div key={session.id} className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                IN PROGRESS
                              </Badge>
                              <span className="text-sm text-gray-600">
                                Started: {(() => {
                                  try {
                                    const startDate = new Date(session.startTime);
                                    if (isNaN(startDate.getTime())) {
                                      return 'Invalid date';
                                    }
                                    return `${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                                  } catch (error) {
                                    return 'Invalid date';
                                  }
                                })()}
                              </span>
                              {partsOrder && (
                                <Badge className={getPartsStatusColor(partsOrder.status)}>
                                  Parts: {partsOrder.status}
                                </Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!partsOrder ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOrderParts(session)}
                                  disabled={createPartsOrderMutation.isPending}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                  <Package className="w-4 h-4 mr-2" />
                                  Order Parts
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedPartsOrder(partsOrder);
                                    setShowPartsStatusDialog(true);
                                  }}
                                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                                >
                                  <Truck className="w-4 h-4 mr-2" />
                                  Update Parts
                                </Button>
                              )}
                              <Button
                                size="sm"
                                onClick={() => handleCompleteWork(session.id)}
                                disabled={completeWorkMutation.isPending || !canComplete}
                                className={`text-white ${canComplete 
                                  ? 'bg-green-600 hover:bg-green-700' 
                                  : 'bg-gray-400 cursor-not-allowed'}`}
                                title={!canComplete ? 'Parts must be delivered before completing work' : 'Submit completion report and close work'}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Complete Work
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {generateJobOrderNumber(session.issueId)}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {session.issueTitle || `Work Session for ${generateJobOrderNumber(session.issueId)}`}
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4 text-gray-500">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span 
                                    className={`${session.issueLocation && session.issueLocation !== 'Location not specified' ? 'cursor-pointer hover:text-blue-600 hover:underline transition-colors' : 'text-gray-400'}`}
                                    onClick={() => {
                                      if (session.issueLocation && session.issueLocation !== 'Location not specified') {
                                        handleNavigateToLocation(session.issueLocation);
                                      }
                                    }}
                                    title={session.issueLocation && session.issueLocation !== 'Location not specified' ? "Click to get directions" : "No location available"}
                                  >
                                    {session.issueLocation || 'Location not specified'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Duration: {calculateWorkDuration(new Date(session.startTime))}
                                </div>
                              </div>
                              {session.issueLocation && session.issueLocation !== 'Location not specified' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleNavigateToLocation(session.issueLocation)}
                                  className="flex items-center gap-1 text-xs px-2 py-1 h-7"
                                >
                                  <Navigation className="w-3 h-3" />
                                  Navigate
                                </Button>
                              )}
                            </div>
                            
                            {partsOrder && (
                              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    Parts Order: {partsOrder.orderNumber}
                                  </span>
                                  <Badge className={getPartsStatusColor(partsOrder.status)}>
                                    {partsOrder.status}
                                  </Badge>
                                </div>
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                  <div>Parts: {partsOrder.partsRequested.join(', ')}</div>
                                  <div className="mt-1">Priority: {partsOrder.priority}</div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      })
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed-work">
            <Card>
              <CardHeader>
                <CardTitle>Completed Work History</CardTitle>
                <CardDescription>
                  View details of your completed jobs and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {completionReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No completed work reports yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completionReports.map((report: any) => (
                      <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {report.jobCardNumber}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                              Completed
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                              {'★'.repeat(report.customerSatisfaction)}
                              <span className="ml-1 text-gray-500">({report.customerSatisfaction}/5)</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCompletedWork(report);
                              setShowCompletedWorkDetails(true);
                            }}
                          >
                            View Details
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {report.workCompleted.substring(0, 100)}{report.workCompleted.length > 100 ? '...' : ''}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {report.timeTaken} minutes
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {report.materialsUsed.length} materials used
                            </div>
                            {report.photos && report.photos.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Camera className="w-4 h-4" />
                                {report.photos.length} photos
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400">
                            Completed: {new Date(report.createdAt).toLocaleString()}
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



          <TabsContent value="field-reports">
            <Card>
              <CardHeader>
                <CardTitle>Field Reports</CardTitle>
                <CardDescription>
                  Your submitted field reports and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fieldReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No field reports submitted yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fieldReports.map((report: any) => (
                      <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {report.reportType.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {generateJobOrderNumber(report.issueId)}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {report.description}
                          </h3>
                          {report.findings && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Findings:</span> {report.findings}
                            </p>
                          )}
                          {report.actionsTaken && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Actions:</span> {report.actionsTaken}
                            </p>
                          )}
                          {report.materialsUsed && report.materialsUsed.length > 0 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Materials:</span> {report.materialsUsed.join(', ')}
                            </p>
                          )}
                          {report.nextSteps && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Next Steps:</span> {report.nextSteps}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

        {/* Parts Order Dialog */}
        <Dialog open={showPartsOrderDialog} onOpenChange={setShowPartsOrderDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Order Parts</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Parts Required</Label>
                <div className="space-y-2 mt-2">
                  {partsOrderData.parts.map((part, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Enter part name/description"
                        value={part}
                        onChange={(e) => updatePartsField(index, e.target.value)}
                        className="flex-1"
                      />
                      {partsOrderData.parts.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePartsField(index)}
                          className="px-2"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPartsField}
                    className="w-full"
                  >
                    + Add Another Part
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Priority</Label>
                <div className="flex gap-2 mt-2">
                  {(['normal', 'high', 'urgent'] as const).map((priority) => (
                    <Button
                      key={priority}
                      type="button"
                      variant={partsOrderData.priority === priority ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPartsOrderData(prev => ({ ...prev, priority }))}
                      className="capitalize"
                    >
                      {priority}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Justification</Label>
                <Textarea
                  placeholder="Explain why these parts are needed..."
                  value={partsOrderData.justification}
                  onChange={(e) => setPartsOrderData(prev => ({ 
                    ...prev, 
                    justification: e.target.value 
                  }))}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPartsOrderDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitPartsOrder}
                  disabled={createPartsOrderMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Submit Order
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Parts Status Update Dialog */}
        <Dialog open={showPartsStatusDialog} onOpenChange={setShowPartsStatusDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Update Parts Status</DialogTitle>
            </DialogHeader>
            
            {selectedPartsOrder && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                  <div className="text-sm font-medium">Order: {selectedPartsOrder.orderNumber}</div>
                  <div className="text-sm text-gray-600">Current Status: {selectedPartsOrder.status}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Parts: {selectedPartsOrder.partsRequested.join(', ')}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Update Status</Label>
                  <div className="space-y-2 mt-2">
                    {selectedPartsOrder.status === 'pending' && (
                      <div className="text-sm text-orange-600">
                        ⏳ Waiting for management approval
                      </div>
                    )}
                    {selectedPartsOrder.status === 'approved' && (
                      <div className="text-sm text-blue-600">
                        ✅ Approved - Parts are being ordered
                      </div>
                    )}
                    {selectedPartsOrder.status === 'ordered' && (
                      <Button
                        onClick={() => handleUpdatePartsStatus(selectedPartsOrder.id, 'delivered')}
                        disabled={updatePartsOrderMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Mark as Delivered & Installed
                      </Button>
                    )}
                    {selectedPartsOrder.status === 'delivered' && (
                      <div className="text-sm text-green-600">
                        ✅ Parts delivered and installed - You can now complete the work
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPartsStatusDialog(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Completion Report Dialog */}
        <Dialog open={showCompletionReportDialog} onOpenChange={setShowCompletionReportDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Work Completion Report</DialogTitle>
              <p className="text-sm text-gray-600">Complete this report to close the work session and notify technical manager</p>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedSessionForCompletion && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Issue: {selectedSessionForCompletion.issueTitle}
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    Job Card: JC-{String(selectedSessionForCompletion.issueId).padStart(3, '0')}-{new Date().getFullYear()}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Work Completed *</Label>
                <Textarea
                  placeholder="Describe the work that was completed..."
                  value={completionReportData.workCompleted}
                  onChange={(e) => setCompletionReportData(prev => ({ 
                    ...prev, 
                    workCompleted: e.target.value 
                  }))}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Materials Used</Label>
                <div className="space-y-2 mt-2">
                  {completionReportData.materialsUsed.map((material, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Enter material/part used"
                        value={material}
                        onChange={(e) => updateMaterialField(index, e.target.value)}
                        className="flex-1"
                      />
                      {completionReportData.materialsUsed.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMaterialField(index)}
                          className="px-2"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMaterialField}
                    className="w-full"
                  >
                    + Add Material
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Time Taken (minutes) *</Label>
                  <Input
                    type="number"
                    placeholder="120"
                    value={completionReportData.timeTaken}
                    onChange={(e) => setCompletionReportData(prev => ({ 
                      ...prev, 
                      timeTaken: e.target.value 
                    }))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Customer Satisfaction (1-5)</Label>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        type="button"
                        variant={completionReportData.customerSatisfaction === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCompletionReportData(prev => ({ 
                          ...prev, 
                          customerSatisfaction: rating 
                        }))}
                        className="w-8 h-8 p-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Issues Found</Label>
                <Textarea
                  placeholder="Describe any additional issues discovered during work..."
                  value={completionReportData.issuesFound}
                  onChange={(e) => setCompletionReportData(prev => ({ 
                    ...prev, 
                    issuesFound: e.target.value 
                  }))}
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Recommendations</Label>
                <Textarea
                  placeholder="Any recommendations for preventive maintenance or follow-up..."
                  value={completionReportData.recommendations}
                  onChange={(e) => setCompletionReportData(prev => ({ 
                    ...prev, 
                    recommendations: e.target.value 
                  }))}
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Additional Notes</Label>
                <Textarea
                  placeholder="Any additional comments or observations..."
                  value={completionReportData.additionalNotes}
                  onChange={(e) => setCompletionReportData(prev => ({ 
                    ...prev, 
                    additionalNotes: e.target.value 
                  }))}
                  rows={2}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Work Photos</Label>
                <div className="mt-2 space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openCamera}
                      disabled={isCapturingPhoto}
                      className="flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      {isCapturingPhoto ? 'Processing...' : 'Take Photos'}
                    </Button>
                    <span className="text-sm text-gray-500 flex items-center">
                      Document completed work, before/after conditions
                    </span>
                  </div>
                  
                  {completionReportData.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {completionReportData.photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img 
                            src={photo} 
                            alt={`Work photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCompletionReportDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitCompletionReport}
                  disabled={createCompletionReportMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Report & Complete Work
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Completed Work Details Dialog */}
        <Dialog open={showCompletedWorkDetails} onOpenChange={setShowCompletedWorkDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Completion Report Details</DialogTitle>
              <DialogDescription>
                Full details of completed work and documentation
              </DialogDescription>
            </DialogHeader>
            
            {selectedCompletedWork && (
              <div className="space-y-6">
                {/* Header Information */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium text-green-900 dark:text-green-100">Job Card Number</Label>
                    <p className="text-lg font-mono text-green-800 dark:text-green-200">{selectedCompletedWork.jobCardNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-green-900 dark:text-green-100">Customer Satisfaction</Label>
                    <div className="flex items-center gap-2">
                      <div className="text-yellow-500">
                        {'★'.repeat(selectedCompletedWork.customerSatisfaction)}
                        {'☆'.repeat(5 - selectedCompletedWork.customerSatisfaction)}
                      </div>
                      <span className="text-sm text-green-700 dark:text-green-300">
                        ({selectedCompletedWork.customerSatisfaction}/5)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Work Details */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Work Completed</Label>
                    <p className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                      {selectedCompletedWork.workCompleted}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Time Taken</Label>
                      <p className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                        {selectedCompletedWork.timeTaken} minutes
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Materials Used</Label>
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                        {selectedCompletedWork.materialsUsed.map((material: string, index: number) => (
                          <div key={index} className="text-sm">• {material}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedCompletedWork.issuesFound && (
                    <div>
                      <Label className="text-sm font-medium">Issues Found</Label>
                      <p className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border text-sm">
                        {selectedCompletedWork.issuesFound}
                      </p>
                    </div>
                  )}

                  {selectedCompletedWork.recommendations && (
                    <div>
                      <Label className="text-sm font-medium">Recommendations</Label>
                      <p className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border text-sm">
                        {selectedCompletedWork.recommendations}
                      </p>
                    </div>
                  )}

                  {selectedCompletedWork.additionalNotes && (
                    <div>
                      <Label className="text-sm font-medium">Additional Notes</Label>
                      <p className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                        {selectedCompletedWork.additionalNotes}
                      </p>
                    </div>
                  )}

                  {/* Photos Section */}
                  {selectedCompletedWork.photos && selectedCompletedWork.photos.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Work Documentation Photos</Label>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedCompletedWork.photos.map((photo: string, index: number) => (
                          <div key={index} className="relative group">
                            <img 
                              src={photo} 
                              alt={`Work documentation ${index + 1}`}
                              className="w-full h-32 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                              onClick={() => window.open(photo, '_blank')}
                            />
                            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                              Photo {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Click photos to view full size</p>
                    </div>
                  )}

                  {/* Completion Info */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Report submitted: {new Date(selectedCompletedWork.createdAt).toLocaleString()}</span>
                      <span>Sent to Technical Manager</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setShowCompletedWorkDetails(false)}>
                    Close
                  </Button>
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

function calculateWorkDuration(startTime: Date | string) {
  try {
    const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const now = new Date();
    
    // Check if the date is valid
    if (isNaN(start.getTime())) {
      return '0h 0m';
    }
    
    const diffMs = now.getTime() - start.getTime();
    
    // Handle negative durations (future dates)
    if (diffMs < 0) {
      return '0h 0m';
    }
    
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating work duration:', error);
    return '0h 0m';
  }
}

function getPartsStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'ordered': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}