import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ListPlus } from "lucide-react";
import { VoterList, ListDialogProps } from "./list-utils/types";
import { addVotersToList, createNewList } from "./list-utils/listOperations";

export const AddAllToListDialog = ({ searchQuery, county }: ListDialogProps) => {
  const [open, setOpen] = useState(false);
  const [lists, setLists] = useState<VoterList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchLists = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("voter_lists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching lists:", error);
      return;
    }

    setLists(data || []);
  };

  const handleSuccess = () => {
    toast({
      title: "Success",
      description: "Voters added to list successfully",
    });
    setOpen(false);
  };

  const handleError = (error: Error) => {
    console.error("Error:", error);
    toast({
      title: "Error",
      description: "Failed to add voters to list",
      variant: "destructive",
    });
  };

  const handleAddToExistingList = async (listId: string) => {
    setIsLoading(true);
    await addVotersToList({
      county,
      searchQuery,
      listId,
      onSuccess: handleSuccess,
      onError: handleError,
    });
    setIsLoading(false);
  };

  const handleCreateList = async () => {
    setIsLoading(true);
    await createNewList({
      county,
      searchQuery,
      listName: newListName,
      description: newListDescription,
      listId: "", // Not used for creation
      onSuccess: handleSuccess,
      onError: handleError,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) fetchLists();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="flex items-center gap-2"
        >
          <ListPlus className="h-4 w-4" />
          Add All to List
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add All Results to List</DialogTitle>
          <DialogDescription>
            Add all search results to an existing list or create a new one.
          </DialogDescription>
        </DialogHeader>
        
        {lists.length > 0 && (
          <div className="space-y-4">
            <Label>Existing Lists</Label>
            <div className="grid gap-2">
              {lists.map((list) => (
                <Button
                  key={list.id}
                  variant="outline"
                  onClick={() => handleAddToExistingList(list.id)}
                  disabled={isLoading}
                >
                  {list.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Label>Create New List</Label>
          <Input
            placeholder="List Name"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={newListDescription}
            onChange={(e) => setNewListDescription(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button
            onClick={handleCreateList}
            disabled={!newListName || isLoading}
          >
            Create & Add All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};