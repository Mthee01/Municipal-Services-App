import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { X, MapPin, Camera, Plus } from "lucide-react";
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const formData = new FormData();
      
      // Add form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Add photos
      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      const response = await fetch("/api/issues", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create issue");
      }

      return response.json();
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
    const files = Array.from(event.target.files || []);
    if (photos.length + files.length > 5) {
      toast({
        title: "Too many photos",
        description: "Maximum 5 photos allowed",
        variant: "destructive",
      });
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
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
      description: "Please allow location access when prompted",
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
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 300000
          }
        );
      });

      const { latitude, longitude, accuracy } = position.coords;
      
      // Enhanced location format
      const locationString = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      
      form.setValue("location", locationString);
      
      console.log("Location captured:", { latitude, longitude, accuracy, locationString });
      
      toast({
        title: "Location captured successfully", 
        description: `GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} ${accuracy ? `(±${Math.round(accuracy)}m)` : ''}`,
      });
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
                    </div>
                    <p className="text-xs text-gray-500">
                      {locationLoading ? "Getting your location..." : "Click map icon to use current location (requires permission)"}
                    </p>
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
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Upload Photos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">Click to upload photos or drag and drop</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB each (max 5 photos)</p>
                  </label>
                </div>
                
                {photos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
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
