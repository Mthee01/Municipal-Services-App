import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Layers, ZoomIn, ZoomOut, Navigation, Filter, RefreshCw, Users, ChevronDown, ChevronUp } from "lucide-react";
import type { Issue } from "@shared/schema";

interface GISMapProps {
  issues: Issue[];
  technicians?: any[];
  wards?: any[];
  onIssueSelect?: (issue: Issue) => void;
  onTechnicianSelect?: (technician: any) => void;
  height?: string;
  showFilters?: boolean;
  showLegend?: boolean;
}

interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export function GISMapIntegration({ 
  issues, 
  technicians = [], 
  wards = [], 
  onIssueSelect, 
  onTechnicianSelect,
  height = "500px",
  showFilters = false,
  showLegend = false 
}: GISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState(12);
  const [centerLocation, setCenterLocation] = useState<GeoLocation>({
    lat: -26.2041, // Johannesburg coordinates
    lng: 28.0473,
    address: "Johannesburg, South Africa"
  });
  
  const [layersExpanded, setLayersExpanded] = useState(false);
  const [mapLayers, setMapLayers] = useState<MapLayer[]>([
    { id: "water_sanitation", name: "Water & Sanitation", visible: true, color: "#3B82F6" },
    { id: "electricity", name: "Electricity", visible: true, color: "#EAB308" },
    { id: "roads_transport", name: "Roads & Transport", visible: true, color: "#EF4444" },
    { id: "waste_management", name: "Waste Management", visible: true, color: "#10B981" },
    { id: "safety_security", name: "Safety & Security", visible: true, color: "#8B5CF6" },
    { id: "housing", name: "Housing", visible: true, color: "#F97316" }
  ]);

  // Simulate geocoding for issue locations
  const geocodeLocation = (location: string): GeoLocation => {
    // Mock geocoding - in real implementation, use Google Maps Geocoding API
    const baseCoords = { lat: -26.2041, lng: 28.0473 };
    const offset = () => (Math.random() - 0.5) * 0.1; // Random offset within ~5km
    
    return {
      lat: baseCoords.lat + offset(),
      lng: baseCoords.lng + offset(),
      address: location
    };
  };

  const issuesWithCoordinates = issues.map(issue => ({
    ...issue,
    coordinates: geocodeLocation(issue.location)
  }));

  const filteredIssues = selectedLayer === "all" 
    ? issuesWithCoordinates 
    : issuesWithCoordinates.filter(issue => issue.category === selectedLayer);

  const techniciansWithCoordinates = technicians.map(tech => ({
    ...tech,
    coordinates: geocodeLocation(tech.currentLocation || "Johannesburg, South Africa")
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "#EF4444";
      case "in_progress": return "#F59E0B";
      case "resolved": return "#10B981";
      default: return "#6B7280";
    }
  };

  const getTechnicianStatusColor = (status: string) => {
    switch (status) {
      case "available": return "#10B981";
      case "busy": return "#F59E0B";
      case "offline": return "#6B7280";
      default: return "#8B5CF6";
    }
  };

  const toggleLayer = (layerId: string) => {
    setMapLayers(prev => 
      prev.map(layer => 
        layer.id === layerId 
          ? { ...layer, visible: !layer.visible }
          : layer
      )
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'water & sanitation':
      case 'water_sanitation':
        return '💧';
      case 'electricity':
        return '⚡';
      case 'roads & transport':
      case 'roads_transport':
        return '🛣️';
      case 'waste management':
      case 'waste_management':
        return '🗑️';
      case 'safety & security':
      case 'safety_security':
        return '🛡️';
      case 'housing':
        return '🏠';
      default:
        return '📍';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
      case 'reported':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    // Initialize map (in real implementation, use Leaflet or Google Maps)
    if (mapRef.current) {
      // Map initialization would go here
      console.log("Map initialized with", filteredIssues.length, "issues");
    }
  }, [filteredIssues]);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span className="text-base sm:text-lg">Municipal Services GIS Map</span>
          </CardTitle>
          
          {/* Mobile-responsive filter controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {showFilters && (
              <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Select layer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {mapLayers.map(layer => (
                    <SelectItem key={layer.id} value={layer.id}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: layer.color }}
                        />
                        {layer.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Statistics summary for mobile */}
            <div className="flex justify-between sm:justify-start gap-4 text-xs text-gray-600 sm:hidden">
              <span>{filteredIssues.length} Issues</span>
              <span>{techniciansWithCoordinates.length} Technicians</span>
              <span>{wards.length} Wards</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Mobile Controls - Horizontal on mobile */}
          <div className="flex lg:flex-col gap-2 lg:w-auto w-full justify-center lg:justify-start">
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.min(prev + 1, 20))}>
              <ZoomIn className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Zoom In</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setZoomLevel(prev => Math.max(prev - 1, 1))}>
              <ZoomOut className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Zoom Out</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCenterLocation({
              lat: -26.2041,
              lng: 28.0473,
              address: "Johannesburg, South Africa"
            })}>
              <Navigation className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Center</span>
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {/* Map Container */}
          <div className="flex-1 min-h-0">
            <div 
              ref={mapRef}
              className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 rounded-lg border-2 border-gray-300 shadow-lg relative touch-manipulation h-64 sm:h-80 lg:h-96 overflow-hidden"
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), 
                                  radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
                                  radial-gradient(circle at 40% 80%, rgba(139, 92, 246, 0.05) 0%, transparent 50%)`
              }}
            >
              {/* Enhanced Map View */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 rounded-lg">
                {/* Street Grid Background */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="streets" width="10" height="10" patternUnits="userSpaceOnUse">
                      <rect width="10" height="10" fill="transparent"/>
                      <path d="M 0 5 L 10 5 M 5 0 L 5 10" stroke="#64748b" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#streets)"/>
                  {/* Major roads */}
                  <line x1="0" y1="33" x2="100" y2="33" stroke="#475569" strokeWidth="1" opacity="0.4"/>
                  <line x1="0" y1="66" x2="100" y2="66" stroke="#475569" strokeWidth="1" opacity="0.4"/>
                  <line x1="25" y1="0" x2="25" y2="100" stroke="#475569" strokeWidth="1" opacity="0.4"/>
                  <line x1="75" y1="0" x2="75" y2="100" stroke="#475569" strokeWidth="1" opacity="0.4"/>
                </svg>

                {/* Ward boundaries with enhanced visibility */}
                {wards.map((ward: any, index) => (
                  <div
                    key={ward.id}
                    className="absolute border-2 border-emerald-400 bg-emerald-50 bg-opacity-20 rounded-lg shadow-sm"
                    style={{
                      left: `${8 + (index % 3) * 28}%`,
                      top: `${8 + Math.floor(index / 3) * 28}%`,
                      width: '24%',
                      height: '24%'
                    }}
                  >
                    <div className="text-xs font-semibold text-emerald-700 bg-white bg-opacity-80 px-1 py-0.5 rounded m-1 shadow-sm">
                      {ward.wardNumber}
                    </div>
                  </div>
                ))}

                {/* Enhanced Issue markers */}
                {filteredIssues.slice(0, 10).map((issue, index) => (
                  <div
                    key={`issue-${issue.id}`}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${15 + (index % 5) * 16}%`,
                      top: `${15 + Math.floor(index / 5) * 22}%`
                    }}
                    onClick={() => onIssueSelect?.(issue)}
                  >
                    {/* Enhanced marker with pulse animation for urgent issues */}
                    <div className="relative">
                      <div 
                        className={`w-6 h-6 rounded-full border-3 border-white shadow-lg hover:scale-125 transition-all duration-200 ${
                          issue.priority === 'high' ? 'animate-pulse' : ''
                        }`}
                        style={{ backgroundColor: getStatusColor(issue.status) }}
                      >
                        {/* Priority indicator */}
                        {issue.priority === 'high' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-ping" />
                        )}
                      </div>
                      
                      {/* Category icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-3 h-3 text-white text-xs font-bold">
                          {getCategoryIcon(issue.category)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced popup with better styling */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white p-3 rounded-lg shadow-xl text-xs whitespace-nowrap z-30 border border-gray-200 min-w-48">
                      <div className="font-semibold text-gray-900 mb-1">{issue.title}</div>
                      <div className="text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {issue.location}
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(issue.status)}`}>
                          {issue.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-blue-600 font-medium">{issue.category}</span>
                      </div>
                      {issue.priority === 'high' && (
                        <div className="text-red-600 font-semibold text-xs">⚠️ HIGH PRIORITY</div>
                      )}
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
                    </div>
                  </div>
                ))}

                {/* Technician markers */}
                {techniciansWithCoordinates.slice(0, 8).map((technician, index) => (
                  <div
                    key={`tech-${technician.id}`}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{
                      left: `${25 + (index % 4) * 18}%`,
                      top: `${15 + Math.floor(index / 4) * 30}%`
                    }}
                    onClick={() => onTechnicianSelect?.(technician)}
                  >
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-transform flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: getTechnicianStatusColor(technician.status) }}
                    >
                      T
                    </div>
                    {/* Technician popup on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2 rounded shadow-lg text-xs whitespace-nowrap z-20 border">
                      <div className="font-medium">{technician.name}</div>
                      <div className="text-gray-600">{technician.department}</div>
                      <div className="text-gray-500 capitalize">{technician.status}</div>
                      <div className="text-blue-600">{technician.currentLocation}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center p-8 relative z-10">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive GIS Map</h3>
                <p className="text-gray-600 mb-4">
                  Showing {filteredIssues.length} issues on the map
                </p>
                <p className="text-sm text-gray-500">
                  Click on markers to view issue details
                </p>
              </div>
            </div>

            {/* Map Legend */}
            {showLegend && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Issue Status</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Open Issues</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Resolved</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Technician Status</h5>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">T</div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs">T</div>
                        <span>Busy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-xs">T</div>
                        <span>Offline</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Click markers for details • Dashed lines show ward boundaries
                </div>
              </div>
            )}
          </div>

          {/* Layer Controls - Responsive */}
          <div className="lg:w-48 w-full space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between p-2 h-auto lg:hidden"
              onClick={() => setLayersExpanded(!layersExpanded)}
            >
              <span className="font-medium text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Map Layers
              </span>
              {layersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            <div className="hidden lg:block">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Map Layers
              </h4>
            </div>
            
            {/* Mobile: Collapsible, Desktop: Always visible */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:space-y-0 ${!layersExpanded && 'hidden lg:grid'}`}>
              {mapLayers.map(layer => (
                <div 
                  key={layer.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer text-xs sm:text-sm"
                  onClick={() => toggleLayer(layer.id)}
                >
                  <input 
                    type="checkbox" 
                    checked={layer.visible}
                    onChange={() => toggleLayer(layer.id)}
                    className="rounded flex-shrink-0"
                  />
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: layer.color }}
                  />
                  <span className="truncate">{layer.name}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-2 mt-4">
              <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                <div>Zoom: {zoomLevel}x</div>
                <div className="truncate">Center: {centerLocation.address}</div>
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    Real-time Updates
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}