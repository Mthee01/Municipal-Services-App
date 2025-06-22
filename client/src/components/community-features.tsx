import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageSquare, TrendingUp, Award, MapPin, Clock, Star, ThumbsUp } from "lucide-react";
import { formatRelativeTime, getStatusColor } from "@/lib/utils";

interface CommunityUpdate {
  id: number;
  issueId: number;
  issueTitle: string;
  type: "progress" | "completion" | "comment" | "rating";
  message: string;
  author: string;
  timestamp: string;
  ward?: string;
  rating?: number;
}

interface CommunityFeedback {
  id: number;
  issueId: number;
  type: "thumbs_up" | "suggestion" | "concern";
  message: string;
  author: string;
  timestamp: string;
  likes: number;
}

export function CommunityFeatures() {
  const [selectedTab, setSelectedTab] = useState("updates");
  const [newComment, setNewComment] = useState("");
  const [feedbackDialog, setFeedbackDialog] = useState(false);

  const { data: issues, isLoading: issuesLoading } = useQuery({
    queryKey: ["/api/issues"],
  });

  // Mock community data - in real app would come from API
  const communityUpdates: CommunityUpdate[] = [
    {
      id: 1,
      issueId: 1,
      issueTitle: "Pothole on Main Street",
      type: "progress",
      message: "Road crew has arrived and started work. Expected completion by 3 PM today.",
      author: "Municipal Works Team",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      ward: "Ward 1"
    },
    {
      id: 2,
      issueId: 2,
      issueTitle: "Street light not working",
      type: "completion",
      message: "Street light has been repaired and is now functioning normally.",
      author: "Electrical Team",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      ward: "Ward 2"
    },
    {
      id: 3,
      issueId: 1,
      issueTitle: "Pothole on Main Street",
      type: "comment",
      message: "Thank you for the quick response! The road is much safer now.",
      author: "Local Resident",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      ward: "Ward 1"
    },
    {
      id: 4,
      issueId: 2,
      issueTitle: "Street light not working",
      type: "rating",
      message: "Excellent service - fixed within 24 hours of reporting!",
      author: "Community Member",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      ward: "Ward 2",
      rating: 5
    }
  ];

  const communityFeedback: CommunityFeedback[] = [
    {
      id: 1,
      issueId: 1,
      type: "suggestion",
      message: "Could we get temporary signs warning about the pothole until it's fixed?",
      author: "Sarah Johnson",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      likes: 12
    },
    {
      id: 2,
      issueId: 3,
      type: "concern",
      message: "This water leak is getting worse and affecting neighboring properties.",
      author: "David Brown",
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      likes: 8
    },
    {
      id: 3,
      issueId: 2,
      type: "thumbs_up",
      message: "Great job on the quick street light repair! Much appreciated.",
      author: "Community Group",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 25
    }
  ];

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "progress": return <Clock className="w-4 h-4 text-blue-600" />;
      case "completion": return <Award className="w-4 h-4 text-green-600" />;
      case "comment": return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case "rating": return <Star className="w-4 h-4 text-yellow-600" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case "thumbs_up": return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case "suggestion": return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "concern": return <MessageSquare className="w-4 h-4 text-orange-600" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getUpdateTypeLabel = (type: string) => {
    switch (type) {
      case "progress": return "Progress Update";
      case "completion": return "Completed";
      case "comment": return "Community Comment";
      case "rating": return "Citizen Rating";
      default: return "Update";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Community Hub</h2>
          <p className="text-gray-600 dark:text-gray-300">Stay informed about issue progress and community discussions</p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Users className="w-4 h-4 mr-1" />
          Community Powered
        </Badge>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="updates">Live Updates</TabsTrigger>
          <TabsTrigger value="feedback">Community Feedback</TabsTrigger>
          <TabsTrigger value="progress">Progress Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="updates" className="space-y-4">
          <div className="space-y-4">
            {communityUpdates.map((update) => (
              <Card key={update.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getUpdateIcon(update.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getUpdateTypeLabel(update.type)}
                          </Badge>
                          {update.ward && (
                            <Badge variant="secondary" className="text-xs">
                              <MapPin className="w-3 h-3 mr-1" />
                              {update.ward}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(update.timestamp)}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                        {update.issueTitle}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {update.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          by {update.author}
                        </span>
                        {update.rating && (
                          <div className="flex items-center gap-1">
                            {[...Array(update.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Community Feedback & Suggestions</h3>
            <Dialog open={feedbackDialog} onOpenChange={setFeedbackDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Community Feedback</DialogTitle>
                  <DialogDescription>
                    Help improve our community by sharing suggestions, concerns, or appreciation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Share your thoughts, suggestions, or concerns..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => setFeedbackDialog(false)}>
                      Submit Feedback
                    </Button>
                    <Button variant="outline" onClick={() => setFeedbackDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {communityFeedback.map((feedback) => (
              <Card key={feedback.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getFeedbackIcon(feedback.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {feedback.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(feedback.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {feedback.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          by {feedback.author}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <ThumbsUp className="w-3 h-3" />
                          {feedback.likes}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Community Progress Overview
              </CardTitle>
              <CardDescription>
                Track the progress of community-reported issues and municipal responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">87%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Issues Resolved</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24h</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Avg Response Time</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">4.6/5</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Community Rating</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Recent Progress Updates</h4>
                {issues?.slice(0, 5).map((issue: any) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{issue.title}</h5>
                      <p className="text-xs text-gray-500">{issue.location} • {issue.ward}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(issue.status)}>
                        {issue.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(issue.updatedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}