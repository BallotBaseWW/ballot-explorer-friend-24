import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { VoterInfo } from "../types";

type InteractionType = "call" | "email" | "meeting" | "door_knock" | "other";

interface CreateInteractionData {
  userId: string;
  selectedVoter: VoterInfo;
  type: InteractionType;
  notes: string;
}

export const useInteractionMutation = (onSuccess: () => void) => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, selectedVoter, type, notes }: CreateInteractionData) => {
      console.log('Starting interaction mutation with data:', { userId, selectedVoter, type, notes });

      if (!userId) {
        throw new Error("User ID is required");
      }

      if (!selectedVoter) {
        throw new Error("Voter information is required");
      }

      const interactionData = {
        user_id: userId,
        state_voter_id: selectedVoter.state_voter_id,
        county: selectedVoter.county,
        type,
        notes,
        interaction_date: new Date().toISOString(),
      };

      console.log('Inserting interaction with data:', interactionData);

      const { data, error } = await supabase
        .from("voter_interactions")
        .insert(interactionData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Interaction created successfully:', data);
      return data;
    },
    onSuccess: () => {
      toast({ title: "Interaction recorded successfully" });
      onSuccess();
    },
    onError: (error: Error) => {
      console.error("Error creating interaction:", error);
      toast({
        title: "Error creating interaction",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};