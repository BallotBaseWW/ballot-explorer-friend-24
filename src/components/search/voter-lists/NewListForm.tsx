import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface FormValues {
  name: string;
  description?: string;
}

interface NewListFormProps {
  onSuccess: (listId: string) => void;
  onCancel: () => void;
}

export function NewListForm({ onSuccess, onCancel }: NewListFormProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>();

  const handleSubmit = async (values: FormValues) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('voter_lists')
        .insert({
          name: values.name,
          description: values.description,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error("No data returned");

      onSuccess(data.id);
    } catch (error) {
      console.error('Error creating list:', error);
      toast({
        title: "Error",
        description: "Failed to create list",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter description" />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">Create List</Button>
        </div>
      </form>
    </Form>
  );
}