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
import { ShareListDialog } from "./ShareListDialog";

interface AddToListDialogProps {
  voters: Array<{ state_voter_id: string }>;
  county: string;
}

export function AddToListDialog({ voters, county }: AddToListDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [shareListId, setShareListId] = useState<string | null>(null);
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
      const voterItems = voters.map(voter => ({
        list_id: listId,
        state_voter_id: voter.state_voter_id,
        county,
      }));

      const { error } = await supabase
        .from('voter_list_items')
        .insert(voterItems);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Added ${voters.length} voters to the list`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding voters to list:', error);
      toast({
        title: "Error",
        description: "Failed to add voters to list",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <ListPlus className="h-4 w-4" />
            Add to List
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Voters to List</DialogTitle>
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
              onShare={(listId) => setShareListId(listId)}
              showShareButton
            />
          )}
        </DialogContent>
      </Dialog>

      {shareListId && (
        <ShareListDialog
          listId={shareListId}
          open={!!shareListId}
          onOpenChange={(open) => !open && setShareListId(null)}
        />
      )}
    </>
  );
}