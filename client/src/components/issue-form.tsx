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
  const [currentGPS, setCurrentGPS] = useState<{latitude: number, longitude: number} | null>(null);
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

      // Add GPS coordinates if available
      if (currentGPS) {
        formData.append("latitude", currentGPS.latitude.toString());
        formData.append("longitude", currentGPS.longitude.toString());
        console.log("Adding GPS coordinates:", currentGPS);
      }

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
    console.log("=== PHOTO UPLOAD TRIGGERED ===");
    console.log("Event target:", event.target);
    console.log("Files object:", event.target.files);
    console.log("Browser info:", navigator.userAgent);
    
    const files = Array.from(event.target.files || []);
    
    console.log("Files selected:", files.length);
    files.forEach((file, index) => {
      console.log(`File ${index + 1}: ${file.name}, size: ${file.size} bytes, type: ${file.type}, lastModified: ${file.lastModified}`);
    });
    
    if (files.length === 0) {
      console.log("No files selected - user may have cancelled dialog or browser issue");
      toast({
        title: "No files selected",
        description: "Please try selecting photos again. If the issue persists, try a different browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (photos.length + files.length > 5) {
      console.log("Too many photos selected - limit is 5");
      toast({
        title: "Too many photos",
        description: "Maximum 5 photos allowed",
        variant: "destructive",
      });
      // Reset the input to allow another selection
      event.target.value = '';
      return;
    }
    
    // Check file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValidType) {
        console.log(`❌ Invalid file type: ${file.type} for file ${file.name}`);
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file. Please upload JPG, PNG, GIF, or WEBP files.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        console.log(`❌ File too large: ${file.size} bytes for file ${file.name}`);
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 10MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      console.log(`✅ Valid file: ${file.name} - ${file.type} - ${file.size} bytes`);
      return true;
    });
    
    if (validFiles.length > 0) {
      console.log(`✅ Adding ${validFiles.length} valid files to state`);
      console.log("Current photos state:", photos.length);
      setPhotos(prevPhotos => {
        const newPhotos = [...prevPhotos, ...validFiles];
        console.log("New photos state will be:", newPhotos.length);
        return newPhotos;
      });
      toast({
        title: "Photos added successfully!",
        description: `${validFiles.length} photo(s) ready for upload`,
      });
    } else {
      console.log("❌ No valid files to add");
    }
    
    // Reset the input to allow selecting the same files again if needed
    event.target.value = '';
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
    "Roodepoort CBD, 2191",
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
    console.log(`Attempting to geocode coordinates: ${lat}, ${lng}`);
    
    // Multiple geocoding services to try
    const geocodingServices = [
      // Service 1: Nominatim with South Africa country code
      async () => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&countrycodes=za&accept-language=en`,
          {
            headers: {
              'User-Agent': 'Municipal Services App'
            }
          }
        );
        
        if (!response.ok) throw new Error('Nominatim service unavailable');
        return await response.json();
      },
      
      // Service 2: Nominatim without country restriction (as fallback)
      async () => {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1&accept-language=en`,
          {
            headers: {
              'User-Agent': 'Municipal Services App'
            }
          }
        );
        
        if (!response.ok) throw new Error('Nominatim service unavailable');
        return await response.json();
      }
    ];
    
    let data = null;
    let lastError = null;
    
    // Try each geocoding service
    for (const service of geocodingServices) {
      try {
        data = await service();
        if (data && !data.error) {
          console.log('Geocoding successful with service:', data);
          break;
        }
      } catch (error: any) {
        console.warn('Geocoding service failed:', error);
        lastError = error;
        continue;
      }
    }
    
    if (!data || data.error) {
      throw new Error(lastError?.message || 'All geocoding services failed');
    }
    
    // Extract address components
    const address = data.address || {};
    console.log('Raw address data:', address);
    
    // Build a comprehensive address with better South African address formatting
    const streetNumber = address.house_number || '';
    const streetName = address.road || address.street || address.pedestrian || address.path;
    const suburb = address.suburb || address.neighbourhood || address.residential || address.quarter || address.city_district;
    const city = address.city || address.town || address.municipality || address.village;
    const county = address.county; // This might be the district municipality
    const province = address.state || address.province || address.region;
    const postcode = address.postcode;
    
    // Build the address string prioritizing South African address structure
    const addressParts = [];
    
    // Add street address if available
    if (streetNumber && streetName) {
      addressParts.push(`${streetNumber} ${streetName}`);
    } else if (streetName) {
      addressParts.push(streetName);
    }
    
    // Add locality info in SA format: Suburb, City/Municipality, Province
    if (suburb && !suburb.includes('Ward')) {
      addressParts.push(suburb);
    }
    
    // For municipal areas, show the ward/municipality info more clearly
    if (suburb && suburb.includes('Ward')) {
      addressParts.push(suburb); // Keep ward info
    }
    
    if (city && city !== suburb) {
      addressParts.push(city);
    }
    
    // Add district if different from city
    if (county && county !== city && !addressParts.includes(county)) {
      addressParts.push(county);
    }
    
    if (province) {
      addressParts.push(province);
    }
    
    if (postcode) {
      addressParts.push(postcode);
    }
    
    // Start with constructed address
    let formattedAddress = addressParts.length > 0 ? addressParts.join(', ') : '';
    
    // If we don't have enough detail, use the full display_name but clean it up
    if (!formattedAddress || formattedAddress.length < 10) {
      formattedAddress = data.display_name || `Coordinates: ${lat}, ${lng}`;
      
      // Clean up the display name for better readability
      if (formattedAddress.includes(',')) {
        const parts = formattedAddress.split(',').map(p => p.trim());
        // Take the most relevant parts (usually first 3-4 components)
        formattedAddress = parts.slice(0, 4).join(', ');
      }
    }
    
    // Clean up the address
    formattedAddress = formattedAddress
      .replace(/,\s*,/g, ',')
      .replace(/^,\s*/, '')
      .replace(/,\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('Final formatted address:', formattedAddress);
    console.log('Original coordinates:', lat, lng);
    console.log('Raw geocoding data:', data);
    
    return formattedAddress;
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
            timeout: 15000, // Increased timeout for better GPS lock
            maximumAge: 0 // Always get fresh location to avoid cached wrong positions
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      console.log("GPS coordinates captured:", { latitude, longitude, accuracy });
      
      // Store GPS coordinates for form submission
      setCurrentGPS({ latitude, longitude });
      
      // Check GPS accuracy - if it's too poor, warn the user
      if (accuracy && accuracy > 100) {
        toast({
          title: "GPS accuracy warning",
          description: `GPS accuracy is ±${Math.round(accuracy)}m. Location might be imprecise.`,
          variant: "destructive",
        });
      }
      
      // Check if coordinates are reasonable for South Africa
      // South Africa approximate bounds: Lat: -35 to -22, Lng: 16 to 33
      const isInSouthAfrica = latitude >= -35 && latitude <= -22 && longitude >= 16 && longitude <= 33;
      
      if (!isInSouthAfrica) {
        console.warn(`Coordinates (${latitude}, ${longitude}) appear to be outside South Africa`);
        toast({
          title: "Location check",
          description: `GPS coordinates appear to be outside South Africa. Please verify your location.`,
          variant: "destructive",
        });
      }
      
      // Try to get readable address using reverse geocoding
      try {
        toast({
          title: "Getting your address...",
          description: `Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
        });
        
        const address = await reverseGeocode(latitude, longitude);
        
        // Validate that the address makes sense for South Africa
        const addressLower = address.toLowerCase();
        const isValidSALocation = 
          addressLower.includes('south africa') || 
          addressLower.includes('gauteng') || 
          addressLower.includes('kwazulu') ||
          addressLower.includes('western cape') ||
          addressLower.includes('eastern cape') ||
          addressLower.includes('free state') ||
          addressLower.includes('limpopo') ||
          addressLower.includes('mpumalanga') ||
          addressLower.includes('northern cape') ||
          addressLower.includes('north west') ||
          isInSouthAfrica; // Accept any location within South Africa
        
        if (!isValidSALocation) {
          console.warn('Geocoded address seems to be outside South Africa:', address);
          toast({
            title: "Location verification",
            description: "Please verify the address is correct as it appears to be outside South Africa.",
            variant: "destructive",
          });
        }
        
        form.setValue("location", address);
        console.log("Address captured:", address);
        
        toast({
          title: "Location captured successfully", 
          description: `${address.length > 50 ? address.substring(0, 50) + '...' : address}`,
        });
      } catch (geocodeError) {
        console.error("Reverse geocoding failed:", geocodeError);
        
        // Provide helpful fallback with actual coordinates
        const fallbackLocation = `GPS Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        form.setValue("location", fallbackLocation);
        
        toast({
          title: "Using approximate location", 
          description: "Please verify and edit the address if needed",
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
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-lg shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex flex-row items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <Form {...form}>
            <form id="issue-report-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      {/* Upload from gallery/device with drag & drop */}
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer"
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('border-green-400', 'bg-green-50');
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-green-400', 'bg-green-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('border-green-400', 'bg-green-50');
                          console.log("=== DRAG & DROP TRIGGERED ===");
                          const files = Array.from(e.dataTransfer.files);
                          console.log("Dropped files:", files.length);
                          
                          // Create fake event for handlePhotoUpload
                          const fakeEvent = {
                            target: { files: e.dataTransfer.files, value: '' }
                          } as React.ChangeEvent<HTMLInputElement>;
                          
                          handlePhotoUpload(fakeEvent);
                        }}
                      >
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handlePhotoUpload}
                          className="hidden"
                          id="photo-upload"
                          key={Date.now()}
                        />
                        <div className="cursor-pointer block"
                          onClick={(e) => {
                            e.preventDefault();
                            console.log("Upload area clicked");
                            const input = document.getElementById('photo-upload') as HTMLInputElement;
                            if (input) {
                              console.log("Triggering file dialog manually");
                              input.click();
                            } else {
                              console.error("Photo upload input not found");
                            }
                          }}
                        >
                          <Upload className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                          <p className="text-gray-700 font-medium text-sm">Upload from Gallery</p>
                          <p className="text-xs text-blue-600 mt-1">Click or drag photos here</p>
                        </div>
                      </div>
                      
                      {/* Take photo with camera */}
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer"
                        onClick={startCamera}
                      >
                        <CameraIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium text-sm">Take Photo</p>
                        <p className="text-xs text-gray-500 mt-1">Use device camera</p>
                      </div>
                    </div>
                    
                    {/* Additional button for laptops with file dialog issues */}
                    <div className="flex justify-center mt-2 mb-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Alternative upload button clicked");
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.multiple = true;
                          input.accept = 'image/jpeg,image/jpg,image/png,image/gif,image/webp';
                          input.onchange = (e) => {
                            console.log("Alternative input change triggered");
                            handlePhotoUpload(e as any);
                          };
                          input.click();
                        }}
                        className="text-xs"
                      >
                        <Upload className="h-3 w-3 mr-1" />
                        Browse Files
                      </Button>
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
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Selected Photos ({photos.length}/5)</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPhotos([])}
                        className="text-xs"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border-2 border-green-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                            <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              {photo.name}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-80 hover:opacity-100"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
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

            </form>
          </Form>
        </div>
        
        {/* Fixed Submit Button Footer - ALWAYS VISIBLE */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <Button 
            type="button"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-lg shadow-md"
            disabled={createIssueMutation.isPending}
            onClick={() => {
              console.log("Submit button clicked - triggering form submission");
              form.handleSubmit(onSubmit)();
            }}
          >
            {createIssueMutation.isPending ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Submitting...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-5 w-5" />
                Submit Report
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
