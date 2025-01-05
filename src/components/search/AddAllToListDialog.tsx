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

interface AddAllToListDialogProps {
  searchQuery: any;
  county: string;
}

export const AddAllToListDialog = ({ searchQuery, county }: AddAllToListDialogProps) => {
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

  const fetchAllVoters = async () => {
    // Remove the limit to get all results
    const query = supabase.from(county.toLowerCase()).select('state_voter_id');
    
    // Apply all the search filters from the original query
    Object.entries(searchQuery).forEach(([key, value]) => {
      if (value && key !== 'basicSearch') {
        query.eq(key, value);
      }
    });

    if (searchQuery.basicSearch) {
      const searchTerms = searchQuery.basicSearch.trim().split(' ');
      if (searchTerms.length > 1) {
        const firstName = searchTerms[0];
        const lastName = searchTerms[searchTerms.length - 1];
        query.ilike('first_name', `${firstName}%`)
             .ilike('last_name', `${lastName}%`);
      } else {
        query.ilike('last_name', `${searchQuery.basicSearch}%`);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data.map(v => v.state_voter_id);
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
      // Create new list
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

      // Fetch all voter IDs from search results
      const voterIds = await fetchAllVoters();

      // Prepare batch insert data
      const batchData = voterIds.map(voterId => ({
        list_id: list.id,
        state_voter_id: voterId,
        county: county,
      }));

      // Insert all voters into the list
      const { error: itemError } = await supabase
        .from("voter_list_items")
        .insert(batchData);

      if (itemError) throw itemError;

      toast({
        title: "Success",
        description: `Added ${voterIds.length} voters to new list`,
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
      // Fetch all voter IDs from search results
      const voterIds = await fetchAllVoters();

      // Prepare batch insert data
      const batchData = voterIds.map(voterId => ({
        list_id: listId,
        state_voter_id: voterId,
        county: county,
      }));

      // Insert all voters into the list
      const { error } = await supabase
        .from("voter_list_items")
        .insert(batchData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${voterIds.length} voters to list`,
      });
      setOpen(false);
    } catch (error) {
      console.error("Error adding to list:", error);
      toast({
        title: "Error",
        description: "Failed to add voters to list",
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
            Create & Add All
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};