import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { TagButton } from "./tag-manager/TagButton";
import { TagDialog } from "./tag-manager/TagDialog";
import { Tag } from "./tag-manager/types";

interface TagManagerProps {
  stateVoterId: string;
  county: string;
}

export const TagManager = ({ stateVoterId, county }: TagManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const session = useSession();

  const userId = session?.user?.id;

  // Fetch existing tags
  const { data: tags } = useQuery({
    queryKey: ["voter-tags", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("voter_tags")
        .select("*")
        .eq('user_id', userId)
        .order("name");
      
      if (error) throw error;
      return data as Tag[];
    },
    enabled: !!userId,
  });

  // Fetch tag assignments for this voter
  const { data: assignments } = useQuery({
    queryKey: ["voter-tag-assignments", stateVoterId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("voter_tag_assignments")
        .select("*")
        .eq("state_voter_id", stateVoterId)
        .eq("county", county)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const createTag = useMutation({
    mutationFn: async (data: { name: string; color: string; category: string }) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { data: newTag, error } = await supabase
        .from("voter_tags")
        .insert({
          name: data.name,
          color: data.color,
          category: data.category || null,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return newTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voter-tags"] });
      toast({ title: "Tag created successfully" });
    },
  });

  const assignTag = useMutation({
    mutationFn: async (tagId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("voter_tag_assignments")
        .insert({
          tag_id: tagId,
          state_voter_id: stateVoterId,
          county: county,
          user_id: userId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["voter-tag-assignments", stateVoterId] 
      });
      toast({ title: "Tag assigned successfully" });
    },
  });

  const removeTag = useMutation({
    mutationFn: async (tagId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("voter_tag_assignments")
        .delete()
        .eq("tag_id", tagId)
        .eq("state_voter_id", stateVoterId)
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["voter-tag-assignments", stateVoterId] 
      });
      toast({ title: "Tag removed successfully" });
    },
  });

  if (!userId) return null;

  const assignedTags = tags?.filter(tag => 
    assignments?.some(assignment => assignment.tag_id === tag.id)
  ) || [];

  const availableTags = tags?.filter(tag => 
    !assignments?.some(assignment => assignment.tag_id === tag.id)
  ) || [];

  return (
    <div className="space-y-2">
      <TagButton onClick={() => setIsOpen(true)} />
      <TagDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        assignedTags={assignedTags}
        availableTags={availableTags}
        onAssignTag={(tagId) => assignTag.mutate(tagId)}
        onRemoveTag={(tagId) => removeTag.mutate(tagId)}
        onCreateTag={(name, color, category) => 
          createTag.mutate({ name, color, category })
        }
      />
    </div>
  );
};