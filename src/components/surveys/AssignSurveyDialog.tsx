import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Profile } from "@/types/profile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserIcon } from "lucide-react";

interface AssignSurveyDialogProps {
  surveyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignSurveyDialog = ({ surveyId, open, onOpenChange }: AssignSurveyDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .eq("approved", true);

      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["survey-assignments", surveyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_assignments")
        .select("*")
        .eq("survey_id", surveyId);

      if (error) throw error;
      return data;
    },
  });

  const assignUser = useMutation({
    mutationFn: async (userId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("survey_assignments")
        .insert({
          survey_id: surveyId,
          assigned_to: userId,
          assigned_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-assignments"] });
      toast({
        title: "Success",
        description: "User assigned to survey successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign user to survey.",
        variant: "destructive",
      });
    },
  });

  const unassignUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("survey_assignments")
        .delete()
        .eq("survey_id", surveyId)
        .eq("assigned_to", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["survey-assignments"] });
      toast({
        title: "Success",
        description: "User unassigned from survey successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unassign user from survey.",
        variant: "destructive",
      });
    },
  });

  const isAssigned = (userId: string) => {
    return assignments?.some((assignment) => assignment.assigned_to === userId);
  };

  const handleToggleAssignment = (userId: string) => {
    if (isAssigned(userId)) {
      unassignUser.mutate(userId);
    } else {
      assignUser.mutate(userId);
    }
  };

  if (usersLoading || assignmentsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Users to Survey</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-2">
            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-2 rounded hover:bg-accent"
              >
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4" />
                  <span>{user.full_name || user.email}</span>
                </div>
                <Button
                  variant={isAssigned(user.id) ? "destructive" : "secondary"}
                  size="sm"
                  onClick={() => handleToggleAssignment(user.id)}
                >
                  {isAssigned(user.id) ? "Unassign" : "Assign"}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};