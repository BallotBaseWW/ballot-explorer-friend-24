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
      console.log('Creating interaction with data:', { userId, selectedVoter, type, notes });

      if (!userId || !selectedVoter) {
        throw new Error("Missing required data: user ID or voter information");
      }

      const { error } = await supabase.from("voter_interactions").insert({
        user_id: userId,
        state_voter_id: selectedVoter.state_voter_id,
        county: selectedVoter.county,
        type,
        notes,
        interaction_date: new Date().toISOString(),
      });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
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