import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ListPlus } from "lucide-react";
import { ListSelector } from "./ListSelector";
import { NewListForm } from "./NewListForm";
import { County } from "../types";

interface AddSingleVoterDialogProps {
  voter: { state_voter_id: string };
  county: County;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AddSingleVoterDialog({ voter, county, variant = "outline", size = "sm" }: AddSingleVoterDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { toast } = useToast();

  const { data: lists, refetch: refetchLists } = useQuery({
    queryKey: ['voter-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voter_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleAddToList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('voter_list_items')
        .insert({
          list_id: listId,
          state_voter_id: voter.state_voter_id,
          county,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Voter added to list",
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding voter to list:', error);
      toast({
        title: "Error",
        description: "Failed to add voter to list",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <ListPlus className="h-4 w-4" />
          Add to List
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Voter to List</DialogTitle>
        </DialogHeader>
        
        {isCreatingNew ? (
          <NewListForm
            onSuccess={(listId) => {
              handleAddToList(listId);
              refetchLists();
            }}
            onCancel={() => setIsCreatingNew(false)}
          />
        ) : (
          <ListSelector
            lists={lists || []}
            onSelect={handleAddToList}
            onCreateNew={() => setIsCreatingNew(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}