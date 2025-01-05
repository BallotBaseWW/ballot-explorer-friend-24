import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";

interface UsersTableProps {
  users: Profile[] | undefined;
  isLoading: boolean;
  refetch: () => void;
}

export const UsersTable = ({ users, isLoading, refetch }: UsersTableProps) => {
  const { toast } = useToast();

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

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
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
              <TableCell>{user.full_name || "N/A"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.user_roles?.[0]?.role || "user"}</TableCell>
              <TableCell>{user.approved ? "Approved" : "Pending"}</TableCell>
              <TableCell className="space-x-2">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};