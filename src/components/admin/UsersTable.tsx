import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface UsersTableProps {
  users: Profile[] | undefined;
  isLoading: boolean;
  refetch: () => void;
}

export const UsersTable = ({ users, isLoading, refetch }: UsersTableProps) => {
  const { toast } = useToast();
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: "",
    full_name: "",
    password: "",
  });

  const handleToggleApproval = async (userId: string, currentApproval: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ approved: !currentApproval })
      .eq("id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user approval status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "User approval status updated.",
      });
      refetch();
    }
  };

  const handleToggleRole = async (userId: string, currentRole: "admin" | "user") => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "User role updated.",
      });
      refetch();
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: editingUser.full_name,
        email: editingUser.email,
      })
      .eq("id", editingUser.id);

    if (profileError) {
      toast({
        title: "Error",
        description: "Failed to update user information.",
        variant: "destructive",
      });
      return;
    }

    // If password is provided, update it
    if (editingUser.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        editingUser.id,
        { password: editingUser.password }
      );

      if (passwordError) {
        toast({
          title: "Error",
          description: "Failed to update password.",
          variant: "destructive",
        });
        return;
      }
    }

    toast({
      title: "Success",
      description: "User information updated successfully.",
    });
    setEditingUser(null);
    refetch();
  };

  const handleCreateUser = async () => {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: newUserData.email,
      password: newUserData.password,
      email_confirm: true,
      user_metadata: {
        full_name: newUserData.full_name,
      },
    });

    if (authError) {
      toast({
        title: "Error",
        description: "Failed to create user.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "User created successfully.",
    });
    setNewUserData({ email: "", full_name: "", password: "" });
    refetch();
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Create New User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                value={newUserData.email}
                onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="new-name">Full Name</Label>
              <Input
                id="new-name"
                value={newUserData.full_name}
                onChange={(e) => setNewUserData(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newUserData.password}
                onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <Button onClick={handleCreateUser}>Create User</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <Input
                      value={editingUser.full_name || ""}
                      onChange={(e) => setEditingUser(prev => ({ ...prev!, full_name: e.target.value }))}
                    />
                  ) : (
                    user.full_name || "N/A"
                  )}
                </TableCell>
                <TableCell>
                  {editingUser?.id === user.id ? (
                    <Input
                      value={editingUser.email || ""}
                      onChange={(e) => setEditingUser(prev => ({ ...prev!, email: e.target.value }))}
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell>{user.user_roles?.[0]?.role || "user"}</TableCell>
                <TableCell>{user.approved ? "Approved" : "Pending"}</TableCell>
                <TableCell className="space-x-2">
                  {editingUser?.id === user.id ? (
                    <>
                      <Button variant="outline" size="sm" onClick={handleUpdateUser}>
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingUser({ ...user, password: "" })}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleApproval(user.id, !!user.approved)}
                      >
                        {user.approved ? "Revoke" : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleRole(user.id, user.user_roles?.[0]?.role || "user")}
                      >
                        Toggle Admin
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};