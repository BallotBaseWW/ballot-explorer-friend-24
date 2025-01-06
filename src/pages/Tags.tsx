import { Header } from "@/components/Header";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CreateTagForm } from "@/components/search/voter-card/tag-manager/CreateTagForm";
import { TagList } from "@/components/search/voter-card/tag-manager/TagList";

const Tags = () => {
  useAuthCheck();
  const session = useSession();

  const { data: tags, refetch } = useQuery({
    queryKey: ["voter-tags", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("voter_tags")
        .select("*")
        .eq('user_id', session.user.id)
        .order("name");
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleRemoveTag = async (tagId: string) => {
    if (!session?.user?.id) return;
    
    const { error } = await supabase
      .from("voter_tags")
      .delete()
      .eq("id", tagId)
      .eq("user_id", session.user.id);

    if (!error) {
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Tag Management</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Tag</h2>
          <CreateTagForm onCreateTag={(name, color, category) => {
            // After creating, refetch the tags
            refetch();
          }} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Tags</h2>
          <TagList 
            tags={tags || []} 
            onRemoveTag={handleRemoveTag}
          />
        </div>
      </main>
    </div>
  );
};

export default Tags;