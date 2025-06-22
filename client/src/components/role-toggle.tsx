import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Shield, Building2, MapPin, Wrench, UserCheck } from "lucide-react";
import type { UserRole } from "@/lib/types";

interface RoleToggleProps {
  currentRole: UserRole | null;
  onRoleChange: (role: UserRole) => void;
}

const roleConfig: Record<UserRole, { label: string; icon: any; color: string; description: string }> = {
  citizen: {
    label: "Citizen",
    icon: User,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Report issues and track services"
  },
  official: {
    label: "Municipal Official",
    icon: UserCheck,
    color: "bg-green-50 text-green-700 border-green-200",
    description: "Manage issues and oversee operations"
  },
  admin: {
    label: "Administrator",
    icon: Shield,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Full system administration"
  },
  mayor: {
    label: "Mayor",
    icon: Building2,
    color: "bg-red-50 text-red-700 border-red-200",
    description: "Municipality-wide oversight"
  },
  wardCouncillor: {
    label: "Ward Councillor",
    icon: MapPin,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    description: "Ward-specific management"
  },
  techManager: {
    label: "Technical Manager",
    icon: Wrench,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    description: "Technician allocation and performance"
  },
  systemAdmin: {
    label: "System Administrator",
    icon: Shield,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Complete system management and user administration"
  }
};

export function RoleToggle({ currentRole, onRoleChange }: RoleToggleProps) {
  if (!currentRole) {
    return null;
  }

  const currentConfig = roleConfig[currentRole];
  const Icon = currentConfig.icon;

  return (
    <div className="flex items-center gap-3">
      <Badge variant="outline" className={currentConfig.color}>
        <Icon className="w-4 h-4 mr-1" />
        {currentConfig.label}
      </Badge>
      
      <Select value={currentRole} onValueChange={onRoleChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Switch role" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(roleConfig).map(([role, config]) => {
            const RoleIcon = config.icon;
            return (
              <SelectItem key={role} value={role}>
                <div className="flex items-center gap-2">
                  <RoleIcon className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{config.label}</div>
                    <div className="text-xs text-gray-500">{config.description}</div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
