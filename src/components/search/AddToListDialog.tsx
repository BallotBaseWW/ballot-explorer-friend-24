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
import { VoterList } from "@/types/voter-list";

interface AddToListDialogProps {
  stateVoterId: string;
  county: string;
}

export const AddToListDialog = ({ stateVoterId, county }: AddToListDialogProps) => {
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

  const createList = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create lists",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: list, error: listError } = await supabase
        .from("voter_lists")
        .insert({
          name: newListName,
          description: newListDescription || null,
          user_id: user.id,
        })
        .select()
        .single();

      if (listError) throw listError;

      const { error: itemError } = await supabase
        .from("voter_list_items")
        .insert({
          list_id: list.id,
          state_voter_id: stateVoterId,
          county: county,
        });

      if (itemError) throw itemError;

      toast({
        title: "Success",
        description: "Voter added to new list",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error creating list:", error);
      toast({
        title: "Error",
        description: "Failed to create list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToExistingList = async (listId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("voter_list_items").insert({
        list_id: listId,
        state_voter_id: stateVoterId,
        county: county,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voter added to list",
      });
      setOpen(false);
    } catch (error) {
      console.error("Error adding to list:", error);
      toast({
        title: "Error",
        description: "Failed to add voter to list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) fetchLists();
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="md:w-auto w-full text-sm px-2 h-8 whitespace-nowrap"
        >
          <ListPlus className="h-4 w-4 mr-2" />
          Add to List
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Voter List</DialogTitle>
          <DialogDescription>
            Add this voter to an existing list or create a new one.
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
                  onClick={() => addToExistingList(list.id)}
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
            onClick={createList}
            disabled={!newListName || isLoading}
          >
            Create & Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
