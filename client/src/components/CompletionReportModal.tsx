import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { X, Clock, CheckCircle, Star } from "lucide-react";

const completionReportSchema = z.object({
  workCompleted: z.string().min(10, "Please describe the work completed (minimum 10 characters)"),
  materialsUsed: z.string().optional(),
  timeTaken: z.number().min(1, "Time taken must be at least 1 minute").max(1440, "Time cannot exceed 24 hours"),
  issuesFound: z.string().optional(),
  recommendations: z.string().optional(),
  customerSatisfaction: z.number().min(1).max(5),
  additionalNotes: z.string().optional(),
});

type CompletionReportForm = z.infer<typeof completionReportSchema>;

interface CompletionReportModalProps {
  issue: {
    id: number;
    title: string;
    description: string;
    category: string;
    location: string;
  };
  jobCardNumber: string;
  technicianId: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function CompletionReportModal({ 
  issue, 
  jobCardNumber, 
  technicianId, 
  isOpen, 
  onClose 
}: CompletionReportModalProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CompletionReportForm>({
    resolver: zodResolver(completionReportSchema),
    defaultValues: {
      workCompleted: "",
      materialsUsed: "",
      timeTaken: 30,
      issuesFound: "",
      recommendations: "",
      customerSatisfaction: 5,
      additionalNotes: "",
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async (data: CompletionReportForm) => {
      const materialsArray = data.materialsUsed 
        ? data.materialsUsed.split(',').map(m => m.trim()).filter(m => m.length > 0)
        : [];

      const reportData = {
        issueId: issue.id,
        technicianId,
        jobCardNumber,
        workCompleted: data.workCompleted,
        materialsUsed: materialsArray,
        timeTaken: data.timeTaken,
        issuesFound: data.issuesFound || null,
        recommendations: data.recommendations || null,
        customerSatisfaction: data.customerSatisfaction,
        additionalNotes: data.additionalNotes || null,
        completedAt: new Date().toISOString(),
      };

      return await apiRequest("/api/completion-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Completion Report Submitted",
        description: `Work completion report for job card ${jobCardNumber} has been successfully submitted.`,
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/completion-reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/field-reports"] });
      
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit completion report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CompletionReportForm) => {
    submitReportMutation.mutate(data);
  };

  const commonMaterials = [
    "Pipes", "Cables", "Fittings", "Screws & Bolts", "Wire Connectors", 
    "Concrete Mix", "Sand", "Gravel", "Paint", "Tools", "Safety Equipment"
  ];

  const addMaterial = (material: string) => {
    if (!selectedMaterials.includes(material)) {
      const newMaterials = [...selectedMaterials, material];
      setSelectedMaterials(newMaterials);
      form.setValue('materialsUsed', newMaterials.join(', '));
    }
  };

  const removeMaterial = (material: string) => {
    const newMaterials = selectedMaterials.filter(m => m !== material);
    setSelectedMaterials(newMaterials);
    form.setValue('materialsUsed', newMaterials.join(', '));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            Work Completion Report
          </DialogTitle>
          <DialogDescription>
            Complete the work report for <strong>{issue.title}</strong> (Job Card: {jobCardNumber})
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="text-sm">
            <p><strong>Issue:</strong> {issue.title}</p>
            <p><strong>Category:</strong> {issue.category}</p>
            <p><strong>Location:</strong> {issue.location}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="workCompleted"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-green-700">Work Completed *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the work that was completed..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of all work performed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeTaken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Taken (minutes) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={1440}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerSatisfaction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Customer Satisfaction *
                    </FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Rate satisfaction (1-5)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ Excellent (5)</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ Good (4)</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ Average (3)</SelectItem>
                        <SelectItem value="2">⭐⭐ Poor (2)</SelectItem>
                        <SelectItem value="1">⭐ Very Poor (1)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="materialsUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Materials Used</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List materials used (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can add common materials below or type custom ones
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {commonMaterials.map((material) => (
                      <Badge
                        key={material}
                        variant={selectedMaterials.includes(material) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => selectedMaterials.includes(material) ? removeMaterial(material) : addMaterial(material)}
                      >
                        {material}
                        {selectedMaterials.includes(material) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issuesFound"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issues Found During Work</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any additional issues discovered..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommendations</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Suggest preventive measures or future improvements..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any other information or observations..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={submitReportMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {submitReportMutation.isPending ? "Submitting..." : "Complete Work & Submit Report"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={submitReportMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}