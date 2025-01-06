import { useState } from "react";
import { Plus, Tag, X } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface TagManagerProps {
  stateVoterId: string;
  county: string;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  category: string | null;
}

interface TagAssignment {
  id: string;
  tag_id: string;
}

export const TagManager = ({ stateVoterId, county }: TagManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");
  const [newTagCategory, setNewTagCategory] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing tags
  const { data: tags } = useQuery({
    queryKey: ["voter-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voter_tags")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Tag[];
    },
  });

  // Fetch tag assignments for this voter
  const { data: assignments } = useQuery({
    queryKey: ["voter-tag-assignments", stateVoterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("voter_tag_assignments")
        .select("*")
        .eq("state_voter_id", stateVoterId)
        .eq("county", county);
      
      if (error) throw error;
      return data as TagAssignment[];
    },
  });

  // Create new tag
  const createTag = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("voter_tags")
        .insert({
          name: newTagName,
          color: newTagColor,
          category: newTagCategory || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voter-tags"] });
      setNewTagName("");
      setNewTagColor("#000000");
      setNewTagCategory("");
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
      const { error } = await supabase
        .from("voter_tag_assignments")
        .insert({
          tag_id: tagId,
          state_voter_id: stateVoterId,
          county: county,
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
              <div className="flex flex-wrap gap-2">
                {assignedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    style={{ backgroundColor: tag.color }}
                    className="flex items-center gap-1"
                  >
                    {tag.name}
                    <button
                      onClick={() => {
                        const assignment = assignments?.find(
                          a => a.tag_id === tag.id
                        );
                        if (assignment) {
                          removeTag.mutate(assignment.id);
                        }
                      }}
                      className="ml-1 hover:bg-black/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Add Existing Tag</h4>
              <Select
                onValueChange={(value) => assignTag.mutate(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags?.filter(tag => 
                    !assignments?.some(assignment => 
                      assignment.tag_id === tag.id
                    )
                  ).map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                        {tag.category && (
                          <span className="text-muted-foreground">
                            ({tag.category})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Create New Tag</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <Input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-20"
                />
              </div>
              <Input
                placeholder="Category (optional)"
                value={newTagCategory}
                onChange={(e) => setNewTagCategory(e.target.value)}
              />
              <Button
                onClick={() => createTag.mutate()}
                disabled={!newTagName}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Tag
              </Button>
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