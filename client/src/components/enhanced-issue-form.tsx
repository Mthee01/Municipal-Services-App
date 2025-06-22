import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Camera, Mic, MapPin, Upload, Brain, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/contexts/LanguageContext";

interface IssueFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  location: string;
  latitude?: number;
  longitude?: number;
  ward: string;
  photos: string[];
  videos: string[];
  audioNotes: string[];
  isEmergency: boolean;
  visibility: string;
  tags: string[];
}

interface AIClassification {
  suggestedCategory: string;
  suggestedPriority: string;
  confidence: number;
  duplicates: any[];
}

export function EnhancedIssueForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [aiClassification, setAiClassification] = useState<AIClassification | null>(null);
  const [useAiSuggestions, setUseAiSuggestions] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [formData, setFormData] = useState<IssueFormData>({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    location: "",
    latitude: undefined,
    longitude: undefined,
    ward: "",
    photos: [],
    videos: [],
    audioNotes: [],
    isEmergency: false,
    visibility: "public",
    tags: [],
  });

  const { data: wards = [] } = useQuery({
    queryKey: ["/api/wards"],
  });

  const createIssueMutation = useMutation({
    mutationFn: (issueData: any) => apiRequest("POST", "/api/issues", issueData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      toast({
        title: t.success || "Success",
        description: t.issueReported || "Issue reported successfully",
      });
      onClose();
      resetForm();
    },
    onError: (error) => {
      if (!isOnline) {
        // Store in localStorage for offline sync
        const offlineIssues = JSON.parse(localStorage.getItem("offlineIssues") || "[]");
        offlineIssues.push({ ...formData, timestamp: Date.now() });
        localStorage.setItem("offlineIssues", JSON.stringify(offlineIssues));
        
        toast({
          title: t.savedOffline || "Saved Offline",
          description: t.willSyncWhenOnline || "Will sync when connection is restored",
        });
        onClose();
        resetForm();
      } else {
        toast({
          title: t.error || "Error",
          description: error.message || t.failedToReport || "Failed to report issue",
          variant: "destructive",
        });
      }
    },
  });

  // AI Classification
  const classifyIssueMutation = useMutation({
    mutationFn: (text: string) => apiRequest("POST", "/api/ai/classify-issue", { text }),
    onSuccess: (data) => {
      setAiClassification(data);
      if (useAiSuggestions && data.confidence > 0.7) {
        setFormData(prev => ({
          ...prev,
          category: data.suggestedCategory,
          priority: data.suggestedPriority,
        }));
      }
    },
  });

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOnlineStatus);
    
    // Sync offline issues when coming back online
    if (isOnline) {
      syncOfflineIssues();
    }

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOnlineStatus);
    };
  }, [isOnline]);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    // Trigger AI classification when title and description change
    if (formData.title && formData.description && useAiSuggestions) {
      const text = `${formData.title} ${formData.description}`;
      const debounceTimer = setTimeout(() => {
        classifyIssueMutation.mutate(text);
      }, 1000);
      return () => clearTimeout(debounceTimer);
    }
  }, [formData.title, formData.description, useAiSuggestions]);

  const syncOfflineIssues = async () => {
    const offlineIssues = JSON.parse(localStorage.getItem("offlineIssues") || "[]");
    if (offlineIssues.length > 0) {
      try {
        for (const issue of offlineIssues) {
          await apiRequest("POST", "/api/issues", issue);
        }
        localStorage.removeItem("offlineIssues");
        queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
        toast({
          title: t.syncComplete || "Sync Complete",
          description: `${offlineIssues.length} ${t.offlineIssuesSynced || "offline issues synced"}`,
        });
      } catch (error) {
        console.error("Failed to sync offline issues:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      priority: "medium",
      location: "",
      latitude: currentLocation?.lat,
      longitude: currentLocation?.lng,
      ward: "",
      photos: [],
      videos: [],
      audioNotes: [],
      isEmergency: false,
      visibility: "public",
      tags: [],
    });
    setAiClassification(null);
  };

  const handlePhotoCapture = async () => {
    if (!navigator.mediaDevices) {
      toast({
        title: t.cameraNotSupported || "Camera not supported",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        cameraRef.current.play();
        
        // Capture photo after 3 seconds
        setTimeout(() => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (context && cameraRef.current) {
            canvas.width = cameraRef.current.videoWidth;
            canvas.height = cameraRef.current.videoHeight;
            context.drawImage(cameraRef.current, 0, 0);
            
            const photoUrl = canvas.toDataURL("image/jpeg", 0.8);
            setFormData(prev => ({
              ...prev,
              photos: [...prev.photos, photoUrl],
            }));
            
            stream.getTracks().forEach(track => track.stop());
          }
        }, 3000);
      }
    } catch (error) {
      toast({
        title: t.cameraError || "Camera error",
        description: t.failedToAccessCamera || "Failed to access camera",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: "photos" | "videos") => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], e.target!.result as string],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setFormData(prev => ({
          ...prev,
          audioNotes: [...prev.audioNotes, audioUrl],
        }));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 30000);
    } catch (error) {
      toast({
        title: t.microphoneError || "Microphone error",
        description: t.failedToAccessMicrophone || "Failed to access microphone",
        variant: "destructive",
      });
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: t.validationError || "Validation Error",
        description: t.fillRequiredFields || "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createIssueMutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>{t.reportIssue || "Report Issue"}</span>
              {!isOnline && (
                <Badge variant="destructive" className="flex items-center space-x-1">
                  <WifiOff className="h-3 w-3" />
                  <span>{t.offline || "Offline"}</span>
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-xs">
                <Switch
                  checked={useAiSuggestions}
                  onCheckedChange={setUseAiSuggestions}
                  className="scale-75"
                />
                <Brain className="h-3 w-3" />
              </div>
              <Button variant="ghost" onClick={onClose}>×</Button>
            </div>
          </div>
          {!isOnline && (
            <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
              {t.offlineMode || "Operating in offline mode. Your report will be saved and submitted when connection is restored."}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* AI Classification Results */}
          {aiClassification && (
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    {t.aiSuggestions || "AI Suggestions"}
                  </span>
                  <Badge variant="outline">
                    {Math.round(aiClassification.confidence * 100)}% {t.confidence || "confidence"}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-800 dark:text-blue-200">{t.category || "Category"}:</span>
                    <span className="ml-2 font-medium">{aiClassification.suggestedCategory}</span>
                  </div>
                  <div>
                    <span className="text-blue-800 dark:text-blue-200">{t.priority || "Priority"}:</span>
                    <span className="ml-2 font-medium">{aiClassification.suggestedPriority}</span>
                  </div>
                </div>
                {aiClassification.duplicates.length > 0 && (
                  <div className="mt-2 text-sm">
                    <span className="text-blue-800 dark:text-blue-200">
                      {t.possibleDuplicates || "Possible duplicates found"}:
                    </span>
                    <span className="ml-2">{aiClassification.duplicates.length}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">{t.title || "Title"} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={t.enterTitle || "Enter issue title"}
              />
            </div>

            <div>
              <Label htmlFor="description">{t.description || "Description"} *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t.enterDescription || "Describe the issue in detail"}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">{t.category || "Category"} *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t.selectCategory || "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="water_sanitation">{t.waterSanitation || "Water & Sanitation"}</SelectItem>
                    <SelectItem value="electricity">{t.electricity || "Electricity"}</SelectItem>
                    <SelectItem value="roads_transport">{t.roadsTransport || "Roads & Transport"}</SelectItem>
                    <SelectItem value="waste_management">{t.wasteManagement || "Waste Management"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">{t.priority || "Priority"}</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t.low || "Low"}</SelectItem>
                    <SelectItem value="medium">{t.medium || "Medium"}</SelectItem>
                    <SelectItem value="high">{t.high || "High"}</SelectItem>
                    <SelectItem value="urgent">{t.urgent || "Urgent"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">{t.location || "Location"}</Label>
              <div className="flex space-x-2">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder={t.enterLocation || "Enter location"}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (currentLocation) {
                      setFormData(prev => ({
                        ...prev,
                        location: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
                      }));
                    }
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="ward">{t.ward || "Ward"}</Label>
              <Select 
                value={formData.ward} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.selectWard || "Select ward"} />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward: any) => (
                    <SelectItem key={ward.id} value={ward.wardNumber}>
                      {t.ward || "Ward"} {ward.wardNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Media Attachments */}
          <div className="space-y-4">
            <Label>{t.attachments || "Attachments"}</Label>
            
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePhotoCapture}
                className="flex items-center space-x-2"
              >
                <Camera className="h-4 w-4" />
                <span>{t.takePhoto || "Take Photo"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{t.uploadPhoto || "Upload Photo"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{t.uploadVideo || "Upload Video"}</span>
              </Button>

              <Button
                type="button"
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? stopAudioRecording : startAudioRecording}
                className="flex items-center space-x-2"
              >
                <Mic className="h-4 w-4" />
                <span>{isRecording ? t.stopRecording || "Stop Recording" : t.recordAudio || "Record Audio"}</span>
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileUpload(e, "photos")}
              className="hidden"
            />

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, "videos")}
              className="hidden"
            />

            <video ref={cameraRef} className="hidden" />

            {/* Display attachments */}
            {(formData.photos.length > 0 || formData.videos.length > 0 || formData.audioNotes.length > 0) && (
              <div className="grid grid-cols-3 gap-2">
                {formData.photos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Photo ${index + 1}`} className="w-full h-20 object-cover rounded" />
                ))}
                {formData.videos.map((video, index) => (
                  <video key={index} src={video} className="w-full h-20 object-cover rounded" controls />
                ))}
                {formData.audioNotes.map((audio, index) => (
                  <audio key={index} src={audio} controls className="w-full" />
                ))}
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isEmergency}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEmergency: checked }))}
              />
              <Label className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span>{t.emergency || "Emergency"}</span>
              </Label>
            </div>

            <div>
              <Label>{t.visibility || "Visibility"}</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t.public || "Public"}</SelectItem>
                  <SelectItem value="ward_only">{t.wardOnly || "Ward Only"}</SelectItem>
                  <SelectItem value="private">{t.private || "Private"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t.tags || "Tags"}</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
                <Input
                  placeholder={t.addTag || "Add tag..."}
                  className="w-32"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t.cancel || "Cancel"}
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createIssueMutation.isPending || (!formData.title || !formData.description || !formData.category)}
            >
              {createIssueMutation.isPending ? t.submitting || "Submitting..." : t.submit || "Submit"}
            </Button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <Progress value={uploadProgress} className="mt-4" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}