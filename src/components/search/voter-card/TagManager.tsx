import { useState } from "react";
import { Tag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@supabase/auth-helpers-react";
import { TagList } from "./tag-manager/TagList";
import { TagSelector } from "./tag-manager/TagSelector";
import { CreateTagForm } from "./tag-manager/CreateTagForm";
import { Tag as TagType } from "./tag-manager/types";

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

  console.log('Current user ID:', userId);

  // Fetch existing tags
  const { data: tags } = useQuery({
    queryKey: ["voter-tags"],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("voter_tags")
        .select("*")
        .eq('user_id', userId)
        .order("name");
      
      if (error) throw error;
      return data as TagType[];
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

  // Create new tag
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
      toast({
        title: "Tag created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Assign tag to voter
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
      toast({
        title: "Tag assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error assigning tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove tag from voter
  const removeTag = useMutation({
    mutationFn: async (assignmentId: string) => {
      if (!userId) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("voter_tag_assignments")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["voter-tag-assignments", stateVoterId] 
      });
      toast({
        title: "Tag removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing tag",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignedTags = tags?.filter(tag => 
    assignments?.some(assignment => assignment.tag_id === tag.id)
  ) || [];

  const handleCreateTag = (name: string, color: string, category: string) => {
    createTag.mutate({ name, color, category });
  };

  const handleAssignTag = (tagId: string) => {
    assignTag.mutate(tagId);
  };

  const handleRemoveTag = (tagId: string) => {
    const assignment = assignments?.find(a => a.tag_id === tagId);
    if (assignment) {
      removeTag.mutate(assignment.id);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Tag className="h-4 w-4 mr-2" />
            Manage Tags
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Tags</h4>
              <TagList tags={assignedTags} onRemoveTag={handleRemoveTag} />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Add Existing Tag</h4>
              <TagSelector 
                availableTags={tags?.filter(tag => 
                  !assignments?.some(assignment => 
                    assignment.tag_id === tag.id
                  )
                ) || []}
                onSelectTag={handleAssignTag}
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Create New Tag</h4>
              <CreateTagForm onCreateTag={handleCreateTag} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-1">
        {assignedTags.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};