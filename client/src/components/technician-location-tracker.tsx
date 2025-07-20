import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, FileText, AlertTriangle, Navigation, Eye, User, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface TechnicianLocation {
  id: number;
  technicianId: number;
  latitude: string;
  longitude: string;
  address?: string;
  isOnSite?: boolean;
  currentIssueId?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
}

interface Technician {
  id: number;
  name: string;
  phone: string;
  email?: string;
  department: string;
  skills: string[];
  status: string;
  currentLocation?: string;
  latitude?: string;
  longitude?: string;
  teamId?: number;
  performanceRating: number;
  completedIssues: number;
  avgResolutionTime: number;
  lastUpdate: string;
  location?: TechnicianLocation;
}

export function TechnicianLocationTracker() {
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  
  // Get all technicians with their current locations
  const { data: techniciansWithLocations = [], isLoading: techniciansLoading, error } = useQuery<Technician[]>({
    queryKey: ["/api/technicians-with-locations"],
    refetchInterval: 10000, // Refetch every 10 seconds for real-time tracking
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Calculate tracking enabled/disabled counts
  const enabledCount = techniciansWithLocations.filter(tech => 
    tech.location?.timestamp && 
    new Date(tech.location.timestamp).getTime() > Date.now() - 30 * 60 * 1000
  ).length;
  
  const totalCount = techniciansWithLocations.length;

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const updateTime = new Date(timestamp).getTime();
    const diffMinutes = Math.floor((now - updateTime) / (1000 * 60));
    
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Technician Location Tracking</h2>
              <p className="text-sm text-gray-600">Monitor field staff GPS tracking status</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
            <span className="text-red-600">Failed to load technician tracking status</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-orange-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Technician Location Tracking</h2>
                <p className="text-sm text-gray-600">Monitor field staff GPS tracking status</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">{enabledCount} enabled</span>
              </div>
              <span className="text-sm text-gray-500">Updates every 10s</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {techniciansLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="ml-2 text-gray-600">Loading technicians...</span>
            </div>
          ) : (
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Technician to View Location
              </label>
              <Select onValueChange={(value) => {
                const technician = techniciansWithLocations.find(t => t.id.toString() === value);
                if (technician) setSelectedTechnician(technician);
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a technician..." />
                </SelectTrigger>
                <SelectContent>
                  {techniciansWithLocations.map((technician) => {
                    const isTracking = technician.location?.timestamp && 
                      new Date(technician.location.timestamp).getTime() > Date.now() - 30 * 60 * 1000;
                    
                    return (
                      <SelectItem key={technician.id} value={technician.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{technician.name}</span>
                          <div className="flex items-center gap-2 ml-4">
                            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <span className="text-xs text-gray-500">
                              {isTracking ? 'Tracking' : 'Offline'}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              
              {techniciansWithLocations.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No technicians available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detailed Location Modal */}
      <Dialog open={!!selectedTechnician} onOpenChange={() => setSelectedTechnician(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              {selectedTechnician?.name} - Location Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedTechnician && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-900">{selectedTechnician.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge variant="outline" className={
                    selectedTechnician.status === 'available' ? 'border-green-200 text-green-700' :
                    selectedTechnician.status === 'on_job' ? 'border-blue-200 text-blue-700' :
                    'border-gray-200 text-gray-700'
                  }>
                    {selectedTechnician.status === 'on_job' ? 'On Job' : 
                     selectedTechnician.status === 'available' ? 'Available' : 
                     selectedTechnician.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">GPS Tracking</label>
                  <Badge variant={selectedTechnician.location?.timestamp && 
                    new Date(selectedTechnician.location.timestamp).getTime() > Date.now() - 30 * 60 * 1000 ? 
                    "default" : "secondary"} className={
                    selectedTechnician.location?.timestamp && 
                    new Date(selectedTechnician.location.timestamp).getTime() > Date.now() - 30 * 60 * 1000 ? 
                    "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                  }>
                    {selectedTechnician.location?.timestamp && 
                     new Date(selectedTechnician.location.timestamp).getTime() > Date.now() - 30 * 60 * 1000 ? 
                     "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              {selectedTechnician.location ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Location</label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900">
                        Lat: {selectedTechnician.location.latitude}, Lng: {selectedTechnician.location.longitude}
                      </p>
                      {selectedTechnician.location.accuracy && (
                        <p className="text-xs text-gray-500">
                          Accuracy: ±{Math.round(Number(selectedTechnician.location.accuracy))} meters
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700">Last Update</label>
                    <p className="text-gray-900">{formatTimeAgo(selectedTechnician.location.timestamp)}</p>
                  </div>
                  
                  {selectedTechnician.location.isOnSite && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Navigation className="h-4 w-4 text-blue-600" />
                      <span className="text-blue-700 font-medium">Technician is currently on-site</span>
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${selectedTechnician.location?.latitude},${selectedTechnician.location?.longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="w-full"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    View on Map
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-yellow-800 font-medium">Location Unavailable</p>
                    <p className="text-sm text-yellow-700">GPS tracking is disabled or no recent location data</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}