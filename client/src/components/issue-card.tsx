import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { formatRelativeTime, getStatusColor, getPriorityColor } from "@/lib/utils";
import type { Issue } from "@shared/schema";

interface IssueCardProps {
  issue: Issue;
  showActions?: boolean;
  onViewDetails?: (issue: Issue) => void;
  onRate?: (issue: Issue) => void;
  onUpdate?: (issue: Issue) => void;
}

export function IssueCard({ issue, showActions = true, onViewDetails, onRate, onUpdate }: IssueCardProps) {
  const isResolved = issue.status === "resolved" || issue.status === "closed";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-trust-blue text-lg">
                {issue.category === "water_sanitation" && "💧"}
                {issue.category === "electricity" && "⚡"}
                {issue.category === "roads_transport" && "🚗"}
                {issue.category === "waste_management" && "🗑️"}
                {issue.category === "safety_security" && "🛡️"}
                {issue.category === "housing" && "🏠"}
                {issue.category === "other" && "❓"}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{issue.title}</h4>
              <p className="text-sm text-gray-600 capitalize">
                {issue.category.replace("_", " & ")}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(issue.status)}>
              {issue.status.replace("_", " ")}
            </Badge>
            {issue.referenceNumber && (
              <span className="text-sm font-mono font-semibold text-blue-600">
                RefNo: {issue.referenceNumber}
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-2">{issue.description}</p>
        
        {issue.photos && issue.photos.length > 0 && (
          <div className="mb-4">
            <div className="flex space-x-2 overflow-x-auto">
              {issue.photos.slice(0, 3).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Issue photo ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              ))}
              {issue.photos.length > 3 && (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-sm text-gray-600">
                  +{issue.photos.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatRelativeTime(issue.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="truncate max-w-32">{issue.location}</span>
            </div>
          </div>
          <Badge className={getPriorityColor(issue.priority)}>
            {issue.priority}
          </Badge>
        </div>

        {/* Progress Timeline */}
        <div className="mb-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
              <span>Reported</span>
            </div>
            <div className={`flex items-center ${["assigned", "in_progress", "resolved", "closed"].includes(issue.status) ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${["assigned", "in_progress", "resolved", "closed"].includes(issue.status) ? "bg-green-600" : "bg-gray-300"}`}></div>
              <span>Assigned</span>
            </div>
            <div className={`flex items-center ${["in_progress", "resolved", "closed"].includes(issue.status) ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${["in_progress", "resolved", "closed"].includes(issue.status) ? "bg-green-600" : "bg-gray-300"}`}></div>
              <span>In Progress</span>
            </div>
            <div className={`flex items-center ${["resolved", "closed"].includes(issue.status) ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${["resolved", "closed"].includes(issue.status) ? "bg-green-600" : "bg-gray-300"}`}></div>
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                className="text-sa-green hover:text-green-700"
                onClick={() => onViewDetails(issue)}
              >
                View Details
              </Button>
            )}
            {isResolved && onRate && !issue.rating && (
              <Button
                variant="ghost"
                size="sm"
                className="text-trust-blue hover:text-blue-700"
                onClick={() => onRate(issue)}
              >
                Rate Service
              </Button>
            )}
            {issue.rating && (
              <div className="flex items-center space-x-1 text-sm">
                <span className="text-gray-600">Rated:</span>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= issue.rating! ? "text-yellow-400" : "text-gray-300"}>
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onUpdate && (
              <Button
                variant="ghost"
                size="sm"
                className="text-trust-blue hover:text-blue-700"
                onClick={() => onUpdate(issue)}
              >
                Update
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
