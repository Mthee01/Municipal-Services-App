import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Layers, ZoomIn, ZoomOut, Navigation, Filter } from "lucide-react";
import type { Issue } from "@shared/schema";

interface GISMapProps {
  issues: Issue[];
  onIssueSelect?: (issue: Issue) => void;
  height?: string;
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

export function GISMapIntegration({ issues, onIssueSelect, height = "500px" }: GISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedLayer, setSelectedLayer] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState(12);
  const [centerLocation, setCenterLocation] = useState<GeoLocation>({
    lat: -26.2041, // Johannesburg coordinates
    lng: 28.0473,
    address: "Johannesburg, South Africa"
  });
  
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "#EF4444";
      case "in_progress": return "#F59E0B";
      case "resolved": return "#10B981";
      default: return "#6B7280";
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

  useEffect(() => {
    // Initialize map (in real implementation, use Leaflet or Google Maps)
    if (mapRef.current) {
      // Map initialization would go here
      console.log("Map initialized with", filteredIssues.length, "issues");
    }
  }, [filteredIssues]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 md:pb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <MapPin className="h-4 w-4 md:h-5 md:w-5" />
            Municipal Services GIS Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedLayer} onValueChange={setSelectedLayer}>
              <SelectTrigger className="w-full md:w-48">
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 md:p-6">
        {/* Mobile controls row */}
        <div className="flex items-center justify-between gap-2 mb-3 md:hidden">
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="p-2">
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="p-2">
              <Navigation className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-gray-600">
            {filteredIssues.length} issues
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {/* Desktop Map Controls */}
          <div className="hidden md:flex flex-col gap-2">
            <Button variant="outline" size="sm">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Navigation className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {/* Map Container */}
          <div className="flex-1">
            <div 
              ref={mapRef}
              className="gis-map-mobile w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative"
              style={{ 
                height: typeof window !== 'undefined' && window.innerWidth < 768 ? "300px" : height,
                minHeight: "250px"
              }}
            >
              {/* Simulated Map View */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg">
                {/* Simulated issue markers - larger on mobile */}
                {filteredIssues.slice(0, 10).map((issue, index) => (
                  <div
                    key={issue.id}
                    className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${20 + (index % 5) * 15}%`,
                      top: `${20 + Math.floor(index / 5) * 20}%`
                    }}
                    onClick={() => onIssueSelect?.(issue)}
                  >
                    <div 
                      className="gis-map-marker rounded-full border-2 border-white shadow-lg md:w-4 md:h-4 w-6 h-6"
                      style={{ backgroundColor: getStatusColor(issue.status) }}
                    />
                    {/* Issue popup - mobile optimized */}
                    <div className="gis-map-popup absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity bg-white/95 p-2 rounded-lg shadow-lg text-xs z-20 max-w-48">
                      <div className="font-medium truncate">{issue.title}</div>
                      <div className="text-gray-600 truncate text-xs">{issue.location}</div>
                      <div className="text-gray-500 text-xs">{issue.status}</div>
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
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
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

          {/* Layer Controls */}
          <div className="w-48 space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Map Layers
            </h4>
            {mapLayers.map(layer => (
              <div 
                key={layer.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleLayer(layer.id)}
              >
                <input 
                  type="checkbox" 
                  checked={layer.visible}
                  onChange={() => toggleLayer(layer.id)}
                  className="rounded"
                />
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-sm">{layer.name}</span>
              </div>
            ))}
            
            <div className="border-t pt-2 mt-4">
              <div className="text-sm text-gray-600">
                <div>Zoom: {zoomLevel}x</div>
                <div>Center: {centerLocation.address}</div>
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