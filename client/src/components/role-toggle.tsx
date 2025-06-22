import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface RoleToggleProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleToggle({ currentRole, onRoleChange }: RoleToggleProps) {
  return (
    <div className="bg-gray-100 rounded-lg p-1 flex">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
          currentRole === "citizen" 
            ? "bg-sa-green text-white hover:bg-green-700" 
            : "text-gray-700 hover:bg-white"
        )}
        onClick={() => onRoleChange("citizen")}
      >
        Citizen
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "px-4 py-2 text-sm font-medium rounded-md transition-colors",
          currentRole === "official" 
            ? "bg-sa-green text-white hover:bg-green-700" 
            : "text-gray-700 hover:bg-white"
        )}
        onClick={() => onRoleChange("official")}
      >
        Official
      </Button>
    </div>
  );
}
