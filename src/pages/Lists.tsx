
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import type { VoterList } from "@/types/voter-list";

const Lists = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: lists, isLoading, error } = useQuery({
    queryKey: ["voterLists"],
    queryFn: async () => {
      try {
        const userResponse = await supabase.auth.getUser();
        const user = userResponse.data.user;
        
        if (!user) {
          throw new Error("No user found");
        }

        const { data, error: listsError } = await supabase
          .from("voter_lists")
          .select("*")
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (listsError) {
          console.error("Supabase error:", listsError);
          throw new Error(listsError.message);
        }

        return (data || []) as VoterList[];
      } catch (error: any) {
        console.error("Error in query function:", error);
        throw new Error(error.message);
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30000
  });

  const handleCreateList = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data, error } = await supabase
        .from("voter_lists")
        .insert([
          {
            name: "New List",
            description: "",
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "List created successfully",
      });

      navigate(`/lists/${data.id}`);
    } catch (error: any) {
      console.error("Error creating list:", error);
      toast({
        title: "Error creating list",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading lists: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Lists</h1>
        <Button onClick={handleCreateList}>
          <Plus className="h-4 w-4 mr-2" />
          Create List
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      ) : !lists || lists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No lists created yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {lists.map((list) => (
            <div
              key={list.id}
              className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/lists/${list.id}`)}
            >
              <h3 className="font-semibold mb-1">{list.name}</h3>
              {list.description && (
                <p className="text-sm text-muted-foreground mb-2">
                  {list.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Last updated: {format(new Date(list.updated_at), "PPP")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Lists;
