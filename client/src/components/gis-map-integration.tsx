import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Layers, ZoomIn, ZoomOut, Navigation, Filter, Clock, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import type { Issue } from "@shared/schema";
import L from 'leaflet';

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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
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

  // Enhanced geocoding for South African locations
  const geocodeLocation = (location: string): GeoLocation => {
    const locationMap: { [key: string]: { lat: number, lng: number } } = {
      // Major South African cities
      'cape town': { lat: -33.9249, lng: 18.4241 },
      'johannesburg': { lat: -26.2041, lng: 28.0473 },
      'durban': { lat: -29.8587, lng: 31.0218 },
      'pretoria': { lat: -25.7479, lng: 28.2293 },
      'port elizabeth': { lat: -33.9608, lng: 25.6022 },
      'bloemfontein': { lat: -29.0852, lng: 26.1596 },
      'soweto': { lat: -26.2678, lng: 27.8546 },
      'sandton': { lat: -26.1076, lng: 28.0567 },
      'camps bay': { lat: -33.9575, lng: 18.3774 },
      'stellenbosch': { lat: -33.9321, lng: 18.8602 }
    };
    
    const locationLower = location.toLowerCase();
    let baseCoords = { lat: -26.2041, lng: 28.0473 }; // Default to Johannesburg
    
    // Check if location matches known cities
    for (const [city, coords] of Object.entries(locationMap)) {
      if (locationLower.includes(city)) {
        baseCoords = coords;
        break;
      }
    }
    
    // Add small random offset for unique positioning
    const offset = () => (Math.random() - 0.5) * 0.01; // Smaller offset for more realistic clustering
    
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

  // Initialize map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Create map instance
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [centerLocation.lat, centerLocation.lng], 
        zoomLevel
      );

      // Add OpenStreetMap tiles (free, no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      // Fix leaflet default marker icons
      const DefaultIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.Marker.prototype.options.icon = DefaultIcon;
    }

    return () => {
      // Cleanup map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [centerLocation.lat, centerLocation.lng, zoomLevel]);

  // Update markers when issues change
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    // Add new markers
    filteredIssues.forEach(issue => {
      const coordinates = geocodeLocation(issue.location);
      
      // Create custom marker based on issue status
      const marker = L.marker([coordinates.lat, coordinates.lng]);
      
      // Create popup content with issue details
      const popupContent = `
        <div class="p-2 min-w-48">
          <div class="font-bold text-sm mb-1">${issue.title}</div>
          <div class="text-xs text-gray-600 mb-1">
            <strong>Location:</strong> ${issue.location}
          </div>
          <div class="text-xs text-gray-600 mb-1">
            <strong>Category:</strong> ${issue.category.replace('_', ' ')}
          </div>
          <div class="text-xs text-gray-600 mb-1">
            <strong>Status:</strong> <span class="capitalize">${issue.status.replace('_', ' ')}</span>
          </div>
          <div class="text-xs text-gray-600 mb-2">
            <strong>Priority:</strong> <span class="capitalize">${issue.priority}</span>
          </div>
          ${issue.description ? `<div class="text-xs text-gray-700 mb-2">${issue.description.substring(0, 100)}${issue.description.length > 100 ? '...' : ''}</div>` : ''}
          <button onclick="window.selectIssue?.(${issue.id})" class="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-600">
            View Details
          </button>
        </div>
      `;
      
      marker.bindPopup(popupContent);
      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });

    // Expose issue selection function to global scope for popup buttons
    (window as any).selectIssue = (issueId: number) => {
      const issue = issues.find(i => i.id === issueId);
      if (issue && onIssueSelect) {
        onIssueSelect(issue);
      }
    };
  }, [filteredIssues, issues, onIssueSelect]);

  // Map control functions
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
      setZoomLevel(mapInstanceRef.current.getZoom());
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
      setZoomLevel(mapInstanceRef.current.getZoom());
    }
  };

  const centerMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([centerLocation.lat, centerLocation.lng], zoomLevel);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Municipal Services GIS Map
          </CardTitle>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 sm:p-4 lg:p-6">
        {/* Mobile controls - horizontal layout */}
        <div className="flex items-center justify-between mb-4 sm:hidden">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={zoomIn} title="Zoom In">
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={zoomOut} title="Zoom Out">
              <ZoomOut className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={centerMap} title="Center Map">
              <Navigation className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-xs text-gray-600 font-medium">
            {filteredIssues.length} issues
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Desktop controls - vertical layout */}
          <div className="hidden sm:flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={zoomIn} title="Zoom In">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={zoomOut} title="Zoom Out">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={centerMap} title="Center Map">
              <Navigation className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" title="Layers">
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {/* Map Container - responsive sizing */}
          <div className="flex-1 min-w-0">
            <div 
              ref={mapRef}
              className="w-full bg-gray-100 rounded-lg border border-gray-300 overflow-hidden"
              style={{ 
                height: "clamp(300px, 50vh, 600px)"
              }}
            />
            
            {/* Map loading message */}
            {filteredIssues.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-lg">
                <div className="text-center p-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues to Display</h3>
                  <p className="text-gray-600">
                    No issues match your current filter selection
                  </p>
                </div>
              </div>
            )}

            {/* Map Legend - responsive positioning */}
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                <span>Open Issues</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                <span>Resolved</span>
              </div>
            </div>
          </div>

          {/* Layer Controls - responsive sidebar */}
          <div className="w-full sm:w-64 lg:w-48 mt-4 sm:mt-0">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Map Layers
              </h4>
              
              {/* Mobile: Simplified view */}
              <div className="sm:hidden">
                <p className="text-xs text-gray-600 mb-2">
                  {mapLayers.filter(l => l.visible).length} of {mapLayers.length} layers visible
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {mapLayers.map(layer => (
                    <label 
                      key={layer.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input 
                        type="checkbox" 
                        checked={layer.visible}
                        onChange={() => toggleLayer(layer.id)}
                        className="rounded text-xs"
                      />
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: layer.color }}
                      />
                      <span className="text-xs truncate">{layer.name.split(' ')[0]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Desktop: Full view */}
              <div className="hidden sm:block space-y-2">
                {mapLayers.map(layer => (
                  <div 
                    key={layer.id}
                    className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
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
              </div>
              
              <div className="border-t pt-2 space-y-1">
                <div className="text-xs sm:text-sm text-gray-600">
                  <div>Zoom: {zoomLevel}x</div>
                  <div className="hidden sm:block">Center: {centerLocation.address}</div>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      Real-time Updates
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}