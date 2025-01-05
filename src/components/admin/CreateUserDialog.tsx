import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateUserDialogProps {
  newUserData: {
    email: string;
    full_name: string;
    password: string;
  };
  setNewUserData: (data: {
    email: string;
    full_name: string;
    password: string;
  }) => void;
  handleCreateUser: () => void;
}

export const CreateUserDialog = ({
  newUserData,
  setNewUserData,
  handleCreateUser,
}: CreateUserDialogProps) => {
  return (
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
              onChange={(e) =>
                setNewUserData({ ...newUserData, email: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="new-name">Full Name</Label>
            <Input
              id="new-name"
              value={newUserData.full_name}
              onChange={(e) =>
                setNewUserData({ ...newUserData, full_name: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="new-password">Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newUserData.password}
              onChange={(e) =>
                setNewUserData({ ...newUserData, password: e.target.value })
              }
            />
          </div>
          <Button onClick={handleCreateUser}>Create User</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};