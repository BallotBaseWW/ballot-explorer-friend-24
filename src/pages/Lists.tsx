import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { List, ListPlus, Trash2 } from "lucide-react";
import { VoterList } from "@/types/voter-list";

const Lists = () => {
  const [lists, setLists] = useState<VoterList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchLists = async () => {
    const { data, error } = await supabase
      .from("voter_lists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching lists:", error);
      return;
    }

    setLists(data || []);
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const createList = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("voter_lists").insert({
        name: newListName,
        description: newListDescription || null,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "List created successfully",
      });
      
      setNewListName("");
      setNewListDescription("");
      fetchLists();
    } catch (error) {
      console.error("Error creating list:", error);
      toast({
        title: "Error",
        description: "Failed to create list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteList = async (listId: string) => {
    try {
      const { error } = await supabase
        .from("voter_lists")
        .delete()
        .eq("id", listId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "List deleted successfully",
      });
      
      fetchLists();
    } catch (error) {
      console.error("Error deleting list:", error);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Voter Lists</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <ListPlus className="h-4 w-4 mr-2" />
                Create New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New List</DialogTitle>
                <DialogDescription>
                  Create a new list to organize voters.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">List Name</Label>
                  <Input
                    id="name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newListDescription}
                    onChange={(e) => setNewListDescription(e.target.value)}
                    placeholder="Enter list description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={createList} disabled={!newListName || isLoading}>
                  Create List
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => (
            <Card key={list.id}>
              <CardHeader>
                <CardTitle>{list.name}</CardTitle>
                {list.description && (
                  <CardDescription>{list.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Created: {new Date(list.created_at).toLocaleDateString()}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/lists/${list.id}`)}
                >
                  <List className="h-4 w-4 mr-2" />
                  View List
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteList(list.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {lists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No lists created yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Lists;