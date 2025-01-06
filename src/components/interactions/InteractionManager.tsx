import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus } from "lucide-react";
import { CreateInteractionDialog } from "./CreateInteractionDialog";
import { InteractionsList } from "./InteractionsList";

export const InteractionManager = () => {
  const session = useSession();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: interactions, isLoading } = useQuery({
    queryKey: ["voter-interactions", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      const { data, error } = await supabase
        .from("voter_interactions")
        .select("*, bronx(*), brooklyn(*), manhattan(*), queens(*), statenisland(*)")
        .eq("user_id", session.user.id)
        .order("interaction_date", { ascending: false });

      if (error) {
        console.error("Error fetching interactions:", error);
        toast({
          title: "Error fetching interactions",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      return data;
    },
    enabled: !!session?.user?.id,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Voter Interactions
        </h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Interaction
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-4">
          <p className="text-muted-foreground">Loading interactions...</p>
        </Card>
      ) : interactions?.length === 0 ? (
        <Card className="p-4">
          <p className="text-muted-foreground">No interactions recorded yet.</p>
        </Card>
      ) : (
        <InteractionsList interactions={interactions} />
      )}

      <CreateInteractionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["voter-interactions"] });
          setIsCreateDialogOpen(false);
        }}
      />
    </div>
  );
};