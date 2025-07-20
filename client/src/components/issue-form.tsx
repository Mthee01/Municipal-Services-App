import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { X, MapPin, Camera, Plus, List, CameraIcon, Upload, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { CreateIssueData } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  priority: z.enum(["low", "medium", "high", "emergency"]),
  location: z.string().min(3, "Location is required"),
  ward: z.string().optional(),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
  notifyBySms: z.boolean().default(true),
});

interface IssueFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IssueForm({ isOpen, onClose }: IssueFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      location: "",
      ward: "",
      reporterName: "",
      reporterPhone: "",
      notifyBySms: true,
    },
  });

  const createIssueMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      console.log("Starting issue creation with data:", data);
      console.log("Photos to upload:", photos.length);
      
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Add photos
      photos.forEach((photo, index) => {
        console.log(`Adding photo ${index + 1}: ${photo.name}, size: ${photo.size}`);
        formData.append("photos", photo);
      });

      console.log("Sending request to /api/issues");
      const response = await fetch("/api/issues", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(`Failed to create issue: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log("Issue created successfully:", result);
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Issue Reported Successfully!",
        description: "You will receive updates via SMS.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      form.reset();
      setPhotos([]);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Photo upload triggered");
    const files = Array.from(event.target.files || []);
    
    console.log("Files selected:", files.length);
    files.forEach((file, index) => {
      console.log(`File ${index + 1}: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    });
    
    if (files.length === 0) {
      console.log("No files selected");
      return;
    }
    
    if (photos.length + files.length > 5) {
      console.log("Too many photos selected");
      toast({
        title: "Too many photos",
        description: "Maximum 5 photos allowed",
        variant: "destructive",
      });
      return;
    }
    
    // Check file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        console.log(`Invalid file type: ${file.type} for file ${file.name}`);
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file. Please upload JPG, PNG, or GIF files.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        console.log(`File too large: ${file.size} bytes for file ${file.name}`);
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      console.log("Adding valid files to state:", validFiles.length);
      setPhotos([...photos, ...validFiles]);
      toast({
        title: "Photos added",
        description: `${validFiles.length} photo(s) added successfully`,
      });
    } else {
      console.log("No valid files to add");
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to take photos",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = Date.now();
        const file = new File([blob], `camera-photo-${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: timestamp,
        });

        if (photos.length >= 5) {
          toast({
            title: "Maximum photos reached",
            description: "You can upload up to 5 photos only",
            variant: "destructive",
          });
          return;
        }

        setPhotos([...photos, file]);
        toast({
          title: "Photo captured",
          description: "Photo added successfully",
        });
      }
    }, 'image/jpeg', 0.8);
  };

  // Cleanup camera on component unmount or when form closes
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Stop camera when form is closed
  useEffect(() => {
    if (!isOpen && cameraStream) {
      stopCamera();
    }
  }, [isOpen, cameraStream]);

  // Common South African locations for quick selection
  const commonLocations = [
    "Cape Town CBD",
    "Johannesburg CBD", 
    "Durban CBD",
    "Pretoria CBD",
    "Port Elizabeth CBD",
    "Bloemfontein CBD",
    "Soweto",
    "Sandton",
    "Camps Bay",
    "Stellenbosch",
    "Pietermaritzburg",
    "East London",
    "Kimberley",
    "Polokwane",
    "Nelspruit",
    "Rustenburg",
    "Potchefstroom",
    "George",
    "Knysna",
    "Hermanus"
  ];

  // Reverse geocoding function to convert GPS coordinates to address
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Using OpenStreetMap Nominatim API (free, no API key required)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Municipal Services App'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Extract meaningful address components
    const address = data.address || {};
    const components = [
      address.house_number,
      address.road || address.street,
      address.suburb || address.neighbourhood || address.residential,
      address.city || address.town || address.municipality,
      address.postcode
    ].filter(Boolean);
    
    return components.length > 0 ? components.join(', ') : data.display_name || 'Address not found';
  };

  const selectLocation = (location: string) => {
    form.setValue("location", location);
    setShowLocationPicker(false);
    toast({
      title: "Location selected",
      description: `Location set to: ${location}`,
    });
  };

  const getCurrentLocation = async () => {
    console.log("getCurrentLocation called");
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services. Please enter your address manually.",
        variant: "destructive",
      });
      return;
    }

    // Check if we're in a secure context (HTTPS)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      toast({
        title: "Secure connection required",
        description: "Location services require HTTPS. Please enter your address manually.",
        variant: "destructive",
      });
      return;
    }

    setLocationLoading(true);
    console.log("Location loading started");
    
    toast({
      title: "Getting location...",
      description: "Getting your address...",
    });

    try {
      // First check permissions
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({name: 'geolocation'});
        console.log("Geolocation permission:", permission.state);
        
        if (permission.state === 'denied') {
          throw new Error('Location permission denied');
        }
      }

      // Create a promise with built-in timeout
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Location request timed out after 10 seconds'));
        }, 10000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (err) => {
            clearTimeout(timeoutId);
            reject(err);
          },
          {
            enableHighAccuracy: true, // Better accuracy for address lookup
            timeout: 10000,
            maximumAge: 60000 // Shorter cache for more current location
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      console.log("GPS coordinates captured:", { latitude, longitude, accuracy });
      
      // Try to get readable address using reverse geocoding
      try {
        const address = await reverseGeocode(latitude, longitude);
        form.setValue("location", address);
        console.log("Address captured:", address);
        
        toast({
          title: "Location captured successfully", 
          description: `Address: ${address.length > 50 ? address.substring(0, 50) + '...' : address}`,
        });
      } catch (geocodeError) {
        console.warn("Reverse geocoding failed, using coordinates:", geocodeError);
        // Fallback to coordinates if geocoding fails
        const locationString = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
        form.setValue("location", locationString);
        
        toast({
          title: "Location captured", 
          description: `GPS coordinates captured ${accuracy ? `(±${Math.round(accuracy)}m)` : ''}`,
        });
      }
    } catch (error: any) {
      console.error("Location error:", error);
      let errorMessage = "Unable to get current location";
      
      if (error.message?.includes('timed out')) {
        errorMessage = "Location request timed out. Please enter your address manually.";
      } else if (error.message?.includes('denied')) {
        errorMessage = "Location access denied. Please enable location permissions and try again.";
      } else {
        switch (error.code) {
          case 1: // PERMISSION_DENIED
            errorMessage = "Location access denied. Please enable location permissions in your browser.";
            break;
          case 2: // POSITION_UNAVAILABLE
            errorMessage = "Location unavailable. Please check your GPS signal or enter address manually.";
            break;
          case 3: // TIMEOUT
            errorMessage = "Location request timed out. Please try again or enter address manually.";
            break;
          default:
            errorMessage = "Location access failed. Please enter your address manually.";
        }
      }
      
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log("Location request finished, stopping loading");
      setLocationLoading(false);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createIssueMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">Report an Issue</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Category Selection */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="water_sanitation">Water & Sanitation</SelectItem>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="roads_transport">Roads & Transport</SelectItem>
                        <SelectItem value="waste_management">Waste Management</SelectItem>
                        <SelectItem value="safety_security">Safety & Security</SelectItem>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe the Issue *</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Please provide details about the issue..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <FormControl>
                          <Input placeholder="Street address or landmark" {...field} />
                        </FormControl>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={(e) => {
                            e.preventDefault();
                            console.log("Location button clicked");
                            getCurrentLocation();
                          }}
                          disabled={locationLoading}
                          className="px-3"
                          title="Get current location"
                        >
                          {locationLoading ? (
                            <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={(e) => {
                            e.preventDefault();
                            setShowLocationPicker(!showLocationPicker);
                          }}
                          className="px-3"
                          title="Choose from common locations"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {showLocationPicker && (
                        <div className="border rounded-lg p-3 bg-gray-50 max-h-40 overflow-y-auto">
                          <p className="text-sm font-medium mb-2">Select a location:</p>
                          <div className="grid grid-cols-2 gap-1">
                            {commonLocations.map((location) => (
                              <button
                                key={location}
                                type="button"
                                onClick={() => selectLocation(location)}
                                className="text-left text-sm p-2 hover:bg-white hover:shadow-sm rounded border-0 bg-transparent"
                              >
                                {location}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {locationLoading ? "Getting your address..." : "Use GPS (map icon) or choose from list"}
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority Level */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Priority Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low" className="text-sm">Low</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium" className="text-sm">Medium</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="high" />
                          <Label htmlFor="high" className="text-sm">High</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="emergency" id="emergency" />
                          <Label htmlFor="emergency" className="text-sm text-red-600">Emergency</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Photo Upload */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Add Photos ({photos.length}/5)
                </Label>
                
                {!showCamera ? (
                  <>
                    {/* Photo options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Upload from device */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*,image/jpeg,image/jpg,image/png,image/gif"
                          capture="environment"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                        />
                        <label htmlFor="photo-upload" className="cursor-pointer">
                          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-gray-600 font-medium text-sm">Upload from device</p>
                          <p className="text-xs text-gray-500 mt-1">Select photos</p>
                        </label>
                      </div>
                      
                      {/* Take photo with camera */}
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer"
                        onClick={startCamera}
                      >
                        <CameraIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium text-sm">Take photo</p>
                        <p className="text-xs text-gray-500 mt-1">Use camera</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">PNG, JPG up to 10MB each (max 5 photos)</p>
                  </>
                ) : (
                  /* Camera interface */
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-64 md:h-80 object-cover"
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <Button
                        type="button"
                        onClick={capturePhoto}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={photos.length >= 5}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Capture Photo
                      </Button>
                      
                      <Button
                        type="button"
                        onClick={stopCamera}
                        variant="outline"
                      >
                        <StopCircle className="h-4 w-4 mr-2" />
                        Close Camera
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Display uploaded/captured photos */}
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Contact Information</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="reporterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reporterPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notifyBySms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <Label className="text-sm text-gray-600">
                          Send me SMS updates about this issue
                        </Label>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-sa-green hover:bg-green-700 text-white font-semibold py-4"
                disabled={createIssueMutation.isPending}
              >
                {createIssueMutation.isPending ? "Submitting..." : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
