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
      <CardContent className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-trust-blue text-base sm:text-lg">
                {issue.category === "water_sanitation" && "💧"}
                {issue.category === "electricity" && "⚡"}
                {issue.category === "roads_transport" && "🚗"}
                {issue.category === "waste_management" && "🗑️"}
                {issue.category === "safety_security" && "🛡️"}
                {issue.category === "housing" && "🏠"}
                {issue.category === "other" && "❓"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{issue.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600 capitalize">
                {issue.category.replace("_", " & ")}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1 sm:space-y-2 flex-shrink-0">
            <Badge className={`${getStatusColor(issue.status)} text-xs`}>
              {issue.status.replace("_", " ")}
            </Badge>
            {issue.referenceNumber && (
              <span className="text-xs sm:text-sm font-mono font-semibold text-blue-600">
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
                  className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ))}
              {issue.photos.length > 3 && (
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs sm:text-sm text-gray-600">
                  +{issue.photos.length - 3}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 space-y-1 sm:space-y-0">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span>{formatRelativeTime(issue.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="truncate max-w-40 sm:max-w-32">{issue.location}</span>
            </div>
          </div>
          <Badge className={`${getPriorityColor(issue.priority)} text-xs`}>
            {issue.priority}
          </Badge>
        </div>

        {/* Progress Timeline */}
        <div className="mb-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:space-x-4 gap-2 sm:gap-0 text-xs sm:text-sm">
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full mr-1 sm:mr-2"></div>
              <span>Reported</span>
            </div>
            <div className={`flex items-center ${["assigned", "in_progress", "resolved", "closed"].includes(issue.status) ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-2 h-2 rounded-full mr-1 sm:mr-2 ${["assigned", "in_progress", "resolved", "closed"].includes(issue.status) ? "bg-green-600" : "bg-gray-300"}`}></div>
              <span>Assigned</span>
            </div>
            <div className={`flex items-center ${["in_progress", "resolved", "closed"].includes(issue.status) ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-2 h-2 rounded-full mr-1 sm:mr-2 ${["in_progress", "resolved", "closed"].includes(issue.status) ? "bg-green-600" : "bg-gray-300"}`}></div>
              <span>In Progress</span>
            </div>
            <div className={`flex items-center ${["resolved", "closed"].includes(issue.status) ? "text-green-600" : "text-gray-400"}`}>
              <div className={`w-2 h-2 rounded-full mr-1 sm:mr-2 ${["resolved", "closed"].includes(issue.status) ? "bg-green-600" : "bg-gray-300"}`}></div>
              <span>Resolved</span>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
            {onViewDetails && (
              <Button
                variant="ghost"
                size="sm"
                className="text-sa-green hover:text-green-700 w-full sm:w-auto text-xs sm:text-sm"
                onClick={() => onViewDetails(issue)}
              >
                View Details
              </Button>
            )}
            {isResolved && onRate && !issue.rating && (
              <Button
                variant="ghost"
                size="sm"
                className="text-trust-blue hover:text-blue-700 w-full sm:w-auto text-xs sm:text-sm"
                onClick={() => onRate(issue)}
              >
                Rate Service
              </Button>
            )}
            {issue.rating && (
              <div className="flex items-center justify-center sm:justify-start space-x-1 text-xs sm:text-sm py-2">
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
                className="text-trust-blue hover:text-blue-700 w-full sm:w-auto text-xs sm:text-sm"
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
