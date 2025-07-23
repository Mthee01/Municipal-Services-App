import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ClipboardList, 
  User, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  MapPin,
  Phone,
  FileText,
  Wrench,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobOrder, Issue } from "@shared/schema";

interface JobOrderWithDetails extends JobOrder {
  issue: Issue;
  technicianName?: string;
  assignedByName?: string;
}

export default function JobOrderManagement() {
  const [selectedJobOrder, setSelectedJobOrder] = useState<JobOrderWithDetails | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [materialsRequired, setMaterialsRequired] = useState("");
  const [skillsRequired, setSkillsRequired] = useState("");
  const [safetyNotes, setSafetyNotes] = useState("");

  // Fetch all job orders with issue details
  const { data: jobOrders = [], isLoading: jobOrdersLoading } = useQuery<JobOrderWithDetails[]>({
    queryKey: ['/api/job-orders'],
    queryFn: async () => {
      const response = await fetch('/api/job-orders');
      if (!response.ok) {
        throw new Error('Failed to fetch job orders');
      }
      return response.json();
    },
  });

  // Fetch available technicians
  const { data: technicians = [] } = useQuery({
    queryKey: ['/api/technicians'],
    queryFn: async () => {
      const response = await fetch('/api/technicians');
      if (!response.ok) {
        throw new Error('Failed to fetch technicians');
      }
      return response.json();
    },
  });

  // Create job order mutation
  const createJobOrderMutation = useMutation({
    mutationFn: async (issueId: number) => {
      return apiRequest("POST", "/api/job-orders", {
        issueId,
        priority: "medium",
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-orders'] });
      toast({
        title: "Job Order Created",
        description: "New job order has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create job order.",
        variant: "destructive",
      });
    }
  });

  // Assign technician mutation
  const assignTechnicianMutation = useMutation({
    mutationFn: async ({ jobOrderId, technicianId, estimatedHours, specialInstructions, materialsRequired, skillsRequired, safetyNotes }: {
      jobOrderId: number;
      technicianId: number;
      estimatedHours?: number;
      specialInstructions?: string;
      materialsRequired?: string[];
      skillsRequired?: string[];
      safetyNotes?: string;
    }) => {
      return apiRequest("PATCH", `/api/job-orders/${jobOrderId}/assign`, {
        technicianId,
        estimatedHours,
        specialInstructions,
        materialsRequired,
        skillsRequired,
        safetyNotes,
        status: "assigned"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-orders'] });
      setAssignModalOpen(false);
      setSelectedJobOrder(null);
      toast({
        title: "Technician Assigned",
        description: "Job order has been assigned to technician successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to assign technician.",
        variant: "destructive",
      });
    }
  });

  const handleViewDetails = (jobOrder: JobOrderWithDetails) => {
    setSelectedJobOrder(jobOrder);
    setDetailsModalOpen(true);
  };

  const handleAssignTechnician = (jobOrder: JobOrderWithDetails) => {
    setSelectedJobOrder(jobOrder);
    setSelectedTechnician("");
    setEstimatedHours("");
    setSpecialInstructions("");
    setMaterialsRequired("");
    setSkillsRequired("");
    setSafetyNotes("");
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = () => {
    if (!selectedJobOrder || !selectedTechnician) return;

    const materialsArray = materialsRequired.split(',').map(m => m.trim()).filter(Boolean);
    const skillsArray = skillsRequired.split(',').map(s => s.trim()).filter(Boolean);

    assignTechnicianMutation.mutate({
      jobOrderId: selectedJobOrder.id,
      technicianId: parseInt(selectedTechnician),
      estimatedHours: estimatedHours ? parseInt(estimatedHours) : undefined,
      specialInstructions: specialInstructions || undefined,
      materialsRequired: materialsArray.length > 0 ? materialsArray : undefined,
      skillsRequired: skillsArray.length > 0 ? skillsArray : undefined,
      safetyNotes: safetyNotes || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter job orders by status
  const pendingJobOrders = jobOrders.filter(jo => jo.status === 'pending');
  const assignedJobOrders = jobOrders.filter(jo => jo.status === 'assigned');
  const inProgressJobOrders = jobOrders.filter(jo => jo.status === 'in_progress');
  const completedJobOrders = jobOrders.filter(jo => jo.status === 'completed');

  if (jobOrdersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600">Loading job orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Order Management</h1>
          <p className="text-gray-600">Manage work orders, assign technicians, and track progress</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingJobOrders.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assigned Orders</p>
                  <p className="text-2xl font-bold text-blue-600">{assignedJobOrders.length}</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">{inProgressJobOrders.length}</p>
                </div>
                <Settings className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedJobOrders.length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Job Orders Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({pendingJobOrders.length})</TabsTrigger>
            <TabsTrigger value="assigned">Assigned ({assignedJobOrders.length})</TabsTrigger>
            <TabsTrigger value="in_progress">In Progress ({inProgressJobOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedJobOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <JobOrderTable 
              jobOrders={pendingJobOrders} 
              onViewDetails={handleViewDetails}
              onAssignTechnician={handleAssignTechnician}
              showAssignButton={true}
            />
          </TabsContent>

          <TabsContent value="assigned" className="mt-6">
            <JobOrderTable 
              jobOrders={assignedJobOrders} 
              onViewDetails={handleViewDetails}
              onAssignTechnician={handleAssignTechnician}
              showAssignButton={false}
            />
          </TabsContent>

          <TabsContent value="in_progress" className="mt-6">
            <JobOrderTable 
              jobOrders={inProgressJobOrders} 
              onViewDetails={handleViewDetails}
              onAssignTechnician={handleAssignTechnician}
              showAssignButton={false}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            <JobOrderTable 
              jobOrders={completedJobOrders} 
              onViewDetails={handleViewDetails}
              onAssignTechnician={handleAssignTechnician}
              showAssignButton={false}
            />
          </TabsContent>
        </Tabs>

        {/* Job Order Details Modal */}
        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Job Order Details - {selectedJobOrder?.jobOrderNumber}
              </DialogTitle>
            </DialogHeader>
            
            {selectedJobOrder && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Job Order Number</Label>
                    <p className="text-lg font-mono">{selectedJobOrder.jobOrderNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge className={`${getStatusColor(selectedJobOrder.status)} mt-1`}>
                      {selectedJobOrder.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Priority</Label>
                    <Badge className={`${getPriorityColor(selectedJobOrder.priority)} mt-1`}>
                      {selectedJobOrder.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created</Label>
                    <p>{formatDate(selectedJobOrder.createdAt)}</p>
                  </div>
                </div>

                {/* Issue Information */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Issue Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Issue Title</Label>
                      <p className="font-medium">{selectedJobOrder.issue.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Category</Label>
                      <p>{selectedJobOrder.issue.category}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedJobOrder.issue.location}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Ward</Label>
                      <p>{selectedJobOrder.issue.ward}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Description</Label>
                      <p className="text-sm text-gray-700 mt-1">{selectedJobOrder.issue.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Reporter</Label>
                      <p>{selectedJobOrder.issue.reporterName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Contact</Label>
                      <p className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedJobOrder.issue.reporterPhone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assignment Information */}
                {selectedJobOrder.technicianId && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Assignment Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Assigned Technician</Label>
                        <p className="font-medium">{selectedJobOrder.technicianName || `Technician ${selectedJobOrder.technicianId}`}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Assigned Date</Label>
                        <p>{formatDate(selectedJobOrder.assignedAt)}</p>
                      </div>
                      {selectedJobOrder.estimatedHours && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Estimated Hours</Label>
                          <p className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {selectedJobOrder.estimatedHours}h
                          </p>
                        </div>
                      )}
                      {selectedJobOrder.actualHours && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Actual Hours</Label>
                          <p className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {selectedJobOrder.actualHours}h
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                {(selectedJobOrder.specialInstructions || selectedJobOrder.materialsRequired || selectedJobOrder.skillsRequired || selectedJobOrder.safetyNotes) && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Work Details
                    </h3>
                    <div className="space-y-3">
                      {selectedJobOrder.specialInstructions && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Special Instructions</Label>
                          <p className="text-sm text-gray-700 mt-1">{selectedJobOrder.specialInstructions}</p>
                        </div>
                      )}
                      {selectedJobOrder.materialsRequired && selectedJobOrder.materialsRequired.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Materials Required</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedJobOrder.materialsRequired.map((material, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedJobOrder.skillsRequired && selectedJobOrder.skillsRequired.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Skills Required</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedJobOrder.skillsRequired.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-blue-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedJobOrder.safetyNotes && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Safety Notes</Label>
                          <p className="text-sm text-red-700 mt-1 bg-red-50 p-2 rounded">
                            ⚠️ {selectedJobOrder.safetyNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Assign Technician Modal */}
        <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Assign Technician - {selectedJobOrder?.jobOrderNumber}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="technician">Select Technician *</Label>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech: any) => (
                      <SelectItem key={tech.id} value={tech.id.toString()}>
                        {tech.name} - {tech.department} ({tech.availability})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimated-hours">Estimated Hours</Label>
                <Input
                  id="estimated-hours"
                  type="number"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  placeholder="e.g., 4"
                />
              </div>

              <div>
                <Label htmlFor="special-instructions">Special Instructions</Label>
                <Textarea
                  id="special-instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any specific instructions for the technician..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="materials-required">Materials Required (comma-separated)</Label>
                <Input
                  id="materials-required"
                  value={materialsRequired}
                  onChange={(e) => setMaterialsRequired(e.target.value)}
                  placeholder="e.g., pipes, fittings, sealant"
                />
              </div>

              <div>
                <Label htmlFor="skills-required">Skills Required (comma-separated)</Label>
                <Input
                  id="skills-required"
                  value={skillsRequired}
                  onChange={(e) => setSkillsRequired(e.target.value)}
                  placeholder="e.g., plumbing, electrical, welding"
                />
              </div>

              <div>
                <Label htmlFor="safety-notes">Safety Notes</Label>
                <Textarea
                  id="safety-notes"
                  value={safetyNotes}
                  onChange={(e) => setSafetyNotes(e.target.value)}
                  placeholder="Important safety considerations..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignSubmit}
                  disabled={!selectedTechnician || assignTechnicianMutation.isPending}
                >
                  {assignTechnicianMutation.isPending ? 'Assigning...' : 'Assign Technician'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Job Order Table Component
function JobOrderTable({ 
  jobOrders, 
  onViewDetails, 
  onAssignTechnician, 
  showAssignButton 
}: {
  jobOrders: JobOrderWithDetails[];
  onViewDetails: (jobOrder: JobOrderWithDetails) => void;
  onAssignTechnician: (jobOrder: JobOrderWithDetails) => void;
  showAssignButton: boolean;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-ZA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (jobOrders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg text-gray-600 mb-2">No job orders found</p>
          <p className="text-sm text-gray-500">Job orders will appear here when created</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Order #</TableHead>
              <TableHead>Issue Title</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobOrders.map((jobOrder) => (
              <TableRow key={jobOrder.id}>
                <TableCell>
                  <span className="font-mono text-sm">{jobOrder.jobOrderNumber}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{jobOrder.issue.title}</p>
                    <p className="text-sm text-gray-500">{jobOrder.issue.category}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-sm">{jobOrder.issue.location}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityColor(jobOrder.priority)}>
                    {jobOrder.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(jobOrder.status)}>
                    {jobOrder.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {jobOrder.technicianName || (jobOrder.technicianId ? `Tech ${jobOrder.technicianId}` : 'Unassigned')}
                </TableCell>
                <TableCell>{formatDate(jobOrder.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewDetails(jobOrder)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {showAssignButton && (
                      <Button
                        size="sm"
                        onClick={() => onAssignTechnician(jobOrder)}
                      >
                        <User className="w-4 h-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}