import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, FileText, AlertTriangle, Navigation } from "lucide-react";

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
  // Get all technicians with their current locations
  const { data: techniciansWithLocations = [], isLoading: techniciansLoading, error } = useQuery<Technician[]>({
    queryKey: ["/api/technicians-with-locations"],
    refetchInterval: 10000, // Refetch every 10 seconds for real-time tracking
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Calculate live tracking count (technicians updated within last 30 minutes)
  const liveTrackedCount = techniciansWithLocations.filter(tech => 
    tech.location?.timestamp && 
    new Date(tech.location.timestamp).getTime() > Date.now() - 30 * 60 * 1000
  ).length;

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
              <h2 className="text-xl font-semibold text-gray-900">Real-time Technician Locations</h2>
              <p className="text-sm text-gray-600">Monitor field staff locations and status in real-time</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-2" />
            <span className="text-red-600">Failed to load technician locations</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-orange-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Real-time Technician Locations</h2>
              <p className="text-sm text-gray-600">Monitor field staff locations and status in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">{liveTrackedCount} live</span>
            </div>
            <span className="text-sm text-gray-500">Updates every 10s</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {techniciansLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <span className="ml-2 text-gray-600">Loading technician locations...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techniciansWithLocations.map((technician) => {
              const isRecent = technician.location?.timestamp && 
                new Date(technician.location.timestamp).getTime() > Date.now() - 30 * 60 * 1000;
              
              return (
                <div 
                  key={technician.id} 
                  className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                    isRecent ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{technician.name}</h3>
                      <p className="text-sm text-gray-600">{technician.department}</p>
                      <p className="text-xs text-gray-500">{technician.phone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        technician.status === 'on_job' ? 'bg-yellow-100 text-yellow-800' :
                        technician.status === 'available' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {technician.status.replace('_', ' ')}
                      </div>
                      {isRecent && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  
                  {technician.location ? (
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 break-words">
                          {technician.location.address || 
                           `${parseFloat(technician.location.latitude).toFixed(4)}, ${parseFloat(technician.location.longitude).toFixed(4)}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-700">
                          {formatTimeAgo(technician.location.timestamp)}
                        </span>
                      </div>
                      
                      {technician.location.currentIssueId && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-green-500" />
                          <span className="text-gray-700">
                            Working on issue #{technician.location.currentIssueId}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-4">
                          {technician.location.speed && (
                            <div className="flex items-center gap-1">
                              <Navigation className="h-3 w-3" />
                              <span>{technician.location.speed}km/h</span>
                            </div>
                          )}
                          {technician.location.accuracy && (
                            <span>±{technician.location.accuracy}m</span>
                          )}
                        </div>
                        {technician.location.isOnSite && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            On Site
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Location not available</span>
                    </div>
                  )}
                  
                  {/* Performance indicators */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Completed: {technician.completedIssues}</span>
                      <span>Rating: {technician.performanceRating}/5</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {techniciansWithLocations.length === 0 && (
              <div className="col-span-full text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No technicians currently being tracked</p>
                <p className="text-sm text-gray-400 mt-2">Technicians will appear here when location tracking is enabled</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}