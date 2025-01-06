import { Header } from "@/components/Header";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateTagForm } from "@/components/search/voter-card/tag-manager/CreateTagForm";
import { TagList } from "@/components/search/voter-card/tag-manager/TagList";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

const Tags = () => {
  useAuthCheck();
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags, refetch } = useQuery({
    queryKey: ["voter-tags", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("voter_tags")
        .select("*")
        .eq('user_id', session.user.id)
        .order("name");
      
      if (error) {
        console.error("Error fetching tags:", error);
        toast({
          title: "Error fetching tags",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const createTagMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; category: string }) => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      
      const { data: newTag, error } = await supabase
        .from("voter_tags")
        .insert({
          name: data.name,
          color: data.color,
          category: data.category || null,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return newTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voter-tags"] });
      toast({ title: "Tag created successfully" });
    },
    onError: (error: Error) => {
      console.error("Error creating tag:", error);
      toast({
        title: "Error creating tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRemoveTag = async (tagId: string) => {
    if (!session?.user?.id) return;
    
    const { error } = await supabase
      .from("voter_tags")
      .delete()
      .eq("id", tagId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error removing tag:", error);
      toast({
        title: "Error removing tag",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Tag removed successfully" });
      refetch();
    }
  };

  const handleCreateTag = (name: string, color: string, category: string) => {
    createTagMutation.mutate({ name, color, category });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Voter Management</h1>
        
        <Tabs defaultValue="tags" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
          </TabsList>

          <TabsContent value="tags" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Create New Tag</h2>
              <CreateTagForm onCreateTag={handleCreateTag} />
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Your Tags</h2>
              <TagList 
                tags={tags || []} 
                onRemoveTag={handleRemoveTag}
              />
            </Card>
          </TabsContent>

          <TabsContent value="interactions">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Interaction Management</h2>
              <p className="text-muted-foreground mt-2">
                Track and manage your voter interactions here. Coming soon.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="finance">
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Finance Management</h2>
              <p className="text-muted-foreground mt-2">
                Manage voter contributions and financial records here. Coming soon.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Tags;