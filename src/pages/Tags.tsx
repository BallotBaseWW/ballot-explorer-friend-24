import { Header } from "@/components/Header";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { InteractionManager } from "@/components/interactions/InteractionManager";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Tags = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (!session) {
        navigate('/login');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const { data: tags, refetch } = useQuery({
    queryKey: ["voter-tags"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("voter_tags")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching tags:", error);
        throw error;
      }

      return data || [];
    },
    enabled: isAuthenticated,
  });

  const createTagMutation = useMutation({
    mutationFn: async (data: { name: string; color: string; category: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("Not authenticated");
      }
      
      const { data: newTag, error } = await supabase
        .from("voter_tags")
        .insert([
          {
            name: data.name,
            color: data.color,
            category: data.category,
            user_id: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating tag:", error);
        throw error;
      }

      return newTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voter-tags"] });
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    },
    onError: (error) => {
      console.error("Error in createTagMutation:", error);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
    },
  });

  const handleRemoveTag = async (tagId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to remove tags",
        variant: "destructive",
      });
      return;
    }
    
    const { error } = await supabase
      .from("voter_tags")
      .delete()
      .eq("id", tagId)
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Error removing tag:", error);
      toast({
        title: "Error",
        description: "Failed to remove tag",
        variant: "destructive",
      });
      return;
    }

    refetch();
    toast({
      title: "Success",
      description: "Tag removed successfully",
    });
  };

  const handleCreateTag = (name: string, color: string, category: string) => {
    createTagMutation.mutate({ name, color, category });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="tags" className="w-full">
          <TabsList>
            <TabsTrigger value="tags">Tag Management</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tags">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tags?.map((tag) => (
                    <div
                      key={tag.id}
                      className="p-4 bg-white rounded-lg shadow flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span>{tag.name}</span>
                        {tag.category && (
                          <span className="text-sm text-gray-500">
                            ({tag.category})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveTag(tag.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="interactions">
            <InteractionManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tags;