import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
      console.log("Fetching voter lists...");
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user found");
        throw new Error("No user found");
      }

      console.log("User ID:", user.id);
      const { data, error } = await supabase
        .from("voter_lists")
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          user_id
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Error fetching lists:", error);
        throw error;
      }

      console.log("Fetched lists:", data);
      return data as VoterList[];
    },
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
    console.error("Error in lists query:", error);
    return (
      <div className="min-h-screen bg-background">
        <SidebarProvider>
          <div className="flex w-full">
            <AppSidebar />
            <div className="flex-1">
              <Header />
              <main className="max-w-7xl mx-auto p-4">
                <div className="text-center py-12">
                  <p className="text-destructive">Error loading lists: {error.message}</p>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1">
            <Header />
            <main className="max-w-7xl mx-auto p-4">
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
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Lists;