import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useState } from "react";
import { CreateUserDialog } from "./CreateUserDialog";
import { UserTableRow } from "./UserTableRow";

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

    try {
      const { VITE_SUPABASE_URL } = import.meta.env;
      // Update user data through Edge Function
      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'updateUser',
          userData: {
            id: editingUser.id,
            email: editingUser.email,
            full_name: editingUser.full_name,
            password: editingUser.password,
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to update user');
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editingUser.full_name,
          email: editingUser.email,
        })
        .eq("id", editingUser.id);

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "User information updated successfully.",
      });
      setEditingUser(null);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user information.",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    try {
      // Create user through Edge Function
      const response = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'createUser',
          userData: newUserData,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create user');
      }

      toast({
        title: "Success",
        description: "User created successfully.",
      });
      setNewUserData({ email: "", full_name: "", password: "" });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <CreateUserDialog
        newUserData={newUserData}
        setNewUserData={setNewUserData}
        handleCreateUser={handleCreateUser}
      />

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
              <UserTableRow
                key={user.id}
                user={user}
                editingUser={editingUser}
                setEditingUser={setEditingUser}
                handleUpdateUser={handleUpdateUser}
                handleToggleApproval={handleToggleApproval}
                handleToggleRole={handleToggleRole}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};