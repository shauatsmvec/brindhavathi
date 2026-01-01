import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Loader2, Pencil, Trash2, Key, X, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ManagedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
}

export function UserManagement() {
  const queryClient = useQueryClient();
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "list" },
      });

      if (response.error) throw response.error;
      return response.data.users as ManagedUser[];
    },
  });

  const updateNameMutation = useMutation({
    mutationFn: async ({ userId, name }: { userId: string; name: string }) => {
      const response = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "update_name", targetUserId: userId, newName: name },
      });
      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User name updated");
      setEditingUser(null);
      setNewName("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: string; password: string }) => {
      const response = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "update_password", targetUserId: userId, newPassword: password },
      });
      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);
    },
    onSuccess: () => {
      toast.success("Password updated");
      setPasswordUser(null);
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await supabase.functions.invoke("admin-manage-users", {
        body: { action: "delete", targetUserId: userId },
      });
      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User deleted");
      setDeletingUser(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleEditName = (user: ManagedUser) => {
    setEditingUser(user);
    setNewName(user.full_name);
  };

  const handleSaveName = () => {
    if (!editingUser || !newName.trim()) return;
    updateNameMutation.mutate({ userId: editingUser.id, name: newName.trim() });
  };

  const handleChangePassword = () => {
    if (!passwordUser) return;
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    updatePasswordMutation.mutate({ userId: passwordUser.id, password: newPassword });
  };

  const handleDeleteUser = () => {
    if (!deletingUser) return;
    deleteUserMutation.mutate(deletingUser.id);
  };

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>
            <p className="text-sm text-muted-foreground">Loading users...</p>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>
            <p className="text-sm text-destructive">Failed to load users</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card p-6 lg:col-span-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>
            <p className="text-sm text-muted-foreground">Manage user accounts, names, and passwords</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Last Login</th>
                <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-muted/20">
                  <td className="py-3 px-2 text-sm text-foreground">{user.full_name || "—"}</td>
                  <td className="py-3 px-2 text-sm text-foreground">{user.email}</td>
                  <td className="py-3 px-2">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-2 text-sm text-muted-foreground">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditName(user)}
                        title="Edit name"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPasswordUser(user)}
                        title="Change password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingUser(user)}
                        title="Delete user"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!users || users.length === 0) && (
          <p className="text-center text-muted-foreground py-8">No users found</p>
        )}
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Name</DialogTitle>
            <DialogDescription>
              Update the display name for {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Full name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveName} disabled={updateNameMutation.isPending}>
              {updateNameMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={!!passwordUser} onOpenChange={() => setPasswordUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Set a new password for {passwordUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={updatePasswordMutation.isPending}>
              {updatePasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingUser?.email}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
