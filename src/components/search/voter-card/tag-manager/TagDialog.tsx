import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TagList } from "./TagList";
import { TagSelector } from "./TagSelector";
import { CreateTagForm } from "./CreateTagForm";
import { Tag } from "./types";

interface TagDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignedTags: Tag[];
  availableTags: Tag[];
  onAssignTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag: (name: string, color: string, category: string) => void;
}

export const TagDialog = ({
  isOpen,
  onOpenChange,
  assignedTags,
  availableTags,
  onAssignTag,
  onRemoveTag,
  onCreateTag,
}: TagDialogProps) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Manage Tags</DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Tags</h4>
          <TagList tags={assignedTags} onRemoveTag={onRemoveTag} />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Add Existing Tag</h4>
          <TagSelector 
            availableTags={availableTags}
            onSelectTag={onAssignTag}
          />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Create New Tag</h4>
          <CreateTagForm onCreateTag={onCreateTag} />
        </div>
      </div>
    </DialogContent>
  </Dialog>
);