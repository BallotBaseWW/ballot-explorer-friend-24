import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateListDialog } from "@/components/search/voter-lists/CreateListDialog";
import { Link } from "react-router-dom";

const Lists = () => {
  const { toast } = useToast();
  const [selectedList, setSelectedList] = useState<string | null>(null);

  const { data: lists, refetch: refetchLists } = useQuery({
    queryKey: ['voter-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('voter_lists')
        .select(`
          *,
          voter_list_items (
            count
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const handleDeleteList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from('voter_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "List deleted successfully",
      });
      refetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
      toast({
        title: "Error",
        description: "Failed to delete list",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto p-4">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">My Voter Lists</h2>
          <CreateListDialog onSuccess={refetchLists} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists?.map((list) => (
            <Link key={list.id} to={`/lists/${list.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {list.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {list.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      {list.voter_list_items?.[0]?.count || 0} voters
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Handle export
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!lists?.length && (
          <div className="text-center py-8 text-muted-foreground">
            No lists created yet. Create your first list using the button above.
          </div>
        )}
      </main>
    </div>
  );
};

export default Lists;