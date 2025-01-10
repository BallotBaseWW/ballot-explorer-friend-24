import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CategoriesManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async () => {
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update({ name: newCategoryName })
          .eq("id", editingCategory.id);
        if (error) throw error;
        toast({ title: "Category updated successfully" });
      } else {
        const { error } = await supabase
          .from("categories")
          .insert({ name: newCategoryName });
        if (error) throw error;
        toast({ title: "Category created successfully" });
      }
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsDialogOpen(false);
      setNewCategoryName("");
      setEditingCategory(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Category deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Categories</h2>
        <Button onClick={() => {
          setEditingCategory(null);
          setNewCategoryName("");
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid gap-4">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <span>{category.name}</span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setEditingCategory(category);
                  setNewCategoryName(category.name);
                  setIsDialogOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleDelete(category.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}