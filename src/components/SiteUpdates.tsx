import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export function SiteUpdates() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<any>(null);
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const { data: isAdmin } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return false;
      
      const { data: roleData, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user role:", error);
        return false;
      }
      
      return roleData?.role === "admin";
    },
  });

  const { data: updates, refetch } = useQuery({
    queryKey: ["siteUpdates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_updates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: dataCurrency } = useQuery({
    queryKey: ["dataCurrency"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_currency")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
  });

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No user found");

      if (editingUpdate) {
        await supabase
          .from("site_updates")
          .update({ content })
          .eq("id", editingUpdate.id);
      } else {
        await supabase
          .from("site_updates")
          .insert([{ content, created_by: user.id }]);
      }

      toast({
        title: `Update ${editingUpdate ? "edited" : "added"} successfully`,
      });

      setIsOpen(false);
      setContent("");
      setEditingUpdate(null);
      refetch();
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
      await supabase
        .from("site_updates")
        .delete()
        .eq("id", id);

      toast({
        title: "Update deleted successfully",
      });

      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (update: any) => {
    setEditingUpdate(update);
    setContent(update.content);
    setIsOpen(true);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Site Updates</h2>
        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingUpdate(null);
                  setContent("");
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingUpdate ? "Edit Update" : "Add New Update"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter update content..."
                  className="min-h-[100px]"
                />
                <Button onClick={handleSubmit}>
                  {editingUpdate ? "Save Changes" : "Add Update"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {dataCurrency && (
        <div className="mb-4 text-sm text-muted-foreground">
          Data current as of: {format(new Date(dataCurrency.as_of_date), "PPP")}
        </div>
      )}

      <div className="space-y-4">
        {updates?.map((update: any) => (
          <div
            key={update.id}
            className="p-4 rounded-lg border bg-card text-card-foreground"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p>{update.content}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(update.created_at), "PPP")}
                </p>
              </div>
              {isAdmin && (
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(update)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(update.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}