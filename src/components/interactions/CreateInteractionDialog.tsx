import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { County } from "@/components/search/list-utils/types";

type InteractionType = "call" | "email" | "meeting" | "door_knock" | "other";

interface CreateInteractionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateInteractionDialog = ({
  open,
  onOpenChange,
  onSuccess,
}: CreateInteractionDialogProps) => {
  const session = useSession();
  const { toast } = useToast();
  const [voterId, setVoterId] = useState("");
  const [county, setCounty] = useState<County>("bronx");
  const [type, setType] = useState<InteractionType>("call");
  const [notes, setNotes] = useState("");

  const createInteractionMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      // First verify the voter exists
      const { data: voterExists, error: voterCheckError } = await supabase
        .from(county)
        .select("state_voter_id")
        .eq("state_voter_id", voterId)
        .single();

      if (voterCheckError || !voterExists) {
        throw new Error("Voter not found in selected county");
      }

      const { error } = await supabase.from("voter_interactions").insert({
        user_id: session.user.id,
        state_voter_id: voterId,
        county: county.toUpperCase(),
        type,
        notes,
        interaction_date: new Date().toISOString(),
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Interaction recorded successfully" });
      onSuccess();
      resetForm();
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

  const resetForm = () => {
    setVoterId("");
    setCounty("bronx");
    setType("call");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Interaction</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createInteractionMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="voterId">NYS Voter ID</Label>
            <Input
              id="voterId"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Select value={county} onValueChange={(value: County) => setCounty(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronx">Bronx</SelectItem>
                <SelectItem value="brooklyn">Brooklyn</SelectItem>
                <SelectItem value="manhattan">Manhattan</SelectItem>
                <SelectItem value="queens">Queens</SelectItem>
                <SelectItem value="statenisland">Staten Island</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Interaction Type</Label>
            <Select value={type} onValueChange={(value: InteractionType) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="door_knock">Door Knock</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes about the interaction..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createInteractionMutation.isPending}
            >
              Save Interaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};