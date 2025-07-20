import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, FileText, AlertTriangle, Navigation, Eye, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
              <span className="ml-2 text-gray-600">Loading tracking status...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {techniciansWithLocations.map((technician) => {
                const isTracking = technician.location?.timestamp && 
                  new Date(technician.location.timestamp).getTime() > Date.now() - 30 * 60 * 1000;
                
                return (
                  <div 
                    key={technician.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTechnician(technician)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-gray-900">{technician.name}</span>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <Eye className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">GPS Tracking:</span>
                        <Badge variant={isTracking ? "default" : "secondary"} className={
                          isTracking ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                        }>
                          {isTracking ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <Badge variant="outline" className={
                          technician.status === 'available' ? 'border-green-200 text-green-700' :
                          technician.status === 'on_job' ? 'border-blue-200 text-blue-700' :
                          'border-gray-200 text-gray-700'
                        }>
                          {technician.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {techniciansWithLocations.length === 0 && !techniciansLoading && (
            <div className="text-center py-8 text-gray-500">
              No technicians found
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
              <div className="grid grid-cols-2 gap-4">
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