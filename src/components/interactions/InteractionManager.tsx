import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus } from "lucide-react";
import { CreateInteractionDialog } from "./CreateInteractionDialog";
import { InteractionsList } from "./InteractionsList";
import { County } from "../search/list-utils/types";
import { Interaction } from "./types";

export const InteractionManager = () => {
  const session = useSession();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: interactions, isLoading } = useQuery({
    queryKey: ["voter-interactions", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      console.log("Fetching interactions for user:", session.user.id);
      
      const { data, error } = await supabase
        .from("voter_interactions")
        .select(`
          *,
          bronx:bronx(first_name, last_name),
          brooklyn:brooklyn(first_name, last_name),
          manhattan:manhattan(first_name, last_name),
          queens:queens(first_name, last_name),
          statenisland:statenisland(first_name, last_name)
        `)
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

      console.log("Raw interactions data:", data);

      // Ensure county is of type County and convert to lowercase
      const formattedInteractions = data.map(interaction => ({
        ...interaction,
        county: interaction.county.toLowerCase() as County,
        // Ensure voter data is properly structured
        bronx: interaction.bronx?.[0] || null,
        brooklyn: interaction.brooklyn?.[0] || null,
        manhattan: interaction.manhattan?.[0] || null,
        queens: interaction.queens?.[0] || null,
        statenisland: interaction.statenisland?.[0] || null
      })) as Interaction[];

      console.log("Formatted interactions:", formattedInteractions);
      return formattedInteractions;
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
      ) : !interactions || interactions.length === 0 ? (
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