import { useState } from "react";
import { useForm } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListPlus } from "lucide-react";

interface AddToListDialogProps {
  voters: Array<{ state_voter_id: string }>;
  county: string;
}

interface FormValues {
  listId: string;
  newListName: string;
  newListDescription?: string;
}

export function AddToListDialog({ voters, county }: AddToListDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>();

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

  const handleSubmit = async (values: FormValues) => {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      let listId = values.listId;

      // Create new list if needed
      if (isCreatingNew && values.newListName) {
        const { data: newList, error: createError } = await supabase
          .from('voter_lists')
          .insert({
            name: values.newListName,
            description: values.newListDescription,
            user_id: user.id, // Include the user_id here
          })
          .select()
          .single();

        if (createError) throw createError;
        listId = newList.id;
      }

      // Add voters to the list
      const voterItems = voters.map(voter => ({
        list_id: listId,
        state_voter_id: voter.state_voter_id,
        county,
      }));

      const { error: addError } = await supabase
        .from('voter_list_items')
        .insert(voterItems);

      if (addError) throw addError;

      toast({
        title: "Success",
        description: `Added ${voters.length} voters to the list`,
      });
      setIsOpen(false);
      form.reset();
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {!isCreatingNew && lists?.length ? (
              <FormField
                control={form.control}
                name="listId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select List</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lists.map((list) => (
                          <SelectItem key={list.id} value={list.id}>
                            {list.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            ) : null}

            {(isCreatingNew || !lists?.length) && (
              <>
                <FormField
                  control={form.control}
                  name="newListName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>List Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter list name" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newListDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter description" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {lists?.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
              >
                {isCreatingNew ? "Select Existing List" : "Create New List"}
              </Button>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add {voters.length} Voter{voters.length !== 1 ? "s" : ""}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}