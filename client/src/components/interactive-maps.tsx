import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Navigation, Users, AlertTriangle, CheckCircle, Clock, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Issue, Technician } from "@shared/schema";
import { useLanguage } from "@/contexts/LanguageContext";

interface MapMarker {
  id: number;
  type: "issue" | "technician";
  lat: number;
  lng: number;
  data: Issue | Technician;
}

interface HeatMapData {
  lat: number;
  lng: number;
  intensity: number;
}

export function InteractiveMaps() {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [showTechnicians, setShowTechnicians] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const { data: issues = [] } = useQuery({
    queryKey: ["/api/issues"],
    refetchInterval: 30000,
  });

  const { data: technicians = [] } = useQuery({
    queryKey: ["/api/technicians"],
    refetchInterval: 15000,
  });

  // Generate mock coordinates for demonstration
  const getRandomCoordinates = () => ({
    lat: -26.2041 + (Math.random() - 0.5) * 0.1, // Johannesburg area
    lng: 28.0473 + (Math.random() - 0.5) * 0.1,
  });

  const markers: MapMarker[] = [
    ...issues.map((issue: Issue) => ({
      id: issue.id,
      type: "issue" as const,
      lat: issue.latitude || getRandomCoordinates().lat,
      lng: issue.longitude || getRandomCoordinates().lng,
      data: issue,
    })),
    ...(showTechnicians ? technicians.map((tech: Technician) => ({
      id: tech.id,
      type: "technician" as const,
      lat: parseFloat(tech.latitude || getRandomCoordinates().lat.toString()),
      lng: parseFloat(tech.longitude || getRandomCoordinates().lng.toString()),
      data: tech,
    })) : []),
  ];

  const filteredMarkers = markers.filter((marker) => {
    if (marker.type === "issue") {
      const issue = marker.data as Issue;
      return (
        (selectedCategory === "all" || issue.category === selectedCategory) &&
        (selectedPriority === "all" || issue.priority === selectedPriority)
      );
    }
    return true;
  });

  const heatMapData: HeatMapData[] = issues.reduce((acc: HeatMapData[], issue: Issue) => {
    const coords = getRandomCoordinates();
    const existing = acc.find(
      (point) => Math.abs(point.lat - coords.lat) < 0.01 && Math.abs(point.lng - coords.lng) < 0.01
    );
    if (existing) {
      existing.intensity += 1;
    } else {
      acc.push({
        lat: coords.lat,
        lng: coords.lng,
        intensity: 1,
      });
    }
    return acc;
  }, []);

  const getIssueStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-red-500";
      case "high":
        return "border-orange-500";
      case "medium":
        return "border-yellow-500";
      case "low":
        return "border-green-500";
      default:
        return "border-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>{t.interactiveMaps || "Interactive Maps"}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="category-filter">{t.category || "Category"}:</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all || "All"}</SelectItem>
                  <SelectItem value="water_sanitation">{t.waterSanitation || "Water & Sanitation"}</SelectItem>
                  <SelectItem value="electricity">{t.electricity || "Electricity"}</SelectItem>
                  <SelectItem value="roads_transport">{t.roadsTransport || "Roads & Transport"}</SelectItem>
                  <SelectItem value="waste_management">{t.wasteManagement || "Waste Management"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="priority-filter">{t.priority || "Priority"}:</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.all || "All"}</SelectItem>
                  <SelectItem value="urgent">{t.urgent || "Urgent"}</SelectItem>
                  <SelectItem value="high">{t.high || "High"}</SelectItem>
                  <SelectItem value="medium">{t.medium || "Medium"}</SelectItem>
                  <SelectItem value="low">{t.low || "Low"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-technicians"
                checked={showTechnicians}
                onCheckedChange={setShowTechnicians}
              />
              <Label htmlFor="show-technicians">{t.showTechnicians || "Show Technicians"}</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-heatmap"
                checked={showHeatMap}
                onCheckedChange={setShowHeatMap}
              />
              <Label htmlFor="show-heatmap">{t.heatMap || "Heat Map"}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="relative h-96 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg overflow-hidden"
          >
            {/* Simulated Map Background */}
            <div className="absolute inset-0 opacity-20">
              <svg viewBox="0 0 400 300" className="w-full h-full">
                {/* Roads */}
                <path d="M0,150 Q100,100 200,150 T400,150" stroke="#666" strokeWidth="2" fill="none" />
                <path d="M150,0 Q200,100 150,200 T150,300" stroke="#666" strokeWidth="2" fill="none" />
                <path d="M50,50 L350,250" stroke="#666" strokeWidth="1" fill="none" />
                <path d="M350,50 L50,250" stroke="#666" strokeWidth="1" fill="none" />
              </svg>
            </div>

            {/* Heat Map Overlay */}
            {showHeatMap && (
              <div className="absolute inset-0">
                {heatMapData.map((point, index) => (
                  <div
                    key={index}
                    className="absolute rounded-full bg-red-500 opacity-30"
                    style={{
                      left: `${((point.lng + 28.1) * 100) % 100}%`,
                      top: `${((26.3 - point.lat) * 100) % 100}%`,
                      width: `${Math.max(20, point.intensity * 10)}px`,
                      height: `${Math.max(20, point.intensity * 10)}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Markers */}
            {filteredMarkers.map((marker) => (
              <Popover key={`${marker.type}-${marker.id}`}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="absolute p-0 h-auto"
                    style={{
                      left: `${((marker.lng + 28.1) * 100) % 100}%`,
                      top: `${((26.3 - marker.lat) * 100) % 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {marker.type === "issue" ? (
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${getIssueStatusColor(
                          (marker.data as Issue).status
                        )} ${getPriorityColor((marker.data as Issue).priority)}`}
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white">
                        <Users className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  {marker.type === "issue" ? (
                    <IssueMarkerPopup issue={marker.data as Issue} />
                  ) : (
                    <TechnicianMarkerPopup technician={marker.data as Technician} />
                  )}
                </PopoverContent>
              </Popover>
            ))}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
              <h4 className="font-semibold mb-2 text-sm">{t.legend || "Legend"}</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span>{t.openIssues || "Open Issues"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span>{t.inProgress || "In Progress"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>{t.resolved || "Resolved"}</span>
                </div>
                {showTechnicians && (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>{t.technicians || "Technicians"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg">
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between space-x-4">
                  <span>{t.totalIssues || "Total Issues"}:</span>
                  <Badge variant="outline">{filteredMarkers.filter(m => m.type === "issue").length}</Badge>
                </div>
                {showTechnicians && (
                  <div className="flex items-center justify-between space-x-4">
                    <span>{t.activeTechnicians || "Active Technicians"}:</span>
                    <Badge variant="outline">{filteredMarkers.filter(m => m.type === "technician").length}</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function IssueMarkerPopup({ issue }: { issue: Issue }) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{issue.title}</h4>
        <Badge variant={issue.status === "open" ? "destructive" : issue.status === "resolved" ? "default" : "secondary"}>
          {issue.status}
        </Badge>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{issue.description}</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-medium">{t.category || "Category"}:</span>
          <p>{issue.category}</p>
        </div>
        <div>
          <span className="font-medium">{t.priority || "Priority"}:</span>
          <p>{issue.priority}</p>
        </div>
        <div>
          <span className="font-medium">{t.location || "Location"}:</span>
          <p>{issue.location}</p>
        </div>
        <div>
          <span className="font-medium">{t.reported || "Reported"}:</span>
          <p>{new Date(issue.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      {issue.votes && issue.votes > 0 && (
        <div className="flex items-center space-x-1 text-xs">
          <span className="font-medium">{t.communityVotes || "Community Votes"}:</span>
          <Badge variant="outline">{issue.votes}</Badge>
        </div>
      )}
    </div>
  );
}

function TechnicianMarkerPopup({ technician }: { technician: Technician }) {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">{technician.name}</h4>
        <Badge variant={technician.status === "available" ? "default" : "secondary"}>
          {technician.status}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="font-medium">{t.department || "Department"}:</span>
          <p>{technician.department}</p>
        </div>
        <div>
          <span className="font-medium">{t.completedIssues || "Completed"}:</span>
          <p>{technician.completedIssues || 0}</p>
        </div>
        <div>
          <span className="font-medium">{t.rating || "Rating"}:</span>
          <p>{technician.performanceRating || "N/A"}/5</p>
        </div>
        <div>
          <span className="font-medium">{t.currentLocation || "Location"}:</span>
          <p>{technician.currentLocation || t.unknown || "Unknown"}</p>
        </div>
      </div>
      {technician.skills && technician.skills.length > 0 && (
        <div>
          <span className="font-medium text-xs">{t.skills || "Skills"}:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {technician.skills.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}