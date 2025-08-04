import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Users, 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Database,
  BarChart3,
  Activity,
  UserCheck,
  Crown,
  Briefcase,
  Wrench,
  Phone,
  LogOut,
  Key,
  RefreshCw
} from "lucide-react";

// User creation form schema
const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  role: z.enum(["citizen", "call_centre_agent", "admin", "ward_councillor", "mayor", "tech_manager", "field_technician"]),
  municipalityAccountNo: z.string().optional(),
});

type CreateUserData = z.infer<typeof createUserSchema>;

const roleConfig = {
  citizen: { icon: UserCheck, label: "Citizen", color: "bg-mtn-blue" },
  call_centre_agent: { icon: Phone, label: "Call Centre Agent", color: "bg-mtn-yellow" },
  admin: { icon: Shield, label: "Administrator", color: "bg-red-500" },
  ward_councillor: { icon: Crown, label: "Ward Councillor", color: "bg-mtn-dark-blue" },
  mayor: { icon: Crown, label: "Mayor", color: "bg-mtn-yellow" },
  tech_manager: { icon: Briefcase, label: "Tech Manager", color: "bg-mtn-blue" },
  field_technician: { icon: Wrench, label: "Field Technician", color: "bg-mtn-dark-blue" },
};

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: keyof typeof roleConfig;
  municipalityAccountNo?: string;
  createdAt: string;
  lastActive?: string;
  status: "active" | "inactive" | "suspended";
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  totalTeams: number;
  activeTechnicians: number;
  systemUptime: string;
}

export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetAllPasswords, setShowResetAllPasswords] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    retry: false,
  });

  // Fetch system statistics
  const { data: stats } = useQuery<SystemStats>({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });

  // Create user form
  const createForm = useForm<CreateUserData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      email: "",
      phone: "",
      role: "citizen",
      municipalityAccountNo: "",
    },
  });

  // Edit user form
  const editForm = useForm<Partial<CreateUserData>>({
    resolver: zodResolver(createUserSchema.partial()),
    defaultValues: {},
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await apiRequest("POST", "/api/admin/users", data);
      if (!response.ok) throw new Error("Failed to create user");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "New user has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setShowCreateUser(false);
      createForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateUserData> }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${id}`, data);
      if (!response.ok) throw new Error("Failed to update user");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "User has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowEditUser(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${id}`);
      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "active" | "inactive" | "suspended" }) => {
      console.log("Updating user status:", { id, status });
      const response = await apiRequest("PATCH", `/api/admin/users/${id}/status`, { status });
      console.log("Status update response:", response.status, response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("Status update failed:", errorData);
        throw new Error(errorData.message || "Failed to update user status");
      }
      
      const result = await response.json();
      console.log("Status update successful:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Status mutation success:", data);
      toast({
        title: "Status Updated",
        description: "User status has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
    },
    onError: (error) => {
      console.error("Status mutation error:", error);
      toast({
        title: "Error Updating Status",
        description: error.message || "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateUser = (data: CreateUserData) => {
    createUserMutation.mutate(data);
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    const data = editForm.getValues();
    updateUserMutation.mutate({ id: selectedUser.id, data });
  };

  const handleDeleteUser = (user: User) => {
    deleteUserMutation.mutate(user.id);
  };

  const handleToggleStatus = (user: User, newStatus: "active" | "inactive" | "suspended") => {
    toggleUserStatusMutation.mutate({ id: user.id, status: newStatus });
  };

  // Reset password mutations
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: number; password: string }) => {
      console.log("Resetting password for user:", id);
      const response = await apiRequest("PATCH", `/api/admin/users/${id}/reset-password`, { newPassword: password });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("Password reset failed:", errorData);
        throw new Error(errorData.message || "Failed to reset password");
      }
      
      const result = await response.json();
      console.log("Password reset successful:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("Password reset mutation success:", data);
      toast({
        title: "Password Reset",
        description: "User password has been successfully reset.",
      });
      setShowResetPassword(false);
      setSelectedUser(null);
      setNewPassword("");
    },
    onError: (error) => {
      console.error("Password reset mutation error:", error);
      toast({
        title: "Error Resetting Password",
        description: error.message || "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetAllPasswordsMutation = useMutation({
    mutationFn: async (password: string) => {
      console.log("Resetting all user passwords");
      const response = await apiRequest("POST", "/api/admin/users/reset-all-passwords", { newPassword: password });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("All passwords reset failed:", errorData);
        throw new Error(errorData.message || "Failed to reset all passwords");
      }
      
      const result = await response.json();
      console.log("All passwords reset successful:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("All passwords reset mutation success:", data);
      toast({
        title: "All Passwords Reset",
        description: `Successfully reset passwords for ${data.resetCount} users.`,
      });
      setShowResetAllPasswords(false);
      setNewPassword("");
    },
    onError: (error) => {
      console.error("All passwords reset mutation error:", error);
      toast({
        title: "Error Resetting Passwords",
        description: error.message || "Failed to reset passwords. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleResetPassword = () => {
    if (!selectedUser || !newPassword) return;
    resetPasswordMutation.mutate({ id: selectedUser.id, password: newPassword });
  };

  const handleResetAllPasswords = () => {
    if (!newPassword) return;
    resetAllPasswordsMutation.mutate(newPassword);
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setShowResetPassword(true);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      municipalityAccountNo: user.municipalityAccountNo || "",
    });
    setShowEditUser(true);
  };

  const getRoleIcon = (role: keyof typeof roleConfig) => {
    const IconComponent = roleConfig[role]?.icon || Shield;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-500",
      inactive: "bg-gray-500", 
      suspended: "bg-red-500",
    };
    return (
      <Badge 
        className={`${statusColors[status as keyof typeof statusColors]} text-white border-0`}
        style={{
          background: status === 'active' ? 'hsl(196, 100%, 31%)' : statusColors[status as keyof typeof statusColors]
        }}
      >
        {status}
      </Badge>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("municipalAuth");
    sessionStorage.removeItem("municipalAuth");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, hsl(51, 100%, 98%) 0%, hsl(196, 100%, 98%) 100%)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm" style={{ borderBottom: '3px solid hsl(196, 100%, 31%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8" style={{ color: 'hsl(196, 100%, 31%)' }} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Administrator Dashboard</h1>
                <p className="text-sm text-gray-500">Full System Access & User Management</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="flex items-center space-x-2"
              style={{ 
                borderColor: 'hsl(196, 100%, 31%)',
                color: 'hsl(196, 100%, 31%)'
              }}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-max w-full">
              <TabsTrigger value="overview" className="px-3 py-1.5 text-sm whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="users" className="px-3 py-1.5 text-sm whitespace-nowrap">Users</TabsTrigger>
              <TabsTrigger value="permissions" className="px-3 py-1.5 text-sm whitespace-nowrap">Roles</TabsTrigger>
              <TabsTrigger value="settings" className="px-3 py-1.5 text-sm whitespace-nowrap">Settings</TabsTrigger>
            </TabsList>
          </div>

          {/* System Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeUsers || 0} active users
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalIssues || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.resolvedIssues || 0} resolved
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalTeams || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.activeTechnicians || 0} technicians
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Status</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">
                    Uptime: {stats?.systemUptime || "24h"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="flex items-center gap-3">
                <Dialog open={showResetAllPasswords} onOpenChange={setShowResetAllPasswords}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2 bg-orange-50 hover:bg-orange-100 border-orange-200">
                      <RefreshCw className="w-4 h-4" />
                      <span>Reset All Passwords</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
                
                <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add User</span>
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreateUser)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(roleConfig).map(([value, config]) => (
                                  <SelectItem key={value} value={value}>
                                    <div className="flex items-center space-x-2">
                                      {getRoleIcon(value as keyof typeof roleConfig)}
                                      <span>{config.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="municipalityAccountNo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Municipality Account No. (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-2">
                        <Button 
                          type="submit" 
                          disabled={createUserMutation.isPending}
                          className="flex-1"
                        >
                          {createUserMutation.isPending ? "Creating..." : "Create User"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCreateUser(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">User</TableHead>
                        <TableHead className="min-w-[120px]">Role</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Last Active</TableHead>
                        <TableHead className="min-w-[320px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="min-w-[200px]">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">@{user.username}</div>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <div className="flex items-center space-x-2">
                              {getRoleIcon(user.role)}
                              <span className="text-sm">{roleConfig[user.role]?.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[100px]">{getStatusBadge(user.status)}</TableCell>
                          <TableCell className="text-sm text-gray-500 min-w-[120px]">
                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : "Never"}
                          </TableCell>
                          <TableCell className="min-w-[280px]">
                            <div className="flex items-center gap-2 justify-start">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                                className="flex items-center gap-1 px-3 py-1 h-8 whitespace-nowrap"
                              >
                                <Edit className="w-3 h-3" />
                                <span className="text-xs">Edit</span>
                              </Button>

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openResetPasswordDialog(user)}
                                className="flex items-center gap-1 px-3 py-1 h-8 whitespace-nowrap"
                                title="Reset Password"
                              >
                                <Key className="w-3 h-3" />
                                <span className="text-xs">Reset</span>
                              </Button>
                              
                              <Select
                                value={user.status}
                                onValueChange={(status: "active" | "inactive" | "suspended") => 
                                  handleToggleStatus(user, status)
                                }
                              >
                                <SelectTrigger className="w-20 h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="inactive">Inactive</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                              </Select>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 flex-shrink-0"
                                    title="Delete user"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {user.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteUser(user)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(roleConfig).map(([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center space-x-2">
                                    {getRoleIcon(value as keyof typeof roleConfig)}
                                    <span>{config.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button 
                        type="submit" 
                        disabled={updateUserMutation.isPending}
                        className="flex-1"
                      >
                        {updateUserMutation.isPending ? "Updating..." : "Update User"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowEditUser(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Reset All Passwords Dialog */}
            <Dialog open={showResetAllPasswords} onOpenChange={setShowResetAllPasswords}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Reset All User Passwords</DialogTitle>
                  <DialogDescription>
                    This will reset passwords for all {stats?.totalUsers || 0} users in the system. Please enter a new password.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="new-password-all" className="block text-sm font-medium mb-2">
                      New Password (minimum 6 characters)
                    </label>
                    <Input
                      id="new-password-all"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password for all users"
                      minLength={6}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleResetAllPasswords}
                      disabled={resetAllPasswordsMutation.isPending || newPassword.length < 6}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      {resetAllPasswordsMutation.isPending ? "Resetting..." : "Reset All Passwords"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowResetAllPasswords(false);
                        setNewPassword("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Reset Individual Password Dialog */}
            <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                  <DialogDescription>
                    Reset password for {selectedUser?.name} ({selectedUser?.username})
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="new-password-single" className="block text-sm font-medium mb-2">
                      New Password (minimum 6 characters)
                    </label>
                    <Input
                      id="new-password-single"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength={6}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleResetPassword}
                      disabled={resetPasswordMutation.isPending || newPassword.length < 6}
                      className="flex-1"
                    >
                      {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowResetPassword(false);
                        setSelectedUser(null);
                        setNewPassword("");
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Roles & Permissions */}
          <TabsContent value="permissions" className="space-y-6">
            <h2 className="text-xl font-semibold">Roles & Permissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(roleConfig).map(([role, config]) => (
                <Card key={role}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      {getRoleIcon(role as keyof typeof roleConfig)}
                      <span>{config.label}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {role === "admin" && (
                        <>
                          <div>• Full system access</div>
                          <div>• User management</div>
                          <div>• System configuration</div>
                          <div>• All dashboard access</div>
                        </>
                      )}
                      {role === "mayor" && (
                        <>
                          <div>• Municipal oversight</div>
                          <div>• Strategic planning</div>
                          <div>• Policy decisions</div>
                          <div>• Performance analytics</div>
                        </>
                      )}
                      {role === "ward_councillor" && (
                        <>
                          <div>• Ward management</div>
                          <div>• Citizen representation</div>
                          <div>• Issue tracking</div>
                          <div>• Community engagement</div>
                        </>
                      )}
                      {role === "tech_manager" && (
                        <>
                          <div>• Team management</div>
                          <div>• Work assignment</div>
                          <div>• Resource allocation</div>
                          <div>• Performance monitoring</div>
                        </>
                      )}
                      {role === "field_technician" && (
                        <>
                          <div>• Issue resolution</div>
                          <div>• Field reporting</div>
                          <div>• Time tracking</div>
                          <div>• Mobile access</div>
                        </>
                      )}
                      {role === "call_centre_agent" && (
                        <>
                          <div>• Customer support</div>
                          <div>• Issue logging</div>
                          <div>• Communication hub</div>
                          <div>• WhatsApp management</div>
                        </>
                      )}
                      {role === "citizen" && (
                        <>
                          <div>• Issue reporting</div>
                          <div>• Service requests</div>
                          <div>• Payment management</div>
                          <div>• Communication access</div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">System Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  System configuration options will be available in future updates.
                  Current system is running optimally with default settings.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Database Status</h4>
                    <p className="text-sm text-green-600">Connected and operational</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">API Status</h4>
                    <p className="text-sm text-green-600">All endpoints active</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">WebSocket</h4>
                    <p className="text-sm text-green-600">Real-time communication active</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">File Storage</h4>
                    <p className="text-sm text-green-600">Upload system operational</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}