import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Profile } from "@/types/profile";

interface UserTableRowProps {
  user: Profile;
  editingUser: Profile | null;
  setEditingUser: (user: Profile | null) => void;
  handleUpdateUser: () => void;
  handleToggleApproval: (userId: string, currentApproval: boolean) => void;
  handleToggleRole: (userId: string, role: "admin" | "user") => void;
}

export const UserTableRow = ({
  user,
  editingUser,
  setEditingUser,
  handleUpdateUser,
  handleToggleApproval,
  handleToggleRole,
}: UserTableRowProps) => {
  return (
    <TableRow>
      <TableCell>
        {editingUser?.id === user.id ? (
          <Input
            value={editingUser.full_name || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, full_name: e.target.value })
            }
          />
        ) : (
          user.full_name || "N/A"
        )}
      </TableCell>
      <TableCell>
        {editingUser?.id === user.id ? (
          <Input
            value={editingUser.email || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, email: e.target.value })
            }
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
              onClick={() =>
                handleToggleRole(
                  user.id,
                  user.user_roles?.[0]?.role || "user"
                )
              }
            >
              Toggle Admin
            </Button>
          </>
        )}
      </TableCell>
    </TableRow>
  );
};